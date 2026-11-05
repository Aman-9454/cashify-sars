import 'package:flutter/material.dart';
import '../../../../core/utils/currency_formatter.dart';
import '../data/models/requests/validate_imei_request.dart';
import '../data/models/responses/device_verification_report_model.dart';
import '../data/repositories/sell_repository.dart';

class DeviceImeiVerificationSheet extends StatefulWidget {
  final Map<String, dynamic>? selectedModel;
  final String? selectedBrand;
  final String selectedVariant;
  final SellRepository sellRepository;
  final ValueChanged<DeviceVerificationReportModel>? onVerified;

  const DeviceImeiVerificationSheet({
    super.key,
    required this.selectedModel,
    this.selectedBrand,
    required this.selectedVariant,
    required this.sellRepository,
    this.onVerified,
  });

  static Future<DeviceVerificationReportModel?> show(
    BuildContext context, {
    required Map<String, dynamic>? selectedModel,
    String? selectedBrand,
    required String selectedVariant,
    SellRepository? sellRepository,
    ValueChanged<DeviceVerificationReportModel>? onVerified,
  }) {
    return showModalBottomSheet<DeviceVerificationReportModel>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => DeviceImeiVerificationSheet(
        selectedModel: selectedModel,
        selectedBrand: selectedBrand,
        selectedVariant: selectedVariant,
        sellRepository: sellRepository ?? SellRepositoryImpl(),
        onVerified: onVerified,
      ),
    );
  }

  @override
  State<DeviceImeiVerificationSheet> createState() => _DeviceImeiVerificationSheetState();
}

class _DeviceImeiVerificationSheetState extends State<DeviceImeiVerificationSheet> {
  final TextEditingController _imeiController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isVerifying = false;
  DeviceVerificationReportModel? _report;
  String? _errorMessage;

  @override
  void dispose() {
    _imeiController.dispose();
    super.dispose();
  }

  Future<void> _handleVerify() async {
    if (!_formKey.currentState!.validate()) return;

    final imei = _imeiController.text.trim();
    final brand = (widget.selectedBrand != null && widget.selectedBrand!.trim().isNotEmpty)
        ? widget.selectedBrand!
        : (widget.selectedModel?['brand']?.toString() ??
            widget.selectedModel?['brandName']?.toString() ??
            widget.selectedModel?['brandId']?.toString().replaceAll('brand-', '') ??
            'Device');
    final model = widget.selectedModel?['name']?.toString() ?? 'Model';

    setState(() {
      _isVerifying = true;
      _errorMessage = null;
    });

    try {
      final res = await widget.sellRepository.validateImei(
        ValidateImeiRequest(
          imei: imei,
          selectedBrand: brand,
          selectedModel: model,
          selectedVariant: widget.selectedVariant,
        ),
      );

      if (res.data != null && res.data['success'] == true) {
        final rep = DeviceVerificationReportModel.fromJson(
          res.data as Map<String, dynamic>,
        );

        if (!rep.verified) {
          final errorMsg = rep.mismatchReason ??
              (rep.blacklisted
                  ? 'Device is flagged in national blacklist/stolen registry.'
                  : 'Device verification failed: Invalid IMEI or specification mismatch.');
          if (mounted) {
            setState(() {
              _isVerifying = false;
              _errorMessage = errorMsg;
            });
          }
          return;
        }

        if (mounted) {
          setState(() {
            _report = rep;
            _isVerifying = false;
          });
          widget.onVerified?.call(rep);
        }
        return;
      }

      throw Exception(res.data?['message'] ?? 'Device verification failed');
    } catch (e) {
      if (mounted) {
        setState(() {
          _isVerifying = false;
          _errorMessage = e.toString().replaceAll('Exception: ', '');
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.85,
      ),
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
                  child: const Icon(Icons.verified_outlined, color: Color(0xFF059669), size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Instant IMEI & Device Verification',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                      ),
                      Text(
                        'Verify authenticity & get verified bonus payout',
                        style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),

            if (_report == null) ...[
              Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Dial *#06# on your device to find your 15-digit IMEI number.',
                      style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _imeiController,
                      keyboardType: TextInputType.number,
                      maxLength: 15,
                      decoration: InputDecoration(
                        labelText: 'Device IMEI (15 Digits)',
                        hintText: 'e.g. 356987102938475',
                        labelStyle: const TextStyle(fontSize: 13, color: Color(0xFF64748B)),
                        prefixIcon: const Icon(Icons.phone_android, size: 20, color: Color(0xFF059669)),
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
                        if (val == null || val.trim().length != 15) {
                          return 'Please enter a valid 15-digit IMEI';
                        }
                        return null;
                      },
                    ),
                    if (_errorMessage != null) ...[
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF2F2),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: const Color(0xFFFCA5A5)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.error_outline, size: 16, color: Color(0xFFDC2626)),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _errorMessage!,
                                style: const TextStyle(fontSize: 11, color: Color(0xFFDC2626)),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                    const SizedBox(height: 18),
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF059669),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: _isVerifying ? null : _handleVerify,
                        child: _isVerifying
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                              )
                            : const Text('Verify Device Authenticity', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      ),
                    ),
                  ],
                ),
              ),
            ] else ...[
              // Verification Report View
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFFF0FDF4),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF86EFAC)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.check_circle, color: Color(0xFF16A34A), size: 24),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Device Authenticity Verified!',
                                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF166534)),
                              ),
                              Text(
                                'Diagnostic Report: ${_report!.status}',
                                style: const TextStyle(fontSize: 11, color: Color(0xFF15803D), fontWeight: FontWeight.w600),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const Divider(height: 20, color: Color(0xFFBBF7D0)),
                    _buildReportRow('Device IMEI', _report!.imei),
                    const SizedBox(height: 6),
                    _buildReportRow('Model Match', _report!.modelMatch ? 'Confirmed' : 'Unmatched'),
                    const SizedBox(height: 6),
                    _buildReportRow('Warranty Status', _report!.warrantyStatus),
                    const SizedBox(height: 6),
                    _buildReportRow('Blacklist Status', _report!.blacklisted ? 'Flagged' : 'Clean & Verified'),
                    if (_report!.estimatedValuation != null) ...[
                      const SizedBox(height: 6),
                      _buildReportRow('AI Valuation', formatCurrency(_report!.estimatedValuation!.toInt())),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0F172A),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () => Navigator.pop(context, _report),
                  child: const Text('Proceed with Verified Device', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildReportRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF475569))),
        Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
      ],
    );
  }
}
