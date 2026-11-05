import 'package:flutter/material.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/services/api_service.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../core/utils/helpers.dart';
import '../../../models/admin_models.dart';
import '../repositories/operations_repository.dart';

class AdminDiagnosticQuestionsScreen extends StatefulWidget {
  const AdminDiagnosticQuestionsScreen({super.key});

  @override
  State<AdminDiagnosticQuestionsScreen> createState() => _AdminDiagnosticQuestionsScreenState();
}

class _AdminDiagnosticQuestionsScreenState extends State<AdminDiagnosticQuestionsScreen> {
  final OperationsRepository _operationsRepository = OperationsRepositoryImpl();
  final List<Map<String, String>> _categories = const [
    {'id': 'cat-dslr', 'label': 'Cameras', 'icon': '📷'},
    {'id': 'cat-lens', 'label': 'Lenses', 'icon': '🔍'},
    {'id': 'cat-smartphone', 'label': 'Smartphones', 'icon': '📱'},
    {'id': 'cat-laptop', 'label': 'Laptops', 'icon': '💻'},
    {'id': 'cat-tablet', 'label': 'Tablets', 'icon': '📟'},
    {'id': 'cat-action-camera', 'label': 'Action Cams', 'icon': '🏄'},
    {'id': 'cat-video-camera', 'label': 'Video Cams', 'icon': '📹'},
    {'id': 'cat-gimbal', 'label': 'Gimbals', 'icon': '🕹️'},
  ];

