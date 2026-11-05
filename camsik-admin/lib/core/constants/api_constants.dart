class ApiConstants {
  ApiConstants._();

  // Primary Server & API Base URL
  static  String serverUrl = "https://casmik-one.vercel.app";
  static  String baseUrl = "$serverUrl/api";

  // Fallback Server URLs for local development / testing
  static const List<String> fallbackUrls = [
    'http://localhost:4028',
    'http://10.83.192.150:4028',
    'http://10.0.2.2:4028',
    'https://casmik-one.vercel.app',
    'https://casmik.vercel.app',
  ];

  // ── Authentication Endpoints ──
  static String get login => "$baseUrl/auth/login";
  static String get refreshToken => "$baseUrl/auth/refresh-token";

  // ── Admin Command & Analytics ──
  static String get overview => "$baseUrl/admin/overview";

  // ── Orders Management ──
  static String get orders => "$baseUrl/orders";
  static String get orderMessages => "$baseUrl/orders/messages";

  // ── Partners Network ──
  static String get partners => "$baseUrl/partners";

  // ── Field Logistics & Fleet ──
  static String get deliveryAgents => "$baseUrl/delivery-agents";

  // ── Rental Fleet & Bookings ──
  static String get rentals => "$baseUrl/rentals";

  // ── Catalog Management ──
  static String get categories => "$baseUrl/categories";
  static String get brands => "$baseUrl/brands";
  static String get models => "$baseUrl/models";
  static String get lenses => "$baseUrl/lenses";
  static String get refurbished => "$baseUrl/refurbished";
  static String get questions => "$baseUrl/questions";

  // ── Logistics & Settings ──
  static String get pincodes => "$baseUrl/pincodes";
  static String get notifications => "$baseUrl/notifications";
  static String get payouts => "$baseUrl/payouts";
  static String get coupons => "$baseUrl/coupons";
  static String get supportTickets => "$baseUrl/support-tickets";

  // ── Media & Proof Upload ──
  static String get imageKitAuth => "$baseUrl/imagekit/auth";
  static String get imageKitUpload => "$baseUrl/imagekit/upload";
}

