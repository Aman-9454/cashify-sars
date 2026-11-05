import 'package:flutter/material.dart';
import '../../../widgets/camsik_smart_image.dart';

class SellQuestionsStep extends StatefulWidget {
  final Map<String, dynamic>? selectedModel;
  final String selectedStorage;
  final String selectedColor;
  final int basePrice;
  final int calculatedPrice;
  final List<Map<String, dynamic>> questions;
  final Map<int, int> selectedAnswers;
  final Function(int qIdx, int optIdx) onAnswerSelected;
  final VoidCallback onProceed;

  const SellQuestionsStep({
    super.key,
    this.selectedModel,
    this.selectedStorage = 'Standard',
    this.selectedColor = 'Standard Color',
    this.basePrice = 50000,
    required this.calculatedPrice,
    required this.questions,
    required this.selectedAnswers,
    required this.onAnswerSelected,
    required this.onProceed,
  });

  @override
  State<SellQuestionsStep> createState() => _SellQuestionsStepState();
}

class _SellQuestionsStepState extends State<SellQuestionsStep> {
  int _currentIndex = 0;
  bool _isMovingForward = true;

  void _goToPrevious() {
    if (_currentIndex > 0) {
      setState(() {
        _isMovingForward = false;
        _currentIndex--;
      });
    }
  }

  void _goToNextOrProceed() {
    if (_currentIndex < widget.questions.length - 1) {
      setState(() {
        _isMovingForward = true;
        _currentIndex++;
      });
    } else {
      widget.onProceed();
    }
  }

