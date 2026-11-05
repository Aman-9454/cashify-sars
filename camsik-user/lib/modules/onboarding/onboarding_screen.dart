import 'package:flutter/material.dart';
import '../../core/constants/app_constants.dart';

class CamsikOnboardingScreen extends StatefulWidget {
  final VoidCallback onFinish;
  const CamsikOnboardingScreen({super.key, required this.onFinish});

  @override
  State<CamsikOnboardingScreen> createState() => _CamsikOnboardingScreenState();
}

class _CamsikOnboardingScreenState extends State<CamsikOnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentSlide = 0;

  final List<Map<String, dynamic>> _slides = [
    {
      'badge': 'INSTANT CASH PAYOUT $kBullet 60-SEC AI QUOTE',
      'title': 'Sell Old Tech & Cameras for Peak Cash',
      'subtitle':
          'Guaranteed highest resale payout for iPhones, MacBooks, DSLRs, Lenses & Tablets. 60-second AI valuation, free doorstep pickup & spot UPI transfer.',
      'gradient': [const Color(0xFF064E3B), const Color(0xFF059669)],
      'accent': const Color(0xFF34D399),
      'icon': Icons.bolt_rounded,
      'pills': ['Zero Hidden Deductions', 'Spot UPI Payout', 'DoD Military Wipe'],
    },
    {
      'badge': 'CERTIFIED REFURBISHED $kBullet 45-POINT CHECK',
      'title': 'Buy Verified Tech at up to 70% Off',
      'subtitle':
          'Explore 45-point rigorously tested pre-owned flagships with 6 to 12 months comprehensive warranty, 7-day replacement guarantee, and 90%+ healthy batteries.',
      'gradient': [const Color(0xFF1E1B4B), const Color(0xFF4F46E5)],
      'accent': const Color(0xFF818CF8),
      'icon': Icons.shopping_bag_rounded,
      'pills': ['6-12 Months Warranty', 'Battery 90%+', '100% Genuine Parts'],
    },
    {
      'badge': '1-STEP EXCHANGE $kBullet +$kRupee 5,000 BONUS',
      'title': 'Doorstep 1-Step Exchange & Upgrade',
      'subtitle':
          'Upgrade your gadget seamlessly with zero downtime. Hand your old device to our verified executive and receive your certified upgrade on the spot!',
      'gradient': [const Color(0xFF3B0764), const Color(0xFF7C3AED)],
      'accent': const Color(0xFFC084FC),
      'icon': Icons.swap_horizontal_circle_rounded,
      'pills': ['Extra $kRupee 5,000 Bonus', '1-Step Doorstep Swap', 'Pay Difference Only'],
    },
  ];

  @override
  Widget build(BuildContext context) {
    final slide = _slides[_currentSlide];

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              child: Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: widget.onFinish,
                  child: const Text(
                    'Skip',
                    style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                ),
              ),
            ),
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                itemCount: _slides.length,
                onPageChanged: (idx) => setState(() => _currentSlide = idx),
                itemBuilder: (ctx, idx) {
                  final item = _slides[idx];
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    child: Center(
                      child: SingleChildScrollView(
                        physics: const BouncingScrollPhysics(),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          width: 130,
                          height: 130,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: item['gradient'] as List<Color>,
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: (item['accent'] as Color).withValues(alpha: 0.35),
                                blurRadius: 28,
                                spreadRadius: 4,
                              ),
                            ],
                          ),
                          child: Center(
                            child: Icon(item['icon'] as IconData, size: 60, color: Colors.white),
                          ),
                        ),
                        const SizedBox(height: 36),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: (item['accent'] as Color).withValues(alpha: 0.5)),
                          ),
                          child: Text(
                            item['badge'] as String,
                            style: TextStyle(
                              color: item['accent'] as Color,
                              fontSize: 11,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          item['title'] as String,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 24,
                            fontWeight: FontWeight.w900,
                            height: 1.25,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          item['subtitle'] as String,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: Color(0xFF94A3B8),
                            fontSize: 13,
                            height: 1.5,
                          ),
                        ),
                        const SizedBox(height: 24),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          alignment: WrapAlignment.center,
                          children: (item['pills'] as List<String>).map((pill) {
                            return Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: const Color(0xFF1E293B),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: Colors.white12),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                   Icon(Icons.check_circle_rounded, size: 13, color: item['accent'] as Color),
                                  const SizedBox(width: 5),
                                  Text(
                                    pill,
                                    style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                            );
                          }).toList(),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: List.generate(
                      _slides.length,
                      (i) => AnimatedContainer(
                        duration: const Duration(milliseconds: 250),
                        margin: const EdgeInsets.only(right: 6),
                        width: _currentSlide == i ? 24 : 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: _currentSlide == i ? (slide['accent'] as Color) : Colors.white24,
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    ),
                  ),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: slide['accent'] as Color,
                      foregroundColor: const Color(0xFF0F172A),
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      elevation: 4,
                    ),
                    onPressed: () {
                      if (_currentSlide < _slides.length - 1) {
                        _pageController.nextPage(
                          duration: const Duration(milliseconds: 300),
                          curve: Curves.easeInOut,
                        );
                      } else {
                        widget.onFinish();
                      }
                    },
                    child: Row(
                      children: [
                        Text(
                          _currentSlide == _slides.length - 1 ? 'Get Started' : 'Next',
                          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14),
                        ),
                        const SizedBox(width: 6),
                        const Icon(Icons.arrow_forward_rounded, size: 16),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
