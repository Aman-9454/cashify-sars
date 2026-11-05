class InspectionCriterionModel {
  final String id;
  final String key;
  final String label;
  final String sublabel;
  final String category;
  final double deductionAmount;
  final int scoreWeight;
  final bool isPassedByDefault;

  InspectionCriterionModel({
    required this.id,
    required this.key,
    required this.label,
    required this.sublabel,
    required this.category,
    required this.deductionAmount,
    required this.scoreWeight,
    this.isPassedByDefault = true,
  });

  factory InspectionCriterionModel.fromJson(Map<String, dynamic> json) {
    return InspectionCriterionModel(
      id: json['id']?.toString() ?? '',
      key: json['key']?.toString() ?? '',
      label: json['label']?.toString() ?? '',
      sublabel: json['sublabel']?.toString() ?? '',
      category: json['category']?.toString() ?? 'screen',
      deductionAmount: (json['deductionAmount'] as num?)?.toDouble() ?? 0.0,
      scoreWeight: (json['scoreWeight'] as num?)?.toInt() ?? 10,
      isPassedByDefault: json['isPassedByDefault'] ?? true,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'key': key,
    'label': label,
    'sublabel': sublabel,
    'category': category,
    'deductionAmount': deductionAmount,
    'scoreWeight': scoreWeight,
    'isPassedByDefault': isPassedByDefault,
  };
}

class GradingScaleModel {
  final int minScore;
  final String grade;
  final String color;

  GradingScaleModel({
    required this.minScore,
    required this.grade,
    required this.color,
  });

  factory GradingScaleModel.fromJson(Map<String, dynamic> json) {
    return GradingScaleModel(
      minScore: (json['minScore'] as num?)?.toInt() ?? 0,
      grade: json['grade']?.toString() ?? '',
      color: json['color']?.toString() ?? '#10B981',
    );
  }
}
