import 'dart:async';
import 'dart:convert';
import 'dart:io';
import '../constants/api_constants.dart';
import '../../models/partner_models.dart';

/// Real-time streaming socket service for instant partner notifications
/// without repeated polling or hammering the API.
class PartnerSocketService {
  PartnerSocketService._();
  static final PartnerSocketService instance = PartnerSocketService._();

  HttpClient? _client;
  HttpClientRequest? _request;
  StreamSubscription? _sub;
  bool _isConnected = false;
  String? _currentPartnerId;

  final _orderController = StreamController<PartnerOrder>.broadcast();
  Stream<PartnerOrder> get onNewOrder => _orderController.stream;

  bool get isConnected => _isConnected;

  void connect(String partnerId) {
    if (_isConnected && _currentPartnerId == partnerId) return;
    disconnect();
    _currentPartnerId = partnerId;
    _startStream(partnerId);
  }

  Future<void> _startStream(String partnerId) async {
    try {
      _client = HttpClient();
      final url = Uri.parse('${ApiConstants.baseUrl}/partners/events?partnerId=$partnerId');
      _request = await _client!.getUrl(url);
      _request!.headers.set('Accept', 'text/event-stream');
      _request!.headers.set('Cache-Control', 'no-cache');

      final response = await _request!.close();
      if (response.statusCode == 200) {
        _isConnected = true;
        _sub = response
            .transform(utf8.decoder)
            .transform(const LineSplitter())
            .listen((line) {
          if (line.startsWith('data: ')) {
            final jsonStr = line.substring(6).trim();
            if (jsonStr.isEmpty) return;
            try {
              final map = jsonDecode(jsonStr);
              if (map is Map && map['type'] == 'new_order_assigned' && map['order'] != null) {
                final order = PartnerOrder.fromJson(Map<String, dynamic>.from(map['order']));
                _orderController.add(order);
              }
            } catch (_) {}
          }
        }, onDone: () {
          _isConnected = false;
          _scheduleReconnect(partnerId);
        }, onError: (e) {
          _isConnected = false;
          _scheduleReconnect(partnerId);
        });
      } else {
        _scheduleReconnect(partnerId);
      }
    } catch (_) {
      _scheduleReconnect(partnerId);
    }
  }

  void _scheduleReconnect(String partnerId) {
    if (_currentPartnerId != partnerId) return;
    Future.delayed(const Duration(seconds: 5), () {
      if (_currentPartnerId == partnerId && !_isConnected) {
        _startStream(partnerId);
      }
    });
  }

  void disconnect() {
    _currentPartnerId = null;
    _isConnected = false;
    _sub?.cancel();
    _sub = null;
    try {
      _client?.close(force: true);
    } catch (_) {}
    _client = null;
  }
}
