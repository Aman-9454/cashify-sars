import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'core/routes/app_routes.dart';
import 'core/theme/app_theme.dart';
import 'modules/fleet/bloc/fleet_cubit.dart';
import 'modules/navigation/bloc/navigation_cubit.dart';
import 'modules/orders/bloc/orders_cubit.dart';
import 'modules/overview/bloc/overview_cubit.dart';
import 'modules/partners/bloc/partners_cubit.dart';
import 'modules/profile/bloc/profile_cubit.dart';

final GlobalKey<ScaffoldMessengerState> scaffoldMessengerKey =
    GlobalKey<ScaffoldMessengerState>();

class CamsikAdminApp extends StatelessWidget {
  const CamsikAdminApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => NavigationCubit()),
        BlocProvider(create: (_) => OverviewCubit()..loadOverview()),
        BlocProvider(create: (_) => OrdersCubit()..loadOrders()),
        BlocProvider(create: (_) => PartnersCubit()..loadPartners()),
        BlocProvider(create: (_) => FleetCubit()..loadAgents()),
        BlocProvider(create: (_) => ProfileCubit()..loadProfile()),
      ],
      child: MaterialApp(
        title: 'CAMSIK Admin',
        scaffoldMessengerKey: scaffoldMessengerKey,
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        initialRoute: AppRoutes.initial,
        onGenerateRoute: AppRoutes.onGenerateRoute,
      ),
    );
  }
}