  String _selectedCategoryId = 'cat-dslr';
  List<AdminCategoryQuestion> _questions = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadQuestions();
  }

  Future<void> _loadQuestions() async {
    setState(() => _loading = true);
    final items = await _operationsRepository.fetchDiagnosticQuestions(_selectedCategoryId);
    if (!mounted) return;
    setState(() {
      _questions = items;
      _loading = false;
    });
  }

  void _onCategoryChanged(String categoryId) {
    if (_selectedCategoryId == categoryId) return;
    setState(() => _selectedCategoryId = categoryId);
    _loadQuestions();
  }

  Future<void> _toggleQuestionActive(AdminCategoryQuestion q, bool active) async {
    final success = await _operationsRepository.updateQuestion({
      'id': q.id,
      'active': active,
      'categoryId': q.categoryId,
    });
    if (success) {
      Helpers.showSuccessSnackbar('Success', active ? 'Question activated' : 'Question deactivated');
      _loadQuestions();
    } else {
      Helpers.showErrorSnackbar('Error', 'Failed to update question status');
    }
  }

  Future<void> _deleteQuestion(String id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Question?'),
        content: const Text('Are you sure you want to remove this diagnostic question from live valuation?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Delete', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final success = await _operationsRepository.deleteQuestion(id);
      if (success) {
        Helpers.showSuccessSnackbar('Deleted', 'Question removed from valuation engine');
        _loadQuestions();
      } else {
        Helpers.showErrorSnackbar('Error', 'Failed to delete question');
      }
    }
  }

  void _showEditAdjustmentDialog(AdminCategoryQuestion q, AdminQuestionOption opt) {
    final controller = TextEditingController(text: opt.adj.toInt().toString());
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Edit Price Adjustment: ${opt.label}', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(opt.sublabel, style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
            const SizedBox(height: 14),
            TextField(
              controller: controller,
              keyboardType: const TextInputType.numberWithOptions(signed: true),
              decoration: InputDecoration(
                labelText: 'Price Adjustment (₹)',
                helperText: 'Use negative e.g. -3000 for deduction, 0 for base, positive for bonus',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () async {
              final newAdj = double.tryParse(controller.text.trim()) ?? opt.adj;
              Navigator.pop(ctx);

              final updatedOptions = q.options.map((o) {
                if (o.id == opt.id) {
                  return AdminQuestionOption(id: o.id, label: o.label, sublabel: o.sublabel, adj: newAdj);
                }
                return o;
              }).toList();

              final success = await _operationsRepository.updateQuestion({
                'id': q.id,
                'categoryId': q.categoryId,
                'options': updatedOptions.map((o) => o.toJson()).toList(),
              });

              if (success) {
                Helpers.showSuccessSnackbar('Success', 'Adjustment updated for ${opt.label}');
                _loadQuestions();
              } else {
                Helpers.showErrorSnackbar('Error', 'Failed to update adjustment');
              }
            },
            child: const Text('Save Adjustment', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showAddOptionDialog(AdminCategoryQuestion q) {
    final labelCtrl = TextEditingController();
    final sublabelCtrl = TextEditingController();
    final adjCtrl = TextEditingController(text: '0');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add Diagnostic Condition Option', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: labelCtrl,
              decoration: InputDecoration(
                labelText: 'Option Label (e.g. Broken Display)',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: sublabelCtrl,
              decoration: InputDecoration(
                labelText: 'Description / Guidelines',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: adjCtrl,
              keyboardType: const TextInputType.numberWithOptions(signed: true),
              decoration: InputDecoration(
                labelText: 'Price Adjustment (₹)',
                helperText: 'e.g. -4500 or 0 or 1500',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () async {
              if (labelCtrl.text.trim().isEmpty) return;
              final newAdj = double.tryParse(adjCtrl.text.trim()) ?? 0.0;
              Navigator.pop(ctx);

              final newOption = AdminQuestionOption(
                id: 'opt-${DateTime.now().millisecondsSinceEpoch}',
                label: labelCtrl.text.trim(),
                sublabel: sublabelCtrl.text.trim(),
                adj: newAdj,
              );

              final updatedOptions = [...q.options, newOption];

              final success = await _operationsRepository.updateQuestion({
                'id': q.id,
                'categoryId': q.categoryId,
                'options': updatedOptions.map((o) => o.toJson()).toList(),
              });

              if (success) {
                Helpers.showSuccessSnackbar('Success', 'Condition option added');
                _loadQuestions();
              } else {
                Helpers.showErrorSnackbar('Error', 'Failed to add option');
              }
            },
            child: const Text('Add Option', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showAddQuestionDialog() {
    final questionCtrl = TextEditingController();
    final subtextCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('New Diagnostic Question', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Adding to: ${_categories.firstWhere((c) => c['id'] == _selectedCategoryId)['label']}',
                style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary, fontSize: 13)),
            const SizedBox(height: 14),
            TextField(
              controller: questionCtrl,
              decoration: InputDecoration(
                labelText: 'Question Title *',
                hintText: 'e.g. Does the camera focus and shoot normally?',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: subtextCtrl,
              decoration: InputDecoration(
                labelText: 'Inspection Guideline / Subtext',
                hintText: 'e.g. Check sensor autofocus lock speed & dial feedback.',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () async {
              if (questionCtrl.text.trim().isEmpty) return;
              Navigator.pop(ctx);

              final success = await _operationsRepository.createQuestion({
                'id': 'q-${DateTime.now().millisecondsSinceEpoch}',
                'categoryId': _selectedCategoryId,
                'question': questionCtrl.text.trim(),
                'subtext': subtextCtrl.text.trim(),
                'active': true,
                'options': [
                  {'id': 'opt-1', 'label': 'Flawless / Perfect Condition', 'sublabel': 'Works as intended', 'adj': 0},
                  {'id': 'opt-2', 'label': 'Minor Wear / Functional Flaw', 'sublabel': 'Light cosmetic/functional issue', 'adj': -2000},
                  {'id': 'opt-3', 'label': 'Major Defect / Broken', 'sublabel': 'Requires repair or replacement', 'adj': -5000},
                ],
              });

              if (success) {
                Helpers.showSuccessSnackbar('Success', 'Diagnostic question created');
                _loadQuestions();
              } else {
                Helpers.showErrorSnackbar('Error', 'Failed to create question');
              }
            },
            child: const Text('Create Question', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Diagnostic Questions & Valuation Engine', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0.5,
        actions: [
          IconButton(
            icon: const Icon(Icons.sync_rounded, color: AppColors.primary),
            onPressed: () async {
              final confirm = await showDialog<bool>(
                context: context,
                builder: (ctx) => AlertDialog(
                  title: const Text('Re-sync All Question Templates?'),
                  content: const Text('This will reset and synchronize the complete official questions & answers for all 8 categories in the valuation engine.'),
                  actions: [
                    TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
                      onPressed: () => Navigator.pop(ctx, true),
                      child: const Text('Re-sync All', style: TextStyle(color: Colors.white)),
                    ),
                  ],
                ),
              );
              if (confirm == true) {
                setState(() => _loading = true);
                try {
                  await ApiService.dio.get('${ApiConstants.questions}?reset=true');
                  Helpers.showSuccessSnackbar('Synchronized', 'Diagnostic questions reset for all 8 categories');
                  _loadQuestions();
                } catch (e) {
                  Helpers.showErrorSnackbar('Error', 'Failed to synchronize questions');
                  setState(() => _loading = false);
                }
              }
            },
            tooltip: 'Re-sync All Categories',
          ),
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppColors.primary),
            onPressed: _loadQuestions,
            tooltip: 'Reload Questions',
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary,
        onPressed: _showAddQuestionDialog,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Add Question', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
      body: Column(
        children: [
          // ── Category Selector Chips ──
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: Colors.white,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _categories.map((c) {
                  final isSelected = c['id'] == _selectedCategoryId;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      selected: isSelected,
                      label: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(c['icon']!),
                          const SizedBox(width: 6),
                          Text(
                            c['label']!,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                              color: isSelected ? Colors.white : AppColors.textPrimary,
                            ),
                          ),
                        ],
                      ),
                      selectedColor: AppColors.primary,
                      backgroundColor: AppColors.background,
                      onSelected: (_) => _onCategoryChanged(c['id']!),
                    ),
                  );
                }).toList(),
              ),
            ),
          ),

          // ── Header Summary Bar ──
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: AppColors.background,
            child: Row(
              children: [
                const Icon(Icons.psychology_alt_rounded, size: 18, color: AppColors.primary),
                const SizedBox(width: 8),
                Text(
                  '${_questions.length} Diagnostic Valuation Questions',
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    '${_questions.where((q) => q.active).length} Active',
                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary),
                  ),
                ),
              ],
            ),
          ),

          // ── Questions List ──
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _questions.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text('❓', style: TextStyle(fontSize: 48)),
                            const SizedBox(height: 12),
                            const Text('No Diagnostic Questions for this Category', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                            const SizedBox(height: 6),
                            const Text('Add condition questions to calculate accurate doorstep quotes.', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
                            const SizedBox(height: 16),
                            ElevatedButton.icon(
                              onPressed: _showAddQuestionDialog,
                              icon: const Icon(Icons.add, size: 16),
                              label: const Text('Create First Question'),
                              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.fromLTRB(16, 8, 16, 80),
                        itemCount: _questions.length,
                        itemBuilder: (ctx, i) {
                          final q = _questions[i];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 14),
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                              side: BorderSide(
                                color: q.active ? AppColors.border : AppColors.border.withValues(alpha: 0.5),
                              ),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Question Header
                                  Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Container(
                                        width: 26,
                                        height: 26,
                                        decoration: BoxDecoration(
                                          color: q.active ? AppColors.primary.withValues(alpha: 0.1) : Colors.grey.withValues(alpha: 0.1),
                                          shape: BoxShape.circle,
                                        ),
                                        child: Center(
                                          child: Text(
                                            '${i + 1}',
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 12,
                                              color: q.active ? AppColors.primary : Colors.grey,
                                            ),
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 10),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              q.question,
                                              style: TextStyle(
                                                fontWeight: FontWeight.bold,
                                                fontSize: 14,
                                                color: q.active ? AppColors.textPrimary : Colors.grey,
                                              ),
                                            ),
                                            if (q.subtext.isNotEmpty) ...[
                                              const SizedBox(height: 4),
                                              Text(
                                                q.subtext,
                                                style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                                              ),
                                            ],
                                          ],
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      // Active Switch
                                      Switch(
                                        value: q.active,
                                        activeTrackColor: AppColors.primary,
                                        onChanged: (val) => _toggleQuestionActive(q, val),
                                      ),
                                      IconButton(
                                        icon: const Icon(Icons.delete_outline, size: 20, color: AppColors.error),
                                        onPressed: () => _deleteQuestion(q.id),
                                        tooltip: 'Delete Question',
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  const Divider(height: 1),
                                  const SizedBox(height: 12),

                                  // Condition Options & Adjustments
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      const Text(
                                        'CONDITION OPTIONS & DEDUCTIONS',
                                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.textMuted, letterSpacing: 0.5),
                                      ),
                                      TextButton.icon(
                                        style: TextButton.styleFrom(padding: EdgeInsets.zero, visualDensity: VisualDensity.compact),
                                        onPressed: () => _showAddOptionDialog(q),
                                        icon: const Icon(Icons.add, size: 14, color: AppColors.primary),
                                        label: const Text('Add Option', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary)),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),

                                  // Options
                                  ...q.options.map((opt) {
                                    final isNegative = opt.adj < 0;
                                    final isPositive = opt.adj > 0;
                                    final color = isNegative
                                        ? AppColors.error
                                        : (isPositive ? AppColors.success : AppColors.textMuted);

                                    return Container(
                                      margin: const EdgeInsets.only(bottom: 8),
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                      decoration: BoxDecoration(
                                        color: AppColors.background,
                                        borderRadius: BorderRadius.circular(10),
                                        border: Border.all(color: AppColors.border.withValues(alpha: 0.6)),
                                      ),
                                      child: Row(
                                        children: [
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  opt.label,
                                                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: AppColors.textPrimary),
                                                ),
                                                if (opt.sublabel.isNotEmpty)
                                                  Text(
                                                    opt.sublabel,
                                                    style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                                                  ),
                                              ],
                                            ),
                                          ),
                                          // Adjustment Badge
                                          InkWell(
                                            onTap: () => _showEditAdjustmentDialog(q, opt),
                                            borderRadius: BorderRadius.circular(8),
                                            child: Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                              decoration: BoxDecoration(
                                                color: color.withValues(alpha: 0.12),
                                                borderRadius: BorderRadius.circular(8),
                                                border: Border.all(color: color.withValues(alpha: 0.3)),
                                              ),
                                              child: Row(
                                                mainAxisSize: MainAxisSize.min,
                                                children: [
                                                  Text(
                                                    isNegative
                                                        ? '-${CurrencyFormatter.format(opt.adj.abs())}'
                                                        : (isPositive ? '+${CurrencyFormatter.format(opt.adj)}' : '₹0 (Base)'),
                                                    style: TextStyle(
                                                      fontWeight: FontWeight.bold,
                                                      fontSize: 12,
                                                      color: color,
                                                    ),
                                                  ),
                                                  const SizedBox(width: 4),
                                                  Icon(Icons.edit, size: 12, color: color),
                                                ],
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    );
                                  }),
                                ],
                              ),
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
