import 'package:flutter_bloc/flutter_bloc.dart';

class NavigationCubit extends Cubit<int> {
  NavigationCubit([super.initialIndex = 0]);

  void setTab(int index) => emit(index);
}

