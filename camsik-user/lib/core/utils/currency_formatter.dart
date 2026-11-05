import '../constants/app_constants.dart';

String formatCurrency(num amount) {
  final str = amount.toStringAsFixed(0);
  if (str.length <= 3) return '$kRupee$str';
  final lastThree = str.substring(str.length - 3);
  final remaining = str.substring(0, str.length - 3);
  final formattedRemaining = remaining.replaceAllMapped(
    RegExp(r'(\d)(?=(\d\d)+$)'),
    (Match m) => '${m[1]},',
  );
  return '$kRupee$formattedRemaining,$lastThree';
}
