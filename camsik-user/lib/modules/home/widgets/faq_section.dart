import 'package:flutter/material.dart';
import '../../../core/constants/app_constants.dart';
import '../../profile/widgets/customer_support_sheet.dart';

class CamsikFaqSectionWidget extends StatefulWidget {
  const CamsikFaqSectionWidget({super.key});

  @override
  State<CamsikFaqSectionWidget> createState() => _CamsikFaqSectionWidgetState();
}

class _CamsikFaqSectionWidgetState extends State<CamsikFaqSectionWidget> {
  String _selectedCategory = 'All Questions';
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  final List<String> _categories = const [
    'All Questions',
    'Selling & Valuation',
    'Buying Refurbished',
    'Exchange & Upgrade',
    'Doorstep & Privacy',
  ];

  final List<Map<String, String>> _allFaqs = [
    {
      'id': 'faq-1',
      'category': 'Selling & Valuation',
      'badge': 'AI Valuation Engine',
      'q': 'How is the resale price of my phone, laptop, or camera calculated on Camsik?',
      'a': 'Our proprietary pricing algorithm analyzes live secondary market demand across India, processor/sensor generation, physical cosmetics, battery cycle health, display condition (OLED burn-in, scratches), camera sensor health, and included original accessories to calculate the highest guaranteed payout.',
    },
    {
      'id': 'faq-2',
      'category': 'Selling & Valuation',
      'badge': 'KYC & Paperwork',
      'q': 'Do I need the original box and bill to sell my device on Camsik?',
      'a': 'No! An original bill and retail packaging are not mandatory. Having them adds a small value bonus, but you can sell your smartphone, MacBook, tablet, or camera with just a valid government photo ID (Aadhaar Card, Driving License, or Passport) for legal KYC compliance.',
    },
    {
      'id': 'faq-3',
      'category': 'Buying Refurbished',
      'badge': '45-Point Inspection',
      'q': 'What quality checks do certified refurbished devices go through?',
      'a': 'Every device undergoes a 45-point hardware inspection conducted by certified diagnostic technicians. We test touchscreen responsiveness, battery health (guaranteed 85%+), motherboard thermals, camera optics, biometric sensors (Face ID/Touch ID/Shutter), and speaker audio clarity. Defective units are rejected.',
    },
    {
      'id': 'faq-4',
      'category': 'Buying Refurbished',
      'badge': 'Warranty & Returns',
      'q': 'What warranty and return policy do I get when buying refurbished tech?',
      'a': 'All certified refurbished devices purchased from Camsik come with a 6 to 12 months comprehensive warranty covering manufacturing and hardware defects, along with a 7-day hassle-free replacement guarantee if the device fails to meet expectations.',
    },
    {
      'id': 'faq-5',
      'category': 'Exchange & Upgrade',
      'badge': '1-Step Doorstep Swap',
      'q': 'How does the 1-step device exchange process work?',
      'a': 'Select the upgraded device you want and enter the details of your old phone, laptop, or camera. We add an exclusive exchange bonus (up to $kRupee 5,000) directly to your trade-in credit. Our specialist arrives at your doorstep with your upgraded device, inspects your old gadget, and you pay only the remaining balance on the spot.',
    },
    {
      'id': 'faq-6',
      'category': 'Exchange & Upgrade',
      'badge': 'Cashback Balance',
      'q': 'What happens if my old gadget is worth more than the device I want to buy?',
      'a': 'If your trade-in valuation exceeds the cost of your selected upgrade, Camsik pays YOU the remaining balance! The technician immediately transfers the surplus cash to your UPI or bank account right at your doorstep.',
    },
    {
      'id': 'faq-7',
      'category': 'Doorstep & Privacy',
      'badge': 'DoD 5220.22-M Wipe',
      'q': 'How is my private data and photos protected before device resale?',
      'a': 'Data security is our highest priority. Before any device leaves your hands, our technician performs a certified DoD 5220.22-M military-grade data sanitization wiping all internal SSDs, storage buffers, and user accounts. You receive a digitally signed legal bill of sale and liability indemnity certificate.',
    },
    {
      'id': 'faq-8',
      'category': 'Doorstep & Privacy',
      'badge': '100% Free Doorstep',
      'q': 'Are there any pickup or cancellation fees if I decline the doorstep quote?',
      'a': 'Zero hidden fees and zero travel charges! Doorstep evaluation is 100% free across 200+ cities in India. If the final on-site quote does not meet your expectations for any reason, you can decline with zero penalty.',
    },
    {
      'id': 'faq-9',
      'category': 'Selling & Valuation',
      'badge': '7-Day Price Lock',
      'q': 'How long is my online price quote valid?',
      'a': 'Once you generate a quote on Camsik, your price is locked for 7 days. You have complete flexibility to schedule your free doorstep pickup at any convenient slot within that period without worrying about market price fluctuations.',
    },
    {
      'id': 'faq-10',
      'category': 'Doorstep & Privacy',
      'badge': 'Instant Spot Transfer',
      'q': 'When and how will I receive payment for my device?',
      'a': 'Payment is initiated immediately before the technician packs the equipment. You can choose Instant UPI (Google Pay, PhonePe, Paytm) or direct IMPS bank transfer. The technician waits until you receive the bank confirmation SMS.',
    },
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  int _getCategoryCount(String category) {
    if (category == 'All Questions') return _allFaqs.length;
    return _allFaqs.where((f) => f['category'] == category).length;
  }

  IconData _getCategoryIcon(String category) {
    switch (category) {
      case 'Selling & Valuation':
        return Icons.currency_rupee_rounded;
      case 'Buying Refurbished':
        return Icons.verified_rounded;
      case 'Exchange & Upgrade':
        return Icons.swap_horiz_rounded;
      case 'Doorstep & Privacy':
        return Icons.shield_rounded;
      default:
        return Icons.all_inclusive_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    final query = _searchQuery.trim().toLowerCase();

    final filtered = _allFaqs.where((f) {
      final matchesCategory = _selectedCategory == 'All Questions' || f['category'] == _selectedCategory;
      if (!matchesCategory) return false;
      if (query.isEmpty) return true;

      final q = (f['q'] ?? '').toLowerCase();
      final a = (f['a'] ?? '').toLowerCase();
      final badge = (f['badge'] ?? '').toLowerCase();
      return q.contains(query) || a.contains(query) || badge.contains(query);
    }).toList();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── 1. SECTION HEADER ──
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(7),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF059669), Color(0xFF10B981)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF059669).withValues(alpha: 0.25),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: const Icon(Icons.help_center_rounded, color: Colors.white, size: 18),
              ),
              const SizedBox(width: 10),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Frequently Asked Questions',
                      style: TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF0F172A),
                        letterSpacing: -0.3,
                      ),
                    ),
                    SizedBox(height: 1),
                    Text(
                      'Instant answers for valuation, pickup, payment & safety',
                      style: TextStyle(
                        fontSize: 11,
                        color: Color(0xFF64748B),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // ── 2. INTERACTIVE SEARCH BAR ──
          Container(
            height: 44,
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: _searchQuery.isNotEmpty ? const Color(0xFF059669) : const Color(0xFFE2E8F0),
                width: 1,
              ),
            ),
            child: TextField(
              controller: _searchController,
              onChanged: (val) => setState(() => _searchQuery = val),
              style: const TextStyle(fontSize: 12.5, color: Color(0xFF0F172A), fontWeight: FontWeight.w500),
              decoration: InputDecoration(
                isDense: true,
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 11),
                border: InputBorder.none,
                hintText: 'Search questions (e.g. bill, price, warranty)...',
                hintStyle: const TextStyle(fontSize: 11.5, color: Color(0xFF94A3B8)),
                prefixIcon: const Icon(Icons.search_rounded, size: 18, color: Color(0xFF64748B)),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.cancel_rounded, size: 16, color: Color(0xFF94A3B8)),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = '');
                        },
                      )
                    : null,
              ),
            ),
          ),

          const SizedBox(height: 12),

          // ── 3. CATEGORY FILTER CHIPS WITH COUNTS ──
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            child: Row(
              children: _categories.map((cat) {
                final isSelected = _selectedCategory == cat;
                final count = _getCategoryCount(cat);
                final icon = _getCategoryIcon(cat);

                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: GestureDetector(
                    onTap: () {
                      setState(() => _selectedCategory = cat);
                    },
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        gradient: isSelected
                            ? const LinearGradient(
                                colors: [Color(0xFF059669), Color(0xFF10B981)],
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                              )
                            : null,
                        color: isSelected ? null : Colors.white,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isSelected ? const Color(0xFF059669) : const Color(0xFFE2E8F0),
                          width: 1,
                        ),
                        boxShadow: isSelected
                            ? [
                                BoxShadow(
                                  color: const Color(0xFF059669).withValues(alpha: 0.25),
                                  blurRadius: 8,
                                  offset: const Offset(0, 3),
                                ),
                              ]
                            : [
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
                          Icon(
                            icon,
                            size: 13,
                            color: isSelected ? Colors.white : const Color(0xFF059669),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            cat,
                            style: TextStyle(
                              color: isSelected ? Colors.white : const Color(0xFF334155),
                              fontSize: 11.5,
                              fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                            decoration: BoxDecoration(
                              color: isSelected ? Colors.white.withValues(alpha: 0.25) : const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              '$count',
                              style: TextStyle(
                                fontSize: 9.5,
                                fontWeight: FontWeight.w800,
                                color: isSelected ? Colors.white : const Color(0xFF64748B),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),

          const SizedBox(height: 12),

          // ── 4. FAQ ACCORDION LIST ──
          if (filtered.isEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
              decoration: BoxDecoration(
                color: const Color(0xFFF8FAFC),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Column(
                children: [
                  const Icon(Icons.search_off_rounded, size: 36, color: Color(0xFF94A3B8)),
                  const SizedBox(height: 8),
                  Text(
                    'No questions found for "$_searchQuery"',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF0F172A)),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Try another keyword or select All Questions',
                    style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                  ),
                  const SizedBox(height: 10),
                  TextButton(
                    onPressed: () {
                      _searchController.clear();
                      setState(() {
                        _searchQuery = '';
                        _selectedCategory = 'All Questions';
                      });
                    },
                    child: const Text('Reset Filter', style: TextStyle(color: Color(0xFF059669), fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            )
          else
            ...filtered.map((f) => _FaqItemCard(faq: f)),

          const SizedBox(height: 14),

          // ── 5. STILL HAVE QUESTIONS? 24X7 SUPPORT BANNER ──
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: Colors.white.withValues(alpha: 0.12), width: 1),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.1),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF059669).withValues(alpha: 0.2),
                    shape: BoxShape.circle,
                    border: Border.all(color: const Color(0xFF059669).withValues(alpha: 0.4)),
                  ),
                  child: const Icon(Icons.headset_mic_rounded, color: Color(0xFF34D399), size: 22),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Still have questions?',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 13.5,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Our gadget valuation team is ready to assist you live.',
                        style: TextStyle(
                          color: Color(0xFFCBD5E1),
                          fontSize: 10.5,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: () => CustomerSupportSheet.show(context),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF059669), Color(0xFF10B981)],
                      ),
                      borderRadius: BorderRadius.circular(10),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF059669).withValues(alpha: 0.4),
                          blurRadius: 8,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Help Desk',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        SizedBox(width: 3),
                        Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 12),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _FaqItemCard extends StatefulWidget {
  final Map<String, String> faq;

  const _FaqItemCard({required this.faq});

  @override
  State<_FaqItemCard> createState() => _FaqItemCardState();
}

class _FaqItemCardState extends State<_FaqItemCard> {
  bool _isExpanded = false;

  @override
  Widget build(BuildContext context) {
    final f = widget.faq;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: _isExpanded ? const Color(0xFF059669) : const Color(0xFFE2E8F0),
          width: _isExpanded ? 1.4 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: _isExpanded ? const Color(0xFF059669).withValues(alpha: 0.08) : Colors.black.withValues(alpha: 0.02),
            blurRadius: _isExpanded ? 10 : 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Theme(
        data: Theme.of(context).copyWith(
          dividerColor: Colors.transparent,
          splashColor: Colors.transparent,
          highlightColor: Colors.transparent,
        ),
        child: ExpansionTile(
          onExpansionChanged: (val) {
            setState(() => _isExpanded = val);
          },
          tilePadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
          childrenPadding: EdgeInsets.zero,
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Badge Pill
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2.5),
                decoration: BoxDecoration(
                  color: _isExpanded ? const Color(0xFFECFDF5) : const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(
                    color: _isExpanded ? const Color(0xFFA7F3D0) : const Color(0xFFE2E8F0),
                    width: 0.8,
                  ),
                ),
                child: Text(
                  f['badge'] ?? 'POLICY',
                  style: TextStyle(
                    fontSize: 9.5,
                    fontWeight: FontWeight.w800,
                    color: _isExpanded ? const Color(0xFF047857) : const Color(0xFF475569),
                    letterSpacing: 0.2,
                  ),
                ),
              ),
              const SizedBox(height: 5),
              // Question Text
              Text(
                f['q'] ?? '',
                style: TextStyle(
                  fontWeight: FontWeight.w800,
                  fontSize: 12.8,
                  color: _isExpanded ? const Color(0xFF059669) : const Color(0xFF0F172A),
                  height: 1.25,
                ),
              ),
            ],
          ),
          trailing: Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: _isExpanded ? const Color(0xFF059669) : const Color(0xFFF1F5F9),
              shape: BoxShape.circle,
            ),
            child: Icon(
              _isExpanded ? Icons.keyboard_arrow_up_rounded : Icons.keyboard_arrow_down_rounded,
              color: _isExpanded ? Colors.white : const Color(0xFF64748B),
              size: 20,
            ),
          ),
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Divider(color: Color(0xFFF1F5F9), height: 1),
                  const SizedBox(height: 10),
                  Text(
                    f['a'] ?? '',
                    style: const TextStyle(
                      color: Color(0xFF334155),
                      fontSize: 12,
                      height: 1.5,
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                  const SizedBox(height: 10),
                  // Trust Tag Row
                  Row(
                    children: [
                      const Icon(Icons.verified_rounded, size: 13, color: Color(0xFF059669)),
                      const SizedBox(width: 4),
                      Text(
                        'Verified Camsik Recommerce Policy',
                        style: TextStyle(
                          color: const Color(0xFF059669).withValues(alpha: 0.9),
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
