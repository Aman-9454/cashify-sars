class CreateVerificationSessionRequest {
  final Map<String, dynamic> selectedDevice;
  final String? userId;
  final String? sellFlowId;

  const CreateVerificationSessionRequest({
    required this.selectedDevice,
    this.userId,
    this.sellFlowId,
  });

  Map<String, dynamic> toJson() {
    return {
      'selectedDevice': selectedDevice,
      if (userId != null && userId!.isNotEmpty) 'userId': userId,
      if (sellFlowId != null && sellFlowId!.isNotEmpty) 'sellFlowId': sellFlowId,
    };
  }
}
