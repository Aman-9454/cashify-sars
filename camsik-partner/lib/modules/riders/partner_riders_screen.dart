import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/constants/app_colors.dart';
import '../../core/services/session_service.dart';
import '../orders/data/repositories/orders_repository.dart';
import '../../models/partner_models.dart';
import 'data/models/delivery_agent_model.dart';
import 'data/repositories/riders_repository.dart';
import 'screens/add_rider_screen.dart';

class PartnerRidersScreen extends StatefulWidget {
  const PartnerRidersScreen({super.key});

  @override
  State<PartnerRidersScreen> createState() => _PartnerRidersScreenState();
}

class _PartnerRidersScreenState extends State<PartnerRidersScreen> {
  final RidersRepository _ridersRepo = RidersRepositoryImpl();
  final OrdersRepository _ordersRepo = OrdersRepositoryImpl();

  List<DeliveryAgentModel> _riders = [];
  List<PartnerOrder> _allOrders = [];
  bool _loading = true;
  String _filter = 'all';

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    final partner = SessionService.currentUser;
    final partnerId = partner?.id ?? '';
    if (partnerId.isEmpty) {
      if (mounted) setState(() => _loading = false);
      return;
    }

    try {
      final results = await Future.wait([
        _ridersRepo.fetchRiders(partnerId: partnerId),
        _ordersRepo.fetchOrders(partnerId: partnerId),
      ]);

      if (mounted) {
        setState(() {
          _riders = results[0] as List<DeliveryAgentModel>;
          _allOrders = results[1] as List<PartnerOrder>;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _makeCall(String phone) async {
    final clean = phone.replaceAll(RegExp(r'\s+'), '');
    if (clean.isEmpty) return;
    final uri = Uri.parse('tel:$clean');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  Future<void> _openAddRiderScreen() async {
    final added = await Navigator.push<bool>(
      context,
      MaterialPageRoute(builder: (_) => const AddRiderScreen()),
    );
    if (added == true) {
      _loadData();
    }
  }

  Future<void> _toggleRiderStatus(DeliveryAgentModel rider) async {
    final newStatus = rider.status == 'online' ? 'offline' : 'online';
    final success = await _ridersRepo.updateRiderStatus(rider.id, newStatus);
    if (success) {
      setState(() {
        final idx = _riders.indexWhere((r) => r.id == rider.id);
        if (idx != -1) {
          _riders[idx] = DeliveryAgentModel(
            id: rider.id,
            name: rider.name,
            phone: rider.phone,
            email: rider.email,
            city: rider.city,
            pinCodes: rider.pinCodes,
            status: newStatus,
            rating: rider.rating,
            todayPickups: rider.todayPickups,
            todayDeliveries: rider.todayDeliveries,
            partnerId: rider.partnerId,
            vehicle: rider.vehicle,
            vehicleNumber: rider.vehicleNumber,
          );
        }
      });
    }
  }

  int _getActiveTasksForRider(DeliveryAgentModel rider) {
    return _allOrders.where((o) {
      final isRiderAssigned = o.deliveryAgentId == rider.id ||
          (o.deliveryAgentPhone != null && o.deliveryAgentPhone == rider.phone);
      if (!isRiderAssigned) return false;
      return o.status != 'completed' && o.status != 'paid' && o.status != 'cancelled' && o.status != 'rejected';
    }).length;
  }

  int _getCompletedTasksForRider(DeliveryAgentModel rider) {
    return _allOrders.where((o) {
      final isRiderAssigned = o.deliveryAgentId == rider.id ||
          (o.deliveryAgentPhone != null && o.deliveryAgentPhone == rider.phone);
      if (!isRiderAssigned) return false;
      return o.status == 'completed' || o.status == 'paid';
    }).length;
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _filter == 'all'
        ? _riders
        : _riders.where((r) => r.status.toLowerCase() == _filter).toList();

    final onlineCount = _riders.where((r) => r.status.toLowerCase() == 'online').length;
    final onTripCount = _riders.where((r) => r.status.toLowerCase() == 'on_trip').length;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(
          'Store Delivery Fleet',
          style: TextStyle(
            fontSize: 17.sp,
            fontWeight: FontWeight.w900,
            color: const Color(0xFF0F172A),
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          Padding(
            padding: EdgeInsets.only(right: 3.w),
            child: ElevatedButton.icon(
              icon: const Icon(Icons.add_rounded, size: 18),
              label: Text(
                'Add Rider',
                style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                elevation: 0,
                padding: EdgeInsets.symmetric(horizontal: 3.5.w, vertical: 0.8.h),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: _openAddRiderScreen,
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _loadData,
        child: _loading
            ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
            : ListView(
                padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.5.h),
                physics: const AlwaysScrollableScrollPhysics(),
                children: [
                  // Hero Fleet Overview Banner
                  Container(
                    padding: EdgeInsets.all(5.w),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF0B132B), Color(0xFF1C2541)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: const Color(0xFF3A506B).withValues(alpha: 0.5)),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF0B132B).withValues(alpha: 0.35),
                          blurRadius: 18,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(7),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF48CAE4).withValues(alpha: 0.15),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: const Icon(
                                      Icons.two_wheeler_rounded,
                                      color: Color(0xFF48CAE4),
                                      size: 16,
                                    ),
                                  ),
                                  SizedBox(width: 2.w),
                                  Flexible(
                                    child: Text(
                                      'STORE FLEET',
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                        color: const Color(0xFF94A3B8),
                                        fontSize: 14.sp,
                                        fontWeight: FontWeight.bold,
                                        letterSpacing: 0.8,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            SizedBox(width: 2.w),
                            Container(
                              padding: EdgeInsets.symmetric(horizontal: 2.5.w, vertical: 0.4.h),
                              decoration: BoxDecoration(
                                color: const Color(0xFF10B981).withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.shield_rounded, color: Color(0xFF34D399), size: 14),
                                  SizedBox(width: 1.w),
                                  Text(
                                    'Verified Fleet',
                                    style: TextStyle(
                                      color: const Color(0xFF34D399),
                                      fontSize: 14.sp,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: 1.8.h),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '${_riders.length} Riders',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 18.sp,
                                      fontWeight: FontWeight.w900,
                                    ),
                                  ),
                                  SizedBox(height: 0.2.h),
                                  Text(
                                    'Total Fleet',
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: TextStyle(
                                      color: const Color(0xFF94A3B8),
                                      fontSize: 14.sp,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            SizedBox(width: 2.w),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  '$onlineCount Online',
                                  style: TextStyle(
                                    color: const Color(0xFF34D399),
                                    fontSize: 17.sp,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                                SizedBox(height: 0.2.h),
                                Text(
                                  '$onTripCount On Trip',
                                  style: TextStyle(
                                    color: const Color(0xFF94A3B8),
                                    fontSize: 14.sp,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  SizedBox(height: 2.h),

                  // Filter Chips
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildFilterChip('all', 'All Riders (${_riders.length})'),
                        SizedBox(width: 2.w),
                        _buildFilterChip('online', 'Online ($onlineCount)'),
                        SizedBox(width: 2.w),
                        _buildFilterChip('on_trip', 'On Trip ($onTripCount)'),
                        SizedBox(width: 2.w),
                        _buildFilterChip('offline', 'Offline'),
                      ],
                    ),
                  ),
                  SizedBox(height: 2.h),

                  if (filtered.isEmpty)
                    Container(
                      padding: EdgeInsets.symmetric(vertical: 4.h, horizontal: 4.w),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Center(
                        child: Column(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: const BoxDecoration(
                                color: Color(0xFFF1F5F9),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.two_wheeler_rounded, size: 38, color: Color(0xFF94A3B8)),
                            ),
                            SizedBox(height: 1.5.h),
                            Text(
                              'No store riders in this category',
                              style: TextStyle(
                                fontSize: 16.sp,
                                fontWeight: FontWeight.bold,
                                color: const Color(0xFF0F172A),
                              ),
                            ),
                            SizedBox(height: 0.5.h),
                            Text(
                              'Add your delivery executives to assign them doorstep inspections & device pick-up tasks.',
                              textAlign: TextAlign.center,
                              style: TextStyle(fontSize: 14.sp, color: const Color(0xFF64748B)),
                            ),
                            SizedBox(height: 2.h),
                            ElevatedButton.icon(
                              icon: const Icon(Icons.person_add_rounded, size: 18),
                              label: Text('Onboard New Rider', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold)),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primary,
                                foregroundColor: Colors.white,
                                padding: EdgeInsets.symmetric(horizontal: 5.w, vertical: 1.2.h),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              ),
                              onPressed: _openAddRiderScreen,
                            ),
                          ],
                        ),
                      ),
                    )
                  else
                    ...filtered.map((rider) => _buildRiderCard(rider)),
                ],
              ),
      ),
    );
  }

  Widget _buildFilterChip(String key, String label) {
    final isSelected = _filter == key;
    return InkWell(
      onTap: () => setState(() => _filter = key),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 0.8.h),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppColors.primary : const Color(0xFFE2E8F0),
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.25),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : const Color(0xFF64748B),
            fontSize: 14.sp,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
          ),
        ),
      ),
    );
  }

  Widget _buildRiderCard(DeliveryAgentModel rider) {
    final isOnline = rider.status.toLowerCase() == 'online';
    final isOnTrip = rider.status.toLowerCase() == 'on_trip';

    final activeTasks = _getActiveTasksForRider(rider);
    final completedTasks = _getCompletedTasksForRider(rider);

    final vehicleInfo = [
      if (rider.vehicle.isNotEmpty) rider.vehicle,
      if (rider.vehicleNumber.isNotEmpty) '(${rider.vehicleNumber})',
    ].join(' ');

    return Container(
      margin: EdgeInsets.only(bottom: 1.5.h),
      padding: EdgeInsets.all(4.w),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Row: Avatar + Details + Status Pill (Safe from overflow)
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  gradient: isOnline
                      ? const LinearGradient(colors: [Color(0xFF10B981), Color(0xFF059669)])
                      : (isOnTrip
                          ? const LinearGradient(colors: [Color(0xFF3B82F6), Color(0xFF1D4ED8)])
                          : const LinearGradient(colors: [Color(0xFF64748B), Color(0xFF475569)])),
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [
                    BoxShadow(
                      color: (isOnline ? AppColors.success : AppColors.primary).withValues(alpha: 0.25),
                      blurRadius: 8,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: const Icon(Icons.two_wheeler_rounded, color: Colors.white, size: 22),
              ),
              SizedBox(width: 3.5.w),
              // Expanded so text cannot overflow off screen!
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      rider.name,
                      style: TextStyle(
                        fontSize: 16.sp,
                        fontWeight: FontWeight.bold,
                        color: const Color(0xFF0F172A),
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    SizedBox(height: 0.2.h),
                    Text(
                      '+91 ${rider.phone}',
                      style: TextStyle(
                        fontSize: 14.sp,
                        color: const Color(0xFF475569),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    if (vehicleInfo.isNotEmpty) ...[
                      SizedBox(height: 0.2.h),
                      Text(
                        vehicleInfo,
                        style: TextStyle(
                          fontSize: 14.sp,
                          color: const Color(0xFF64748B),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ],
                ),
              ),
              SizedBox(width: 2.w),
              // Status Pill with tap-to-toggle
              InkWell(
                onTap: () => _toggleRiderStatus(rider),
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding: EdgeInsets.symmetric(horizontal: 2.5.w, vertical: 0.5.h),
                  decoration: BoxDecoration(
                    color: isOnline
                        ? const Color(0xFFECFDF5)
                        : (isOnTrip ? const Color(0xFFEFF6FF) : const Color(0xFFF1F5F9)),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isOnline
                          ? const Color(0xFFA7F3D0)
                          : (isOnTrip ? const Color(0xFFBFDBFE) : const Color(0xFFCBD5E1)),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 7,
                        height: 7,
                        decoration: BoxDecoration(
                          color: isOnline
                              ? const Color(0xFF059669)
                              : (isOnTrip ? const Color(0xFF2563EB) : const Color(0xFF64748B)),
                          shape: BoxShape.circle,
                        ),
                      ),
                      SizedBox(width: 1.w),
                      Text(
                        rider.status.toUpperCase(),
                        style: TextStyle(
                          fontSize: 14.sp,
                          fontWeight: FontWeight.bold,
                          color: isOnline
                              ? const Color(0xFF059669)
                              : (isOnTrip ? const Color(0xFF2563EB) : const Color(0xFF64748B)),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          SizedBox(height: 1.5.h),
          const Divider(height: 1, color: Color(0xFFF1F5F9)),
          SizedBox(height: 1.2.h),

          // Bottom Action & Live Tasks Metrics
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Wrap(
                  spacing: 2.w,
                  runSpacing: 0.5.h,
                  children: [
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 2.5.w, vertical: 0.4.h),
                      decoration: BoxDecoration(
                        color: activeTasks > 0 ? const Color(0xFFEFF6FF) : const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        'Active: $activeTasks',
                        style: TextStyle(
                          fontSize: 14.sp,
                          fontWeight: FontWeight.bold,
                          color: activeTasks > 0 ? AppColors.primary : const Color(0xFF64748B),
                        ),
                      ),
                    ),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 2.5.w, vertical: 0.4.h),
                      decoration: BoxDecoration(
                        color: completedTasks > 0 ? AppColors.successLight : const Color(0xFFF1F5F9),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        'Done: $completedTasks',
                        style: TextStyle(
                          fontSize: 14.sp,
                          fontWeight: FontWeight.bold,
                          color: completedTasks > 0 ? AppColors.success : const Color(0xFF64748B),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              InkWell(
                onTap: () => _makeCall(rider.phone),
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  padding: EdgeInsets.symmetric(horizontal: 3.5.w, vertical: 0.8.h),
                  decoration: BoxDecoration(
                    color: const Color(0xFF059669),
                    borderRadius: BorderRadius.circular(10),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF059669).withValues(alpha: 0.25),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.phone_in_talk_rounded, color: Colors.white, size: 15),
                      SizedBox(width: 1.5.w),
                      Text(
                        'Call Rider',
                        style: TextStyle(fontSize: 14.sp, color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
