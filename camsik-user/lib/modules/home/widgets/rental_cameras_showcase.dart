import 'package:flutter/material.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../models/user_order.dart';
import '../../../models/user_profile.dart';
import '../../../widgets/camsik_smart_image.dart';
import '../../rent/rental_cameras_screen.dart';

class RentalCamerasShowcase extends StatelessWidget {
  final List<Map<String, dynamic>> rentalCameras;
  final UserProfile userProfile;
  final Function(UserProfile) onProfileUpdate;
  final Function(UserOrder) onOrderCreated;

  const RentalCamerasShowcase({
    super.key,
    required this.rentalCameras,
    required this.userProfile,
    required this.onProfileUpdate,
    required this.onOrderCreated,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Wrap(
                      crossAxisAlignment: WrapCrossAlignment.center,
                      spacing: 8,
                      runSpacing: 4,
                      children: [
                        const Text(
                          'Rent Pro Cameras & Gear',
                          style: TextStyle(fontSize: 17, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: const BoxDecoration(
                            color: Color(0xFFFFE4E6),
                            borderRadius: BorderRadius.all(Radius.circular(6)),
                          ),
                          child: const Text(
                            'DAILY / WEEKLY',
                            style: TextStyle(color: Color(0xFFE11D48), fontSize: 9, fontWeight: FontWeight.w900),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    const Text(
                      'Cinema bodies, mirrorless, lenses & gimbals · Doorstep delivery',
                      style: TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              TextButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (ctx) => RentalCamerasWidget(
                        rentalCameras: rentalCameras,
                        userProfile: userProfile,
                        onProfileUpdate: onProfileUpdate,
                        onOrderCreated: onOrderCreated,
                      ),
                    ),
                  );
                },
                child: const Text('View Fleet', style: TextStyle(color: Color(0xFFE11D48), fontWeight: FontWeight.bold, fontSize: 12)),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 232,
          child: rentalCameras.isEmpty
              ? ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  itemCount: 3,
                  itemBuilder: (ctx, idx) => Container(
                    width: 175,
                    margin: const EdgeInsets.symmetric(horizontal: 5),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFFF1F5F9)),
                    ),
                    child: const Center(
                      child: SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFFE11D48)),
                      ),
                    ),
                  ),
                )
              : ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  itemCount: rentalCameras.length,
                  itemBuilder: (ctx, idx) {
              final c = rentalCameras[idx];
              final name = c['model'] as String? ?? 'Camera';
              final dailyPrice = (c['dailyPrice'] as num?)?.toInt() ?? 0;
              final deposit = (c['securityDeposit'] as num?)?.toInt() ?? 0;
              final image = c['image'] as String? ?? '';
              final category = c['category'] as String? ?? 'Cinema';
              final videoRes = c['videoRes'] as String? ?? '4K Video';

              return InkWell(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (ctx) => RentalCamerasWidget(
                        rentalCameras: rentalCameras,
                        userProfile: userProfile,
                        onProfileUpdate: onProfileUpdate,
                        onOrderCreated: onOrderCreated,
                        initialCamera: c,
                      ),
                    ),
                  );
                },
                borderRadius: BorderRadius.circular(18),
                child: Container(
                  width: 175,
                  margin: const EdgeInsets.symmetric(horizontal: 6),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 6, offset: const Offset(0, 2)),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFE4E6),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              category,
                              style: const TextStyle(color: Color(0xFFE11D48), fontSize: 9, fontWeight: FontWeight.bold),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text('Available', style: TextStyle(color: Color(0xFF059669), fontSize: 8, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Expanded(
                        child: Center(
                          child: CamsikSmartImage(
                            image: image,
                            fit: BoxFit.contain,
                            iconSize: 42,
                            iconColor: const Color(0xFFE11D48),
                          ),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF0F172A)),
                      ),
                      Text(
                        videoRes,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(color: Color(0xFF64748B), fontSize: 10),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.baseline,
                        textBaseline: TextBaseline.alphabetic,
                        children: [
                          Text(
                            formatCurrency(dailyPrice),
                            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Color(0xFFE11D48)),
                          ),
                          const Text(
                            '/day',
                            style: TextStyle(color: Color(0xFF64748B), fontSize: 10, fontWeight: FontWeight.w600),
                          ),
                        ],
                      ),
                      Text(
                        'Deposit: ${formatCurrency(deposit)}',
                        style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 9),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
