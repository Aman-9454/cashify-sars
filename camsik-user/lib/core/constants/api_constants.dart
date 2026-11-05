class ApiConstants {
  ApiConstants._();

  // Primary Server & API Base URL
  // Set to true to use your local Next.js dev server (http://127.0.0.1:4028)
  // where the newly created APIs (profile, addresses, otp, etc.) are running.
  // Set to false when targeting the remote production Vercel server.
  static const bool useLocalBackend = false;
  static const String serverUrl = 
  useLocalBackend
      ? "http://127.0.0.1:4028"
      :
       "https://casmik-one.vercel.app";
  static const String baseUrl = "$serverUrl/api";

  // Fallback Server URLs for local development / testing
  static const List<String> fallbackUrls = [
    'http://localhost:4028',
    'https://casmik-one.vercel.app',
    'https://casmik.vercel.app',
    'http://10.0.2.2:4028',
  ];

  // ── Authentication Endpoints ──
  static const String login = "$baseUrl/auth/login";
  static const String register = "$baseUrl/auth/signup";
  static const String sendOtp = "$baseUrl/auth/send-otp";
  static const String verifyOtp = "$baseUrl/auth/verify-otp";
  static const String refreshToken = "$baseUrl/auth/refresh-token";
  static const String getProfile = "$baseUrl/auth/me";
  static const String updateProfile = "$baseUrl/auth/profile";

  // ── Catalog & Home Endpoints ──
  static const String banners = "$baseUrl/banners";
  static const String categories = "$baseUrl/categories";
  static const String brands = "$baseUrl/brands";
  static const String models = "$baseUrl/models";
  static const String questions = "$baseUrl/questions";
  static const String refurbished = "$baseUrl/refurbished";
  static const String rentals = "$baseUrl/rentals";
  static const String lenses = "$baseUrl/lenses";

  // ── Orders & Transactions Endpoints ──
  static const String orders = "$baseUrl/orders";
  static const String createOrder = "$baseUrl/orders";
  static const String updateOrder = "$baseUrl/orders";
  static const String orderMessages = "$baseUrl/orders/messages";

  // ── Device Verification & AI Diagnostics ──
  static const String validateImei = "$baseUrl/device-verification/validate-imei";
  static const String verificationSession = "$baseUrl/device-verification/session";

  // ── Media & ImageKit Upload ──
  static const String imageKitAuth = "$baseUrl/imagekit/auth";
  static const String imageKitUpload = "$baseUrl/imagekit/upload";

  // ── Location & Notifications ──
  static const String cities = "$baseUrl/cities";
  static const String pincodes = "$baseUrl/pincodes";
  static const String notifications = "$baseUrl/notifications";
}
