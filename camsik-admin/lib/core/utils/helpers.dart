import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../app.dart';
import '../constants/app_colors.dart';

class Helpers {
  Helpers._();

  static Future<void> makePhoneCall(String phoneNumber) async {
    final cleanPhone = phoneNumber.replaceAll(RegExp(r'[^0-9+]'), '');
    if (cleanPhone.isEmpty) {
      showErrorSnackbar('Invalid Phone', 'No valid contact number provided');
      return;
    }
    final Uri phoneUri = Uri.parse('tel:$cleanPhone');
    try {
      if (await canLaunchUrl(phoneUri)) {
        await launchUrl(phoneUri);
      } else {
        showErrorSnackbar('Dialer Error', 'Could not open phone dialer');
      }
    } catch (_) {
      showErrorSnackbar('Dialer Error', 'Could not open phone dialer');
    }
  }

  static Future<void> openMapNavigation(String destination) async {
    if (destination.trim().isEmpty) {
      showErrorSnackbar('Navigation Error', 'No destination address specified');
      return;
    }
    final encoded = Uri.encodeComponent(destination);
    final Uri mapUri = Uri.parse('https://www.google.com/maps/search/?api=1&query=$encoded');
    try {
      if (await canLaunchUrl(mapUri)) {
        await launchUrl(mapUri, mode: LaunchMode.externalApplication);
      } else {
        showErrorSnackbar('Maps Error', 'Could not open maps navigation');
      }
    } catch (_) {
      showErrorSnackbar('Maps Error', 'Could not open maps navigation');
    }
  }

  static void showSuccessSnackbar(String title, String message) {
    scaffoldMessengerKey.currentState?.hideCurrentSnackBar();
    scaffoldMessengerKey.currentState?.showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle, color: Colors.white, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  Text(
                    message,
                    style: const TextStyle(color: Colors.white, fontSize: 12),
                  ),
                ],
              ),
            ),
          ],
        ),
        backgroundColor: AppColors.success,
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  static void showErrorSnackbar(String title, String message) {
    scaffoldMessengerKey.currentState?.hideCurrentSnackBar();
    scaffoldMessengerKey.currentState?.showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.error_outline, color: Colors.white, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  Text(
                    message,
                    style: const TextStyle(color: Colors.white, fontSize: 12),
                  ),
                ],
              ),
            ),
          ],
        ),
        backgroundColor: AppColors.error,
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }
}

Future<void> openDialer(String phoneNumber) => Helpers.makePhoneCall(phoneNumber);

Future<void> openGoogleMapsNavigation(String address) => Helpers.openMapNavigation(address);

void showCustomSnackBar(BuildContext context, String message, {bool isError = false}) {
  if (isError) {
    Helpers.showErrorSnackbar('Notice', message);
  } else {
    Helpers.showSuccessSnackbar('Success', message);
  }
}
