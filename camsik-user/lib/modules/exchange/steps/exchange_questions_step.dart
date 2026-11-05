import 'package:flutter/material.dart';
import '../../../core/constants/app_constants.dart';
import '../../../core/utils/currency_formatter.dart';

class ExchangeQuestionsStep extends StatelessWidget {
  final Map<String, dynamic>? selectedOldDevice;
  final List<Map<String, dynamic>> questions;
  final Map<int, int> selectedAnswers;
  final int calculatedOldValue;
  final int exchangeBonus;
  final void Function(int qIdx, int optIdx) onAnswerSelected;
  final VoidCallback onNext;

  const ExchangeQuestionsStep({
    super.key,
    required this.selectedOldDevice,
    required this.questions,
    required this.selectedAnswers,
    required this.calculatedOldValue,
    required this.exchangeBonus,
    required this.onAnswerSelected,
    required this.onNext,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFF3B0764), Color(0xFF1E1B4B)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    selectedOldDevice?['name'] ?? 'Old Device',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                  const Text(
                    'Valuation + $kRupee 5,000 Exchange Bonus',
                    style: TextStyle(color: Colors.white70, fontSize: 11),
                  ),
                ],
              ),
              Text(
                formatCurrency(calculatedOldValue + exchangeBonus),
                style: const TextStyle(
                  color: Color(0xFFC084FC),
                  fontWeight: FontWeight.w900,
                  fontSize: 20,
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: questions.length,
            separatorBuilder: (c, i) => const SizedBox(height: 14),
            itemBuilder: (ctx, qIdx) {
              final q = questions[qIdx];
              final options = (q['options'] as List?)
                      ?.whereType<Map>()
                      .map((e) => Map<String, dynamic>.from(e))
                      .toList() ??
                  [];
              final sel = selectedAnswers[qIdx] ?? 0;

              return Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${qIdx + 1}. ${q['question']}',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                        color: Color(0xFF0F172A),
                      ),
                    ),
                    const SizedBox(height: 10),
                    ...List.generate(options.length, (optIdx) {
                      final opt = options[optIdx];
                      final isSel = sel == optIdx;
                      final adj = (opt['adj'] as num?)?.toInt() ?? 0;

                      return InkWell(
                        onTap: () => onAnswerSelected(qIdx, optIdx),
                        borderRadius: BorderRadius.circular(10),
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 6),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 8),
                          decoration: BoxDecoration(
                            color: isSel
                                ? const Color(0xFF7C3AED).withValues(alpha: 0.08)
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: isSel
                                  ? const Color(0xFF7C3AED)
                                  : const Color(0xFFE2E8F0),
                            ),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                isSel
                                    ? Icons.radio_button_checked
                                    : Icons.radio_button_off,
                                size: 16,
                                color: isSel
                                    ? const Color(0xFF7C3AED)
                                    : const Color(0xFF94A3B8),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  opt['label'] as String,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                              if (adj != 0)
                                Text(
                                  adj > 0
                                      ? '+${formatCurrency(adj)}'
                                      : '-${formatCurrency(adj.abs())}',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    color: adj > 0
                                        ? const Color(0xFF059669)
                                        : const Color(0xFFEF4444),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      );
                    }),
                  ],
                ),
              );
            },
          ),
        ),
        Container(
          padding: const EdgeInsets.all(16),
          color: Colors.white,
          child: SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF7C3AED),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
                elevation: 3,
              ),
              onPressed: onNext,
              child: const Text(
                'Next: Choose Upgrade Device',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
