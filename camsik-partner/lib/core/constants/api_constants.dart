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
  static const String registerPartner = "$baseUrl/partners";
  static const String refreshToken = "$baseUrl/auth/refresh-token";


  // ── Partner Portal Endpoints ──
  static const String partners = "$baseUrl/partners";
  static const String partnerPayouts = "$baseUrl/partners/payouts";
  static const String partnerDashboard = "$baseUrl/partners/dashboard";
  static const String partnerInspectionCriteria = "$baseUrl/partners/inspection-criteria";

  // ── Orders & Operations ──
  static const String orders = "$baseUrl/orders";
  static const String orderMessages = "$baseUrl/orders/messages";
  static const String deliveryAgents = "$baseUrl/delivery-agents";

  // ── Device Inspection & Diagnostics ──
  static const String validateImei = "$baseUrl/device-verification/validate-imei";
  static const String verificationSession = "$baseUrl/device-verification/session";

  // ── Media & Damage Upload ──
  static const String imageKitAuth = "$baseUrl/imagekit/auth";
  static const String imageKitUpload = "$baseUrl/imagekit/upload";
}

