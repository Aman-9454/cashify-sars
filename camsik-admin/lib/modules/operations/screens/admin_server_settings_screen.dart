import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/services/api_service.dart';
import '../../../core/utils/helpers.dart';
import '../../overview/bloc/overview_cubit.dart';

class AdminServerSettingsScreen extends StatefulWidget {
  const AdminServerSettingsScreen({super.key});

  @override
  State<AdminServerSettingsScreen> createState() => _AdminServerSettingsScreenState();
}

class _AdminServerSettingsScreenState extends State<AdminServerSettingsScreen> {
  final _customUrlController = TextEditingController();
  bool _isTesting = false;
  String? _testResult;
  bool _testSuccess = false;

  @override
  void initState() {
    super.initState();
    _customUrlController.text = ApiConstants.serverUrl;
    _testConnection(ApiConstants.serverUrl);
  }

  @override
  void dispose() {
    _customUrlController.dispose();
    super.dispose();
  }

  Future<void> _testConnection(String url) async {
    setState(() {
      _isTesting = true;
      _testResult = 'Pinging $url...';
    });

    try {
      final dio = ApiService.dio;
      final cleanUrl = url.endsWith('/') ? url.substring(0, url.length - 1) : url;
      final res = await dio.get('$cleanUrl/api/admin/overview').timeout(const Duration(seconds: 4));
      
      if (!mounted) return;
      setState(() {
        _isTesting = false;
        _testSuccess = res.statusCode == 200;
        _testResult = res.statusCode == 200
            ? 'Connected successfully (HTTP ${res.statusCode})'
            : 'Server responded with HTTP ${res.statusCode}';
      });
    } catch (e) {
      // Test basic root if admin overview is protected
      try {
        final dio = ApiService.dio;
        final cleanUrl = url.endsWith('/') ? url.substring(0, url.length - 1) : url;
        final res = await dio.get('$cleanUrl/api/categories').timeout(const Duration(seconds: 4));
        if (!mounted) return;
        setState(() {
          _isTesting = false;
          _testSuccess = res.statusCode == 200;
          _testResult = res.statusCode == 200
              ? 'Connected successfully (API Active)'
              : 'Failed: $e';
        });
      } catch (err) {
        if (!mounted) return;
        setState(() {
          _isTesting = false;
          _testSuccess = false;
          _testResult = 'Connection failed: $err';
        });
      }
    }
  }

  Future<void> _selectServer(String url) async {
    await ApiService.switchServerUrl(url);
    if (!mounted) return;
    _customUrlController.text = url;
    try {
      context.read<OverviewCubit>().loadOverview();
    } catch (_) {}
    showCustomSnackBar(context, 'Switched to $url', isError: false);
    _testConnection(url);
  }

  @override
  Widget build(BuildContext context) {
    final activeUrl = ApiConstants.serverUrl;

    return Scaffold(
      appBar: AppBar(
        title: const Text('API Server & Connection', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: AppColors.secondary,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.border),
                boxShadow: [
                  BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 8, offset: const Offset(0, 2)),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 12,
                        height: 12,
                        decoration: BoxDecoration(
                          color: _testSuccess ? AppColors.success : (_isTesting ? AppColors.warning : AppColors.error),
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        _isTesting ? 'Testing connection...' : (_testSuccess ? 'Server Online' : 'Server Offline / Unreachable'),
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                          color: _testSuccess ? AppColors.success : (_isTesting ? AppColors.warning : AppColors.error),
                        ),
                      ),
                      const Spacer(),
                      IconButton(
                        icon: const Icon(Icons.refresh, size: 18),
                        onPressed: () => _testConnection(ApiConstants.serverUrl),
                        tooltip: 'Test Connection',
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Active Base URL: ${ApiConstants.baseUrl}',
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                  ),
                  if (_testResult != null) ...[
                    const SizedBox(height: 6),
                    Text(
                      _testResult!,
                      style: TextStyle(
                        fontSize: 11,
                        color: _testSuccess ? AppColors.textSecondary : AppColors.error,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 24),

            const Text(
              'PRECONFIGURED ENVIRONMENTS',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textMuted, letterSpacing: 0.5),
            ),
            const SizedBox(height: 10),

            _buildPresetOption(
              title: 'Localhost (Port 4028) [Recommended]',
              subtitle: 'Local Next.js server running at http://localhost:4028',
              url: 'http://localhost:4028',
              isActive: activeUrl == 'http://localhost:4028',
            ),
            const SizedBox(height: 10),

            _buildPresetOption(
              title: 'Android Emulator (Port 4028)',
              subtitle: 'Android loopback mapped to host: http://10.0.2.2:4028',
              url: 'http://10.0.2.2:4028',
              isActive: activeUrl == 'http://10.0.2.2:4028',
            ),
            const SizedBox(height: 10),

            _buildPresetOption(
              title: 'Production (Vercel)',
              subtitle: 'Live Cloud deployment: https://casmik-one.vercel.app',
              url: 'https://casmik-one.vercel.app',
              isActive: activeUrl == 'https://casmik-one.vercel.app',
            ),
            const SizedBox(height: 24),

            const Text(
              'CUSTOM SERVER URL',
              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textMuted, letterSpacing: 0.5),
            ),
            const SizedBox(height: 10),

            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _customUrlController,
                    decoration: InputDecoration(
                      hintText: 'e.g. http://192.168.1.100:4028',
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.border)),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () {
                    final clean = _customUrlController.text.trim();
                    if (clean.isNotEmpty) {
                      _selectServer(clean);
                    }
                  },
                  child: const Text('Apply', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPresetOption({
    required String title,
    required String subtitle,
    required String url,
    required bool isActive,
  }) {
    return InkWell(
      onTap: () => _selectServer(url),
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isActive ? AppColors.primary.withValues(alpha: 0.08) : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isActive ? AppColors.primary : AppColors.border,
            width: isActive ? 1.5 : 1,
          ),
        ),
        child: Row(
          children: [
            Icon(
              isActive ? Icons.radio_button_checked : Icons.radio_button_off,
              color: isActive ? AppColors.primary : AppColors.textMuted,
              size: 20,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: isActive ? AppColors.primary : AppColors.textPrimary)),
                  const SizedBox(height: 2),
                  Text(subtitle, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                ],
              ),
            ),
            if (isActive)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(8)),
                child: const Text('ACTIVE', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
              ),
          ],
        ),
      ),
    );
  }
}
