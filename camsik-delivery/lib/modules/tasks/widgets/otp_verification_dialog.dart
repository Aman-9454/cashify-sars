import 'package:flutter/material.dart';
import 'package:sizer/sizer.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/utils/helpers.dart';
import '../../../../models/delivery_models.dart';
import '../bloc/tasks_cubit.dart';

class OtpVerificationDialog {
  static void show({
    required BuildContext context,
    required DeliveryTask task,
    required TasksCubit tasksCubit,
    VoidCallback? onVerified,
  }) {
    final otpController = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
          title: Text(
            'Enter 4-Digit Customer OTP',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16.sp),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Ask customer for the handover OTP sent to ${task.customerPhone}.',
                style: TextStyle(fontSize: 14.sp, color: Colors.black54),
              ),
              const SizedBox(height: 14),
              TextField(
                controller: otpController,
                keyboardType: TextInputType.number,
                maxLength: 4,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 18.sp,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 8,
                ),
                decoration: InputDecoration(
                  counterText: '',
                  filled: true,
                  fillColor: const Color(0xFFF1F5F9),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                '(Customer Order OTP: ${task.otp})',
                style: TextStyle(fontSize: 14.sp, color: Colors.black45),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: Text('Cancel', style: TextStyle(fontSize: 15.sp)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.success,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: () async {
                final entered = otpController.text.trim();
                final success = await tasksCubit.verifyOtpAndComplete(
                  task: task,
                  enteredOtp: entered,
                );

                if (success) {
                  if (ctx.mounted) Navigator.pop(ctx);
                  onVerified?.call();
                  if (context.mounted) {
                    showCustomSnackBar(
                      context,
                      'OTP Verified! Doorstep task marked completed.',
                      isError: false,
                    );
                  }
                } else {
                  if (ctx.mounted) {
                    showCustomSnackBar(
                      ctx,
                      'Invalid OTP. Please check customer phone.',
                      isError: true,
                    );
                  }
                }
              },
              child: Text('Verify & Complete', style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
  }
}
