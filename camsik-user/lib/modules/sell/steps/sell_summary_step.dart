import 'package:flutter/material.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../widgets/camsik_smart_image.dart';
import '../data/models/responses/device_verification_report_model.dart';
// import '../widgets/device_imei_verification_sheet.dart';

class SellSummaryStep extends StatefulWidget {
  final Map<String, dynamic>? selectedModel;
  final String? categoryId;
  final String? categoryName;
  final String selectedStorage;
  final String selectedColor;
  final List<Map<String, dynamic>> selectedLenses;
  final int basePrice;
  final int calculatedPrice;
  final List<Map<String, dynamic>> questions;
  final Map<int, int> selectedAnswers;
  final String? verifiedImei;
  final Function(String? verifiedImei) onProceed;

  const SellSummaryStep({
    super.key,
    required this.selectedModel,
    this.categoryId,
    this.categoryName,
    required this.selectedStorage,
    required this.selectedColor,
    this.selectedLenses = const [],
    required this.basePrice,
    required this.calculatedPrice,
    required this.questions,
    required this.selectedAnswers,
    this.verifiedImei,
    required this.onProceed,
  });

  @override
  State<SellSummaryStep> createState() => _SellSummaryStepState();
}

class _SellSummaryStepState extends State<SellSummaryStep> {
  DeviceVerificationReportModel? _verificationReport;

