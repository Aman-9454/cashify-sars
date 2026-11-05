import '../../models/partner_models.dart';

extension OrderFilters on List<PartnerOrder> {
  List<PartnerOrder> filterCompleted() {
    return where((o) => o.status == 'completed' || o.status == 'paid').toList();
  }
}
