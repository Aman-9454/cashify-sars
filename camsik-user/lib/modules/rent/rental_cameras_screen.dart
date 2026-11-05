import 'package:flutter/material.dart';
import '../../models/user_order.dart';
import '../../models/user_profile.dart';
import 'views/rental_catalog_view.dart';
import 'views/rental_checkout_view.dart';
import 'views/rental_detail_view.dart';

class RentalCamerasWidget extends StatefulWidget {
  final List<Map<String, dynamic>> rentalCameras;
  final UserProfile userProfile;
  final Function(UserProfile) onProfileUpdate;
  final Function(UserOrder) onOrderCreated;
  final Map<String, dynamic>? initialCamera;

  const RentalCamerasWidget({
    super.key,
    required this.rentalCameras,
    required this.userProfile,
    required this.onProfileUpdate,
    required this.onOrderCreated,
    this.initialCamera,
  });

  @override
  State<RentalCamerasWidget> createState() => _RentalCamerasWidgetState();
}

class _RentalCamerasWidgetState extends State<RentalCamerasWidget> {
  Map<String, dynamic>? _activeDetailCamera;
  int _rentalDays = 3;
  bool _isCheckoutMode = false;
  Map<String, dynamic> _currentCalc = {};

  @override
  void initState() {
    super.initState();
    if (widget.initialCamera != null) {
      _activeDetailCamera = widget.initialCamera;
      _rentalDays = (widget.initialCamera!['minDays'] as num?)?.toInt() ?? 1;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_activeDetailCamera != null) {
      if (_isCheckoutMode) {
        return RentalCheckoutView(
          camera: _activeDetailCamera!,
          rentalDays: _rentalDays,
          priceCalc: _currentCalc,
          userProfile: widget.userProfile,
          onProfileUpdate: widget.onProfileUpdate,
          onOrderCreated: widget.onOrderCreated,
          onBack: () => setState(() => _isCheckoutMode = false),
        );
      }
      return RentalDetailView(
        camera: _activeDetailCamera!,
        initialRentalDays: _rentalDays,
        onBack: () => setState(() => _activeDetailCamera = null),
        onProceedToCheckout: (days, calc) {
          setState(() {
            _rentalDays = days;
            _currentCalc = calc;
            _isCheckoutMode = true;
          });
        },
      );
    }
    return RentalCatalogView(
      rentalCameras: widget.rentalCameras,
      onSelectCamera: (c) {
        setState(() {
          _activeDetailCamera = c;
          _rentalDays = (c['minDays'] as num?)?.toInt() ?? 1;
          _isCheckoutMode = false;
        });
      },
    );
  }
}
