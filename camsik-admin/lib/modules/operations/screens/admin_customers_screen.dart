import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../core/utils/helpers.dart';
import '../../../models/admin_models.dart';
import '../../orders/repositories/orders_repository.dart';

class AdminCustomersScreen extends StatefulWidget {
  const AdminCustomersScreen({super.key});

  @override
  State<AdminCustomersScreen> createState() => _AdminCustomersScreenState();
}

class _AdminCustomersScreenState extends State<AdminCustomersScreen> {
  final _ordersRepository = OrdersRepository();
  List<AdminCustomer> _customers = [];
  bool _isLoading = true;
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadCustomers();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadCustomers() async {
    setState(() => _isLoading = true);
    // Derive unique customers from orders
    final orders = await _ordersRepository.getOrders();
    final Map<String, AdminCustomer> map = {};

    for (final o in orders) {
      final phone = o.customerPhone.trim();
      if (phone.isEmpty) continue;

      if (!map.containsKey(phone)) {
        map[phone] = AdminCustomer(
          id: phone,
          name: o.customerName,
          phone: phone,
          email: o.customerEmail,
          city: o.pickupCity.isEmpty ? 'India' : o.pickupCity,
          totalOrders: 1,
          totalSpent: o.finalPrice,
          joinedAt: o.createdAt.split('T').first,
        );
      } else {
        final existing = map[phone]!;
        map[phone] = AdminCustomer(
          id: phone,
          name: existing.name.isNotEmpty && existing.name != 'Customer' ? existing.name : o.customerName,
          phone: phone,
          email: existing.email.isNotEmpty ? existing.email : o.customerEmail,
          city: existing.city,
          totalOrders: existing.totalOrders + 1,
          totalSpent: existing.totalSpent + o.finalPrice,
          joinedAt: existing.joinedAt,
        );
      }
    }

    if (!mounted) return;
    setState(() {
      _customers = map.values.toList();
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final query = _searchController.text.toLowerCase().trim();
    final filtered = _customers.where((c) {
      return c.name.toLowerCase().contains(query) ||
          c.phone.contains(query) ||
          c.city.toLowerCase().contains(query);
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Customer Directory', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: AppColors.secondary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(icon: const Icon(Icons.refresh, size: 20), onPressed: _loadCustomers),
        ],
      ),
      body: Column(
        children: [
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: TextField(
              controller: _searchController,
              onChanged: (_) => setState(() {}),
              decoration: InputDecoration(
                hintText: 'Search customer name, phone, or city...',
                prefixIcon: const Icon(Icons.search, size: 20, color: AppColors.textSecondary),
                filled: true,
                fillColor: AppColors.background,
                contentPadding: const EdgeInsets.symmetric(vertical: 10),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : filtered.isEmpty
                    ? const Center(
                        child: Text('No customers found', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.textMuted)),
                      )
                    : ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: filtered.length,
                        separatorBuilder: (_, _) => const SizedBox(height: 10),
                        itemBuilder: (context, idx) {
                          final c = filtered[idx];
                          return Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: AppColors.border),
                              boxShadow: [
                                BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 4, offset: const Offset(0, 2)),
                              ],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    CircleAvatar(
                                      backgroundColor: AppColors.primary.withValues(alpha: 0.15),
                                      child: Text(
                                        c.name.isNotEmpty ? c.name[0].toUpperCase() : 'C',
                                        style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary),
                                      ),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(c.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                                          const SizedBox(height: 2),
                                          Text(c.city, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                                        ],
                                      ),
                                    ),
                                    // Contact Actions
                                    IconButton(
                                      icon: const Icon(Icons.phone, size: 18, color: AppColors.accent),
                                      tooltip: 'Call Customer',
                                      onPressed: () => openDialer(c.phone),
                                    ),
                                  ],
                                ),
                                const Divider(height: 18),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text('📞 ${c.phone}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                                    Row(
                                      children: [
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                          decoration: BoxDecoration(
                                            color: AppColors.primary.withValues(alpha: 0.1),
                                            borderRadius: BorderRadius.circular(6),
                                          ),
                                          child: Text('${c.totalOrders} Orders', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary)),
                                        ),
                                        const SizedBox(width: 8),
                                        Text(
                                          CurrencyFormatter.format(c.totalSpent),
                                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.success),
                                        ),
                                      ],
                                    ),
                                  ],
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
}
