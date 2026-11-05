class DashboardStatsModel {
  final String partnerId;
  final String partnerName;
  final String storeName;
  final double rating;
  final double storeTradeVolume;
  final String momGrowth;
  final int totalOrdersCount;
  final int completedOrdersCount;
  final int activePipelineCount;
  final double commissionRate;
  final double totalCommissionEarned;
  final double availableFloatBalance;
  final double pendingPayout;

  DashboardStatsModel({
    required this.partnerId,
    required this.partnerName,
    required this.storeName,
    required this.rating,
    required this.storeTradeVolume,
    required this.momGrowth,
    required this.totalOrdersCount,
    required this.completedOrdersCount,
    required this.activePipelineCount,
    required this.commissionRate,
    required this.totalCommissionEarned,
    required this.availableFloatBalance,
    required this.pendingPayout,
  });

  factory DashboardStatsModel.fromJson(Map<String, dynamic> json) {
    final data = json['dashboard'] is Map ? json['dashboard'] as Map : json;
    return DashboardStatsModel(
      partnerId: data['partnerId']?.toString() ?? '',
      partnerName: data['partnerName']?.toString() ?? 'Store Partner',
      storeName: data['storeName']?.toString() ?? 'Camsik Store Hub',
      rating: (data['rating'] as num?)?.toDouble() ?? 4.9,
      storeTradeVolume: (data['storeTradeVolume'] as num?)?.toDouble() ?? 0.0,
      momGrowth: data['momGrowth']?.toString() ?? '+14.2% MoM',
      totalOrdersCount: (data['totalOrdersCount'] as num?)?.toInt() ?? 0,
      completedOrdersCount: (data['completedOrdersCount'] as num?)?.toInt() ?? 0,
      activePipelineCount: (data['activePipelineCount'] as num?)?.toInt() ?? 0,
      commissionRate: (data['commissionRate'] as num?)?.toDouble() ?? 5.0,
      totalCommissionEarned: (data['totalCommissionEarned'] as num?)?.toDouble() ?? 0.0,
      availableFloatBalance: (data['availableFloatBalance'] as num?)?.toDouble() ?? 0.0,
      pendingPayout: (data['pendingPayout'] as num?)?.toDouble() ?? 0.0,
    );
  }
}
