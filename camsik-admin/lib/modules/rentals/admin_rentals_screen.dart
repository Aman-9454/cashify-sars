import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/utils/currency_formatter.dart';
import '../../core/utils/helpers.dart';
import '../../models/admin_models.dart';
import '../../widgets/status_badge.dart';
import 'repositories/rentals_repository.dart';

class AdminRentalsScreen extends StatefulWidget {
  final int initialTab;
  const AdminRentalsScreen({super.key, this.initialTab = 0});

  @override
  State<AdminRentalsScreen> createState() => _AdminRentalsScreenState();
}

class _AdminRentalsScreenState extends State<AdminRentalsScreen> with SingleTickerProviderStateMixin {
  final RentalsRepository _rentalsRepository = RentalsRepositoryImpl();
  late TabController _tabController;
  List<AdminRentalCamera> _cameras = [];
  List<AdminOrder> _rentalOrders = [];
  bool _isLoadingCameras = true;
  bool _isLoadingOrders = true;

  String _search = '';
  String _selectedBrand = 'all';

  final List<String> _brands = ['all', 'Sony', 'Canon', 'Nikon', 'Fujifilm', 'Blackmagic', 'RED', 'DJI'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this, initialIndex: widget.initialTab);
    _loadFleet();
    _loadRentalOrders();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadFleet() async {
    setState(() => _isLoadingCameras = true);
    final list = await _rentalsRepository.fetchRentalCameras();
    if (!mounted) return;
    setState(() {
      _cameras = list;
      _isLoadingCameras = false;
    });
  }

  Future<void> _loadRentalOrders() async {
    setState(() => _isLoadingOrders = true);
    final all = await _rentalsRepository.fetchRentalOrders();
    if (!mounted) return;
    setState(() {
      _rentalOrders = all;
      _isLoadingOrders = false;
    });
  }

