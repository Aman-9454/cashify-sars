class ApiConstants {
  ApiConstants._();

  // Primary Server & API Base URL
  static const String serverUrl = "https://casmik-one.vercel.app";
  static const String baseUrl = "$serverUrl/api";

  // Fallback Server URLs for local development / testing
  static const List<String> fallbackUrls = [
    'https://casmik-one.vercel.app',
    'https://casmik.vercel.app',
    'http://10.0.2.2:4028',
    'http://localhost:4028',
  ];

  // ── Authentication Endpoints ──
  static const String login = "$baseUrl/auth/login";
  static const String refreshToken = "$baseUrl/auth/refresh-token";

  // ── Delivery Agent Endpoints ──
  static const String deliveryAgents = "$baseUrl/delivery-agents";
  static const String deliveryEvents = "$baseUrl/delivery/events";

  // ── Orders / Tasks & Operations ──
  static const String orders = "$baseUrl/orders";
  static const String orderMessages = "$baseUrl/orders/messages";

  // ── Device Inspection & Diagnostics ──
  static const String questions = "$baseUrl/questions";
  static const String validateImei = "$baseUrl/device-verification/validate-imei";
  static const String verificationSession = "$baseUrl/device-verification/session";

  // ── Media & Proof Upload ──
  static const String imageKitAuth = "$baseUrl/imagekit/auth";
  static const String imageKitUpload = "$baseUrl/imagekit/upload";
}
