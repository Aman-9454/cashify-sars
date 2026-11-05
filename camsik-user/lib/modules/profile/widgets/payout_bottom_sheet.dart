import 'package:flutter/material.dart';

class PayoutBottomSheet extends StatefulWidget {
  final String currentUpiId;
  final String currentBankAccount;
  final void Function(String upiId, String bankAccount) onSave;

  const PayoutBottomSheet({
    super.key,
    required this.currentUpiId,
    required this.currentBankAccount,
    required this.onSave,
  });

  static Future<void> show(
    BuildContext context, {
    required String currentUpiId,
    required String currentBankAccount,
    required void Function(String upiId, String bankAccount) onSave,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => PayoutBottomSheet(
        currentUpiId: currentUpiId,
        currentBankAccount: currentBankAccount,
        onSave: onSave,
      ),
    );
  }

  @override
  State<PayoutBottomSheet> createState() => _PayoutBottomSheetState();
}

class _PayoutBottomSheetState extends State<PayoutBottomSheet> {
  late final TextEditingController _upiController;
  late final TextEditingController _bankAccountController;
  final _formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    _upiController = TextEditingController(text: widget.currentUpiId);
    _bankAccountController = TextEditingController(text: widget.currentBankAccount);
  }

  @override
  void dispose() {
    _upiController.dispose();
    _bankAccountController.dispose();
    super.dispose();
  }

  void _handleSave() {
    if (!_formKey.currentState!.validate()) return;

    final upi = _upiController.text.trim();
    final bank = _bankAccountController.text.trim();

    widget.onSave(upi, bank);
    Navigator.pop(context);

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Payout details updated successfully!'),
        backgroundColor: Color(0xFF059669),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.only(
        top: 20,
        left: 20,
        right: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: const Color(0xFFE2E8F0),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF059669).withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.account_balance_wallet, color: Color(0xFF059669), size: 22),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Payout Settings',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                        ),
                        Text(
                          'Instant spot payment credited right at device handover',
                          style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              TextFormField(
                controller: _upiController,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(
                  labelText: 'Primary UPI ID (Instant Payout)',
                  hintText: 'e.g. yourname@okhdfcbank or 9876543210@paytm',
                  labelStyle: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                  prefixIcon: const Icon(Icons.qr_code_2, size: 20, color: Color(0xFF059669)),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFF059669), width: 1.5),
                  ),
                ),
                validator: (val) {
                  if (val != null && val.trim().isNotEmpty && !val.contains('@')) {
                    return 'Please enter a valid UPI ID (e.g. mobile@paytm)';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: _bankAccountController,
                decoration: InputDecoration(
                  labelText: 'Bank Account & IFSC (Optional Backup)',
                  hintText: 'e.g. 5010023456789 (HDFC0001234)',
                  labelStyle: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                  prefixIcon: const Icon(Icons.account_balance_outlined, size: 20, color: Color(0xFF059669)),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFF059669), width: 1.5),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.shield_outlined, size: 16, color: Color(0xFF059669)),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        '100% Secure. Payments are initiated via verified banking gateways after technician verifies your device.',
                        style: TextStyle(fontSize: 10, color: Color(0xFF64748B)),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF059669),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 1,
                  ),
                  onPressed: _handleSave,
                  child: const Text('Save Payout Method', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
