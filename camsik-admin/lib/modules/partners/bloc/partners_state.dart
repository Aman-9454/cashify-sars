import '../../../models/admin_models.dart';

abstract class PartnersState {
  const PartnersState();
}

class PartnersInitial extends PartnersState {
  const PartnersInitial();
}

class PartnersLoading extends PartnersState {
  const PartnersLoading();
}

class PartnersLoaded extends PartnersState {
  final List<AdminPartner> allPartners;
  final String searchQuery;

  const PartnersLoaded({
    required this.allPartners,
    this.searchQuery = '',
  });

  List<AdminPartner> get partners => allPartners;

  List<AdminPartner> get filteredPartners {
    final q = searchQuery.toLowerCase();
    if (q.isEmpty) return allPartners;
    return allPartners.where((p) {
      return p.storeName.toLowerCase().contains(q) ||
          p.ownerName.toLowerCase().contains(q) ||
          p.city.toLowerCase().contains(q) ||
          p.phone.toLowerCase().contains(q);
    }).toList();
  }

  PartnersLoaded copyWith({
    List<AdminPartner>? allPartners,
    String? searchQuery,
  }) {
    return PartnersLoaded(
      allPartners: allPartners ?? this.allPartners,
      searchQuery: searchQuery ?? this.searchQuery,
    );
  }
}

class PartnersFailure extends PartnersState {
  final String error;

  const PartnersFailure(this.error);
}
