import 'package:flutter/material.dart';
import '../../models/user_order.dart';
import '../../models/user_profile.dart';
import '../rent/rental_cameras_screen.dart';
import 'widgets/action_hub.dart';
import 'widgets/banner_carousel.dart';
import 'widgets/categories_bar.dart';
import 'widgets/how_it_works_section.dart';
import 'widgets/rental_cameras_showcase.dart';
import 'widgets/top_deals_showcase.dart';
import 'widgets/trust_scorecard.dart';
import 'widgets/why_camsik_section.dart';

class HomeScreen extends StatelessWidget {
  final List<Map<String, dynamic>> banners;
  final List<Map<String, dynamic>> categories;
  final List<Map<String, dynamic>> refurbishedProducts;
  final List<Map<String, dynamic>> rentalCameras;
  final UserProfile userProfile;
  final Function(UserProfile) onProfileUpdate;
  final Function(UserOrder) onOrderCreated;
  final Function(String catId) onNavigateToSellWithCategory;
  final Function(int index) onNavigateToTab;
  final Future<void> Function()? onRefresh;

  const HomeScreen({
    super.key,
    required this.banners,
    required this.categories,
    required this.refurbishedProducts,
    required this.rentalCameras,
    required this.userProfile,
    required this.onProfileUpdate,
    required this.onOrderCreated,
    required this.onNavigateToSellWithCategory,
    required this.onNavigateToTab,
    this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF0B132B),
      child: RefreshIndicator(
        color: const Color(0xFF059669),
        backgroundColor: Colors.white,
        onRefresh: onRefresh ?? () async {},
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. TOP HERO BANNER (DARK BACKGROUND)
              CamsikFullWidthBannerCarousel(
                banners: banners,
                onBannerTap: onNavigateToSellWithCategory,
                onBrowseDeals: () => onNavigateToTab(2),
              ),

              // 2. WHITE OVERLAY SHEET CONTAINING ALL SECTIONS
              Container(
                width: double.infinity,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(26)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 18),

                    // ACTION HUB (SELL | BUY | EXCHANGE | RENT) - 4 INDIVIDUAL CARDS
                    CompactHorizontalActionHub(
                      onTapSell: () => onNavigateToTab(1),
                      onTapBuy: () => onNavigateToTab(2),
                      onTapExchange: () => onNavigateToTab(3),
                      onTapRent: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (ctx) => RentalCamerasWidget(
                              rentalCameras: rentalCameras,
                              userProfile: userProfile,
                              onProfileUpdate: onProfileUpdate,
                              onOrderCreated: onOrderCreated,
                            ),
                          ),
                        );
                      },
                    ),

                    const SizedBox(height: 22),

                    // TRENDING CATEGORIES (4 CARDS IN A ROW)
                    EightCategoriesBar(
                      categories: categories,
                      onCategorySelected: onNavigateToSellWithCategory,
                      onViewAll: () => onNavigateToTab(1),
                    ),

                    const SizedBox(height: 22),

                    // HOT DEALS ON REFURBISHED (2 SIDE-BY-SIDE CARDS)
                    TopDealsShowcase(
                      products: refurbishedProducts,
                      onShopAll: () => onNavigateToTab(2),
                    ),

                    const SizedBox(height: 22),

                    // CAMSIK QUALITY & TRUST GUARANTEE
                    const TrustScorecard(),

                    const SizedBox(height: 24),

                    // RENT PRO GEAR SHOWCASE
                    RentalCamerasShowcase(
                      rentalCameras: rentalCameras,
                      userProfile: userProfile,
                      onProfileUpdate: onProfileUpdate,
                      onOrderCreated: onOrderCreated,
                    ),

                    const SizedBox(height: 24),

                    // 3-STEP RECOMMERCE WORKFLOW
                    const HowItWorksSection(),

                    const SizedBox(height: 24),

                    // WHY CAMSIK SECTION
                    const WhyCamsikSection(),

                    const SizedBox(height: 36),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
