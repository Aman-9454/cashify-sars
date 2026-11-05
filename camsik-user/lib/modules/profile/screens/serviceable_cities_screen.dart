import 'package:flutter/material.dart';
import '../../../core/services/api_service.dart';

class ServiceableCitiesScreen extends StatefulWidget {
  const ServiceableCitiesScreen({super.key});

  @override
  State<ServiceableCitiesScreen> createState() => _ServiceableCitiesScreenState();
}

class _ServiceableCitiesScreenState extends State<ServiceableCitiesScreen> {
  final TextEditingController _pincodeController = TextEditingController();
  List<Map<String, dynamic>> _cities = [];
  bool _isLoadingCities = true;
  bool _isChecking = false;
  String? _pincodeResult;
  bool _isServiceable = false;

  @override
  void initState() {
    super.initState();
    _loadCities();
  }

  @override
  void dispose() {
    _pincodeController.dispose();
    super.dispose();
  }

  Future<void> _loadCities() async {
    try {
      final cities = await ApiService.fetchCities();
      if (mounted) {
        setState(() {
          _cities = cities.isNotEmpty
              ? cities
              : const [
                  {'id': 'mumbai', 'name': 'Mumbai', 'serviceable': true},
                  {'id': 'delhi', 'name': 'Delhi NCR', 'serviceable': true},
                  {'id': 'bengaluru', 'name': 'Bengaluru', 'serviceable': true},
                  {'id': 'pune', 'name': 'Pune', 'serviceable': true},
                ];
          _isLoadingCities = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _cities = const [
            {'id': 'mumbai', 'name': 'Mumbai', 'serviceable': true},
            {'id': 'delhi', 'name': 'Delhi NCR', 'serviceable': true},
            {'id': 'bengaluru', 'name': 'Bengaluru', 'serviceable': true},
            {'id': 'pune', 'name': 'Pune', 'serviceable': true},
          ];
          _isLoadingCities = false;
        });
      }
    }
  }

  Future<void> _checkPincode() async {
    final query = _pincodeController.text.trim();
    if (query.isEmpty) return;

    setState(() {
      _isChecking = true;
      _pincodeResult = null;
    });

    try {
      final res = await ApiService.checkPincodeServiceability(query);
      if (mounted) {
        setState(() {
          _isServiceable = res['serviceable'] == true;
          _pincodeResult = res['message']?.toString() ??
              (_isServiceable ? 'Pincode $query is serviceable for doorstep pickup!' : 'Currently unserviceable');
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isServiceable = false;
          _pincodeResult = 'Unable to check pincode right now. Please try again.';
        });
      }
    } finally {
      if (mounted) setState(() => _isChecking = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text(
          'Serviceable Cities & Pincodes',
          style: TextStyle(fontWeight: FontWeight.w900, fontSize: 16.5, color: Color(0xFF0F172A)),
        ),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Pincode Search Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFFE2E8F0)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.03),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Check Doorstep Pickup in Your Area',
                    style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: Color(0xFF0F172A)),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Enter your 6-digit postal pincode to check free pickup availability.',
                    style: TextStyle(color: Color(0xFF64748B), fontSize: 12),
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _pincodeController,
                          keyboardType: TextInputType.number,
                          maxLength: 6,
                          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                          decoration: InputDecoration(
                            counterText: '',
                            hintText: 'e.g. 401107 or 110001',
                            prefixIcon: const Icon(Icons.pin_drop_rounded, color: Color(0xFF059669), size: 20),
                            filled: true,
                            fillColor: const Color(0xFFF8FAFC),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
                            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF059669), width: 1.8)),
                          ),
                          onSubmitted: (_) => _checkPincode(),
                        ),
                      ),
                      const SizedBox(width: 10),
                      SizedBox(
                        height: 48,
                        child: ElevatedButton(
                          onPressed: _isChecking ? null : _checkPincode,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF059669),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            elevation: 0,
                          ),
                          child: _isChecking
                              ? const SizedBox(
                                  width: 18,
                                  height: 18,
                                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                )
                              : const Text('Check', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13.5)),
                        ),
                      ),
                    ],
                  ),
                  if (_pincodeResult != null) ...[
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: _isServiceable ? const Color(0xFFECFDF5) : const Color(0xFFFEF2F2),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: _isServiceable ? const Color(0xFF34D399) : const Color(0xFFFCA5A5),
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            _isServiceable ? Icons.check_circle_rounded : Icons.info_outline_rounded,
                            color: _isServiceable ? const Color(0xFF059669) : const Color(0xFFDC2626),
                            size: 18,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              _pincodeResult!,
                              style: TextStyle(
                                color: _isServiceable ? const Color(0xFF065F46) : const Color(0xFF991B1B),
                                fontWeight: FontWeight.w700,
                                fontSize: 12,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Covered Metro Hubs
            const Text(
              'Major Covered Cities & Hubs',
              style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15, color: Color(0xFF0F172A)),
            ),
            const SizedBox(height: 4),
            const Text(
              'Instant doorstep verification and free pickup within 2 hours in these metros:',
              style: TextStyle(color: Color(0xFF64748B), fontSize: 12),
            ),
            const SizedBox(height: 14),

            if (_isLoadingCities)
              const Center(
                child: Padding(
                  padding: EdgeInsets.symmetric(vertical: 30),
                  child: CircularProgressIndicator(color: Color(0xFF059669)),
                ),
              )
            else if (_cities.isEmpty)
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: const Center(
                  child: Text('Service network updating...', style: TextStyle(color: Color(0xFF94A3B8))),
                ),
              )
            else
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: _cities.map((c) {
                  final name = c['name']?.toString() ?? 'City';
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.02),
                          blurRadius: 4,
                          offset: const Offset(0, 1),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.location_on_rounded, size: 16, color: Color(0xFF059669)),
                        const SizedBox(width: 6),
                        Text(
                          name,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF1E293B),
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),

            const SizedBox(height: 28),

            // Service Guarantees
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Column(
                children: [
                  _PerkRow(icon: Icons.electric_bolt_rounded, title: 'Same Day 2-Hour Pickup Window'),
                  SizedBox(height: 10),
                  _PerkRow(icon: Icons.money_off_csred_rounded, title: 'Zero Inspection or Cancellation Fees'),
                  SizedBox(height: 10),
                  _PerkRow(icon: Icons.shield_rounded, title: 'Certified Safe Technician Doorstep Visit'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PerkRow extends StatelessWidget {
  final IconData icon;
  final String title;

  const _PerkRow({required this.icon, required this.title});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18, color: const Color(0xFF059669)),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            title,
            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12.5, color: Color(0xFF334155)),
          ),
        ),
      ],
    );
  }
}
