import 'dart:async';
import 'package:flutter/material.dart';
import '../core/services/api_service.dart';
import '../core/services/notification_service.dart';
import '../models/user_order.dart';
import '../models/user_profile.dart';
import '../widgets/camsik_bottom_bar.dart';
import 'home/screens/select_location_screen.dart';
import 'profile/screens/notifications_screen.dart';
import 'buy/buy_refurbished_screen.dart';
import 'exchange/exchange_workflow_screen.dart';
import 'home/home_screen.dart';
import 'profile/user_profile_screen.dart';
import 'sell/sell_workflow_screen.dart';

class UserMainNavigationScreen extends StatefulWidget {
  final UserProfile userProfile;
  final Function(UserProfile) onProfileUpdate;
  final VoidCallback onLogout;

  const UserMainNavigationScreen({
    super.key,
    required this.userProfile,
    required this.onProfileUpdate,
    required this.onLogout,
  });

  @override
  State<UserMainNavigationScreen> createState() =>
      _UserMainNavigationScreenState();
}

class _UserMainNavigationScreenState extends State<UserMainNavigationScreen> {
  int _currentIndex = 0;
  String _selectedCity = 'Mumbai';
  String _selectedArea = 'Mira Road';

  // Dynamic state loaded from eager cache for instant 0ms UI rendering
  List<Map<String, dynamic>> _banners = ApiService.cachedBanners;
  List<Map<String, dynamic>> _categories = ApiService.cachedCategories;
  List<Map<String, dynamic>> _refurbishedProducts =
      ApiService.cachedRefurbished;
  List<Map<String, dynamic>> _rentalCameras = ApiService.cachedRentalCameras;
  final List<UserOrder> _orders = [];
  Timer? _orderPollingTimer;

  // Selected category for Sell workflow
  String? _preselectedSellCategory;

  @override
  void initState() {
    super.initState();
    _loadInitialData();

    // Real-time Order Sync: Poll every 6 seconds so user immediately sees status updates from partner & rider
    _orderPollingTimer = Timer.periodic(const Duration(seconds: 6), (_) {
      if (mounted && widget.userProfile.phone.isNotEmpty) {
        _refreshOrders();
      }
    });
  }

  @override
  void dispose() {
    _orderPollingTimer?.cancel();
    super.dispose();
  }

  Future<void> _refreshOrders() async {
    if (widget.userProfile.phone.isNotEmpty) {
      try {
        final fetchedOrders =
            await ApiService.fetchOrders(phone: widget.userProfile.phone);
        if (mounted && fetchedOrders.isNotEmpty) {
          setState(() {
            _orders.clear();
            for (final o in fetchedOrders) {
              _orders.add(UserOrder.fromJson(o));
            }
          });
        }
      } catch (_) {}
    }
  }

  Future<void> _refreshAllData() async {
    try {
      final results = await Future.wait([
        ApiService.fetchBanners(),
        ApiService.fetchCategories(),
        ApiService.fetchRefurbished(),
        ApiService.fetchRentalCameras(),
        ApiService.fetchLenses(),
      ]);
      if (mounted) {
        setState(() {
          _banners = results[0];
          _categories = results[1];
          _refurbishedProducts = results[2];
          _rentalCameras = results[3];
        });
      }
    } catch (_) {}

    await _refreshOrders();

    // Refresh notifications count
    NotificationService.checkUnreadCount(phone: widget.userProfile.phone);
  }

  void _loadInitialData() {
    _refreshAllData();
    NotificationService.checkUnreadCount(phone: widget.userProfile.phone);
  }

  void _navigateToSellWithCategory(String catId) {
    setState(() {
      _preselectedSellCategory = catId;
      _currentIndex = 1;
    });
  }

  void _handleOrderCreated(UserOrder order) {
    setState(() {
      _orders.insert(0, order);
      _currentIndex = 0; // Navigate back to Home from start cleanly
    });

    // Native Android Notification & In-App SnackBar
    NotificationService.triggerNotification(
      context: context,
      title: 'Order Confirmed · ${order.orderNumber}',
      message:
          'Your ${order.type.toUpperCase()} request for ${order.device} has been successfully scheduled.',
      orderId: order.orderNumber,
      onTapViewOrder: () {
        setState(() => _currentIndex = 4);
      },
    );
  }

  Future<void> _openLocationPicker() async {
    final result = await Navigator.push<Map<String, String>>(
      context,
      MaterialPageRoute(
        builder: (_) => SelectLocationScreen(
          selectedCity: _selectedCity,
          selectedArea: _selectedArea,
        ),
      ),
    );

    if (result != null && mounted) {
      setState(() {
        _selectedCity = result['city'] ?? _selectedCity;
        _selectedArea = result['area'] ?? _selectedArea;
      });
    }
  }

