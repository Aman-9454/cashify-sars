import '../constants/app_colors.dart';

String formatCurrency(num amount) {
  final int val = amount.round();
  final String s = val.abs().toString();
  if (s.length <= 3) {
    return '$kRupee${val < 0 ? '-' : ''}$s';
  }

  final lastThree = s.substring(s.length - 3);
  final remaining = s.substring(0, s.length - 3);

  final buf = StringBuffer();
  for (int i = 0; i < remaining.length; i++) {
    if (i > 0 && (remaining.length - i) % 2 == 0) {
      buf.write(',');
    }
    buf.write(remaining[i]);
  }
  buf.write(',');
  buf.write(lastThree);

  return '$kRupee${val < 0 ? '-' : ''}${buf.toString()}';
}

class CurrencyFormatter {
  CurrencyFormatter._();
  static String format(num amount) => formatCurrency(amount);
}
