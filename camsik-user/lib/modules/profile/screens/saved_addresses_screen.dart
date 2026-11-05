import 'package:flutter/material.dart';
import '../../../core/services/api_service.dart';
import '../../../core/services/session_service.dart';
import '../../../models/user_address.dart';
import '../../../models/user_profile.dart';
import 'add_edit_address_screen.dart';

class SavedAddressesScreen extends StatefulWidget {
  final UserProfile profile;
  final ValueChanged<String> onAddressSelected;

  const SavedAddressesScreen({
    super.key,
    required this.profile,
    required this.onAddressSelected,
  });

  @override
  State<SavedAddressesScreen> createState() => _SavedAddressesScreenState();
}

class _SavedAddressesScreenState extends State<SavedAddressesScreen> {
  List<UserAddress> _addresses = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadAddresses();
  }

  void _loadAddresses() {
    final rawList = SessionService.getSavedAddresses(fallbackAddress: widget.profile.address);
    setState(() {
      _addresses = rawList.map((m) => UserAddress.fromJson(m)).toList();
      _isLoading = false;
    });
  }

  Future<void> _persistAddresses() async {
    await SessionService.saveAddressesList(_addresses.map((a) => a.toJson()).toList());
  }

  Future<void> _setDefaultAddress(UserAddress selected) async {
    final updatedList = _addresses.map((a) {
      return a.copyWith(isDefault: a.id == selected.id);
    }).toList();

    setState(() {
      _addresses = updatedList;
    });

    await _persistAddresses();

    final formatted = selected.formattedAddress;
    widget.onAddressSelected(formatted);

    // Sync to backend
    await ApiService.updateUserProfile(
      phone: widget.profile.phone,
      address: formatted,
    );

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Selected "${selected.tag}" as default doorstep address'),
          backgroundColor: const Color(0xFF059669),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  Future<void> _deleteAddress(UserAddress address) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Delete Address?', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        content: Text('Are you sure you want to remove this ${address.tag} address?', style: const TextStyle(fontSize: 13, color: Color(0xFF64748B))),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel', style: TextStyle(color: Color(0xFF64748B))),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFEF4444),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Delete', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    final updated = _addresses.where((a) => a.id != address.id).toList();

    // If deleted address was default and other addresses exist, set first as default
    if (address.isDefault && updated.isNotEmpty) {
      updated[0] = updated[0].copyWith(isDefault: true);
      widget.onAddressSelected(updated[0].formattedAddress);
      await ApiService.updateUserProfile(
        phone: widget.profile.phone,
        address: updated[0].formattedAddress,
      );
    } else if (updated.isEmpty) {
      widget.onAddressSelected('');
      await ApiService.updateUserProfile(
        phone: widget.profile.phone,
        address: '',
      );
    }

    setState(() {
      _addresses = updated;
    });
    await _persistAddresses();
  }

  Future<void> _openAddAddress() async {
    final newAddress = await Navigator.push<UserAddress>(
      context,
      MaterialPageRoute(
        builder: (ctx) => AddEditAddressScreen(
          defaultName: widget.profile.name,
          defaultPhone: widget.profile.phone,
        ),
      ),
    );

    if (newAddress != null) {
      List<UserAddress> updatedList;
      if (newAddress.isDefault || _addresses.isEmpty) {
        updatedList = _addresses.map((a) => a.copyWith(isDefault: false)).toList();
        updatedList.insert(0, newAddress.copyWith(isDefault: true));
        widget.onAddressSelected(newAddress.formattedAddress);
        await ApiService.updateUserProfile(
          phone: widget.profile.phone,
          address: newAddress.formattedAddress,
        );
      } else {
        updatedList = [..._addresses, newAddress];
      }

      setState(() {
        _addresses = updatedList;
      });
      await _persistAddresses();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Address added successfully!'),
            backgroundColor: Color(0xFF059669),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  Future<void> _openEditAddress(UserAddress address) async {
    final edited = await Navigator.push<UserAddress>(
      context,
      MaterialPageRoute(
        builder: (ctx) => AddEditAddressScreen(
          initialAddress: address,
          defaultName: widget.profile.name,
          defaultPhone: widget.profile.phone,
        ),
      ),
    );

    if (edited != null) {
      final updatedList = _addresses.map((a) {
        if (a.id == edited.id) return edited;
        if (edited.isDefault) return a.copyWith(isDefault: false);
        return a;
      }).toList();

      setState(() {
        _addresses = updatedList;
      });
      await _persistAddresses();

      if (edited.isDefault) {
        widget.onAddressSelected(edited.formattedAddress);
        await ApiService.updateUserProfile(
          phone: widget.profile.phone,
          address: edited.formattedAddress,
        );
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Address updated successfully!'),
            backgroundColor: Color(0xFF059669),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        foregroundColor: Colors.white,
        elevation: 0,
        title: const Text(
          'Saved Addresses',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator(color: Color(0xFF059669)))
                  : _addresses.isEmpty
                      ? _buildEmptyState()
                      : ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: _addresses.length,
                          itemBuilder: (ctx, idx) => _buildAddressCard(_addresses[idx]),
                        ),
            ),

            // Bottom Add Button
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 10,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF059669),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    elevation: 0,
                  ),
                  onPressed: _openAddAddress,
                  icon: const Icon(Icons.add_location_alt_outlined, size: 20),
                  label: const Text(
                    'Add New Address',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                ),
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
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: const Color(0xFF059669).withValues(alpha: 0.08),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.location_off_outlined,
                size: 56,
                color: Color(0xFF059669),
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'No Saved Addresses Yet',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Add your home or office address for hassle-free doorstep inspection, instant sell payouts and camera delivery.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: Color(0xFF64748B), height: 1.4),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAddressCard(UserAddress addr) {
    final isSelected = addr.isDefault;

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isSelected ? const Color(0xFF059669) : const Color(0xFFE2E8F0),
          width: isSelected ? 1.8 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isSelected ? 0.06 : 0.02),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: InkWell(
        onTap: () => _setDefaultAddress(addr),
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: addr.tag == 'Home'
                          ? const Color(0xFFDCFCE7)
                          : addr.tag == 'Office'
                              ? const Color(0xFFEDE9FE)
                              : const Color(0xFFFEF3C7),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          addr.tag == 'Home'
                              ? Icons.home
                              : addr.tag == 'Office'
                                  ? Icons.business
                                  : Icons.location_on,
                          size: 13,
                          color: addr.tag == 'Home'
                              ? const Color(0xFF059669)
                              : addr.tag == 'Office'
                                  ? const Color(0xFF7C3AED)
                                  : const Color(0xFFD97706),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          addr.tag,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: addr.tag == 'Home'
                                ? const Color(0xFF059669)
                                : addr.tag == 'Office'
                                    ? const Color(0xFF7C3AED)
                                    : const Color(0xFFD97706),
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (isSelected) ...[
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFF059669),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text(
                        'DEFAULT',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w900,
                          color: Colors.white,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                  ],
                  const Spacer(),
                  Container(
                    width: 22,
                    height: 22,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isSelected ? const Color(0xFF059669) : Colors.transparent,
                      border: Border.all(
                        color: isSelected ? const Color(0xFF059669) : const Color(0xFFCBD5E1),
                        width: 2,
                      ),
                    ),
                    child: isSelected
                        ? const Center(
                            child: Icon(Icons.check, size: 14, color: Colors.white),
                          )
                        : null,
                  ),
                ],
              ),
              const SizedBox(height: 10),
              if (addr.contactName.isNotEmpty) ...[
                Row(
                  children: [
                    Text(
                      addr.contactName,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Color(0xFF0F172A)),
                    ),
                    if (addr.contactPhone.isNotEmpty) ...[
                      const SizedBox(width: 8),
                      Text(
                        '• ${addr.contactPhone}',
                        style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), fontWeight: FontWeight.w500),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 6),
              ],
              Text(
                addr.formattedAddress,
                style: const TextStyle(fontSize: 13, color: Color(0xFF334155), height: 1.4),
              ),
              const SizedBox(height: 12),
              const Divider(height: 1),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton.icon(
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      minimumSize: const Size(50, 28),
                    ),
                    icon: const Icon(Icons.edit_outlined, size: 14, color: Color(0xFF3B82F6)),
                    label: const Text('Edit', style: TextStyle(fontSize: 12, color: Color(0xFF3B82F6), fontWeight: FontWeight.bold)),
                    onPressed: () => _openEditAddress(addr),
                  ),
                  const SizedBox(width: 8),
                  TextButton.icon(
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      minimumSize: const Size(50, 28),
                    ),
                    icon: const Icon(Icons.delete_outline, size: 14, color: Color(0xFFEF4444)),
                    label: const Text('Delete', style: TextStyle(fontSize: 12, color: Color(0xFFEF4444), fontWeight: FontWeight.bold)),
                    onPressed: () => _deleteAddress(addr),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