  void _showAddCameraDialog() {
    final brandController = TextEditingController(text: 'Sony');
    final modelController = TextEditingController();
    final categoryController = TextEditingController(text: 'Cinema Cameras');
    final dailyController = TextEditingController(text: '2899');
    final weeklyController = TextEditingController(text: '16999');
    final depositController = TextEditingController(text: '8000');
    final sensorController = TextEditingController(text: 'Full-Frame CMOS');
    final stockController = TextEditingController(text: '3');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add Rental Fleet Camera', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: brandController,
                decoration: const InputDecoration(labelText: 'Brand (Sony, Canon, Nikon, etc.)', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: modelController,
                decoration: const InputDecoration(labelText: 'Model Name (e.g. Sony FX3 Full-Frame)', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: categoryController,
                decoration: const InputDecoration(labelText: 'Category', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: dailyController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Daily Rent (₹/day)', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: weeklyController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Weekly Rent (₹)', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: depositController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Security Deposit (₹)', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: sensorController,
                decoration: const InputDecoration(labelText: 'Sensor Specs', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: stockController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: 'Stock Quantity', border: OutlineInputBorder()),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
            onPressed: () async {
              final model = modelController.text.trim();
              if (model.isEmpty) {
                showCustomSnackBar(context, 'Please enter model name', isError: true);
                return;
              }
              Navigator.pop(ctx);
              setState(() => _isLoadingCameras = true);

              final newCam = {
                'id': 'rent-${DateTime.now().millisecondsSinceEpoch}',
                'brand': brandController.text.trim(),
                'model': model,
                'category': categoryController.text.trim(),
                'dailyPrice': double.tryParse(dailyController.text) ?? 2499.0,
                'weeklyPrice': double.tryParse(weeklyController.text) ?? 14999.0,
                'securityDeposit': double.tryParse(depositController.text) ?? 8000.0,
                'sensor': sensorController.text.trim(),
                'stock': int.tryParse(stockController.text) ?? 1,
                'status': 'available',
              };

              final ok = await _rentalsRepository.addRentalCamera(newCam);
              if (mounted) {
                if (ok) {
                  showCustomSnackBar(context, 'Camera $model added to rental fleet!', isError: false);
                  _loadFleet();
                } else {
                  // Local fallback insert
                  setState(() {
                    _cameras.insert(0, AdminRentalCamera.fromJson(newCam));
                    _isLoadingCameras = false;
                  });
                  showCustomSnackBar(context, 'Camera $model added to fleet', isError: false);
                }
              }
            },
            child: const Text('Add Camera'),
          ),
        ],
      ),
    );
  }

  void _showCameraOptions(AdminRentalCamera camera) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(camera.model, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              Text('${camera.brand} • ${camera.category}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
              const Divider(height: 24),
              ListTile(
                leading: const Icon(Icons.check_circle_outline, color: AppColors.success),
                title: const Text('Mark as Available'),
                onTap: () {
                  Navigator.pop(ctx);
                  _updateCameraStatus(camera.id, 'available');
                },
              ),
              ListTile(
                leading: const Icon(Icons.shopping_bag_outlined, color: AppColors.warning),
                title: const Text('Mark as Currently Rented'),
                onTap: () {
                  Navigator.pop(ctx);
                  _updateCameraStatus(camera.id, 'rented');
                },
              ),
              ListTile(
                leading: const Icon(Icons.build_circle_outlined, color: Color(0xFFF97316)),
                title: const Text('Mark Under Maintenance / Service'),
                onTap: () {
                  Navigator.pop(ctx);
                  _updateCameraStatus(camera.id, 'maintenance');
                },
              ),
              ListTile(
                leading: const Icon(Icons.delete_outline, color: AppColors.error),
                title: const Text('Delete from Fleet', style: TextStyle(color: AppColors.error)),
                onTap: () async {
                  Navigator.pop(ctx);
                  setState(() => _isLoadingCameras = true);
                  await _rentalsRepository.deleteRentalCamera(camera.id);
                  setState(() {
                    _cameras.removeWhere((c) => c.id == camera.id);
                    _isLoadingCameras = false;
                  });
                  if (mounted) {
                    showCustomSnackBar(context, 'Camera removed from fleet', isError: false);
                  }
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _updateCameraStatus(String id, String status) async {
    setState(() {
      final idx = _cameras.indexWhere((c) => c.id == id);
      if (idx != -1) {
        final c = _cameras[idx];
        _cameras[idx] = AdminRentalCamera(
          id: c.id,
          brand: c.brand,
          model: c.model,
          category: c.category,
          sensor: c.sensor,
          mount: c.mount,
          videoRes: c.videoRes,
          dailyPrice: c.dailyPrice,
          weeklyPrice: c.weeklyPrice,
          securityDeposit: c.securityDeposit,
          stock: c.stock,
          status: status,
          image: c.image,
          specs: c.specs,
        );
      }
    });
    showCustomSnackBar(context, 'Updating camera status...', isError: false);
    final ok = await _rentalsRepository.updateRentalCamera({'id': id, 'status': status});
    if (mounted) {
      if (ok) {
        showCustomSnackBar(context, 'Camera status updated to $status in database', isError: false);
      } else {
        showCustomSnackBar(context, 'Status updated locally (database offline)', isError: false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Rental Cameras & Fleet', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: AppColors.secondary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, size: 20),
            onPressed: () {
              _loadFleet();
              _loadRentalOrders();
            },
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primary,
          indicatorWeight: 3,
          labelColor: Colors.white,
          unselectedLabelColor: const Color(0xFF94A3B8),
          tabs: [
            Tab(text: 'Fleet Inventory (${_cameras.length})'),
            Tab(text: 'Rental Bookings (${_rentalOrders.length})'),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_a_photo_rounded),
        label: const Text('Add Camera', style: TextStyle(fontWeight: FontWeight.bold)),
        onPressed: _showAddCameraDialog,
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildFleetTab(),
          _buildBookingsTab(),
        ],
      ),
    );
  }

  Widget _buildFleetTab() {
    final query = _search.toLowerCase().trim();
    final filtered = _cameras.where((c) {
      final matchBrand = _selectedBrand == 'all' || c.brand.toLowerCase() == _selectedBrand.toLowerCase();
      final matchQuery = query.isEmpty || c.model.toLowerCase().contains(query) || c.category.toLowerCase().contains(query);
      return matchBrand && matchQuery;
    }).toList();

    return Column(
      children: [
        // Search & Filter
        Container(
          color: Colors.white,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: Column(
            children: [
              TextField(
                onChanged: (v) => setState(() => _search = v),
                decoration: InputDecoration(
                  hintText: 'Search camera model or category...',
                  prefixIcon: const Icon(Icons.search, size: 20, color: AppColors.textSecondary),
                  filled: true,
                  fillColor: AppColors.background,
                  contentPadding: const EdgeInsets.symmetric(vertical: 10),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 10),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: _brands.map((b) {
                    final isSelected = _selectedBrand == b;
                    return Padding(
                      padding: const EdgeInsets.only(right: 6),
                      child: FilterChip(
                        label: Text(b.toUpperCase(), style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isSelected ? Colors.white : AppColors.textPrimary)),
                        selected: isSelected,
                        selectedColor: AppColors.primary,
                        onSelected: (_) => setState(() => _selectedBrand = b),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
        ),

        Expanded(
          child: _isLoadingCameras
              ? const Center(child: CircularProgressIndicator())
              : filtered.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.camera_alt_outlined, size: 48, color: AppColors.textMuted),
                          const SizedBox(height: 12),
                          const Text('No rental cameras found', style: TextStyle(fontWeight: FontWeight.bold)),
                          const SizedBox(height: 8),
                          ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
                            icon: const Icon(Icons.add),
                            label: const Text('Add First Camera to Fleet'),
                            onPressed: _showAddCameraDialog,
                          ),
                        ],
                      ),
                    )
                  : ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: filtered.length,
                      separatorBuilder: (_, _) => const SizedBox(height: 12),
                      itemBuilder: (context, idx) {
                        final cam = filtered[idx];

                        return Container(
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.border),
                            boxShadow: [
                              BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 4, offset: const Offset(0, 2)),
                            ],
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.circular(12),
                                child: Container(
                                  width: 70,
                                  height: 70,
                                  decoration: BoxDecoration(
                                    color: AppColors.background,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: AppColors.border),
                                  ),
                                  child: cam.image.startsWith('http')
                                      ? Image.network(
                                          cam.image,
                                          fit: BoxFit.cover,
                                          errorBuilder: (_, _, _) => const Icon(Icons.camera_rounded, size: 36, color: AppColors.primary),
                                        )
                                      : const Icon(Icons.camera_rounded, size: 36, color: AppColors.primary),
                                ),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Expanded(
                                          child: Text(
                                            cam.model,
                                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.textPrimary),
                                          ),
                                        ),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                          decoration: BoxDecoration(
                                            color: cam.status == 'available'
                                                ? AppColors.success.withValues(alpha: 0.15)
                                                : cam.status == 'rented'
                                                    ? AppColors.primary.withValues(alpha: 0.15)
                                                    : AppColors.warning.withValues(alpha: 0.15),
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: Text(
                                            cam.status.toUpperCase(),
                                            style: TextStyle(
                                              fontSize: 9,
                                              fontWeight: FontWeight.bold,
                                              color: cam.status == 'available'
                                                  ? AppColors.success
                                                  : cam.status == 'rented'
                                                      ? AppColors.primary
                                                      : AppColors.warning,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 2),
                                    Text('${cam.brand} • ${cam.category}', style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                                    const SizedBox(height: 6),
                                    Wrap(
                                      spacing: 8,
                                      runSpacing: 4,
                                      crossAxisAlignment: WrapCrossAlignment.center,
                                      children: [
                                        Text(
                                          '${CurrencyFormatter.format(cam.dailyPrice)}/day',
                                          style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: AppColors.primary),
                                        ),
                                        Text(
                                          '• Deposit: ${CurrencyFormatter.format(cam.securityDeposit)}',
                                          style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                                        ),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                          decoration: BoxDecoration(
                                            color: AppColors.background,
                                            borderRadius: BorderRadius.circular(4),
                                            border: Border.all(color: AppColors.border),
                                          ),
                                          child: Text(
                                            'Stock: ${cam.stock}',
                                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10, color: AppColors.textSecondary),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.more_vert, size: 20),
                                onPressed: () => _showCameraOptions(cam),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
        ),
      ],
    );
  }

  Widget _buildBookingsTab() {
    return _isLoadingOrders
        ? const Center(child: CircularProgressIndicator())
        : _rentalOrders.isEmpty
            ? const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.calendar_today_rounded, size: 48, color: AppColors.textMuted),
                    SizedBox(height: 12),
                    Text('No rental bookings placed yet', style: TextStyle(fontWeight: FontWeight.bold)),
                    SizedBox(height: 4),
                    Text('When users book rental gear, they will appear here.', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
                  ],
                ),
              )
            : ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: _rentalOrders.length,
                separatorBuilder: (_, _) => const SizedBox(height: 12),
                itemBuilder: (context, idx) {
                  final order = _rentalOrders[idx];

                  return Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border),
                      boxShadow: [
                        BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 4, offset: const Offset(0, 2)),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(order.orderNumber, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: AppColors.primary)),
                            StatusBadge(status: order.status),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(order.deviceName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        const SizedBox(height: 2),
                        Text('Booked by ${order.customerName}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                        if (order.customerPhone.isNotEmpty) ...[
                          const SizedBox(height: 4),
                          InkWell(
                            onTap: () => openDialer(order.customerPhone),
                            child: Text('📞 ${order.customerPhone}', style: const TextStyle(color: AppColors.accent, fontSize: 12, fontWeight: FontWeight.bold)),
                          ),
                        ],
                        const Divider(height: 18),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Pickup / Delivery Slot', style: TextStyle(fontSize: 10, color: AppColors.textMuted)),
                                  Text(
                                    order.pickupDate.isNotEmpty ? '${order.pickupDate} (${order.pickupSlot})' : 'Slot Pending',
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              CurrencyFormatter.format(order.finalPrice),
                              style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: AppColors.success),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              );
  }
}