  void _handleOptionTap(int optIdx) {
    widget.onAnswerSelected(_currentIndex, optIdx);

    // Auto-advance to next question with a smooth transition
    Future.delayed(const Duration(milliseconds: 260), () {
      if (mounted) {
        if (_currentIndex < widget.questions.length - 1) {
          setState(() {
            _isMovingForward = true;
            _currentIndex++;
          });
        } else {
          widget.onProceed();
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final modelName = widget.selectedModel?['name'] as String? ?? 'Selected Device';
    final modelImage = widget.selectedModel?['image'] as String? ?? 'assets/images/categories/dslr.png';
    final totalQuestions = widget.questions.length;
    final hasQuestions = totalQuestions > 0;
    final currentQ = hasQuestions && _currentIndex < totalQuestions ? widget.questions[_currentIndex] : null;
    final options = (currentQ?['options'] as List?) ?? [];
    final selectedOptIdx = widget.selectedAnswers[_currentIndex];
    final answeredCount = widget.selectedAnswers.length;
    final progress = totalQuestions > 0 ? (answeredCount / totalQuestions) : 0.0;

    return Column(
      children: [
        // ── 1. STICKY LIVE VALUATION STRIP (MASKED WITH STARS AS REQUESTED) ──
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.15),
                blurRadius: 8,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 7,
                        height: 7,
                        decoration: const BoxDecoration(
                          color: Color(0xFF34D399),
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 5),
                      const Text(
                        'AI VALUATION ENGINE',
                        style: TextStyle(
                          color: Color(0xFF38BDF8),
                          fontSize: 9.5,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 0.4,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  const Text(
                    'Evaluation in progress...',
                    style: TextStyle(
                      color: Color(0xFF94A3B8),
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              const Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '₹ * * * * *',
                    style: TextStyle(
                      color: Color(0xFF34D399),
                      fontWeight: FontWeight.w900,
                      fontSize: 20,
                      letterSpacing: 2.0,
                    ),
                  ),
                  Text(
                    'Price reveals at final checkout',
                    style: TextStyle(color: Color(0xFF64748B), fontSize: 9.5, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            ],
          ),
        ),

        // ── 2. DEVICE SUMMARY HEADER BAR ──
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          color: Colors.white,
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                padding: const EdgeInsets.all(3),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: CamsikSmartImage(
                  image: modelImage,
                  fit: BoxFit.contain,
                  iconSize: 20,
                  iconColor: const Color(0xFF94A3B8),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      modelName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 13,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                    Text(
                      '${widget.selectedStorage} • ${widget.selectedColor}',
                      style: const TextStyle(
                        fontSize: 10.5,
                        color: Color(0xFF64748B),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text(
                  'Base: ₹ * * * * *',
                  style: TextStyle(
                    fontSize: 10.5,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF475569),
                  ),
                ),
              ),
            ],
          ),
        ),

        // ── 3. QUESTION PROGRESS BAR ──
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          color: const Color(0xFFF8FAFC),
          child: Row(
            children: [
              Text(
                'Question ${_currentIndex + 1} of $totalQuestions',
                style: const TextStyle(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF0F172A),
                ),
              ),
              const Spacer(),
              Text(
                '${(progress * 100).toInt()}% Done',
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF059669),
                ),
              ),
              const SizedBox(width: 8),
              SizedBox(
                width: 70,
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: totalQuestions > 0 ? (_currentIndex + 1) / totalQuestions : 0,
                    minHeight: 5,
                    backgroundColor: const Color(0xFFE2E8F0),
                    valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF059669)),
                  ),
                ),
              ),
            ],
          ),
        ),

        // ── 4. QUESTION CARD WITH ANIMATED SWITCHER TRANSITION ──
        Expanded(
          child: hasQuestions && currentQ != null
              ? AnimatedSwitcher(
                  duration: const Duration(milliseconds: 320),
                  switchInCurve: Curves.easeOutCubic,
                  switchOutCurve: Curves.easeInCubic,
                  transitionBuilder: (Widget child, Animation<double> animation) {
                    final beginOffset = _isMovingForward ? const Offset(0.3, 0.0) : const Offset(-0.3, 0.0);
                    return SlideTransition(
                      position: Tween<Offset>(begin: beginOffset, end: Offset.zero).animate(animation),
                      child: FadeTransition(opacity: animation, child: child),
                    );
                  },
                  child: KeyedSubtree(
                    key: ValueKey<int>(_currentIndex),
                    child: ListView(
                      padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
                      physics: const BouncingScrollPhysics(),
                      children: [
                        // Question Card
                        Container(
                          padding: const EdgeInsets.all(18),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFFE2E8F0), width: 1.2),
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
                              // Question Badge
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFECFDF5),
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(color: const Color(0xFFA7F3D0)),
                                ),
                                child: Text(
                                  'STEP ${_currentIndex + 1}',
                                  style: const TextStyle(
                                    fontSize: 9,
                                    fontWeight: FontWeight.w900,
                                    color: Color(0xFF047857),
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 10),

                              // Question Title
                              Text(
                                currentQ['question']?.toString() ?? 'Condition Question',
                                style: const TextStyle(
                                  fontSize: 17,
                                  fontWeight: FontWeight.w900,
                                  color: Color(0xFF0F172A),
                                  letterSpacing: -0.3,
                                  height: 1.25,
                                ),
                              ),
                              const SizedBox(height: 4),

                              // Subtitle
                              Text(
                                currentQ['subtext']?.toString() ?? 'Select the option that best describes your device',
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFF64748B),
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 16),
                              const Divider(height: 1, color: Color(0xFFF1F5F9)),
                              const SizedBox(height: 16),

                              // Options List
                              ...List.generate(options.length, (optIdx) {
                                final opt = options[optIdx] as Map<String, dynamic>;
                                final label = opt['label']?.toString() ?? '';
                                final desc = opt['desc']?.toString() ?? '';
                                final isSelected = selectedOptIdx == optIdx;

                                return Padding(
                                  padding: const EdgeInsets.only(bottom: 10),
                                  child: InkWell(
                                    onTap: () => _handleOptionTap(optIdx),
                                    borderRadius: BorderRadius.circular(14),
                                    child: AnimatedContainer(
                                      duration: const Duration(milliseconds: 200),
                                      padding: const EdgeInsets.all(14),
                                      decoration: BoxDecoration(
                                        color: isSelected ? const Color(0xFFECFDF5) : Colors.white,
                                        borderRadius: BorderRadius.circular(14),
                                        border: Border.all(
                                          color: isSelected ? const Color(0xFF059669) : const Color(0xFFE2E8F0),
                                          width: isSelected ? 2.0 : 1.2,
                                        ),
                                        boxShadow: [
                                          if (isSelected)
                                            BoxShadow(
                                              color: const Color(0xFF059669).withValues(alpha: 0.12),
                                              blurRadius: 8,
                                              offset: const Offset(0, 2),
                                            ),
                                        ],
                                      ),
                                      child: Row(
                                        children: [
                                          // Radio / Check Icon
                                          Container(
                                            width: 22,
                                            height: 22,
                                            decoration: BoxDecoration(
                                              shape: BoxShape.circle,
                                              color: isSelected ? const Color(0xFF059669) : Colors.transparent,
                                              border: Border.all(
                                                color: isSelected ? const Color(0xFF059669) : const Color(0xFF94A3B8),
                                                width: 2,
                                              ),
                                            ),
                                            child: isSelected
                                                ? const Icon(Icons.check, size: 14, color: Colors.white)
                                                : null,
                                          ),
                                          const SizedBox(width: 12),

                                          // Option details
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  label,
                                                  style: TextStyle(
                                                    fontSize: 13.5,
                                                    fontWeight: FontWeight.w800,
                                                    color: isSelected
                                                        ? const Color(0xFF047857)
                                                        : const Color(0xFF0F172A),
                                                  ),
                                                ),
                                                if (desc.isNotEmpty) ...[
                                                  const SizedBox(height: 2),
                                                  Text(
                                                    desc,
                                                    style: const TextStyle(
                                                      fontSize: 11,
                                                      color: Color(0xFF64748B),
                                                      fontWeight: FontWeight.w500,
                                                    ),
                                                  ),
                                                ],
                                              ],
                                            ),
                                          ),

                                          // Masked Price badge (stars)
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                                            decoration: BoxDecoration(
                                              color: const Color(0xFFF1F5F9),
                                              borderRadius: BorderRadius.circular(6),
                                            ),
                                            child: const Text(
                                              '* * *',
                                              style: TextStyle(
                                                fontSize: 10,
                                                fontWeight: FontWeight.w900,
                                                color: Color(0xFF64748B),
                                                letterSpacing: 1.0,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                );
                              }),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                )
              : const Center(
                  child: Text('No evaluation questions available'),
                ),
        ),

        // ── 5. BOTTOM ACTION BUTTONS: PREVIOUS (LEFT) & SKIP / NEXT (RIGHT) ──
        Container(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.05),
                blurRadius: 10,
                offset: const Offset(0, -3),
              ),
            ],
          ),
          child: Row(
            children: [
              // Left button: Previous Question / Back
              Expanded(
                child: OutlinedButton(
                  onPressed: _currentIndex > 0 ? _goToPrevious : null,
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    side: BorderSide(
                      color: _currentIndex > 0 ? const Color(0xFFCBD5E1) : const Color(0xFFE2E8F0),
                    ),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.arrow_back_rounded,
                        size: 16,
                        color: _currentIndex > 0 ? const Color(0xFF334155) : const Color(0xFF94A3B8),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        'Previous',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: _currentIndex > 0 ? const Color(0xFF334155) : const Color(0xFF94A3B8),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),

              // Right button: Skip or Next
              Expanded(
                child: ElevatedButton(
                  onPressed: _goToNextOrProceed,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF059669),
                    foregroundColor: Colors.white,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        _currentIndex < totalQuestions - 1
                            ? (selectedOptIdx != null ? 'Next Question' : 'Skip')
                            : 'Reveal Final Quote',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(width: 6),
                      const Icon(Icons.arrow_forward_rounded, size: 16),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
