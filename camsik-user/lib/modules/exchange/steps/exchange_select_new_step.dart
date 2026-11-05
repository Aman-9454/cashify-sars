import 'package:flutter/material.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../widgets/camsik_smart_image.dart';

class ExchangeSelectNewStep extends StatefulWidget {
  final List<Map<String, dynamic>> refurbishedProducts;
  final String categoryFilter;
  final String searchQuery;
  final int totalTradeIn;
  final ValueChanged<String> onSearchChanged;
  final ValueChanged<String> onCategoryChanged;
  final ValueChanged<Map<String, dynamic>> onProductSelected;

  const ExchangeSelectNewStep({
    super.key,
    required this.refurbishedProducts,
    required this.categoryFilter,
    required this.searchQuery,
    required this.totalTradeIn,
    required this.onSearchChanged,
    required this.onCategoryChanged,
    required this.onProductSelected,
  });

  @override
  State<ExchangeSelectNewStep> createState() => _ExchangeSelectNewStepState();
}

class _ExchangeSelectNewStepState extends State<ExchangeSelectNewStep> {
  late final TextEditingController _searchController;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController(text: widget.searchQuery);
  }

  @override
  void didUpdateWidget(covariant ExchangeSelectNewStep oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.searchQuery != widget.searchQuery &&
        _searchController.text != widget.searchQuery) {
      _searchController.text = widget.searchQuery;
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final catList = [
      {'id': 'all', 'label': 'All Upgrades', 'icon': Icons.apps_rounded},
      {'id': 'cameras', 'label': 'Cameras', 'icon': Icons.camera_alt_rounded},
      {'id': 'lenses', 'label': 'Lenses', 'icon': Icons.camera_rounded},
      {'id': 'smartphones', 'label': 'Smartphones', 'icon': Icons.phone_iphone_rounded},
      {'id': 'laptops', 'label': 'Laptops', 'icon': Icons.laptop_mac_rounded},
    ];

    var filtered = widget.refurbishedProducts;
    if (widget.categoryFilter != 'all') {
      filtered = filtered
          .where((p) =>
              (p['category'] as String? ?? '').toLowerCase() ==
              widget.categoryFilter.toLowerCase())
          .toList();
    }
    if (widget.searchQuery.trim().isNotEmpty) {
      final q = widget.searchQuery.toLowerCase().trim();
      filtered = filtered
          .where((p) =>
              (p['model'] as String? ?? '').toLowerCase().contains(q) ||
              (p['brand'] as String? ?? '').toLowerCase().contains(q))
          .toList();
    }

    return Column(
      children: [
        // Top Filter & Search Section
        Container(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
          decoration: const BoxDecoration(
            color: Colors.white,
            border: Border(
              bottom: BorderSide(color: Color(0xFFF1F5F9), width: 1),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Search Input Box
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x060F172A),
                      blurRadius: 8,
                      offset: Offset(0, 2),
                    ),
                  ],
                ),
                child: TextField(
                  controller: _searchController,
                  onChanged: widget.onSearchChanged,
                  style: const TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF0F172A),
                  ),
                  decoration: InputDecoration(
                    hintText: 'Search upgrade flagships (Sony, Canon, iPhone)...',
                    hintStyle: const TextStyle(
                      color: Color(0xFF94A3B8),
                      fontSize: 13,
                      fontWeight: FontWeight.w400,
                    ),
                    prefixIcon: const Icon(
                      Icons.search_rounded,
                      size: 20,
                      color: Color(0xFF64748B),
                    ),
                    suffixIcon: widget.searchQuery.isNotEmpty
                        ? IconButton(
                            icon: const Icon(
                              Icons.cancel_rounded,
                              size: 18,
                              color: Color(0xFF94A3B8),
                            ),
                            onPressed: () {
                              _searchController.clear();
                              widget.onSearchChanged('');
                            },
                          )
                        : null,
                    isDense: true,
                    filled: false,
                    contentPadding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 11,
                    ),
                    border: InputBorder.none,
                  ),
                ),
              ),
              const SizedBox(height: 10),

              // Category Filter Pills
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                child: Row(
                  children: catList.map((cat) {
                    final isSel = widget.categoryFilter == cat['id'];
                    final icon = cat['icon'] as IconData;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: InkWell(
                        onTap: () => widget.onCategoryChanged(cat['id'] as String),
                        borderRadius: BorderRadius.circular(24),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 13,
                            vertical: 7.5,
                          ),
                          decoration: BoxDecoration(
                            gradient: isSel
                                ? const LinearGradient(
                                    colors: [
                                      Color(0xFF7C3AED),
                                      Color(0xFF6D28D9),
                                    ],
                                  )
                                : null,
                            color: isSel ? null : Colors.white,
                            borderRadius: BorderRadius.circular(24),
                            border: Border.all(
                              color: isSel
                                  ? Colors.transparent
                                  : const Color(0xFFE2E8F0),
                              width: 1,
                            ),
                            boxShadow: isSel
                                ? const [
                                    BoxShadow(
                                      color: Color(0x337C3AED),
                                      blurRadius: 8,
                                      offset: Offset(0, 3),
                                    ),
                                  ]
                                : null,
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                icon,
                                size: 14,
                                color: isSel
                                    ? Colors.white
                                    : const Color(0xFF64748B),
                              ),
                              const SizedBox(width: 6),
                              Text(
                                cat['label'] as String,
                                style: TextStyle(
                                  color: isSel
                                      ? Colors.white
                                      : const Color(0xFF334155),
                                  fontWeight: isSel
                                      ? FontWeight.w700
                                      : FontWeight.w600,
                                  fontSize: 11.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 10),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7.5),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFECFDF5), Color(0xFFD1FAE5)],
                  ),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFA7F3D0)),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: Color(0xFF059669),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.check_circle_rounded,
                        size: 13,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Total Trade-in Credit: ${formatCurrency(widget.totalTradeIn)} will be discounted at checkout',
                        style: const TextStyle(
                          fontSize: 10.5,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF065F46),
                          letterSpacing: -0.1,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: filtered.isEmpty
              ? _buildEmptyState()
              : ListView.separated(
                  padding: const EdgeInsets.fromLTRB(16, 14, 16, 24),
                  physics: const BouncingScrollPhysics(),
                  itemCount: filtered.length,
                  separatorBuilder: (c, i) => const SizedBox(height: 11),
                  itemBuilder: (ctx, idx) {
                    final p = filtered[idx];
                    return _buildUpgradeCard(p);
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildUpgradeCard(Map<String, dynamic> p) {
    final name = p['model'] as String? ?? 'Device';
    final price = p['sellingPrice'] as int? ?? 65000;
    final image = p['image'] as String? ?? 'assets/images/categories/dslr.png';
    final brand = (p['brand'] as String?)?.trim();
    final diff = price - widget.totalTradeIn;

    return InkWell(
      onTap: () => widget.onProductSelected(p),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE2E8F0)),
          boxShadow: const [
            BoxShadow(
              color: Color(0x060F172A),
              blurRadius: 10,
              offset: Offset(0, 3),
            ),
          ],
        ),
        child: Row(
          children: [
            // Image Thumbnail
            Container(
              width: 66,
              height: 66,
              padding: const EdgeInsets.all(5),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFF1F5F9)),
              ),
              child: CamsikSmartImage(
                image: image,
                fit: BoxFit.contain,
                iconSize: 30,
                iconColor: const Color(0xFF7C3AED),
              ),
            ),
            const SizedBox(width: 12),

            // Device Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    children: [
                      if (brand != null && brand.isNotEmpty) ...[
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 5,
                            vertical: 1.5,
                          ),
                          margin: const EdgeInsets.only(right: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF1F5F9),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            brand.toUpperCase(),
                            style: const TextStyle(
                              fontSize: 8.5,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF475569),
                              letterSpacing: 0.3,
                            ),
                          ),
                        ),
                      ],
                      Expanded(
                        child: Text(
                          name,
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 13.5,
                            color: Color(0xFF0F172A),
                            letterSpacing: -0.2,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Text(
                    'Selling Price: ${formatCurrency(price)}',
                    style: const TextStyle(
                      color: Color(0xFF64748B),
                      fontSize: 11,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 7,
                      vertical: 3,
                    ),
                    decoration: BoxDecoration(
                      color: diff > 0
                          ? const Color(0xFFF5F3FF)
                          : const Color(0xFFECFDF5),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: diff > 0
                            ? const Color(0xFFDDD6FE)
                            : const Color(0xFFA7F3D0),
                      ),
                    ),
                    child: Text(
                      diff > 0
                          ? 'Net Pay: ${formatCurrency(diff)}'
                          : 'You Receive: +${formatCurrency(diff.abs())} Cash',
                      style: TextStyle(
                        color: diff > 0
                            ? const Color(0xFF6D28D9)
                            : const Color(0xFF059669),
                        fontWeight: FontWeight.w900,
                        fontSize: 11,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),

            // Select Action Button
            Container(
              width: 30,
              height: 30,
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: const Icon(
                Icons.arrow_forward_rounded,
                size: 15,
                color: Color(0xFF7C3AED),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Color(0xFFF1F5F9),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.search_off_rounded,
                size: 40,
                color: Color(0xFF94A3B8),
              ),
            ),
            const SizedBox(height: 14),
            const Text(
              'No Upgrades Found',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w800,
                color: Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Try searching with another device model or reset filters.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 12,
                color: Color(0xFF64748B),
                height: 1.4,
              ),
            ),
            const SizedBox(height: 14),
            OutlinedButton.icon(
              onPressed: () {
                _searchController.clear();
                widget.onSearchChanged('');
                widget.onCategoryChanged('all');
              },
              icon: const Icon(Icons.refresh_rounded, size: 16),
              label: const Text('Reset Search & Filters'),
              style: OutlinedButton.styleFrom(
                foregroundColor: const Color(0xFF7C3AED),
                side: const BorderSide(color: Color(0xFFDDD6FE)),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(20),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
