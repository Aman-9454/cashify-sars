import 'package:flutter/material.dart';
import '../../core/services/api_service.dart';
import '../../core/utils/currency_formatter.dart';
import '../../models/user_order.dart';
import '../../models/user_profile.dart';
import '../../widgets/camsik_smart_image.dart';
import 'screens/buy_checkout_screen.dart';
import 'widgets/buy_product_detail_view.dart';

class BuyRefurbishedWidget extends StatefulWidget {
  final List<Map<String, dynamic>> products;
  final UserProfile userProfile;
  final Function(UserProfile) onProfileUpdate;
  final Function(UserOrder) onOrderCreated;

  const BuyRefurbishedWidget({
    super.key,
    required this.products,
    required this.userProfile,
    required this.onProfileUpdate,
    required this.onOrderCreated,
  });

  @override
  State<BuyRefurbishedWidget> createState() => _BuyRefurbishedWidgetState();
}

class _BuyRefurbishedWidgetState extends State<BuyRefurbishedWidget> {
  String _selectedCategory = 'all';
  String _selectedCondition = 'all';
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();
  Map<String, dynamic>? _activeDetailProduct;
  Map<String, dynamic>? _checkoutProduct;
  int _checkoutPrice = 0;
  String _checkoutCondition = 'Superb';
  String _checkoutStorage = '128GB';
  String _checkoutColor = 'Default';
  late List<Map<String, dynamic>> _liveProducts;
  bool _isLoading = false;

  final List<Map<String, String>> _categories = [
    {'id': 'all', 'label': 'All Devices', 'icon': '✨'},
    {'id': 'smartphones', 'label': 'Smartphones', 'icon': '📱'},
    {'id': 'cameras', 'label': 'Cameras', 'icon': '📷'},
    {'id': 'laptops', 'label': 'Laptops', 'icon': '💻'},
    {'id': 'tablets', 'label': 'Tablets', 'icon': '📟'},
    {'id': 'smartwatches', 'label': 'Watches', 'icon': '⌚'},
  ];

  final List<Map<String, String>> _conditions = [
    {'id': 'all', 'label': 'All Grades'},
    {'id': 'superb', 'label': 'Superb (Like New)'},
    {'id': 'good', 'label': 'Good Condition'},
    {'id': 'fair', 'label': 'Fair (Budget)'},
  ];

  @override
  void initState() {
    super.initState();
    _liveProducts = widget.products.isNotEmpty
        ? widget.products
        : ApiService.cachedRefurbished;
    _fetchLiveProducts();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(BuyRefurbishedWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.products != oldWidget.products && widget.products.isNotEmpty) {
      setState(() {
        _liveProducts = widget.products;
      });
    }
  }

