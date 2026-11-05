import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/currency_formatter.dart';
import '../../core/utils/helpers.dart';
import '../../models/admin_models.dart';
import '../operations/screens/admin_diagnostic_questions_screen.dart';
import 'repositories/catalog_repository.dart';

class AdminCatalogScreen extends StatefulWidget {
  final int initialTab;
  const AdminCatalogScreen({super.key, this.initialTab = 0});

  @override
  State<AdminCatalogScreen> createState() => _AdminCatalogScreenState();
}

class _AdminCatalogScreenState extends State<AdminCatalogScreen> with SingleTickerProviderStateMixin {
  final _catalogRepository = CatalogRepository();
  late TabController _tabController;

  // Data
  List<AdminCategory> _categories = [];
  List<AdminBrand> _brands = [];
  List<AdminDeviceModel> _models = [];
  List<AdminLens> _lenses = [];
  List<AdminRefurbishedDevice> _refurbished = [];

  bool _loading = true;
  String _modelSearch = '';
  String _selectedBrandFilter = 'all';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 5, vsync: this, initialIndex: widget.initialTab);
    _loadAllCatalogData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadAllCatalogData() async {
    setState(() => _loading = true);
    final cats = await _catalogRepository.fetchCategories();
    final brs = await _catalogRepository.fetchBrands();
    final mods = await _catalogRepository.fetchModels();
    final lns = await _catalogRepository.fetchLenses();
    final refs = await _catalogRepository.fetchRefurbished();

    if (!mounted) return;
    setState(() {
      _categories = cats;
      _brands = brs;
      _models = mods;
      _lenses = lns;
      _refurbished = refs;
      _loading = false;
    });
  }

  // ── CATEGORY ACTIONS ──
  void _showAddCategoryDialog() {
    final nameController = TextEditingController();
    final iconController = TextEditingController(text: '📷');
    final descController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add Device Category', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              decoration: const InputDecoration(labelText: 'Category Name (e.g. Action Cameras)', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: iconController,
              decoration: const InputDecoration(labelText: 'Emoji Icon (e.g. 📷, 🔍, 🚁)', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: descController,
              decoration: const InputDecoration(labelText: 'Short Description', border: OutlineInputBorder()),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
            onPressed: () async {
              final name = nameController.text.trim();
              if (name.isEmpty) return;
              Navigator.pop(ctx);
              final newCat = {
                'id': 'cat-${DateTime.now().millisecondsSinceEpoch}',
                'name': name,
                'slug': name.toLowerCase().replaceAll(' ', '-'),
                'icon': iconController.text.trim(),
                'description': descController.text.trim(),
                'brandCount': 0,
                'modelCount': 0,
                'active': true,
              };
              setState(() {
                _categories.add(AdminCategory.fromJson(newCat));
              });
              await _catalogRepository.addCategory(newCat);
              if (mounted) {
                showCustomSnackBar(context, 'Category $name added!', isError: false);
              }
            },
            child: const Text('Add Category'),
          ),
        ],
      ),
    );
  }

  // ── BRAND ACTIONS ──
  void _showAddBrandDialog() {
    final nameController = TextEditingController();
    String selectedCat = _categories.isNotEmpty ? _categories.first.id : 'cat-dslr';

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => AlertDialog(
          title: const Text('Add Brand', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: const InputDecoration(labelText: 'Brand Name (e.g. Leica, Panasonic)', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                initialValue: selectedCat,
                decoration: const InputDecoration(labelText: 'Parent Category', border: OutlineInputBorder()),
                items: _categories.map((c) => DropdownMenuItem(value: c.id, child: Text(c.name))).toList(),
                onChanged: (v) => setModalState(() => selectedCat = v ?? selectedCat),
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
              onPressed: () async {
                final name = nameController.text.trim();
                if (name.isEmpty) return;
                Navigator.pop(ctx);
                final newBrand = {
                  'id': 'brand-${DateTime.now().millisecondsSinceEpoch}',
                  'categoryId': selectedCat,
                  'name': name,
                  'slug': name.toLowerCase().replaceAll(' ', '-'),
                  'logo': '',
                  'modelCount': 0,
                  'active': true,
                };
                setState(() => _brands.add(AdminBrand.fromJson(newBrand)));
                await _catalogRepository.addBrand(newBrand);
                Helpers.showSuccessSnackbar('Success', 'Brand $name added!');
              },
              child: const Text('Add Brand'),
            ),
          ],
        ),
      ),
    );
  }

  // ── MODEL ACTIONS ──
  void _showAddModelDialog() {
    final nameController = TextEditingController();
    final priceController = TextEditingController(text: '45000');
    String selectedBrand = _brands.isNotEmpty ? _brands.first.id : 'brand-canon';
    String selectedCat = _categories.isNotEmpty ? _categories.first.id : 'cat-dslr';

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => AlertDialog(
          title: const Text('Add Device Model', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: nameController,
                  decoration: const InputDecoration(labelText: 'Model Name (e.g. Canon EOS R6 Mark II)', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 10),
                DropdownButtonFormField<String>(
                  initialValue: selectedBrand,
                  decoration: const InputDecoration(labelText: 'Brand', border: OutlineInputBorder()),
                  items: _brands.map((b) => DropdownMenuItem(value: b.id, child: Text(b.name))).toList(),
                  onChanged: (v) => setModalState(() => selectedBrand = v ?? selectedBrand),
                ),
                const SizedBox(height: 10),
                DropdownButtonFormField<String>(
                  initialValue: selectedCat,
                  decoration: const InputDecoration(labelText: 'Category', border: OutlineInputBorder()),
                  items: _categories.map((c) => DropdownMenuItem(value: c.id, child: Text(c.name))).toList(),
                  onChanged: (v) => setModalState(() => selectedCat = v ?? selectedCat),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: priceController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Base Buyback Price (₹)', border: OutlineInputBorder()),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
              onPressed: () async {
                final name = nameController.text.trim();
                if (name.isEmpty) return;
                Navigator.pop(ctx);
                final newMod = {
                  'id': 'mod-${DateTime.now().millisecondsSinceEpoch}',
                  'name': name,
                  'brandId': selectedBrand,
                  'categoryId': selectedCat,
                  'basePrice': double.tryParse(priceController.text) ?? 35000.0,
                  'active': true,
                  'storages': ['Standard Body'],
                  'colors': ['Black'],
                };
                setState(() => _models.insert(0, AdminDeviceModel.fromJson(newMod)));
                await _catalogRepository.addModel(newMod);
                Helpers.showSuccessSnackbar('Success', 'Model $name added!');
              },
              child: const Text('Save Model'),
            ),
          ],
        ),
      ),
    );
  }

  void _showEditPriceDialog(AdminDeviceModel model) {
    final priceController = TextEditingController(text: model.basePrice.toInt().toString());

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Edit Price: ${model.name}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        content: TextField(
          controller: priceController,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(labelText: 'Base Price (₹)', border: OutlineInputBorder()),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
            onPressed: () async {
              final newP = double.tryParse(priceController.text) ?? model.basePrice;
              Navigator.pop(ctx);
              setState(() {
                final idx = _models.indexWhere((m) => m.id == model.id);
                if (idx != -1) {
                  _models[idx] = AdminDeviceModel(
                    id: model.id,
                    brandId: model.brandId,
                    categoryId: model.categoryId,
                    name: model.name,
                    slug: model.slug,
                    image: model.image,
                    basePrice: newP,
                    storages: model.storages,
                    colors: model.colors,
                    specs: model.specs,
                    active: model.active,
                  );
                }
              });
              await _catalogRepository.updateModelPrice(model.id, newP);
              if (mounted) {
                showCustomSnackBar(context, 'Updated base price for ${model.name}', isError: false);
              }
            },
            child: const Text('Update Price'),
          ),
        ],
      ),
    );
  }

  // ── LENS ACTIONS ──
  void _showAddLensDialog() {
    final nameController = TextEditingController();
    final typeController = TextEditingController(text: 'Prime Lens');
    final priceController = TextEditingController(text: '8500');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add Camera Lens', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              decoration: const InputDecoration(labelText: 'Lens Name (e.g. 50mm f/1.4 Art)', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: typeController,
              decoration: const InputDecoration(labelText: 'Type (e.g. Prime, Zoom, Wide)', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: priceController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Valuation Price (₹)', border: OutlineInputBorder()),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
            onPressed: () async {
              final name = nameController.text.trim();
              if (name.isEmpty) return;
              Navigator.pop(ctx);
              final newL = {
                'id': 'lens-${DateTime.now().millisecondsSinceEpoch}',
                'name': name,
                'type': typeController.text.trim(),
                'price': double.tryParse(priceController.text) ?? 5000.0,
                'active': true,
              };
              setState(() => _lenses.add(AdminLens.fromJson(newL)));
              await _catalogRepository.addLens(newL);
              if (mounted) {
                showCustomSnackBar(context, 'Lens $name added!', isError: false);
              }
            },
            child: const Text('Add Lens'),
          ),
        ],
      ),
    );
  }

  // ── REFURBISHED ACTIONS ──
  void _showAddRefurbishedDialog() {
    final brandController = TextEditingController(text: 'Sony');
    final modelController = TextEditingController();
    final priceController = TextEditingController(text: '48000');
    final origPriceController = TextEditingController(text: '75000');
    final stockController = TextEditingController(text: '2');
    String condition = 'Superb';

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => AlertDialog(
          title: const Text('Add Refurbished Device', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(controller: brandController, decoration: const InputDecoration(labelText: 'Brand', border: OutlineInputBorder())),
                const SizedBox(height: 10),
                TextField(controller: modelController, decoration: const InputDecoration(labelText: 'Model Name', border: OutlineInputBorder())),
                const SizedBox(height: 10),
                DropdownButtonFormField<String>(
                  initialValue: condition,
                  decoration: const InputDecoration(labelText: 'Condition Grade', border: OutlineInputBorder()),
                  items: const [
                    DropdownMenuItem(value: 'Superb', child: Text('Superb (Like New, 0 Scratches)')),
                    DropdownMenuItem(value: 'Good', child: Text('Good (Minor signs of use)')),
                    DropdownMenuItem(value: 'Fair', child: Text('Fair (Visible cosmetic marks)')),
                  ],
                  onChanged: (v) => setModalState(() => condition = v ?? 'Superb'),
                ),
                const SizedBox(height: 10),
                TextField(controller: priceController, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Selling Price (₹)', border: OutlineInputBorder())),
                const SizedBox(height: 10),
                TextField(controller: origPriceController, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Original MRP (₹)', border: OutlineInputBorder())),
                const SizedBox(height: 10),
                TextField(controller: stockController, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Stock Units', border: OutlineInputBorder())),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
              onPressed: () async {
                final model = modelController.text.trim();
                if (model.isEmpty) return;
                Navigator.pop(ctx);
                final newRef = {
                  'id': 'ref-${DateTime.now().millisecondsSinceEpoch}',
                  'brand': brandController.text.trim(),
                  'model': model,
                  'category': 'Cameras',
                  'condition': condition,
                  'price': double.tryParse(priceController.text) ?? 35000.0,
                  'originalPrice': double.tryParse(origPriceController.text) ?? 60000.0,
                  'stock': int.tryParse(stockController.text) ?? 1,
                  'warrantyMonths': 6,
                  'active': true,
                };
                setState(() => _refurbished.insert(0, AdminRefurbishedDevice.fromJson(newRef)));
                await _catalogRepository.addRefurbished(newRef);
                Helpers.showSuccessSnackbar('Success', 'Refurbished $model listed for sale!');
              },
              child: const Text('Add Refurbished'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Catalog & Pricing Engine', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: AppColors.secondary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.psychology_alt_rounded, size: 22),
            tooltip: 'Diagnostic Questions & Valuation Engine',
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminDiagnosticQuestionsScreen())),
          ),
          IconButton(icon: const Icon(Icons.refresh, size: 20), onPressed: _loadAllCatalogData),
        ],
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          indicatorColor: AppColors.primary,
          indicatorWeight: 3,
          labelColor: Colors.white,
          unselectedLabelColor: const Color(0xFF94A3B8),
          tabs: [
            Tab(text: 'Categories (${_categories.length})'),
            Tab(text: 'Brands (${_brands.length})'),
            Tab(text: 'Models (${_models.length})'),
            Tab(text: 'Lenses (${_lenses.length})'),
            Tab(text: 'Refurbished (${_refurbished.length})'),
          ],
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: [
                _buildCategoriesTab(),
                _buildBrandsTab(),
                _buildModelsTab(),
                _buildLensesTab(),
                _buildRefurbishedTab(),
              ],
            ),
    );
  }

  // 1. CATEGORIES TAB
  Widget _buildCategoriesTab() {
    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Add Category', style: TextStyle(fontWeight: FontWeight.bold)),
        onPressed: _showAddCategoryDialog,
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _categories.length,
        separatorBuilder: (_, _) => const SizedBox(height: 10),
        itemBuilder: (context, idx) {
          final cat = _categories[idx];
          return Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                  child: Center(child: Text(cat.icon, style: const TextStyle(fontSize: 22))),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(cat.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      if (cat.description.isNotEmpty) ...[
                        const SizedBox(height: 2),
                        Text(cat.description, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary), maxLines: 1),
                      ],
                      const SizedBox(height: 4),
                      Text('${cat.brandCount} Brands • ${cat.modelCount} Models', style: const TextStyle(fontSize: 10, color: AppColors.textMuted)),
                    ],
                  ),
                ),
                Switch(
                  value: cat.active,
                  activeTrackColor: AppColors.primary,
                  onChanged: (val) {
                    setState(() {
                      _categories[idx] = AdminCategory(
                        id: cat.id,
                        name: cat.name,
                        slug: cat.slug,
                        icon: cat.icon,
                        image: cat.image,
                        description: cat.description,
                        brandCount: cat.brandCount,
                        modelCount: cat.modelCount,
                        active: val,
                      );
                    });
                  },
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  // 2. BRANDS TAB
  Widget _buildBrandsTab() {
    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Add Brand', style: TextStyle(fontWeight: FontWeight.bold)),
        onPressed: _showAddBrandDialog,
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _brands.length,
        separatorBuilder: (_, _) => const SizedBox(height: 10),
        itemBuilder: (context, idx) {
          final b = _brands[idx];
          return Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                  child: Text(b.name.isNotEmpty ? b.name[0] : 'B', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(b.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      const SizedBox(height: 2),
                      Text('${b.modelCount} Active Camera Models', style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(color: AppColors.success.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(6)),
                  child: const Text('Active Brand', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.success)),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  // 3. MODELS TAB
  Widget _buildModelsTab() {
    final query = _modelSearch.toLowerCase().trim();
    final filtered = _models.where((m) {
      final matchBrand = _selectedBrandFilter == 'all' || m.brandId == _selectedBrandFilter;
      final matchQuery = query.isEmpty || m.name.toLowerCase().contains(query);
      return matchBrand && matchQuery;
    }).toList();

    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Add Model', style: TextStyle(fontWeight: FontWeight.bold)),
        onPressed: _showAddModelDialog,
      ),
      body: Column(
        children: [
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: Column(
              children: [
                TextField(
                  onChanged: (v) => setState(() => _modelSearch = v),
                  decoration: InputDecoration(
                    hintText: 'Search camera or phone models...',
                    prefixIcon: const Icon(Icons.search, size: 20, color: AppColors.textSecondary),
                    filled: true,
                    fillColor: AppColors.background,
                    contentPadding: const EdgeInsets.symmetric(vertical: 10),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                  ),
                ),
                if (_brands.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        Padding(
                          padding: const EdgeInsets.only(right: 6),
                          child: FilterChip(
                            label: const Text('ALL BRANDS', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                            selected: _selectedBrandFilter == 'all',
                            selectedColor: AppColors.primary,
                            labelStyle: TextStyle(color: _selectedBrandFilter == 'all' ? Colors.white : AppColors.textPrimary),
                            onSelected: (_) => setState(() => _selectedBrandFilter = 'all'),
                          ),
                        ),
                        ..._brands.map((b) {
                          final isSel = _selectedBrandFilter == b.id;
                          return Padding(
                            padding: const EdgeInsets.only(right: 6),
                            child: FilterChip(
                              label: Text(b.name.toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                              selected: isSel,
                              selectedColor: AppColors.primary,
                              labelStyle: TextStyle(color: isSel ? Colors.white : AppColors.textPrimary),
                              onSelected: (_) => setState(() => _selectedBrandFilter = b.id),
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: filtered.length,
              separatorBuilder: (_, _) => const SizedBox(height: 10),
              itemBuilder: (context, idx) {
                final mod = filtered[idx];
                return Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                        child: const Icon(Icons.camera_alt, color: AppColors.primary, size: 22),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(mod.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                            const SizedBox(height: 2),
                            Text(
                              'Base Buyback: ${CurrencyFormatter.format(mod.basePrice)}',
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.success),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.edit_note, size: 22, color: AppColors.primary),
                        tooltip: 'Edit Base Price',
                        onPressed: () => _showEditPriceDialog(mod),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  // 4. LENSES TAB
  Widget _buildLensesTab() {
    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Add Lens', style: TextStyle(fontWeight: FontWeight.bold)),
        onPressed: _showAddLensDialog,
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _lenses.length,
        separatorBuilder: (_, _) => const SizedBox(height: 10),
        itemBuilder: (context, idx) {
          final l = _lenses[idx];
          return Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
                  child: Center(child: Text(l.icon, style: const TextStyle(fontSize: 20))),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(l.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      const SizedBox(height: 2),
                      Text(l.type, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                    ],
                  ),
                ),
                Text(
                  CurrencyFormatter.format(l.price),
                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: AppColors.success),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  // 5. REFURBISHED TAB
  Widget _buildRefurbishedTab() {
    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_shopping_cart),
        label: const Text('Add Refurbished', style: TextStyle(fontWeight: FontWeight.bold)),
        onPressed: _showAddRefurbishedDialog,
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: _refurbished.length,
        separatorBuilder: (_, _) => const SizedBox(height: 12),
        itemBuilder: (context, idx) {
          final r = _refurbished[idx];
          return Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(12)),
                    child: r.image.startsWith('http')
                        ? Image.network(
                            r.image,
                            fit: BoxFit.cover,
                            errorBuilder: (_, _, _) => const Icon(Icons.verified, size: 30, color: AppColors.primary),
                          )
                        : const Icon(Icons.verified, size: 30, color: AppColors.primary),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(r.model, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      const SizedBox(height: 2),
                      Text('${r.brand} • Grade: ${r.condition} • ${r.warrantyMonths}m Warranty', style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Text(CurrencyFormatter.format(r.price), style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: AppColors.primary)),
                          const SizedBox(width: 8),
                          if (r.originalPrice > 0)
                            Text(CurrencyFormatter.format(r.originalPrice), style: const TextStyle(decoration: TextDecoration.lineThrough, fontSize: 11, color: AppColors.textMuted)),
                          const Spacer(),
                          Text('Stock: ${r.stock}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: AppColors.textSecondary)),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
