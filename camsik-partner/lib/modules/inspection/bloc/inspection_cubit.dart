import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../models/partner_models.dart';
import '../data/repositories/inspection_repository.dart';
import 'inspection_state.dart';

class InspectionCubit extends Cubit<InspectionState> {
  final InspectionRepository _inspectionRepository;

  InspectionCubit({
    PartnerOrder? initialOrder,
    InspectionRepository? inspectionRepository,
  })  : _inspectionRepository = inspectionRepository ?? InspectionRepositoryImpl(),
        super(InspectionState(selectedOrder: initialOrder)) {
    loadCriteria();
  }

  Future<void> loadCriteria() async {
    try {
      final list = await _inspectionRepository.fetchInspectionCriteria();
      if (list.isNotEmpty) {
        emit(state.copyWith(criteria: list));
      }
    } catch (_) {}
  }

  void selectOrder(PartnerOrder order) {
    emit(state.copyWith(
      selectedOrder: order,
      clearMessages: true,
      verificationReport: null,
    ));
  }

  void toggleScreenOriginal(bool val) => emit(state.copyWith(screenOriginal: val, clearMessages: true));
  void toggleTouchPerfect(bool val) => emit(state.copyWith(touchPerfect: val, clearMessages: true));
  void toggleBatteryHealthy(bool val) => emit(state.copyWith(batteryHealthy: val, clearMessages: true));
  void toggleCameraClean(bool val) => emit(state.copyWith(cameraClean: val, clearMessages: true));
  void toggleShutterLow(bool val) => emit(state.copyWith(shutterLow: val, clearMessages: true));
  void toggleMotherboardClean(bool val) => emit(state.copyWith(motherboardClean: val, clearMessages: true));

  Future<void> verifyDeviceImei(String imei) async {
    final order = state.selectedOrder;
    if (order == null || imei.trim().isEmpty) return;

    emit(state.copyWith(isVerifyingImei: true, clearMessages: true));

    final report = await _inspectionRepository.validateImei(
      imei: imei.trim(),
      brand: order.deviceBrand.isNotEmpty ? order.deviceBrand : 'Apple',
      model: order.deviceModel.isNotEmpty ? order.deviceModel : order.deviceName,
      variant: order.deviceStorage,
    );

    if (report != null) {
      emit(state.copyWith(
        isVerifyingImei: false,
        verificationReport: report,
        successMessage: report.blacklisted
            ? '⚠️ Warning: IMEI flagged on GSMA Blacklist!'
            : '✅ IMEI Verified! Status: ${report.status} • Clean',
      ));
    } else {
      emit(state.copyWith(
        isVerifyingImei: false,
        errorMessage: 'GSMA IMEI verification failed. Please check digits.',
      ));
    }
  }

  Future<bool> submitQA() async {
    final order = state.selectedOrder;
    if (order == null) return false;

    emit(state.copyWith(isSubmitting: true, clearMessages: true));

    final finalVal = state.adjustedPrice;
    final score = state.inspectionScore;

    // Also link verification session if possible
    await _inspectionRepository.createVerificationSession(
      brand: order.deviceBrand.isNotEmpty ? order.deviceBrand : 'Device',
      model: order.deviceModel.isNotEmpty ? order.deviceModel : order.deviceName,
      orderId: order.id,
    );

    final ok = await _inspectionRepository.submitQAReport(
      orderId: order.id,
      finalPrice: finalVal,
      inspectionScore: score,
      notes: '45-Point QA Score: $score/100. Certified by Hub Technician.',
    );

    if (ok) {
      order.status = 'inspection_completed';
      order.finalPrice = finalVal;
      order.inspectionScore = score;
      emit(state.copyWith(
        isSubmitting: false,
        successMessage: 'QA Completed! Score: $score/100 • New Price: ₹${finalVal.toStringAsFixed(0)}',
      ));
      return true;
    } else {
      emit(state.copyWith(
        isSubmitting: false,
        errorMessage: 'Failed to update inspection report on server',
      ));
      return false;
    }
  }
}
