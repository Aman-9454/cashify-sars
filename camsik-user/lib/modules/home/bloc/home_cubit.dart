import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/models/responses/banners_response.dart';
import '../data/models/responses/categories_response.dart';
import '../data/repositories/catalog_repository.dart';
import 'home_state.dart';

class HomeCubit extends Cubit<HomeState> {
  final CatalogRepository _catalogRepository;

  HomeCubit({
    CatalogRepository? catalogRepository,
  })  : _catalogRepository = catalogRepository ?? CatalogRepositoryImpl(),
        super(const HomeInitial());

  Future<void> loadHomeData() async {
    emit(const HomeLoading());

    // Static fallback data commented out as per requirement - live API loaded directly
    /*
    List<BannerModel> banners = FallbackBanners.data
        .map((e) => BannerModel.fromJson(e))
        .toList();
    List<CategoryModel> categories = FallbackCategories.data
        .map((e) => CategoryModel.fromJson(e))
        .toList();
    List<Map<String, dynamic>> refurbished = List<Map<String, dynamic>>.from(FallbackRefurbished.data);
    List<Map<String, dynamic>> rentals = List<Map<String, dynamic>>.from(FallbackRentalCameras.data);
    */
    List<BannerModel> banners = [];
    List<CategoryModel> categories = [];
    List<Map<String, dynamic>> refurbished = [];
    List<Map<String, dynamic>> rentals = [];

    try {
      final bannersFuture = _catalogRepository.getBanners();
      final categoriesFuture = _catalogRepository.getCategories();
      final refFuture = _catalogRepository.getRefurbished();
      final rentFuture = _catalogRepository.getRentalCameras();

      final results = await Future.wait([bannersFuture, categoriesFuture, refFuture, rentFuture]);

      final bannersRes = results[0];
      if (bannersRes.data != null) {
        final bRes = BannersResponse.fromJson(Map<String, dynamic>.from(bannersRes.data as Map));
        if (bRes.banners.isNotEmpty) banners = bRes.banners;
      }

      final catRes = results[1];
      if (catRes.data != null) {
        final cRes = CategoriesResponse.fromJson(Map<String, dynamic>.from(catRes.data as Map));
        if (cRes.categories.isNotEmpty) categories = cRes.categories;
      }

      final refRes = results[2];
      if (refRes.data != null && refRes.data['products'] is List) {
        final list = (refRes.data['products'] as List).cast<Map<String, dynamic>>();
        refurbished = list;
      }

      final rentRes = results[3];
      if (rentRes.data != null && rentRes.data['cameras'] is List) {
        final list = (rentRes.data['cameras'] as List).cast<Map<String, dynamic>>();
        rentals = list;
      }
    } catch (_) {}

    emit(HomeLoaded(
      banners: banners,
      categories: categories,
      refurbished: refurbished,
      rentalCameras: rentals,
    ));
  }
}