  Future<void> _fetchLiveProducts() async {
    if (_liveProducts.isEmpty) {
      setState(() => _isLoading = true);
    }
    final fetched = await ApiService.fetchRefurbished();
    if (mounted) {
      setState(() {
        _liveProducts = fetched;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_checkoutProduct != null) {
      return BuyCheckoutScreen(
        product: _checkoutProduct!,
        selectedPrice: _checkoutPrice,
        selectedCondition: _checkoutCondition,
        selectedStorage: _checkoutStorage,
        selectedColor: _checkoutColor,
        userProfile: widget.userProfile,
        onProfileUpdate: widget.onProfileUpdate,
        onBack: () => setState(() => _checkoutProduct = null),
        onOrderCreated: (order) {
          setState(() {
            _checkoutProduct = null;
            _activeDetailProduct = null;
          });
          widget.onOrderCreated(order);
        },
      );
    }

    if (_activeDetailProduct != null) {
      return BuyProductDetailView(
        product: _activeDetailProduct!,
        allProducts: _liveProducts,
        onBack: () => setState(() => _activeDetailProduct = null),
        onCheckout: (finalPrice, condition, storage, color) {
          setState(() {
            _checkoutProduct = _activeDetailProduct;
            _checkoutPrice = finalPrice;
            _checkoutCondition = condition;
            _checkoutStorage = storage;
            _checkoutColor = color;
          });
        },
      );
    }

    var filtered = _liveProducts;
    if (_selectedCategory != 'all') {
      filtered = filtered
          .where((p) =>
              (p['category'] as String).toLowerCase() ==
              _selectedCategory.toLowerCase())
          .toList();
    }
    if (_selectedCondition != 'all') {
      filtered = filtered
          .where((p) =>
              (p['condition'] as String).toLowerCase() ==
              _selectedCondition.toLowerCase())
          .toList();
    }
    if (_searchQuery.trim().isNotEmpty) {
      final q = _searchQuery.toLowerCase().trim();
      filtered = filtered
          .where((p) =>
              (p['model'] as String).toLowerCase().contains(q) ||
              (p['brand'] as String).toLowerCase().contains(q))
          .toList();
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.white,
        titleSpacing: 16,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Text(
                  'Certified Refurbished',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF0F172A),
                    letterSpacing: -0.4,
                  ),
                ),
                const SizedBox(width: 6),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFFECFDF5),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFFA7F3D0)),
                  ),
                  child: const Text(
                    '✓ Tested',
                    style: TextStyle(
                      color: Color(0xFF059669),
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 2),
            const Text(
              '45-Point Inspected · 12-Month Warranty · Free Delivery',
              style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // ── MODERN SEARCH & FILTER SECTION ──
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(14, 6, 14, 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. Search Box
                Container(
                  height: 44,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(14),
                    border:
                        Border.all(color: const Color(0xFFE2E8F0), width: 0.8),
                  ),
                  child: TextField(
                    controller: _searchController,
                    onChanged: (v) => setState(() => _searchQuery = v),
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF0F172A),
                    ),
                    decoration: InputDecoration(
                      hintText: 'Search iPhone, MacBook, Canon, Sony...',
                      hintStyle: const TextStyle(
                        fontSize: 12.5,
                        color: Color(0xFF94A3B8),
                        fontWeight: FontWeight.w500,
                      ),
                      prefixIcon: const Icon(
                        Icons.search_rounded,
                        color: Color(0xFF059669),
                        size: 20,
                      ),
                      suffixIcon: _searchQuery.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.close_rounded,
                                  size: 18, color: Color(0xFF64748B)),
                              onPressed: () {
                                _searchController.clear();
                                setState(() => _searchQuery = '');
                              },
                            )
                          : null,
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 12),
                    ),
                  ),
                ),

                const SizedBox(height: 10),

                // 2. Category Filter Pills (Horizontal Scroll)
                SizedBox(
                  height: 36,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    physics: const BouncingScrollPhysics(),
                    itemCount: _categories.length,
                    separatorBuilder: (context, index) => const SizedBox(width: 6),
                    itemBuilder: (ctx, idx) {
                      final cat = _categories[idx];
                      final isSel = _selectedCategory == cat['id'];
                      return GestureDetector(
                        onTap: () =>
                            setState(() => _selectedCategory = cat['id']!),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 180),
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: isSel
                                ? const Color(0xFF059669)
                                : const Color(0xFFF8FAFC),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: isSel
                                  ? const Color(0xFF059669)
                                  : const Color(0xFFE2E8F0),
                              width: 1,
                            ),
                            boxShadow: isSel
                                ? [
                                    BoxShadow(
                                      color: const Color(0xFF059669)
                                          .withValues(alpha: 0.25),
                                      blurRadius: 6,
                                      offset: const Offset(0, 2),
                                    )
                                  ]
                                : [],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(cat['icon']!,
                                  style: const TextStyle(fontSize: 13)),
                              const SizedBox(width: 5),
                              Text(
                                cat['label']!,
                                style: TextStyle(
                                  color: isSel
                                      ? Colors.white
                                      : const Color(0xFF334155),
                                  fontSize: 11.5,
                                  fontWeight: isSel
                                      ? FontWeight.w900
                                      : FontWeight.w700,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),

                const SizedBox(height: 8),

                // 3. Condition Segmented Tabs + Live Count
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        physics: const BouncingScrollPhysics(),
                        child: Row(
                          children: _conditions.map((cond) {
                            final isSel = _selectedCondition == cond['id'];
                            return Padding(
                              padding: const EdgeInsets.only(right: 6),
                              child: GestureDetector(
                                onTap: () => setState(
                                    () => _selectedCondition = cond['id']!),
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 150),
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 9, vertical: 4.5),
                                  decoration: BoxDecoration(
                                    color: isSel
                                        ? const Color(0xFF6D28D9)
                                        : Colors.white,
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(
                                      color: isSel
                                          ? const Color(0xFF6D28D9)
                                          : const Color(0xFFE2E8F0),
                                      width: 0.8,
                                    ),
                                  ),
                                  child: Text(
                                    cond['label']!,
                                    style: TextStyle(
                                      color: isSel
                                          ? Colors.white
                                          : const Color(0xFF64748B),
                                      fontSize: 10.5,
                                      fontWeight: isSel
                                          ? FontWeight.w800
                                          : FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      '${filtered.length} units',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF059669),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // ── PRODUCT GRID ──
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(color: Color(0xFF059669)),
                  )
                : RefreshIndicator(
                    color: const Color(0xFF059669),
                    onRefresh: _fetchLiveProducts,
                    child: filtered.isEmpty
                        ? ListView(
                            physics: const AlwaysScrollableScrollPhysics(),
                            children: [
                              SizedBox(
                                  height: MediaQuery.of(context).size.height *
                                      0.12),
                              Center(
                                child: Padding(
                                  padding: const EdgeInsets.all(24),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(18),
                                        decoration: const BoxDecoration(
                                          color: Color(0xFFF1F5F9),
                                          shape: BoxShape.circle,
                                        ),
                                        child: const Icon(
                                            Icons.search_off_rounded,
                                            size: 40,
                                            color: Color(0xFF94A3B8)),
                                      ),
                                      const SizedBox(height: 14),
                                      const Text(
                                        'No Certified Devices Found',
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w900,
                                          color: Color(0xFF0F172A),
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      const Text(
                                        'Try adjusting your category, condition, or search query.',
                                        textAlign: TextAlign.center,
                                        style: TextStyle(
                                            fontSize: 12,
                                            color: Color(0xFF64748B)),
                                      ),
                                      const SizedBox(height: 16),
                                      ElevatedButton(
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor:
                                              const Color(0xFF059669),
                                          foregroundColor: Colors.white,
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 20, vertical: 10),
                                          shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(12)),
                                          elevation: 0,
                                        ),
                                        onPressed: () {
                                          _searchController.clear();
                                          setState(() {
                                            _selectedCategory = 'all';
                                            _selectedCondition = 'all';
                                            _searchQuery = '';
                                          });
                                        },
                                        child: const Text(
                                          'Reset All Filters',
                                          style: TextStyle(
                                              fontSize: 12.5,
                                              fontWeight: FontWeight.w800),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          )
                        : GridView.builder(
                            physics: const AlwaysScrollableScrollPhysics(),
                            padding: const EdgeInsets.all(12),
                            gridDelegate:
                                const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,
                              childAspectRatio: 0.61,
                              crossAxisSpacing: 10,
                              mainAxisSpacing: 10,
                            ),
                            itemCount: filtered.length,
                            itemBuilder: (ctx, idx) {
                              final p = filtered[idx];
                              return _buildModernProductCard(p);
                            },
                          ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildModernProductCard(Map<String, dynamic> p) {
    final name = p['model'] as String? ?? 'Device';
    final price = (p['sellingPrice'] as num?)?.toInt() ?? 0;
    final origPrice = (p['originalPrice'] as num?)?.toInt() ?? price;
    final discount = (p['discount'] as num?)?.toInt() ??
        (origPrice > price
            ? (((origPrice - price) / origPrice) * 100).round()
            : 0);

    final bRaw = p['batteryHealth'];
    final battery = bRaw is num
        ? '$bRaw% Battery'
        : (bRaw?.toString().replaceAll('Battery', '').trim().isNotEmpty == true
            ? '${bRaw.toString().replaceAll('Battery', '').trim()}% Battery'
            : '98% Battery');

    final condition = p['condition'] as String? ?? 'Superb';
    final image = p['image'] as String? ?? '';
    final stock = (p['stock'] as num?)?.toInt() ?? 3;
    final storage = p['storage']?.toString() ?? '128GB';

    // Condition Colors
    Color condBg;
    Color condText;
    if (condition.toLowerCase() == 'superb') {
      condBg = const Color(0xFFEDE9FE);
      condText = const Color(0xFF6D28D9);
    } else if (condition.toLowerCase() == 'good') {
      condBg = const Color(0xFFEFF6FF);
      condText = const Color(0xFF2563EB);
    } else {
      condBg = const Color(0xFFFFFBEB);
      condText = const Color(0xFFD97706);
    }

    return GestureDetector(
      onTap: () {
        setState(() {
          _activeDetailProduct = p;
        });
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFFF1F5F9), width: 1.2),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.035),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── TOP IMAGE AREA WITH BADGES ──
            Container(
              height: 140,
              decoration: const BoxDecoration(
                color: Color(0xFFF8FAFC),
                borderRadius: BorderRadius.vertical(top: Radius.circular(19)),
              ),
              child: Stack(
                children: [
                  // Product Image
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: CamsikSmartImage(
                        image: image,
                        fit: BoxFit.contain,
                        iconSize: 52,
                        iconColor: const Color(0xFF94A3B8),
                      ),
                    ),
                  ),

                  // Top Left: Condition Badge
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 6, vertical: 2.5),
                      decoration: BoxDecoration(
                        color: condBg,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        condition,
                        style: TextStyle(
                          color: condText,
                          fontSize: 9,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                  ),

                  // Top Right: Discount Badge
                  if (discount > 0)
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 2.5),
                        decoration: BoxDecoration(
                          color: const Color(0xFFDCFCE7),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          '$discount% OFF',
                          style: const TextStyle(
                            color: Color(0xFF059669),
                            fontSize: 9,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),

            // ── DETAILS AREA ──
            Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title
                  Text(
                    name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontWeight: FontWeight.w900,
                      fontSize: 13,
                      color: Color(0xFF0F172A),
                      letterSpacing: -0.3,
                    ),
                  ),
                  const SizedBox(height: 3),

                  // Specs / Storage & Battery
                  Row(
                    children: [
                      Text(
                        storage,
                        style: const TextStyle(
                          color: Color(0xFF64748B),
                          fontSize: 10.5,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const Text(
                        ' · ',
                        style:
                            TextStyle(color: Color(0xFFCBD5E1), fontSize: 10),
                      ),
                      Expanded(
                        child: Text(
                          battery,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: Color(0xFF059669),
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),

                  // Warranty Tag & Stock Count
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 5, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF1F5F9),
                          borderRadius: BorderRadius.circular(5),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.shield_outlined,
                                size: 10, color: Color(0xFF2563EB)),
                            SizedBox(width: 3),
                            Text(
                              '12M Warranty',
                              style: TextStyle(
                                fontSize: 8.5,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF1E293B),
                              ),
                            ),
                          ],
                        ),
                      ),
                      Text(
                        '$stock left',
                        style: const TextStyle(
                          fontSize: 9.5,
                          color: Color(0xFF94A3B8),
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 8),

                  // Price Row
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(
                        formatCurrency(price),
                        style: const TextStyle(
                          fontWeight: FontWeight.w900,
                          fontSize: 14.5,
                          color: Color(0xFF0F172A),
                          letterSpacing: -0.4,
                        ),
                      ),
                      if (origPrice > price) ...[
                        const SizedBox(width: 5),
                        Flexible(
                          child: Text(
                            formatCurrency(origPrice),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              decoration: TextDecoration.lineThrough,
                              color: Color(0xFF94A3B8),
                              fontSize: 10,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ],
                    ],
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
