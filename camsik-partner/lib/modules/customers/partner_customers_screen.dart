import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/constants/app_colors.dart';
import '../../core/services/session_service.dart';
import '../../core/utils/currency_formatter.dart';
import '../../models/partner_models.dart';
import '../orders/data/repositories/orders_repository.dart';
import 'data/models/customer_model.dart';

class PartnerCustomersScreen extends StatefulWidget {
  final List<PartnerOrder>? orders;

  const PartnerCustomersScreen({super.key, this.orders});

  @override
  State<PartnerCustomersScreen> createState() => _PartnerCustomersScreenState();
}

class _PartnerCustomersScreenState extends State<PartnerCustomersScreen> {
  final TextEditingController _searchCtrl = TextEditingController();
  final OrdersRepository _ordersRepo = OrdersRepositoryImpl();

  List<PartnerOrder> _orders = [];
  bool _isLoading = false;
  String _filterTier = 'all'; // all, vip, repeat

  @override
  void initState() {
    super.initState();
    if (widget.orders != null && widget.orders!.isNotEmpty) {
      _orders = widget.orders!;
    } else {
      _loadLiveOrders();
    }
  }

  Future<void> _loadLiveOrders() async {
    setState(() => _isLoading = true);
    final partner = SessionService.currentUser;
    final partnerId = partner?.id ?? '';
    if (partnerId.isEmpty) {
      if (mounted) setState(() => _isLoading = false);
      return;
    }
    final fetched = await _ordersRepo.fetchOrders(partnerId: partnerId);
    if (mounted) {
      setState(() {
        _orders = fetched;
        _isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  List<CustomerModel> get _allCustomers {
    final Map<String, List<PartnerOrder>> grouped = {};
    for (final o in _orders) {
      final key = o.customerPhone.isNotEmpty ? o.customerPhone : (o.customerName.isNotEmpty ? o.customerName : o.id);
      grouped.putIfAbsent(key, () => []).add(o);
    }
    final list = grouped.entries.map((e) => CustomerModel.fromOrders(e.key, e.value)).toList();
    list.sort((a, b) => b.totalSpent.compareTo(a.totalSpent));
    return list;
  }

  Future<void> _makeCall(String phone) async {
    final clean = phone.replaceAll(RegExp(r'\s+'), '');
    if (clean.isEmpty) return;
    final uri = Uri.parse('tel:$clean');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  void _showCustomerOrdersSheet(CustomerModel customer) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) {
        return DraggableScrollableSheet(
          initialChildSize: 0.65,
          minChildSize: 0.4,
          maxChildSize: 0.9,
          expand: false,
          builder: (scrollCtx, scrollCtrl) {
            return Padding(
              padding: EdgeInsets.fromLTRB(5.w, 2.h, 5.w, 3.h),
              child: ListView(
                controller: scrollCtrl,
                children: [
                  Center(
                    child: Container(
                      width: 44,
                      height: 5,
                      decoration: BoxDecoration(
                        color: const Color(0xFFCBD5E1),
                        borderRadius: BorderRadius.circular(3),
                      ),
                    ),
                  ),
                  SizedBox(height: 2.h),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              customer.name,
                              style: TextStyle(
                                fontSize: 17.sp,
                                fontWeight: FontWeight.w900,
                                color: const Color(0xFF0F172A),
                              ),
                            ),
                            SizedBox(height: 0.3.h),
                            Text(
                              '+91 ${customer.phone} • ${customer.city}',
                              style: TextStyle(
                                fontSize: 14.sp,
                                color: const Color(0xFF64748B),
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 0.8.h),
                        decoration: BoxDecoration(
                          color: AppColors.successLight,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          CurrencyFormatter.format(customer.totalSpent),
                          style: TextStyle(
                            fontSize: 15.sp,
                            fontWeight: FontWeight.w900,
                            color: AppColors.success,
                          ),
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 2.h),
                  const Divider(height: 1, color: Color(0xFFE2E8F0)),
                  SizedBox(height: 1.5.h),
                  Text(
                    'Order History (${customer.orders.length} Traded)',
                    style: TextStyle(
                      fontSize: 15.sp,
                      fontWeight: FontWeight.bold,
                      color: const Color(0xFF334155),
                    ),
                  ),
                  SizedBox(height: 1.h),
                  ...customer.orders.map((o) {
                    final price = o.finalPrice > 0 ? o.finalPrice : o.quotedPrice;
                    return Container(
                      margin: EdgeInsets.only(bottom: 1.2.h),
                      padding: EdgeInsets.all(3.5.w),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  o.orderNumber,
                                  style: TextStyle(
                                    fontSize: 14.sp,
                                    fontWeight: FontWeight.bold,
                                    color: const Color(0xFF0F172A),
                                  ),
                                ),
                                SizedBox(height: 0.2.h),
                                Text(
                                  o.deviceName.isNotEmpty ? o.deviceName : o.deviceModel,
                                  style: TextStyle(
                                    fontSize: 14.sp,
                                    color: const Color(0xFF475569),
                                  ),
                                ),
                                SizedBox(height: 0.2.h),
                                Text(
                                  o.pickupDate.isNotEmpty ? o.pickupDate : 'Completed Order',
                                  style: TextStyle(
                                    fontSize: 14.sp,
                                    color: const Color(0xFF94A3B8),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                CurrencyFormatter.format(price),
                                style: TextStyle(
                                  fontSize: 15.sp,
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.primary,
                                ),
                              ),
                              SizedBox(height: 0.4.h),
                              Container(
                                padding: EdgeInsets.symmetric(horizontal: 2.w, vertical: 0.3.h),
                                decoration: BoxDecoration(
                                  color: AppColors.successLight,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  o.statusDisplay,
                                  style: TextStyle(
                                    fontSize: 14.sp,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.success,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    );
                  }),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final query = _searchCtrl.text.toLowerCase().trim();
    final all = _allCustomers;

    final vipCount = all.where((c) => c.status == 'vip').length;
    final repeatCount = all.where((c) => c.status == 'repeat' || c.orderCount > 1).length;
    final totalTradeVolume = all.fold<double>(0.0, (s, c) => s + c.totalSpent);

    final filtered = all.where((c) {
      final matchesQuery = query.isEmpty ||
          c.name.toLowerCase().contains(query) ||
          c.phone.contains(query) ||
          c.city.toLowerCase().contains(query) ||
          c.latestDevice.toLowerCase().contains(query);
      if (!matchesQuery) return false;

      if (_filterTier == 'vip') return c.status == 'vip';
      if (_filterTier == 'repeat') return c.status == 'repeat' || c.orderCount > 1;
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(
          'Store Customer Directory',
          style: TextStyle(
            fontSize: 17.sp,
            fontWeight: FontWeight.w900,
            color: const Color(0xFF0F172A),
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Color(0xFF64748B)),
            onPressed: _loadLiveOrders,
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _loadLiveOrders,
        child: _isLoading
            ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
            : ListView(
                padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.5.h),
                physics: const AlwaysScrollableScrollPhysics(),
                children: [
                  // Hero CRM Overview Banner
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
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF48CAE4).withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: const Icon(
                                    Icons.contacts_rounded,
                                    color: Color(0xFF48CAE4),
                                    size: 18,
                                  ),
                                ),
                                SizedBox(width: 2.5.w),
                                Text(
                                  'STORE CLIENT CRM',
                                  style: TextStyle(
                                    color: const Color(0xFF94A3B8),
                                    fontSize: 14.sp,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 1.1,
                                  ),
                                ),
                              ],
                            ),
                            Container(
                              padding: EdgeInsets.symmetric(horizontal: 2.8.w, vertical: 0.5.h),
                              decoration: BoxDecoration(
                                color: const Color(0xFF10B981).withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.4)),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.verified_user_rounded, color: Color(0xFF34D399), size: 14),
                                  SizedBox(width: 1.w),
                                  Text(
                                    'Live Network',
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
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '${all.length} Clients',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 18.sp,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                                SizedBox(height: 0.2.h),
                                Text(
                                  'Total Unique Traded Customers',
                                  style: TextStyle(
                                    color: const Color(0xFF94A3B8),
                                    fontSize: 14.sp,
                                  ),
                                ),
                              ],
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  CurrencyFormatter.format(totalTradeVolume),
                                  style: TextStyle(
                                    color: const Color(0xFF34D399),
                                    fontSize: 17.sp,
                                    fontWeight: FontWeight.w900,
                                  ),
                                ),
                                SizedBox(height: 0.2.h),
                                Text(
                                  'Lifetime Traded Volume',
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

                  // Search Bar
                  TextField(
                    controller: _searchCtrl,
                    onChanged: (_) => setState(() {}),
                    style: TextStyle(fontSize: 15.sp, color: const Color(0xFF0F172A)),
                    decoration: InputDecoration(
                      hintText: 'Search by client name, phone, city, or device...',
                      hintStyle: TextStyle(fontSize: 14.sp, color: const Color(0xFF94A3B8)),
                      prefixIcon: const Icon(Icons.search_rounded, size: 22, color: Color(0xFF64748B)),
                      suffixIcon: _searchCtrl.text.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.close_rounded, size: 20, color: Color(0xFF64748B)),
                              onPressed: () {
                                _searchCtrl.clear();
                                setState(() {});
                              },
                            )
                          : null,
                      filled: true,
                      fillColor: Colors.white,
                      contentPadding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 1.5.h),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: const BorderSide(color: AppColors.primary, width: 2),
                      ),
                    ),
                  ),

                  SizedBox(height: 1.5.h),

                  // Filter Chips
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        _buildFilterChip('all', 'All Clients (${all.length})'),
                        SizedBox(width: 2.w),
                        _buildFilterChip('vip', 'High-Value VIP ($vipCount)'),
                        SizedBox(width: 2.w),
                        _buildFilterChip('repeat', 'Repeat Clients ($repeatCount)'),
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
                              child: const Icon(Icons.person_search_rounded, size: 38, color: Color(0xFF94A3B8)),
                            ),
                            SizedBox(height: 1.5.h),
                            Text(
                              'No customers found',
                              style: TextStyle(
                                fontSize: 16.sp,
                                fontWeight: FontWeight.bold,
                                color: const Color(0xFF0F172A),
                              ),
                            ),
                            SizedBox(height: 0.5.h),
                            Text(
                              query.isNotEmpty
                                  ? 'No client matched "$query". Try searching with phone or device.'
                                  : 'Customers who trade devices with your store will automatically appear here.',
                              textAlign: TextAlign.center,
                              style: TextStyle(fontSize: 14.sp, color: const Color(0xFF64748B)),
                            ),
                          ],
                        ),
                      ),
                    )
                  else
                    ...filtered.map((c) => _buildCustomerCard(c)),
                ],
              ),
      ),
    );
  }

  Widget _buildFilterChip(String key, String label) {
    final isSelected = _filterTier == key;
    return InkWell(
      onTap: () => setState(() => _filterTier = key),
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

  Widget _buildCustomerCard(CustomerModel customer) {
    final isVip = customer.status == 'vip';
    final isRepeat = customer.status == 'repeat';

    final initials = customer.name.isNotEmpty
        ? customer.name.trim().substring(0, 1).toUpperCase()
        : 'C';

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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      gradient: isVip
                          ? const LinearGradient(colors: [Color(0xFFF59E0B), Color(0xFFD97706)])
                          : (isRepeat
                              ? const LinearGradient(colors: [Color(0xFF8B5CF6), Color(0xFF6D28D9)])
                              : const LinearGradient(colors: [Color(0xFF3B82F6), Color(0xFF1D4ED8)])),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: (isVip ? const Color(0xFFF59E0B) : AppColors.primary).withValues(alpha: 0.25),
                          blurRadius: 8,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Center(
                      child: Text(
                        initials,
                        style: TextStyle(
                          fontSize: 18.sp,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                  SizedBox(width: 3.5.w),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        customer.name,
                        style: TextStyle(
                          fontSize: 16.sp,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF0F172A),
                        ),
                      ),
                      SizedBox(height: 0.2.h),
                      Text(
                        '+91 ${customer.phone}',
                        style: TextStyle(
                          fontSize: 14.sp,
                          color: const Color(0xFF475569),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      SizedBox(height: 0.2.h),
                      Text(
                        '${customer.city} • ${customer.orderCount} Order${customer.orderCount > 1 ? "s" : ""} Traded',
                        style: TextStyle(
                          fontSize: 14.sp,
                          color: const Color(0xFF64748B),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 2.8.w, vertical: 0.5.h),
                decoration: BoxDecoration(
                  color: isVip
                      ? const Color(0xFFFEF3C7)
                      : (isRepeat ? const Color(0xFFF3E8FF) : const Color(0xFFEFF6FF)),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: isVip
                        ? const Color(0xFFFDE68A)
                        : (isRepeat ? const Color(0xFFDDD6FE) : const Color(0xFFBFDBFE)),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      isVip
                          ? Icons.stars_rounded
                          : (isRepeat ? Icons.repeat_rounded : Icons.verified_rounded),
                      size: 14,
                      color: isVip
                          ? const Color(0xFFD97706)
                          : (isRepeat ? const Color(0xFF7C3AED) : const Color(0xFF2563EB)),
                    ),
                    SizedBox(width: 1.w),
                    Text(
                      isVip ? 'VIP CLIENT' : (isRepeat ? 'REPEAT' : 'CLIENT'),
                      style: TextStyle(
                        fontSize: 14.sp,
                        fontWeight: FontWeight.bold,
                        color: isVip
                            ? const Color(0xFFB45309)
                            : (isRepeat ? const Color(0xFF6D28D9) : const Color(0xFF1D4ED8)),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          SizedBox(height: 1.5.h),

          // Traded Device Pill
          Container(
            padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 0.6.h),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                const Icon(Icons.phone_android_rounded, size: 16, color: Color(0xFF64748B)),
                SizedBox(width: 2.w),
                Expanded(
                  child: Text(
                    'Latest: ${customer.latestDevice}',
                    style: TextStyle(
                      fontSize: 14.sp,
                      color: const Color(0xFF334155),
                      fontWeight: FontWeight.w600,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),

          SizedBox(height: 1.2.h),
          const Divider(height: 1, color: Color(0xFFF1F5F9)),
          SizedBox(height: 1.2.h),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Total Traded',
                    style: TextStyle(
                      fontSize: 14.sp,
                      color: const Color(0xFF64748B),
                    ),
                  ),
                  SizedBox(height: 0.2.h),
                  Text(
                    CurrencyFormatter.format(customer.totalSpent),
                    style: TextStyle(
                      fontSize: 16.sp,
                      fontWeight: FontWeight.w900,
                      color: AppColors.success,
                    ),
                  ),
                ],
              ),
              Row(
                children: [
                  InkWell(
                    onTap: () => _showCustomerOrdersSheet(customer),
                    borderRadius: BorderRadius.circular(10),
                    child: Container(
                      padding: EdgeInsets.symmetric(horizontal: 3.w, vertical: 0.8.h),
                      decoration: BoxDecoration(
                        color: AppColors.primaryLight,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.receipt_long_rounded, color: AppColors.primary, size: 15),
                          SizedBox(width: 1.5.w),
                          Text(
                            'History',
                            style: TextStyle(
                              fontSize: 14.sp,
                              color: AppColors.primary,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  SizedBox(width: 2.w),
                  InkWell(
                    onTap: () => _makeCall(customer.phone),
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
                            'Call',
                            style: TextStyle(
                              fontSize: 14.sp,
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}
