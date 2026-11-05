import '../data/models/responses/banners_response.dart';
import '../data/models/responses/categories_response.dart';

abstract class HomeState {
  const HomeState();
}

class HomeInitial extends HomeState {
  const HomeInitial();
}

class HomeLoading extends HomeState {
  const HomeLoading();
}

class HomeLoaded extends HomeState {
  final List<BannerModel> banners;
  final List<CategoryModel> categories;
  final List<Map<String, dynamic>> refurbished;
  final List<Map<String, dynamic>> rentalCameras;

  const HomeLoaded({
    required this.banners,
    required this.categories,
    required this.refurbished,
    required this.rentalCameras,
  });

  HomeLoaded copyWith({
    List<BannerModel>? banners,
    List<CategoryModel>? categories,
    List<Map<String, dynamic>>? refurbished,
    List<Map<String, dynamic>>? rentalCameras,
  }) {
    return HomeLoaded(
      banners: banners ?? this.banners,
      categories: categories ?? this.categories,
      refurbished: refurbished ?? this.refurbished,
      rentalCameras: rentalCameras ?? this.rentalCameras,
    );
  }
}

class HomeFailure extends HomeState {
  final String message;

  const HomeFailure(this.message);
}
