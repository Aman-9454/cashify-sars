import 'package:flutter/material.dart';
import '../../../widgets/camsik_smart_image.dart';

class SellBrandStep extends StatefulWidget {
  final String categoryName;
  final String categoryId;
  final List<Map<String, dynamic>> brands;
  final bool isLoading;
  final Function(Map<String, dynamic> brand) onSelectBrand;

  const SellBrandStep({
    super.key,
    required this.categoryName,
    required this.categoryId,
    required this.brands,
    this.isLoading = false,
    required this.onSelectBrand,
  });

  @override
  State<SellBrandStep> createState() => _SellBrandStepState();
}

class _SellBrandStepState extends State<SellBrandStep> {
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final query = _searchQuery.trim().toLowerCase();
    final filteredBrands = widget.brands.where((b) {
      if (query.isEmpty) return true;
      final name = (b['name'] as String? ?? '').toLowerCase();
      final slug = (b['slug'] as String? ?? '').toLowerCase();
      return name.contains(query) || slug.contains(query);
    }).toList();

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── 1. PROMINENT VALUE HERO CARD ──
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(18),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF059669).withValues(alpha: 0.15),
                  blurRadius: 14,
                  offset: const Offset(0, 4),
                ),
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.12),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFF059669).withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: const Color(0xFF059669).withValues(alpha: 0.4), width: 0.8),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.verified_outlined, size: 12, color: Color(0xFF34D399)),
                            SizedBox(width: 4),
                            Text(
                              'AUTHENTIC BRAND VALUATION',
                              style: TextStyle(
                                color: Color(0xFF34D399),
                                fontSize: 9.5,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 0.3,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Select ${widget.categoryName} Brand',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.w900,
                          letterSpacing: -0.3,
                        ),
                      ),
                      const SizedBox(height: 2),
                      const Text(
                        'Choose the brand to view all eligible device models and lock in your price.',
                        style: TextStyle(
                          color: Color(0xFFCBD5E1),
                          fontSize: 10.5,
                          height: 1.3,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.08),
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
                  ),
                  child: const Icon(Icons.stars_rounded, color: Color(0xFF34D399), size: 24),
                ),
              ],
            ),
          ),

          const SizedBox(height: 14),

          // ── 2. SEARCH BAR ──
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFE2E8F0)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.02),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: TextField(
              controller: _searchController,
              onChanged: (val) => setState(() => _searchQuery = val),
              style: const TextStyle(fontSize: 13, color: Color(0xFF0F172A), fontWeight: FontWeight.w600),
              decoration: InputDecoration(
                hintText: 'Search brand (e.g. Apple, Sony, Canon, Samsung)...',
                hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                prefixIcon: const Icon(Icons.search_rounded, size: 20, color: Color(0xFF64748B)),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.close_rounded, size: 16, color: Color(0xFF94A3B8)),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                        },
                      )
                    : null,
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              ),
            ),
          ),

          const SizedBox(height: 16),

          // ── 3. SECTION HEADER ──
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Available Brands (${filteredBrands.length})',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF0F172A),
                ),
              ),
              if (_searchQuery.isNotEmpty)
                Text(
                  'Filtered by "$_searchQuery"',
                  style: const TextStyle(fontSize: 11, color: Color(0xFF059669), fontWeight: FontWeight.w600),
                ),
            ],
          ),

          const SizedBox(height: 10),

          // ── 4. LOADING STATE OR BRANDS GRID ──
          if (widget.isLoading)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 40),
              child: Center(
                child: CircularProgressIndicator(color: Color(0xFF059669)),
              ),
            )
          else if (filteredBrands.isEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                children: [
                  const Icon(Icons.search_off_rounded, size: 40, color: Color(0xFF94A3B8)),
                  const SizedBox(height: 10),
                  Text(
                    'No brands found for "$_searchQuery"',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF1E293B)),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Try searching with a different brand name or clear search',
                    style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            )
          else
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.15,
              ),
              itemCount: filteredBrands.length,
              itemBuilder: (ctx, idx) {
                final brand = filteredBrands[idx];
                final name = brand['name'] as String? ?? 'Brand';
                final logo = brand['logo'] as String? ?? '';
                final modelCount = brand['modelCount'] as num?;

                return Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: () => widget.onSelectBrand(brand),
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE2E8F0), width: 1.2),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.025),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          // Brand Logo / Icon Container
                          Container(
                            width: 52,
                            height: 52,
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF8FAFC),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFFF1F5F9)),
                            ),
                            child: logo.isNotEmpty
                                ? CamsikSmartImage(
                                    image: logo,
                                    fit: BoxFit.contain,
                                    iconSize: 26,
                                    iconColor: const Color(0xFF475569),
                                  )
                                : Center(
                                    child: Text(
                                      name.isNotEmpty ? name[0].toUpperCase() : 'B',
                                      style: const TextStyle(
                                        fontSize: 20,
                                        fontWeight: FontWeight.w900,
                                        color: Color(0xFF059669),
                                      ),
                                    ),
                                  ),
                          ),
                          const SizedBox(height: 8),

                          // Brand Name
                          Text(
                            name,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 13.5,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                          const SizedBox(height: 3),

                          // Model count tag
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFFECFDF5),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: const Color(0xFFA7F3D0), width: 0.8),
                            ),
                            child: Text(
                              modelCount != null && modelCount > 0
                                  ? '$modelCount ${modelCount == 1 ? 'Model' : 'Models'}'
                                  : 'Top Resale',
                              style: const TextStyle(
                                color: Color(0xFF047857),
                                fontSize: 9.5,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
        ],
      ),
    );
  }
}
