import 'package:flutter/material.dart';

class LocationPickerSheet {
  static void show({
    required BuildContext context,
    required String selectedCity,
    required Function(String city, String area) onLocationSelected,
  }) {
    final cities = [
      {'name': 'Mumbai', 'areas': ['Mira Road', 'Andheri West', 'Bandra', 'Borivali', 'Thane']},
      {'name': 'Bengaluru', 'areas': ['Indiranagar', 'Koramangala', 'HSR Layout', 'Whitefield']},
      {'name': 'Delhi NCR', 'areas': ['Connaught Place', 'Gurugram CyberCity', 'Noida Sec 62']},
      {'name': 'Hyderabad', 'areas': ['HITEC City', 'Gachibowli', 'Jubilee Hills']},
      {'name': 'Pune', 'areas': ['Kothrud', 'Viman Nagar', 'Baner', 'Hinjewadi']},
    ];

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) {
        return Container(
          height: MediaQuery.of(ctx).size.height * 0.65,
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Select Your Location', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                      Text('Doorstep service available in 200+ cities', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                    ],
                  ),
                  IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
                ],
              ),
              const SizedBox(height: 16),
              Expanded(
                child: ListView.separated(
                  itemCount: cities.length,
                  separatorBuilder: (context, index) => const Divider(height: 1),
                  itemBuilder: (context, idx) {
                    final c = cities[idx];
                    final cityName = c['name'] as String;
                    final areas = c['areas'] as List<String>;
                    final isSelected = selectedCity == cityName;

                    return ExpansionTile(
                      dense: true,
                      leading: Icon(
                        Icons.location_city,
                        color: isSelected ? const Color(0xFF059669) : const Color(0xFF64748B),
                        size: 20,
                      ),
                      title: Text(
                        cityName,
                        style: TextStyle(
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                          color: isSelected ? const Color(0xFF059669) : const Color(0xFF0F172A),
                        ),
                      ),
                      children: areas.map((area) {
                        return ListTile(
                          dense: true,
                          title: Text(area, style: const TextStyle(fontSize: 13)),
                          trailing: const Icon(Icons.arrow_forward_ios, size: 12, color: Color(0xFF94A3B8)),
                          onTap: () {
                            onLocationSelected(cityName, area);
                            Navigator.pop(ctx);
                          },
                        );
                      }).toList(),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