  Future<void> _showNotificationsDialog() async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => NotificationsScreen(
          phone: widget.userProfile.phone,
          onNavigateToOrders: () {
            setState(() => _currentIndex = 4);
          },
        ),
      ),
    );
    if (mounted) {
      NotificationService.checkUnreadCount(phone: widget.userProfile.phone);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(68),
        child: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFF0B132B), Color(0xFF0F172A)],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ),
          ),
          child: AppBar(
            backgroundColor: Colors.transparent,
            automaticallyImplyLeading: false,
            elevation: 0,
            title: Padding(
              padding: const EdgeInsets.only(top: 6),
              child: Row(
                children: [
                  Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [
                          Color(0xFF059669),
                          Color(0xFF10B981),
                        ],
                        begin: Alignment.bottomLeft,
                        end: Alignment.topRight,
                      ),
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color:
                              const Color(0xFF059669).withValues(alpha: 0.35),
                          blurRadius: 10,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: const Center(
                      child:
                          Icon(Icons.camera_alt_rounded, color: Colors.white, size: 20),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Row(
                        children: [
                          RichText(
                            text: const TextSpan(
                              children: [
                                TextSpan(
                                  text: 'CAM',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w900,
                                    fontSize: 20,
                                    letterSpacing: -0.5,
                                  ),
                                ),
                                TextSpan(
                                  text: 'SIK',
                                  style: TextStyle(
                                    color: Color(0xFF34D399),
                                    fontWeight: FontWeight.w900,
                                    fontSize: 20,
                                    letterSpacing: -0.5,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                            decoration: BoxDecoration(
                              color: const Color(0xFF10B981).withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(5),
                              border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4), width: 0.6),
                            ),
                            child: const Text(
                              'LIVE',
                              style: TextStyle(
                                color: Color(0xFF34D399),
                                fontSize: 8,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                        ],
                      ),
                      InkWell(
                        onTap: _openLocationPicker,
                        borderRadius: BorderRadius.circular(12),
                        child: Row(
                          children: [
                            const Icon(Icons.place_rounded,
                                color: Color(0xFF34D399), size: 12),
                            const SizedBox(width: 3),
                            Text(
                              '$_selectedArea, $_selectedCity',
                              style: const TextStyle(
                                color: Colors.white70,
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const Icon(Icons.keyboard_arrow_down_rounded,
                                color: Colors.white70, size: 16),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.location_on_outlined,
                    color: Colors.white70, size: 22),
                tooltip: 'Select Location',
                onPressed: _openLocationPicker,
              ),
              Stack(
                alignment: Alignment.center,
                clipBehavior: Clip.none,
                children: [
                  IconButton(
                    icon: const Icon(Icons.notifications_none_rounded,
                        color: Colors.white70, size: 22),
                    tooltip: 'Notifications',
                    onPressed: _showNotificationsDialog,
                  ),
                  ValueListenableBuilder<int>(
                    valueListenable: NotificationService.unreadCountNotifier,
                    builder: (context, unreadCount, _) {
                      if (unreadCount <= 0) {
                        return const SizedBox.shrink();
                      }
                      return Positioned(
                        top: 8,
                        right: 8,
                        child: IgnorePointer(
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1.5),
                            constraints: const BoxConstraints(
                              minWidth: 16,
                              minHeight: 16,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFFEF4444),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: const Color(0xFF0F172A),
                                width: 1.5,
                              ),
                            ),
                            child: Center(
                              child: Text(
                                unreadCount > 9 ? '9+' : '$unreadCount',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 8.5,
                                  fontWeight: FontWeight.w900,
                                  height: 1.0,
                                ),
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
              const SizedBox(width: 4),
            ],
          ),
        ),
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: [
          HomeScreen(
            banners: _banners,
            categories: _categories,
            refurbishedProducts: _refurbishedProducts,
            rentalCameras: _rentalCameras,
            userProfile: widget.userProfile,
            onProfileUpdate: widget.onProfileUpdate,
            onOrderCreated: _handleOrderCreated,
            onNavigateToSellWithCategory: _navigateToSellWithCategory,
            onNavigateToTab: (idx) => setState(() => _currentIndex = idx),
            onRefresh: _refreshAllData,
          ),
          SellWorkflowWidget(
            categories: _categories,
            preselectedCategory: _preselectedSellCategory,
            userProfile: widget.userProfile,
            onProfileUpdate: widget.onProfileUpdate,
            onOrderCreated: _handleOrderCreated,
          ),
          BuyRefurbishedWidget(
            products: _refurbishedProducts,
            userProfile: widget.userProfile,
            onProfileUpdate: widget.onProfileUpdate,
            onOrderCreated: _handleOrderCreated,
          ),
          ExchangeWorkflowWidget(
            refurbishedProducts: _refurbishedProducts,
            userProfile: widget.userProfile,
            onProfileUpdate: widget.onProfileUpdate,
            onOrderCreated: _handleOrderCreated,
          ),
          UserProfileWidget(
            profile: widget.userProfile,
            orders: _orders,
            onProfileUpdate: widget.onProfileUpdate,
            onLogout: widget.onLogout,
            onRefreshOrders: _refreshOrders,
            onNavigateToSell: () => setState(() => _currentIndex = 1),
            onNavigateToBuy: () => setState(() => _currentIndex = 2),
          ),
        ],
      ),
      bottomNavigationBar: CamsikBottomBar(
        selectedIndex: _currentIndex,
        onItemSelected: (idx) {
          setState(() => _currentIndex = idx);
          if (idx == 4) {
            _refreshOrders();
          }
        },
      ),
    );
  }
}
