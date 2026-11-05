import 'package:flutter/material.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../widgets/camsik_smart_image.dart';

class RentalCatalogView extends StatefulWidget {
  final List<Map<String, dynamic>> rentalCameras;
  final Function(Map<String, dynamic> camera) onSelectCamera;

  const RentalCatalogView({
    super.key,
    required this.rentalCameras,
    required this.onSelectCamera,
  });

  @override
  State<RentalCatalogView> createState() => _RentalCatalogViewState();
}

class _RentalCatalogViewState extends State<RentalCatalogView> {
  String _selectedCategory = 'all';
  String _selectedBrand = 'all';
  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    var filtered = widget.rentalCameras;
    if (_selectedCategory != 'all') {
      filtered = filtered.where((c) => (c['category'] as String? ?? '').toLowerCase() == _selectedCategory.toLowerCase()).toList();
    }
    if (_selectedBrand != 'all') {
      filtered = filtered.where((c) => (c['brand'] as String? ?? '').toLowerCase() == _selectedBrand.toLowerCase()).toList();
    }
    if (_searchQuery.trim().isNotEmpty) {
      final q = _searchQuery.toLowerCase().trim();
      filtered = filtered.where((c) =>
        (c['model'] as String? ?? '').toLowerCase().contains(q) ||
        (c['brand'] as String? ?? '').toLowerCase().contains(q) ||
        (c['specs'] as String? ?? '').toLowerCase().contains(q)
      ).toList();
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 1,
        title: Row(
          children: [
            const Text('Rent Pro Cameras & Gear', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: const BoxDecoration(
                color: Color(0xFFFFE4E6),
                borderRadius: BorderRadius.all(Radius.circular(6)),
              ),
              child: const Text('FLEET', style: TextStyle(color: Color(0xFFE11D48), fontSize: 9, fontWeight: FontWeight.w900)),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Search & Filter Header
          Container(
            padding: const EdgeInsets.all(12),
            color: Colors.white,
            child: Column(
              children: [
                TextField(
                  onChanged: (v) => setState(() => _searchQuery = v),
                  decoration: InputDecoration(
                    hintText: 'Search FX3, Canon R5, RED, lenses...',
                    prefixIcon: const Icon(Icons.search, size: 20, color: Color(0xFF64748B)),
                    filled: true,
                    fillColor: const Color(0xFFF1F5F9),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                ),
                const SizedBox(height: 8),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildCategoryChip('all', 'All Gear'),
                      _buildCategoryChip('Cinema Cameras', 'Cinema Cameras'),
                      _buildCategoryChip('Mirrorless', 'Mirrorless'),
                      _buildCategoryChip('Cinema Lenses', 'Cinema Lenses'),
                      _buildCategoryChip('Gimbals & Rigs', 'Gimbals & Rigs'),
                      _buildCategoryChip('Action & Drones', 'Action & Drones'),
                    ],
                  ),
                ),
                const SizedBox(height: 6),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildBrandChip('all', 'All Brands'),
                      _buildBrandChip('Sony', 'Sony'),
                      _buildBrandChip('Canon', 'Canon'),
                      _buildBrandChip('Nikon', 'Nikon'),
                      _buildBrandChip('RED', 'RED Digital'),
                      _buildBrandChip('Blackmagic', 'Blackmagic'),
                      _buildBrandChip('DJI', 'DJI'),
                      _buildBrandChip('Fujifilm', 'Fujifilm'),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: filtered.isEmpty
                ? const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.videocam_off_outlined, size: 48, color: Color(0xFF94A3B8)),
                        SizedBox(height: 12),
                        Text('No cameras found matching your filter', style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.w600)),
                      ],
                    ),
                  )
                : GridView.builder(
                    padding: const EdgeInsets.all(12),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.68,
                      crossAxisSpacing: 10,
                      mainAxisSpacing: 10,
                    ),
                    itemCount: filtered.length,
                    itemBuilder: (ctx, idx) {
                      final c = filtered[idx];
                      final name = c['model'] as String? ?? 'Camera';
                      final category = c['category'] as String? ?? 'Cinema';
                      final dailyPrice = (c['dailyPrice'] as num?)?.toInt() ?? 0;
                      final deposit = (c['securityDeposit'] as num?)?.toInt() ?? 0;
                      final image = c['image'] as String? ?? '';
                      final videoRes = c['videoRes'] as String? ?? '4K UHD';
                      final stock = (c['stock'] as num?)?.toInt() ?? 2;

                      return InkWell(
                        onTap: () => widget.onSelectCamera(c),
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                            boxShadow: [
                              BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 6, offset: const Offset(0, 2)),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFFFE4E6),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      category,
                                      style: const TextStyle(color: Color(0xFFE11D48), fontSize: 9, fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                  Text(
                                    '$stock Ready',
                                    style: const TextStyle(color: Color(0xFF059669), fontSize: 9, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Expanded(
                                child: Center(
                                  child: CamsikSmartImage(
                                    image: image,
                                    fit: BoxFit.contain,
                                    iconSize: 44,
                                    iconColor: const Color(0xFFE11D48),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                name,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF0F172A)),
                              ),
                              Text(
                                videoRes,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(color: Color(0xFF64748B), fontSize: 10),
                              ),
                              const SizedBox(height: 4),
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.baseline,
                                textBaseline: TextBaseline.alphabetic,
                                children: [
                                  Text(
                                    formatCurrency(dailyPrice),
                                    style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Color(0xFFE11D48)),
                                  ),
                                  const Text(
                                    '/day',
                                    style: TextStyle(color: Color(0xFF64748B), fontSize: 10, fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                              Text(
                                'Deposit: ${formatCurrency(deposit)}',
                                style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 9),
                              ),
                              const SizedBox(height: 6),
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.symmetric(vertical: 6),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFFF1F2),
                                  borderRadius: BorderRadius.circular(8),
                                  border: Border.all(color: const Color(0xFFFECDD3)),
                                ),
                                child: const Center(
                                  child: Text(
                                    'Rent Gear',
                                    style: TextStyle(color: Color(0xFFE11D48), fontSize: 11, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryChip(String val, String label) {
    final isSel = _selectedCategory == val;
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: ChoiceChip(
        label: Text(label),
        selected: isSel,
        onSelected: (s) => setState(() => _selectedCategory = val),
        selectedColor: const Color(0xFFE11D48),
        labelStyle: TextStyle(
          color: isSel ? Colors.white : const Color(0xFF0F172A),
          fontSize: 10,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildBrandChip(String val, String label) {
    final isSel = _selectedBrand == val;
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: ChoiceChip(
        label: Text(label),
        selected: isSel,
        onSelected: (s) => setState(() => _selectedBrand = val),
        selectedColor: const Color(0xFF4F46E5),
        labelStyle: TextStyle(
          color: isSel ? Colors.white : const Color(0xFF0F172A),
          fontSize: 10,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
