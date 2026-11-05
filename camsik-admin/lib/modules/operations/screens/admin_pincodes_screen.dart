import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/utils/helpers.dart';
import '../../../models/admin_models.dart';
import '../repositories/operations_repository.dart';

class AdminPincodesScreen extends StatefulWidget {
  const AdminPincodesScreen({super.key});

  @override
  State<AdminPincodesScreen> createState() => _AdminPincodesScreenState();
}

class _AdminPincodesScreenState extends State<AdminPincodesScreen> {
  final _operationsRepository = OperationsRepository();
  List<AdminPincode> _pincodes = [];
  bool _isLoading = true;
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadPincodes();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadPincodes() async {
    setState(() => _isLoading = true);
    final list = await _operationsRepository.fetchPincodes();
    if (!mounted) return;
    setState(() {
      _pincodes = list;
      _isLoading = false;
    });
  }

  void _showAddPincodeDialog() {
    final pinController = TextEditingController();
    final cityController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add Serviceable Pincode', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: pinController,
              keyboardType: TextInputType.number,
              maxLength: 6,
              decoration: const InputDecoration(
                labelText: '6-Digit Pincode',
                hintText: 'e.g. 400001',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: cityController,
              decoration: const InputDecoration(
                labelText: 'City / Zone Name',
                hintText: 'e.g. Mumbai South / Fort',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
            onPressed: () async {
              final pin = pinController.text.trim();
              final city = cityController.text.trim();
              if (pin.length != 6) {
                showCustomSnackBar(context, 'Please enter a valid 6-digit pincode', isError: true);
                return;
              }
              Navigator.pop(ctx);
              setState(() => _isLoading = true);
              final ok = await _operationsRepository.addPincode(pin, city.isEmpty ? 'Serviceable Area' : city);
              if (mounted) {
                if (ok) {
                  showCustomSnackBar(context, 'Pincode $pin added to service network', isError: false);
                  _loadPincodes();
                } else {
                  showCustomSnackBar(context, 'Failed to add pincode', isError: true);
                  setState(() => _isLoading = false);
                }
              }
            },
            child: const Text('Add Pincode'),
          ),
        ],
      ),
    );
  }

  Future<void> _deletePincode(String pin) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Remove Pincode', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        content: Text('Are you sure you want to remove pincode $pin from the serviceable network?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Remove', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      setState(() => _isLoading = true);
      final ok = await _operationsRepository.deletePincode(pin);
      if (!mounted) return;
      if (ok) {
        showCustomSnackBar(context, 'Pincode $pin removed', isError: false);
        _loadPincodes();
      } else {
        showCustomSnackBar(context, 'Failed to remove pincode', isError: true);
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final query = _searchController.text.toLowerCase().trim();
    final filtered = _pincodes.where((p) => p.pincode.contains(query) || p.city.toLowerCase().contains(query)).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Serviceable Pincodes', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: AppColors.secondary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, size: 20),
            onPressed: _loadPincodes,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_location_alt_rounded),
        label: const Text('Add Pincode', style: TextStyle(fontWeight: FontWeight.bold)),
        onPressed: _showAddPincodeDialog,
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
                hintText: 'Search pincode or city...',
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
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.location_off_rounded, size: 48, color: AppColors.textMuted),
                            const SizedBox(height: 12),
                            const Text('No serviceable pincodes found', style: TextStyle(fontWeight: FontWeight.bold)),
                            const SizedBox(height: 6),
                            TextButton.icon(
                              icon: const Icon(Icons.add),
                              label: const Text('Add your first serviceable pincode'),
                              onPressed: _showAddPincodeDialog,
                            ),
                          ],
                        ),
                      )
                    : ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: filtered.length,
                        separatorBuilder: (_, _) => const SizedBox(height: 10),
                        itemBuilder: (context, idx) {
                          final item = filtered[idx];
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
                            child: Row(
                              children: [
                                Container(
                                  width: 44,
                                  height: 44,
                                  decoration: BoxDecoration(
                                    color: AppColors.primary.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: const Icon(Icons.pin_drop, color: AppColors.primary, size: 22),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        item.pincode,
                                        style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: AppColors.textPrimary),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        item.city,
                                        style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                      ),
                                    ],
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppColors.success.withValues(alpha: 0.1),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Text('Active Zone', style: TextStyle(color: AppColors.success, fontSize: 11, fontWeight: FontWeight.bold)),
                                ),
                                const SizedBox(width: 8),
                                IconButton(
                                  icon: const Icon(Icons.delete_outline, size: 20, color: AppColors.error),
                                  onPressed: () => _deletePincode(item.pincode),
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
