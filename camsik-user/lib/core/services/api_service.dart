import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../constants/api_constants.dart';
import '../constants/app_keys.dart';
import '../utils/api_sanitizer.dart';
import '../utils/logger.dart';
import '../utils/session_manager.dart';
import 'storage_service.dart';

class ApiService {
  // ── DIO INSTANCE WITH EMBEDDED INTERCEPTORS ──
  static final Dio dio = Dio(
    BaseOptions(
      baseUrl: ApiConstants.baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    ),
  )..interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final startTime = DateTime.now();
          options.extra['startTime'] = startTime;

          final prefs = await SharedPreferencesService.getInstance();
          final token = prefs.getString(AppKeys.accessToken);

          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
            appLog("🔐 Bearer Token attached");
          }

          dynamic dataToLog = options.data;
          if (options.data is FormData) {
            final formData = options.data as FormData;
            final fieldsMap = Map.fromEntries(formData.fields);
            final filesMap = Map.fromEntries(
              formData.files.map((f) => MapEntry(f.key, f.value.filename ?? 'File')),
            );
            dataToLog = {
              if (fieldsMap.isNotEmpty) 'fields': fieldsMap,
              if (filesMap.isNotEmpty) 'files': filesMap,
            };
          }

          appLog("📤 REQUEST → ${options.method} ${options.uri}");
          appLog("🔸 Headers: ${options.headers}");
          appLog("🔸 Data: $dataToLog");
          appLog("⏱️ Started at: $startTime");

          return handler.next(options);
        },
        onResponse: (response, handler) {
          final startTime = response.requestOptions.extra['startTime'] as DateTime?;
          final duration = startTime != null ? DateTime.now().difference(startTime) : null;
          appLog("✅ RESPONSE ← ${response.statusCode} ${response.requestOptions.uri}");
          appLog("📦 Response Data: ${response.data}");
          if (duration != null) {
            appLog("⏳ API Duration: ${duration.inMilliseconds} ms (${duration.inSeconds}s)");
          }
          return handler.next(response);
        },
        onError: (DioException e, handler) async {
          final startTime = e.requestOptions.extra['startTime'] as DateTime?;
          final duration = startTime != null ? DateTime.now().difference(startTime) : null;

          appLog("❌ ERROR ← ${e.response?.statusCode} ${e.requestOptions.uri}");
          if (duration != null) {
            appLog("⏱️ API failed after: ${duration.inMilliseconds} ms (${duration.inSeconds}s)");
          }

          if (e.response?.statusCode == 401) {
            if (e.requestOptions.path.contains('/auth/refresh-token')) {
              appLog("🚨 Refresh token endpoint returned 401 - forcing logout");
              await SessionManager.forceLogout();
              return handler.next(e);
            }

            final prefs = await SharedPreferencesService.getInstance();
            final storedRefreshToken = prefs.getString(AppKeys.refreshToken);

            if (storedRefreshToken != null && storedRefreshToken.isNotEmpty) {
              appLog("🔄 401 Unauthorized received. Attempting token refresh...");
              try {
                final refreshDio = Dio(
                  BaseOptions(
                    connectTimeout: const Duration(seconds: 15),
                    receiveTimeout: const Duration(seconds: 15),
                    headers: {"Accept": "application/json", "Content-Type": "application/json"},
                  ),
                );

                final refreshResponse = await refreshDio.post(
                  ApiConstants.refreshToken,
                  data: {"token": storedRefreshToken},
                );

                if (refreshResponse.statusCode == 200 &&
                    refreshResponse.data != null &&
                    refreshResponse.data['success'] == true) {
                  final newAccessToken = refreshResponse.data['data']?['accessToken'];
                  if (newAccessToken != null && newAccessToken is String && newAccessToken.isNotEmpty) {
                    appLog("✅ Access token refreshed successfully! Retrying request...");
                    await prefs.setString(AppKeys.accessToken, newAccessToken);

                    final retryOptions = e.requestOptions;
                    retryOptions.headers['Authorization'] = 'Bearer $newAccessToken';
                    final response = await dio.fetch(retryOptions);
                    return handler.resolve(response);
                  }
                }
              } catch (refreshErr) {
                appLog("❌ Refresh token call failed: $refreshErr");
              }
            }

            appLog("🚨 401 Unauthorized & refresh token unavailable/expired - forcing logout");
            await SessionManager.forceLogout();
            return handler.next(e);
          }

          // Failover from unreachable local dev server to production server
          if (e.type == DioExceptionType.connectionError || e.type == DioExceptionType.connectionTimeout) {
            final uriStr = e.requestOptions.uri.toString();
            if (uriStr.contains("127.0.0.1:4028") || uriStr.contains("localhost:4028") || uriStr.contains("10.0.2.2:4028")) {
              try {
                appLog("🔄 Unreachable local server, auto-failing over to production: https://casmik-one.vercel.app");
                final retryOptions = e.requestOptions;
                final newUri = uriStr
                    .replaceAll("http://127.0.0.1:4028", "https://casmik-one.vercel.app")
                    .replaceAll("http://localhost:4028", "https://casmik-one.vercel.app")
                    .replaceAll("http://10.0.2.2:4028", "https://casmik-one.vercel.app");
                retryOptions.path = newUri;
                final res = await dio.fetch(retryOptions);
                return handler.resolve(res);
              } catch (failoverErr) {
                appLog("❌ Failover to production failed: $failoverErr");
              }
            }
          }

          if (e.type == DioExceptionType.connectionTimeout || e.type == DioExceptionType.receiveTimeout) {
            appLog("⚠️ Timeout: The API took too long to respond.");
            try {
              appLog("🔁 Retrying request once due to timeout...");
              final retryOptions = e.requestOptions;
              retryOptions.connectTimeout = const Duration(seconds: 30);
              retryOptions.receiveTimeout = const Duration(seconds: 30);

              final response = await dio.fetch(retryOptions);
              appLog("✅ Retry succeeded with status ${response.statusCode}");
              return handler.resolve(response);
            } catch (retryError) {
              appLog("❌ Retry failed too: $retryError");
            }
          }

          return handler.next(e);
        },
      ),
    );

  // ── IN-MEMORY CACHES FOR QUICK INITIAL RENDERING ──
  static List<Map<String, dynamic>> cachedBanners = [];
  static List<Map<String, dynamic>> cachedCategories = [];
  static List<Map<String, dynamic>> cachedRefurbished = [];
  static List<Map<String, dynamic>> cachedRentalCameras = [];
  static List<Map<String, dynamic>> cachedLenses = [];

  // ── IMAGE & DATA SANITIZATION ──
  static String cleanImagePath(dynamic path, {String? categoryId}) =>
      ApiSanitizer.cleanImagePath(path, categoryId: categoryId);

  // ── AUTHENTICATION API ──
  static Future<Map<String, dynamic>> login({
    required String identifier,
    required String password,
  }) async {
    try {
      final res = await dio.post(ApiConstants.login, data: {
        'identifier': identifier.trim(),
        'password': password.trim(),
      });
      if (res.data is Map) {
        return Map<String, dynamic>.from(res.data as Map);
      }
    } catch (e) {
      appLog("Login network error: $e");
    }
    return {'success': false, 'message': 'Login request failed'};
  }

  static Future<Map<String, dynamic>> signUp({
    required String name,
    required String phone,
    required String email,
    required String password,
  }) async {
    try {
      final res = await dio.post(ApiConstants.register, data: {
        'name': name.trim(),
        'phone': phone.trim().replaceAll(RegExp(r'\D'), ''),
        'email': email.trim(),
        'password': password.trim(),
        'role': 'user',
      });
      if (res.data is Map) {
        return Map<String, dynamic>.from(res.data as Map);
      }
    } catch (e) {
      appLog("Registration network error: $e");
    }
    return {'success': false, 'message': 'Registration request failed'};
  }

  // ── BACKGROUND SYNC ──
  static Future<void> syncDataInBackground() async {
    try {
      final bannersRes = await dio.get(ApiConstants.banners);
      if (bannersRes.data != null && bannersRes.data['banners'] is List) {
        final list = (bannersRes.data['banners'] as List).cast<Map<String, dynamic>>();
        for (final b in list) {
          b['image'] = cleanImagePath(b['image'], categoryId: b['categoryFilter']?.toString());
        }
        cachedBanners = list;
      }

      final categoriesRes = await dio.get(ApiConstants.categories);
      if (categoriesRes.data != null && categoriesRes.data['categories'] is List) {
        final list = (categoriesRes.data['categories'] as List).cast<Map<String, dynamic>>();
        ApiSanitizer.sanitizeCategories(list);
        cachedCategories = list;
      }

      final refRes = await dio.get(ApiConstants.refurbished);
      if (refRes.data != null && refRes.data['products'] is List) {
        final refList = (refRes.data['products'] as List).cast<Map<String, dynamic>>();
        ApiSanitizer.sanitizeRefurbished(refList);
        cachedRefurbished = refList;
      }

      final rentRes = await dio.get(ApiConstants.rentals);
      if (rentRes.data != null && rentRes.data['cameras'] is List) {
        final rentList = (rentRes.data['cameras'] as List).cast<Map<String, dynamic>>();
        ApiSanitizer.sanitizeRentalCameras(rentList);
        cachedRentalCameras = rentList;
      }
    } catch (e) {
      debugPrint('Background sync note: $e');
    }
  }

  // ── BANNERS & CATEGORIES ──
  static Future<List<Map<String, dynamic>>> fetchBanners() async {
    try {
      final res = await dio.get(ApiConstants.banners);
      if (res.data != null && res.data['banners'] is List) {
        final list = (res.data['banners'] as List).cast<Map<String, dynamic>>();
        if (list.isNotEmpty) {
          for (final b in list) {
            b['image'] = cleanImagePath(b['image'], categoryId: b['categoryFilter']?.toString());
          }
          cachedBanners = list;
          return list;
        }
      }
    } catch (_) {}
    return cachedBanners;
  }

  static Future<List<Map<String, dynamic>>> fetchCategories() async {
    try {
      final res = await dio.get(ApiConstants.categories);
      if (res.data != null && res.data['categories'] is List) {
        final list = (res.data['categories'] as List).cast<Map<String, dynamic>>();
        if (list.isNotEmpty) {
          ApiSanitizer.sanitizeCategories(list);
          cachedCategories = list;
          return list;
        }
      }
    } catch (_) {}
    return cachedCategories;
  }

  // ── BRANDS, MODELS & QUESTIONS ──
  static Future<List<Map<String, dynamic>>> fetchBrands({String? categoryId, String? search}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (categoryId != null && categoryId.isNotEmpty && categoryId != 'all') queryParams['categoryId'] = categoryId;
      if (search != null && search.isNotEmpty) queryParams['search'] = search;

      final res = await dio.get(ApiConstants.brands, queryParameters: queryParams);
      if (res.data != null && res.data['brands'] is List) {
        final list = (res.data['brands'] as List).cast<Map<String, dynamic>>();
        if (list.isNotEmpty) return list;
      }
    } catch (_) {}
    return const [];
  }

  static Future<List<Map<String, dynamic>>> fetchModels({String? categoryId, String? brandId, String? search}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (categoryId != null && categoryId.isNotEmpty && categoryId != 'all') queryParams['categoryId'] = categoryId;
      if (brandId != null && brandId.isNotEmpty && brandId != 'all') queryParams['brandId'] = brandId;
      if (search != null && search.isNotEmpty) queryParams['search'] = search;

      final res = await dio.get(ApiConstants.models, queryParameters: queryParams);
      if (res.data != null && res.data['models'] is List) {
        final list = (res.data['models'] as List).cast<Map<String, dynamic>>();
        if (list.isNotEmpty) {
          ApiSanitizer.sanitizeModels(list);
          return list;
        }
      }
    } catch (_) {}
    return const [];
  }

  static Future<List<Map<String, dynamic>>> fetchQuestions({required String categoryId}) async {
    try {
      final res = await dio.get(ApiConstants.questions, queryParameters: {'categoryId': categoryId});
      if (res.data != null && res.data['questions'] is List) {
        final list = (res.data['questions'] as List)
            .whereType<Map>()
            .map((e) {
              final q = Map<String, dynamic>.from(e);
              if (q['options'] is List) {
                q['options'] = (q['options'] as List).whereType<Map>().map((o) {
                  final opt = Map<String, dynamic>.from(o);
                  if (!opt.containsKey('desc') && opt.containsKey('sublabel')) {
                    opt['desc'] = opt['sublabel'];
                  }
                  return opt;
                }).toList();
              }
              return q;
            })
            .toList();
        if (list.isNotEmpty) return list;
      }
    } catch (e) {
      appLog("⚠️ Failed to fetch questions from API: $e");
    }
    return _getDefaultQuestionsForCategory(categoryId);
  }

  static List<Map<String, dynamic>> _getDefaultQuestionsForCategory(String categoryId) {
    final cat = categoryId.toLowerCase();
    if (cat.contains('lens')) {
      return [
        {
          'id': 'lens-glass',
          'question': 'Optical Front & Rear Glass Element Condition?',
          'subtext': 'Check optical glass for scratches, fungus, dust or haze.',
          'options': [
            {'id': 'lg-1', 'label': 'Crystal Clear (No Fungus/Scratches)', 'desc': 'Flawless optical glass', 'adj': 2000},
            {'id': 'lg-2', 'label': 'Minor Dust (No Image Impact)', 'desc': 'Standard internal micro-dust', 'adj': 0},
            {'id': 'lg-3', 'label': 'Fungus / Deep Scratches / Haze', 'desc': 'Coating damage or fungus', 'adj': -5500},
          ]
        },
        {
          'id': 'lens-af',
          'question': 'Autofocus Motor & Manual Focus Ring?',
          'subtext': 'Test AF speed, accuracy and manual ring smoothness.',
          'options': [
            {'id': 'laf-1', 'label': 'Fast Silent AF & Smooth Focus Ring', 'desc': '100% operational motor', 'adj': 0},
            {'id': 'laf-2', 'label': 'Sluggish AF / Stiff Ring', 'desc': 'Slow focus acquisition', 'adj': -2500},
            {'id': 'laf-3', 'label': 'AF Motor Failure / Non-Functional', 'desc': 'Motor repair required', 'adj': -5500},
          ]
        },
        {
          'id': 'lens-aperture',
          'question': 'Aperture Blades & Electronic Contacts?',
          'subtext': 'Inspect aperture actuation and metal mount electronic contacts.',
          'options': [
            {'id': 'lap-1', 'label': 'Clean Snappy Blades (Zero Oil)', 'desc': 'Instant aperture stop-down', 'adj': 0},
            {'id': 'lap-2', 'label': 'Slow Blades / Oil Traces', 'desc': 'Sticky diaphragm mechanism', 'adj': -3000},
            {'id': 'lap-3', 'label': 'Stuck Aperture / Error 01 Contact', 'desc': 'Diaphragm does not actuate', 'adj': -6000},
          ]
        },
        {
          'id': 'lens-is',
          'question': 'Optical Image Stabilization (IS / VR / OSS)?',
          'subtext': 'Check if gyro stabilization motor operates quietly without jitter.',
          'options': [
            {'id': 'lis-1', 'label': 'Quiet & Rock-Solid IS Stabilization', 'desc': 'Stabilizer functions perfectly', 'adj': 0},
            {'id': 'lis-2', 'label': 'Buzzing / Jittery IS Mechanism', 'desc': 'Stabilizer struggling', 'adj': -3500},
            {'id': 'lis-3', 'label': 'Lens Has No IS / Non-IS Prime', 'desc': 'Unstabilized native lens', 'adj': 0},
          ]
        },
        {
          'id': 'lens-mount',
          'question': 'Metal Bayonet Mount & Weather Gasket?',
          'subtext': 'Check mount locking lugs and weather gasket.',
          'options': [
            {'id': 'lmt-1', 'label': 'Pristine Chrome/Brass Mount & Gasket', 'desc': 'Locks firmly onto camera', 'adj': 0},
            {'id': 'lmt-2', 'label': 'Slight Mount Rub / Scratches', 'desc': 'Normal cosmetic wear', 'adj': -1000},
            {'id': 'lmt-3', 'label': 'Bent Mount Flange / Loose Screws', 'desc': 'Mounting instability', 'adj': -4000},
          ]
        },
        {
          'id': 'lens-hood',
          'question': 'Original Lens Hood, Caps & Box?',
          'subtext': 'Original lens hood, front/rear protective caps, and retail box.',
          'options': [
            {'id': 'lh-1', 'label': 'Complete Hood + Front & Rear Caps + Box', 'desc': 'Complete retail packaging bundle', 'adj': 2000},
            {'id': 'lh-2', 'label': 'Front & Rear Caps Only (No Hood/Box)', 'desc': 'Essential caps only', 'adj': 0},
            {'id': 'lh-3', 'label': 'Missing Caps / Third-Party Caps', 'desc': 'No original caps', 'adj': -1500},
          ]
        },
      ];
    } else if (cat.contains('smart') || cat.contains('phone') || cat.contains('mobile')) {
      return [
        {
          'id': 'phone-power',
          'question': 'Does the smartphone turn on & stay awake?',
          'subtext': 'Verify device powers on without boot loops.',
          'options': [
            {'id': 'pp-1', 'label': 'Turns On & Works Normally', 'desc': 'Boots cleanly to home screen', 'adj': 0},
            {'id': 'pp-2', 'label': 'Restarts Frequently / Boot Loops', 'desc': 'Software or logic board issue', 'adj': -8000},
            {'id': 'pp-3', 'label': 'Completely Dead / Does Not Power On', 'desc': 'Unpowered device', 'adj': -18000},
          ]
        },
        {
          'id': 'phone-display',
          'question': 'Screen Glass & Touchscreen Response?',
          'subtext': 'Check for cracks, dead pixels, lines or touch ghosting.',
          'options': [
            {'id': 'pd-1', 'label': 'Flawless Display (Original Panel)', 'desc': 'Zero scratches or blemishes', 'adj': 2000},
            {'id': 'pd-2', 'label': 'Hairline Micro Scratches', 'desc': 'Not noticeable in everyday use', 'adj': 0},
            {'id': 'pd-3', 'label': 'Deep Scratches / Minor Chipped Glass', 'desc': 'Touch works but glass chipped', 'adj': -4500},
            {'id': 'pd-4', 'label': 'Cracked Panel / Lines / Touch Deadzone', 'desc': 'Display replacement required', 'adj': -10000},
          ]
        },
        {
          'id': 'phone-battery',
          'question': 'Battery Health Capacity (Above 85%)?',
          'subtext': 'Check Settings -> Battery -> Battery Health percentage.',
          'options': [
            {'id': 'pb-1', 'label': 'Yes, 90% – 100% Health', 'desc': 'Outstanding battery endurance', 'adj': 2000},
            {'id': 'pb-2', 'label': '80% – 89% Health (Normal)', 'desc': 'Standard healthy battery life', 'adj': 0},
            {'id': 'pb-3', 'label': 'Below 80% / Service Notification', 'desc': 'Battery replacement prompt shown', 'adj': -3000},
          ]
        },
        {
          'id': 'phone-cameras',
          'question': 'Are All Cameras & Optical Zoom Functional?',
          'subtext': 'Test wide, telephoto, selfie cameras and autofocus.',
          'options': [
            {'id': 'pc-1', 'label': 'All Cameras Sharp & Fast Focus', 'desc': 'Pristine lenses and stabilization', 'adj': 0},
            {'id': 'pc-2', 'label': 'One Camera Blurry / Scratched Glass', 'desc': 'Minor secondary lens issue', 'adj': -3000},
            {'id': 'pc-3', 'label': 'Camera App Crashes / OIS Rattle', 'desc': 'Sensor repair needed', 'adj': -6500},
          ]
        },
        {
          'id': 'phone-bio',
          'question': 'Face ID, Fingerprint & TrueTone Working?',
          'subtext': 'Test biometric unlocking and true tone display calibration.',
          'options': [
            {'id': 'pbi-1', 'label': 'Face ID / Fingerprint & TrueTone Active', 'desc': '100% genuine sensors', 'adj': 1000},
            {'id': 'pbi-2', 'label': 'TrueTone Disabled (Screen Changed)', 'desc': 'Display replaced previously', 'adj': -2000},
            {'id': 'pbi-3', 'label': 'Biometric Hardware Failed', 'desc': 'Face ID or Touch ID dead', 'adj': -4500},
          ]
        },
        {
          'id': 'phone-box',
          'question': 'Original Fast Charger & Packaging Box?',
          'subtext': 'Original manufacturer box with matching IMEI and fast charger.',
          'options': [
            {'id': 'pbx-1', 'label': 'Original Box + Genuine Charger Included', 'desc': 'Complete package', 'adj': 1100},
            {'id': 'pbx-2', 'label': 'Original Box Only (No Charger)', 'desc': 'Matching IMEI retail box', 'adj': 500},
            {'id': 'pbx-3', 'label': 'Phone Only (No Box or Charger)', 'desc': 'Handset only', 'adj': 0},
          ]
        },
      ];
    } else if (cat.contains('laptop') || cat.contains('macbook')) {
      return [
        {
          'id': 'lap-power',
          'question': 'Does the laptop boot into OS and sleep/wake normally?',
          'subtext': 'Powers on without chime failure or unexpected shutdowns.',
          'options': [
            {'id': 'lp-1', 'label': 'Boots Fast & Runs Normal', 'desc': 'No kernel panics or blue screens', 'adj': 0},
            {'id': 'lp-2', 'label': 'Random Freezes / Throttling', 'desc': 'Thermal or logic board issue', 'adj': -7000},
            {'id': 'lp-3', 'label': 'Black Screen / No Power', 'desc': 'Motherboard failure', 'adj': -20000},
          ]
        },
        {
          'id': 'lap-display',
          'question': 'Screen & Anti-Reflective Coating Condition?',
          'subtext': 'Check for keyboard marks, dead pixels, staingate or lines.',
          'options': [
            {'id': 'ld-1', 'label': 'Pristine Flawless Display', 'desc': 'No dead pixels or delamination', 'adj': 2000},
            {'id': 'ld-2', 'label': 'Micro Scratches / Keyboard Imprints', 'desc': 'Normal surface wear', 'adj': 0},
            {'id': 'ld-3', 'label': 'Cracked Panel / Lines / Staingate', 'desc': 'Screen replacement needed', 'adj': -8500},
          ]
        },
        {
          'id': 'lap-keyboard',
          'question': 'Keyboard, Backlight & Trackpad Condition?',
          'subtext': 'Test all keys, backlight uniformity, and trackpad haptic click.',
          'options': [
            {'id': 'lk-1', 'label': 'All Keys & Trackpad Perfect', 'desc': 'Smooth typing & gestures', 'adj': 0},
            {'id': 'lk-2', 'label': 'Sticky Keys / Faded Letters', 'desc': 'Minor key wear', 'adj': -2500},
            {'id': 'lk-3', 'label': 'Trackpad Defect / Broken Backlight', 'desc': 'Click unresponsive', 'adj': -4500},
          ]
        },
        {
          'id': 'lap-battery',
          'question': 'Battery Health & Backup Duration?',
          'subtext': 'Check battery cycle count and backup time.',
          'options': [
            {'id': 'lb-1', 'label': 'Original Battery with 6+ Hours Backup', 'desc': 'Healthy battery cycles', 'adj': 2000},
            {'id': 'lb-2', 'label': 'Normal Backup (3-5 Hours)', 'desc': 'Standard usable condition', 'adj': 0},
            {'id': 'lb-3', 'label': 'Service Battery Alert / Swollen', 'desc': 'Replacement required', 'adj': -5000},
          ]
        },
        {
          'id': 'lap-charger',
          'question': 'Original High-Wattage Power Adapter & Box?',
          'subtext': 'Original MagSafe or USB-C power brick with cable and retail box.',
          'options': [
            {'id': 'lc-1', 'label': 'Original OEM Fast Charger + Box', 'desc': 'Complete power & retail bundle', 'adj': 1600},
            {'id': 'lc-2', 'label': 'Original Charger Only (No Box)', 'desc': 'Standard genuine adapter', 'adj': 1000},
            {'id': 'lc-3', 'label': 'Third-Party Charger / No Adapter', 'desc': 'Missing OEM charger', 'adj': -1500},
          ]
        },
      ];
    }

    // Default DSLR / Mirrorless camera questions
    return [
      {
        'id': 'cam-power',
        'question': 'Does the camera power on & shoot normally?',
        'subtext': 'Check sensor readout, shutter mechanism, dials and screen.',
        'options': [
          {'id': 'cp-1', 'label': 'Powers on & Shoots Perfectly', 'desc': 'Normal shutter response & dials', 'adj': 0},
          {'id': 'cp-2', 'label': 'Intermittent Shutter Lag', 'desc': 'Takes photos but occasional pause', 'adj': -3000},
          {'id': 'cp-3', 'label': 'Does Not Power On', 'desc': 'Requires servicing / board check', 'adj': -8000},
        ]
      },
      {
        'id': 'cam-sensor',
        'question': 'Sensor Glass & Viewfinder Condition?',
        'subtext': 'Check sensor surface under direct light.',
        'options': [
          {'id': 'cs-1', 'label': 'Pristine Flawless Sensor', 'desc': 'Zero spots, dust or scratches', 'adj': 2000},
          {'id': 'cs-2', 'label': 'Minor Dust (Easily Cleaned)', 'desc': 'Standard sensor dust specks', 'adj': 0},
          {'id': 'cs-3', 'label': 'Visible Scratches / Fungus', 'desc': 'Coating damage or fungus mark', 'adj': -5000},
        ]
      },
      {
        'id': 'cam-shutter',
        'question': 'Estimated Shutter Actuations?',
        'subtext': 'Total photos clicked with this camera body.',
        'options': [
          {'id': 'csh-1', 'label': '< 20,000 Shutter Count', 'desc': 'Light hobbyist usage', 'adj': 1500},
          {'id': 'csh-2', 'label': '20,000 - 60,000 Shutter Count', 'desc': 'Moderate regular use', 'adj': 0},
          {'id': 'csh-3', 'label': '> 80,000 Shutter Count', 'desc': 'Heavy professional workload', 'adj': -4000},
        ]
      },
      {
        'id': 'cam-body',
        'question': 'Body Cosmetic & Rubber Grip Condition?',
        'subtext': 'Inspect body corners, tripod mount, and rubber grip.',
        'options': [
          {'id': 'cb-1', 'label': 'Like New / Flawless', 'desc': 'No scratches, firm rubber grips', 'adj': 1500},
          {'id': 'cb-2', 'label': 'Good (Minor Rub Marks)', 'desc': 'Normal cosmetic edge wear', 'adj': 0},
          {'id': 'cb-3', 'label': 'Heavy Paint Wear / Peeling', 'desc': 'Loose rubber or body dings', 'adj': -3500},
        ]
      },
      {
        'id': 'cam-accessories',
        'question': 'Original Charger, Battery & Packaging Box?',
        'subtext': 'Original OEM battery, dedicated charger, body cap, and retail box.',
        'options': [
          {'id': 'ca-1', 'label': 'Complete Original Box + OEM Charger + Battery', 'desc': 'Complete retail bundle', 'adj': 2500},
          {'id': 'ca-2', 'label': 'Original Charger + Battery (No Box)', 'desc': 'Standard operational gear', 'adj': 0},
          {'id': 'ca-3', 'label': 'Third-Party Charger Only / Missing Caps', 'desc': 'Incomplete accessory bundle', 'adj': -2500},
        ]
      },
    ];
  }

  // ── REFURBISHED & RENTALS ──
  static Future<List<Map<String, dynamic>>> fetchRefurbished({String? category, String? condition, String? search}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (category != null && category.isNotEmpty && category != 'all') queryParams['category'] = category;
      if (condition != null && condition.isNotEmpty && condition != 'all') queryParams['condition'] = condition;
      if (search != null && search.isNotEmpty) queryParams['search'] = search;

      final res = await dio.get(ApiConstants.refurbished, queryParameters: queryParams);
      if (res.data != null && res.data['products'] is List) {
        final list = (res.data['products'] as List).cast<Map<String, dynamic>>();
        if (list.isNotEmpty) {
          ApiSanitizer.sanitizeRefurbished(list);
          cachedRefurbished = list;
          return list;
        }
      }
    } catch (_) {}
    return cachedRefurbished;
  }

  static Future<List<Map<String, dynamic>>> fetchRentalCameras({String? category, String? brand, String? search}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (category != null && category.isNotEmpty && category != 'all') queryParams['category'] = category;
      if (brand != null && brand.isNotEmpty && brand != 'all') queryParams['brand'] = brand;
      if (search != null && search.isNotEmpty) queryParams['search'] = search;

      final res = await dio.get(ApiConstants.rentals, queryParameters: queryParams);
      if (res.data != null && res.data['cameras'] is List) {
        final list = (res.data['cameras'] as List).cast<Map<String, dynamic>>();
        if (list.isNotEmpty) {
          ApiSanitizer.sanitizeRentalCameras(list);
          cachedRentalCameras = list;
          return list;
        }
      }
    } catch (_) {}
    return cachedRentalCameras;
  }

  // ── CAMERA LENSES ──
  static Future<List<Map<String, dynamic>>> fetchLenses() async {
    try {
      final res = await dio.get(ApiConstants.lenses);
      if (res.data != null && res.data['lenses'] is List) {
        final list = (res.data['lenses'] as List)
            .cast<Map<String, dynamic>>()
            .where((l) => l['active'] != false)
            .toList();
        if (list.isNotEmpty) {
          cachedLenses = list;
          return list;
        }
      }
    } catch (e) {
      debugPrint('Failed to fetch lenses from API: $e');
    }
    return cachedLenses;
  }

  // ── ORDERS ──
  static Future<List<Map<String, dynamic>>> fetchOrders({String? phone}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (phone != null && phone.isNotEmpty) queryParams['phone'] = phone;

      final res = await dio.get(ApiConstants.orders, queryParameters: queryParams);
      if (res.data != null && res.data['orders'] is List) {
        return (res.data['orders'] as List).cast<Map<String, dynamic>>();
      }
    } catch (_) {}
    return [];
  }

  static Future<Map<String, dynamic>?> createOrder(Map<String, dynamic> orderData) async {
    try {
      final res = await dio.post(ApiConstants.createOrder, data: orderData);
      if (res.data != null && res.data['success'] == true && res.data['order'] != null) {
        return Map<String, dynamic>.from(res.data['order'] as Map);
      }
    } catch (e) {
      appLog("⚠️ ApiService createOrder error: $e");
    }
    return null;
  }

  // ── USER PROFILE & PAYOUT SYNC ──
  static Future<Map<String, dynamic>?> updateUserProfile({
    required String phone,
    String? name,
    String? email,
    String? address,
    String? upiId,
    String? bankAccount,
  }) async {
    try {
      final res = await dio.put(ApiConstants.updateProfile, data: {
        'phone': phone.trim(),
        if (name != null) 'name': name.trim(),
        if (email != null) 'email': email.trim(),
        if (address != null) 'address': address.trim(),
        if (upiId != null) 'upiId': upiId.trim(),
        if (bankAccount != null) 'bankAccount': bankAccount.trim(),
      });
      if (res.data != null && res.data['success'] == true) {
        appLog("✅ User profile synced with server successfully");
        return Map<String, dynamic>.from(res.data['user'] as Map);
      }
    } catch (e) {
      appLog("⚠️ Profile sync network error: $e");
    }
    return null;
  }

  static Future<Map<String, dynamic>?> fetchUserProfile(String phone) async {
    try {
      final res = await dio.get(ApiConstants.updateProfile, queryParameters: {'phone': phone.trim()});
      if (res.data != null && res.data['success'] == true && res.data['user'] != null) {
        return Map<String, dynamic>.from(res.data['user'] as Map);
      }
    } catch (e) {
      appLog("⚠️ Fetch profile error: $e");
    }
    return null;
  }

  // ── ORDER LIFECYCLE (CANCEL & RESCHEDULE) ──
  static Future<bool> cancelOrder({
    required String orderId,
    String? reason,
  }) async {
    try {
      final res = await dio.patch(ApiConstants.updateOrder, data: {
        'orderId': orderId,
        'status': 'Cancelled',
        'cancellationReason': reason ?? 'Cancelled by user',
      });
      return res.data != null && res.data['success'] == true;
    } catch (e) {
      appLog("❌ Cancel order error: $e");
      return false;
    }
  }

  static Future<bool> rescheduleOrder({
    required String orderId,
    required String newDate,
    required String newSlot,
  }) async {
    try {
      final res = await dio.patch(ApiConstants.updateOrder, data: {
        'orderId': orderId,
        'pickupDate': newDate,
        'pickupSlot': newSlot,
      });
      return res.data != null && res.data['success'] == true;
    } catch (e) {
      appLog("❌ Reschedule order error: $e");
      return false;
    }
  }

  // ── CITIES & SERVICEABILITY ──
  static Future<List<Map<String, dynamic>>> fetchCities() async {
    try {
      final res = await dio.get(ApiConstants.cities);
      if (res.data != null && res.data['cities'] is List) {
        return (res.data['cities'] as List).cast<Map<String, dynamic>>();
      }
    } catch (e) {
      appLog("⚠️ Fetch cities error: $e");
    }
    return [];
  }

  static Future<Map<String, dynamic>> checkPincodeServiceability(String pincode) async {
    try {
      final res = await dio.get(ApiConstants.pincodes, queryParameters: {'pincode': pincode.trim()});
      if (res.data != null && res.data is Map) {
        return Map<String, dynamic>.from(res.data as Map);
      }
    } catch (e) {
      // Fallback to cities endpoint
      try {
        final res = await dio.get(ApiConstants.cities, queryParameters: {'pincode': pincode.trim()});
        if (res.data != null && res.data is Map) {
          return Map<String, dynamic>.from(res.data as Map);
        }
      } catch (_) {}
      appLog("⚠️ Pincode check error: $e");
    }
    return {'success': true, 'serviceable': false, 'pincode': pincode};
  }

  // ── NOTIFICATIONS ──
  static Future<List<Map<String, dynamic>>> fetchNotifications({String? phone}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (phone != null && phone.isNotEmpty) queryParams['phone'] = phone;
      final res = await dio.get(ApiConstants.notifications, queryParameters: queryParams);
      if (res.data != null && res.data['notifications'] is List) {
        return (res.data['notifications'] as List).cast<Map<String, dynamic>>();
      }
    } catch (e) {
      appLog("⚠️ Fetch notifications error: $e");
    }
    return [];
  }

  static Future<void> markNotificationAsRead(String id) async {
    try {
      await dio.post(ApiConstants.notifications, data: {
        'action': 'mark_read',
        'id': id,
      });
    } catch (e) {
      appLog("⚠️ Mark notification read error: $e");
    }
  }

  // ── OTP AUTHENTICATION ──
  static Future<Map<String, dynamic>> sendOtp(String phone) async {
    try {
      final res = await dio.post(ApiConstants.sendOtp, data: {'phone': phone.trim()});
      if (res.data != null && res.data is Map) {
        return Map<String, dynamic>.from(res.data as Map);
      }
    } catch (e) {
      appLog("⚠️ Send OTP error: $e");
    }
    return {'success': true, 'message': 'OTP sent to mobile'};
  }

  static Future<Map<String, dynamic>> verifyOtp({required String phone, required String otp}) async {
    try {
      final res = await dio.post(ApiConstants.verifyOtp, data: {
        'phone': phone.trim(),
        'otp': otp.trim(),
      });
      if (res.data != null && res.data is Map) {
        return Map<String, dynamic>.from(res.data as Map);
      }
    } catch (e) {
      appLog("⚠️ Verify OTP error: $e");
    }
    return {'success': false, 'message': 'Invalid OTP'};
  }
}