  @override
  void initState() {
    super.initState();
    if (widget.verifiedImei != null && widget.verifiedImei!.trim().isNotEmpty) {
      _verificationReport = DeviceVerificationReportModel(
        verified: true,
        imei: widget.verifiedImei!,
        modelMatch: true,
        brand: widget.selectedModel?['brand']?.toString() ?? '',
        model: widget.selectedModel?['name']?.toString() ?? '',
        status: 'CLEAN',
        blacklisted: false,
        warrantyStatus: 'Active / Verified',
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final modelName = widget.selectedModel?['name'] as String? ?? 'Selected Device';
    final modelImage = widget.selectedModel?['image'] as String? ?? 'assets/images/categories/dslr.png';
    final priceDiff = widget.calculatedPrice - widget.basePrice;
    final catId = (widget.categoryId ?? widget.selectedModel?['categoryId'] ?? '').toString().toLowerCase();
    final catName = (widget.categoryName ?? '').toString().toLowerCase();
    final modelNameLower = modelName.toLowerCase();
    final isCamera = (catId == 'cat-dslr' ||
            catId == 'cat-video-camera' ||
            catId == 'cat-action-camera' ||
            catId == 'cat-lens') ||
        RegExp(r'camera|dslr|mirrorless|eos|alpha|lumix|nikon|fuji|camcorder|cinema|lens',
                caseSensitive: false)
            .hasMatch(modelName);

    final isMobileOrSmartphone = !isCamera && (
        catId == 'cat-smartphone' ||
        catId == 'cat-mobile' ||
        catId == 'cat-tablet' ||
        catId == 'cat-tablets' ||
        catId == 'cat-ipad' ||
        catId.contains('phone') ||
        catId.contains('mobile') ||
        catId.contains('tablet') ||
        catId.contains('ipad') ||
        catName.contains('phone') ||
        catName.contains('mobile') ||
        catName.contains('tablet') ||
        catName.contains('ipad') ||
        modelNameLower.contains('iphone') ||
        modelNameLower.contains('galaxy') ||
        modelNameLower.contains('pixel') ||
        modelNameLower.contains('ipad') ||
        modelNameLower.contains('tab') ||
        modelNameLower.contains('lenovo tab') ||
        modelNameLower.contains('pro max') ||
        modelNameLower.contains('redmi') ||
        modelNameLower.contains('oneplus') ||
        modelNameLower.contains('xiaomi') ||
        modelNameLower.contains('vivo') ||
        modelNameLower.contains('oppo') ||
        modelNameLower.contains('realme')
    );

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── 1. HERO GUARANTEED PAYOUT & CHOSEN DEVICE CARD ──
          Container(
            width: double.infinity,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0B132B), Color(0xFF1E293B), Color(0xFF0F172A)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white.withValues(alpha: 0.15), width: 1.2),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF059669).withValues(alpha: 0.2),
                  blurRadius: 18,
                  offset: const Offset(0, 6),
                ),
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.18),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Column(
              children: [
                // Payout Header Section
                Padding(
                  padding: const EdgeInsets.fromLTRB(18, 18, 18, 14),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: const Color(0xFF059669).withValues(alpha: 0.22),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: const Color(0xFF34D399).withValues(alpha: 0.4), width: 0.8),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.bolt_rounded, size: 12, color: Color(0xFF34D399)),
                                SizedBox(width: 3),
                                Text(
                                  'GUARANTEED INSTANT PAYOUT',
                                  style: TextStyle(
                                    color: Color(0xFF34D399),
                                    fontSize: 9.5,
                                    fontWeight: FontWeight.w900,
                                    letterSpacing: 0.4,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.08),
                              borderRadius: BorderRadius.circular(5),
                              border: Border.all(color: Colors.white.withValues(alpha: 0.15), width: 0.8),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.lock_clock_rounded, size: 11, color: Color(0xFF38BDF8)),
                                SizedBox(width: 3),
                                Text(
                                  '7-Day Lock',
                                  style: TextStyle(
                                    color: Color(0xFFE0F2FE),
                                    fontSize: 9.5,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        formatCurrency(widget.calculatedPrice),
                        style: const TextStyle(
                          color: Color(0xFF34D399),
                          fontWeight: FontWeight.w900,
                          fontSize: 34,
                          letterSpacing: -0.8,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.check_circle_rounded, size: 13, color: Color(0xFF34D399)),
                          const SizedBox(width: 4),
                          Text(
                            priceDiff >= 0
                                ? 'Full Valuation (${priceDiff > 0 ? "+${formatCurrency(priceDiff)} Bonus" : "Zero Deductions"})'
                                : 'Adjusted Payout (${formatCurrency(priceDiff)})',
                            style: TextStyle(
                              color: priceDiff >= 0 ? const Color(0xFFCBD5E1) : const Color(0xFFFCA5A5),
                              fontSize: 11.5,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                // Connected Chosen Device Bar
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.black.withValues(alpha: 0.25),
                    borderRadius: const BorderRadius.vertical(bottom: Radius.circular(20)),
                    border: Border(top: BorderSide(color: Colors.white.withValues(alpha: 0.1))),
                  ),
                  child: Row(
                    children: [
                      // Device Image in crisp white container
                      Container(
                        width: 52,
                        height: 52,
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.2),
                              blurRadius: 4,
                              offset: const Offset(0, 1),
                            ),
                          ],
                        ),
                        child: CamsikSmartImage(
                          image: modelImage,
                          fit: BoxFit.contain,
                          iconSize: 26,
                          iconColor: const Color(0xFF94A3B8),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF38BDF8).withValues(alpha: 0.2),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: const Text(
                                    'CHOSEN DEVICE',
                                    style: TextStyle(
                                      color: Color(0xFF38BDF8),
                                      fontSize: 8.5,
                                      fontWeight: FontWeight.w900,
                                      letterSpacing: 0.3,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 3),
                            Text(
                              modelName,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.w800,
                                fontSize: 13.5,
                              ),
                            ),
                            const SizedBox(height: 1),
                            Text(
                              '${widget.selectedStorage} • ${widget.selectedColor}',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                color: Color(0xFF94A3B8),
                                fontSize: 11,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          'Base: ${formatCurrency(widget.basePrice)}',
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 10.5,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // ── 2. INSTANT IMEI / SERIAL VERIFICATION CARD (COMMENTED OUT AS REQUESTED) ──
          /*
          if (isMobileOrSmartphone) ...[
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: _verificationReport != null ? const Color(0xFFF0FDF4) : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: _verificationReport != null ? const Color(0xFF86EFAC) : const Color(0xFFE2E8F0),
                  width: 1.2,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.02),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(9),
                    decoration: BoxDecoration(
                      color: (_verificationReport != null ? const Color(0xFF16A34A) : const Color(0xFF059669))
                          .withValues(alpha: 0.12),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      _verificationReport != null ? Icons.verified_rounded : Icons.phonelink_setup_rounded,
                      color: _verificationReport != null ? const Color(0xFF16A34A) : const Color(0xFF059669),
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _verificationReport != null
                              ? 'Device IMEI Verified'
                              : 'Verify Device Authenticity',
                          style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 12.5, color: Color(0xFF0F172A)),
                        ),
                        const SizedBox(height: 1),
                        Text(
                          _verificationReport != null
                              ? 'Serial/IMEI: ${_verificationReport!.imei} · Status: Verified'
                              : 'Validate IMEI to lock in expedited doorstep handover',
                          style: TextStyle(
                            fontSize: 10.5,
                            color: _verificationReport != null ? const Color(0xFF15803D) : const Color(0xFF64748B),
                          ),
                        ),
                      ],
                    ),
                  ),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _verificationReport != null ? const Color(0xFFDCFCE7) : const Color(0xFF059669),
                      foregroundColor: _verificationReport != null ? const Color(0xFF15803D) : Colors.white,
                      elevation: _verificationReport != null ? 0 : 2,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      minimumSize: const Size(60, 30),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    onPressed: () async {
                      final report = await DeviceImeiVerificationSheet.show(
                        context,
                        selectedModel: widget.selectedModel,
                        selectedVariant: widget.selectedStorage,
                      );
                      if (report != null && mounted) {
                        setState(() => _verificationReport = report);
                      }
                    },
                    child: Text(
                      _verificationReport != null ? 'Re-check' : 'Verify',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900),
                    ),
                  ),
                ],
              ),
            ),
          ],
          */

          const SizedBox(height: 16),

          // ── 3. VALUATION BREAKDOWN DIGITAL STATEMENT ──
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(Icons.receipt_long_rounded, size: 16, color: Color(0xFF059669)),
                  SizedBox(width: 6),
                  Text(
                    'Itemized Valuation Statement',
                    style: TextStyle(
                      fontWeight: FontWeight.w800,
                      fontSize: 14,
                      color: Color(0xFF0F172A),
                      letterSpacing: -0.2,
                    ),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(5),
                ),
                child: const Text(
                  'Transparent Pricing',
                  style: TextStyle(
                    fontSize: 9.5,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF64748B),
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 10),

          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: const Color(0xFFE2E8F0), width: 1.2),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.02),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              children: [
                // Base Market Value
                Padding(
                  padding: const EdgeInsets.fromLTRB(14, 14, 14, 10),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Base Market Value',
                        style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: Color(0xFF0F172A)),
                      ),
                      Text(
                        formatCurrency(widget.basePrice),
                        style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                      ),
                    ],
                  ),
                ),

                const Divider(height: 1, color: Color(0xFFF1F5F9)),

                // Camera Lenses Bundle
                if (widget.selectedLenses.isNotEmpty) ...[
                  Padding(
                    padding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Camera Lenses Bundle (${widget.selectedLenses.length})',
                              style: const TextStyle(
                                fontSize: 12.5,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF0F172A),
                              ),
                            ),
                            const Text(
                              '+ ₹ * * * *',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 1,
                                color: Color(0xFF059669),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        ...widget.selectedLenses.map((l) => Padding(
                              padding: const EdgeInsets.symmetric(vertical: 2),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      '• ${l['name']}',
                                      style: const TextStyle(
                                        fontSize: 11,
                                        color: Color(0xFF64748B),
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  const Text(
                                    '+ ₹ * * * *',
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w800,
                                      letterSpacing: 1,
                                      color: Color(0xFF059669),
                                    ),
                                  ),
                                ],
                              ),
                            )),
                        const SizedBox(height: 6),
                        const Row(
                          children: [
                            Text('⭐', style: TextStyle(fontSize: 11)),
                            SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                'You will get the best price after review from our team',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  color: Color(0xFF047857),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const Divider(height: 1, color: Color(0xFFF1F5F9)),
                ],

                // Diagnostic Adjustments
                Padding(
                  padding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
                  child: Column(
                    children: List.generate(widget.questions.length, (qIdx) {
                      final optIdx = widget.selectedAnswers[qIdx] ?? 0;
                      final options = widget.questions[qIdx]['options'] as List?;
                      if (options == null || optIdx >= options.length) return const SizedBox.shrink();
                      final opt = options[optIdx];
                      final label = opt['label'] as String? ?? '';
                      final adj = (opt['adj'] as num?)?.toInt() ?? 0;

                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 4.5),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Row(
                                children: [
                                  Icon(
                                    adj >= 0 ? Icons.check_circle_outline_rounded : Icons.remove_circle_outline_rounded,
                                    size: 13,
                                    color: adj > 0
                                        ? const Color(0xFF059669)
                                        : adj < 0
                                            ? const Color(0xFFEF4444)
                                            : const Color(0xFF94A3B8),
                                  ),
                                  const SizedBox(width: 6),
                                  Expanded(
                                    child: Text(
                                      label,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(fontSize: 11.5, color: Color(0xFF475569), fontWeight: FontWeight.w500),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            if (adj == 0)
                              const Text(
                                '* * *',
                                style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: Color(0xFF64748B), letterSpacing: 1.0),
                              )
                            else if (adj > 0)
                              const Text(
                                '+ * * *',
                                style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900, color: Color(0xFF059669), letterSpacing: 1.0),
                              )
                            else
                              const Text(
                                '- * * *',
                                style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w900, color: Color(0xFFDC2626), letterSpacing: 1.0),
                              ),
                          ],
                        ),
                      );
                    }),
                  ),
                ),

                // Final Handover Cash Banner
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFECFDF5),
                    borderRadius: const BorderRadius.vertical(bottom: Radius.circular(18)),
                    border: const Border(top: BorderSide(color: Color(0xFFA7F3D0), width: 0.8)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Final Handover Cash',
                            style: TextStyle(
                              fontSize: 13.5,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFF047857),
                            ),
                          ),
                          Text(
                            'Zero deduction guarantee at doorstep',
                            style: TextStyle(fontSize: 10, color: Color(0xFF059669), fontWeight: FontWeight.w500),
                          ),
                        ],
                      ),
                      Text(
                        formatCurrency(widget.calculatedPrice),
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF047857),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 18),

          // ── 4. BUYBACK GUARANTEES ──
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _TrustBadge(icon: Icons.shield_rounded, label: 'DoD Data Wipe'),
                _TrustBadge(icon: Icons.electric_bolt_rounded, label: 'Instant Transfer'),
                _TrustBadge(icon: Icons.local_shipping_rounded, label: 'Free Doorstep'),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // ── 5. PROCEED BUTTON ──
          Container(
            width: double.infinity,
            height: 52,
            decoration: BoxDecoration(
              gradient: (isMobileOrSmartphone && _verificationReport == null)
                  ? const LinearGradient(
                      colors: [Color(0xFFD97706), Color(0xFFF59E0B)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    )
                  : const LinearGradient(
                      colors: [Color(0xFF059669), Color(0xFF10B981)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: (isMobileOrSmartphone && _verificationReport == null
                          ? const Color(0xFFD97706)
                          : const Color(0xFF059669))
                      .withValues(alpha: 0.35),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () async {
                  // IMEI verification commented out:
                  /*
                  if (isMobileOrSmartphone && _verificationReport == null) {
                    final messenger = ScaffoldMessenger.of(context);
                    messenger.showSnackBar(
                      const SnackBar(
                        content: Text(
                          '⚠️ Phone IMEI verification is required before scheduling pickup. Dial *#06# to find your 15-digit IMEI.',
                        ),
                        backgroundColor: Color(0xFFD97706),
                        duration: Duration(seconds: 4),
                      ),
                    );
                    final report = await DeviceImeiVerificationSheet.show(
                      context,
                      selectedModel: widget.selectedModel,
                      selectedVariant: widget.selectedStorage,
                    );
                    if (report != null && mounted) {
                      setState(() => _verificationReport = report);
                      messenger.showSnackBar(
                        SnackBar(
                          content: Text(
                            '✅ IMEI ${report.imei} verified successfully! You can now schedule pickup.',
                          ),
                          backgroundColor: const Color(0xFF059669),
                        ),
                      );
                    }
                    return;
                  }
                  */
                  widget.onProceed(_verificationReport?.imei);
                },
                borderRadius: BorderRadius.circular(16),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.verified_user_rounded,
                      color: Colors.white,
                      size: 19,
                    ),
                    SizedBox(width: 8),
                    Text(
                      'Schedule Doorstep Handover',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 14.5,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.2,
                      ),
                    ),
                    SizedBox(width: 8),
                    Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 17),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _TrustBadge extends StatelessWidget {
  final IconData icon;
  final String label;

  const _TrustBadge({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 13, color: const Color(0xFF059669)),
        const SizedBox(width: 4),
        Text(
          label,
          style: const TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w700,
            color: Color(0xFF475569),
          ),
        ),
      ],
    );
  }
}
