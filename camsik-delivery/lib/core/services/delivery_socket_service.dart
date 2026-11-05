import 'dart:async';
import 'dart:convert';
import 'dart:io';
import '../constants/api_constants.dart';
import '../../models/delivery_models.dart';

/// Real-time streaming socket service for instant delivery task & pickup notifications
/// without repeated polling or hammering the API.
class DeliverySocketService {
  DeliverySocketService._();
  static final DeliverySocketService instance = DeliverySocketService._();

  HttpClient? _client;
  HttpClientRequest? _request;
  StreamSubscription? _sub;
  bool _isConnected = false;
  String? _currentAgentId;

  final _taskController = StreamController<DeliveryTask>.broadcast();
  Stream<DeliveryTask> get onNewTask => _taskController.stream;

  bool get isConnected => _isConnected;

  void connect(String agentId) {
    if (_isConnected && _currentAgentId == agentId) return;
    disconnect();
    _currentAgentId = agentId;
    _startStream(agentId);
  }

  Future<void> _startStream(String agentId) async {
    try {
      _client = HttpClient();
      final url = Uri.parse('${ApiConstants.deliveryEvents}?deliveryAgentId=$agentId');
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
              if (map is Map &&
                  (map['type'] == 'new_pickup_assigned' || map['type'] == 'new_order_assigned') &&
                  map['order'] != null) {
                final task = DeliveryTask.fromJson(Map<String, dynamic>.from(map['order']));
                _taskController.add(task);
              }
            } catch (_) {}
          }
        }, onDone: () {
          _isConnected = false;
          _scheduleReconnect(agentId);
        }, onError: (e) {
          _isConnected = false;
          _scheduleReconnect(agentId);
        });
      } else {
        _scheduleReconnect(agentId);
      }
    } catch (_) {
      _scheduleReconnect(agentId);
    }
  }

  void _scheduleReconnect(String agentId) {
    if (_currentAgentId != agentId) return;
    Future.delayed(const Duration(seconds: 5), () {
      if (_currentAgentId == agentId && !_isConnected) {
        _startStream(agentId);
      }
    });
  }

  void disconnect() {
    _currentAgentId = null;
    _isConnected = false;
    _sub?.cancel();
    _sub = null;
    try {
      _client?.close(force: true);
    } catch (_) {}
    _client = null;
  }
}
