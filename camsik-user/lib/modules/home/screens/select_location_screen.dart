import 'package:flutter/material.dart';

class SelectLocationScreen extends StatefulWidget {
  final String selectedCity;
  final String selectedArea;

  const SelectLocationScreen({
    super.key,
    required this.selectedCity,
    required this.selectedArea,
  });

  @override
  State<SelectLocationScreen> createState() => _SelectLocationScreenState();
}

class _SelectLocationScreenState extends State<SelectLocationScreen> {
  final TextEditingController _searchController = TextEditingController();
  late String _currentCity;
  late String _currentArea;

  final List<Map<String, dynamic>> _citiesData = const [
    {
      'name': 'Mumbai',
      'icon': Icons.apartment_rounded,
      'areas': [
        'Mira Road',
        'Andheri West',
        'Bandra',
        'Borivali',
        'Thane',
        'Powai',
        'Dadar',
        'Navi Mumbai',
        'Goregaon',
        'Malad',
        'Kandivali',
      ],
    },
    {
      'name': 'Bengaluru',
      'icon': Icons.location_city_rounded,
      'areas': [
        'Indiranagar',
        'Koramangala',
        'HSR Layout',
        'Whitefield',
        'Jayanagar',
        'Electronic City',
        'Bellandur',
        'JP Nagar',
      ],
    },
    {
      'name': 'Delhi NCR',
      'icon': Icons.account_balance_rounded,
      'areas': [
        'Connaught Place',
        'Gurugram CyberCity',
        'Noida Sec 62',
        'South Extension',
        'Dwarka',
        'Rohini',
        'Greater Noida',
      ],
    },
    {
      'name': 'Hyderabad',
      'icon': Icons.domain_rounded,
      'areas': [
        'HITEC City',
        'Gachibowli',
        'Jubilee Hills',
        'Banjara Hills',
        'Madhapur',
        'Kondapur',
        'Secunderabad',
      ],
    },
    {
      'name': 'Pune',
      'icon': Icons.business_rounded,
      'areas': [
        'Kothrud',
        'Viman Nagar',
        'Baner',
        'Hinjewadi',
        'Wakad',
        'Koregaon Park',
        'Aundh',
        'Hadapsar',
      ],
    },
    {
      'name': 'Chennai',
      'icon': Icons.temple_hindu_rounded,
      'areas': [
        'T. Nagar',
        'Adyar',
        'Velachery',
        'Anna Nagar',
        'OMR',
        'Nungambakkam',
        'Mylapore',
      ],
    },
    {
      'name': 'Kolkata',
      'icon': Icons.museum_rounded,
      'areas': [
        'Salt Lake',
        'Park Street',
        'New Town',
        'Ballygunge',
        'Howrah',
        'Alipore',
      ],
    },
    {
      'name': 'Ahmedabad',
      'icon': Icons.storefront_rounded,
      'areas': [
        'SG Highway',
        'Vastrapur',
        'Satellite',
        'Bodakdev',
        'Prahlad Nagar',
        'Navrangpura',
      ],
    },
  ];

  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _currentCity = widget.selectedCity;
    _currentArea = widget.selectedArea;
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _selectAndReturn(String city, String area) {
    Navigator.pop(context, {'city': city, 'area': area});
  }

  @override
  Widget build(BuildContext context) {
    // Filter cities and areas based on search query
    final query = _searchQuery.trim().toLowerCase();
    final filteredCities = _citiesData.where((c) {
      if (query.isEmpty) return true;
      final cityName = (c['name'] as String).toLowerCase();
      final areas = (c['areas'] as List<String>);
      final matchesCity = cityName.contains(query);
      final matchesArea = areas.any((a) => a.toLowerCase().contains(query));
      return matchesCity || matchesArea;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Select Your Location',
              style: TextStyle(
                fontWeight: FontWeight.w900,
                fontSize: 16.5,
                color: Color(0xFF0F172A),
              ),
            ),
            Text(
              'Instant Doorstep Pickup in 200+ Cities',
              style: TextStyle(
                fontSize: 11,
                color: Color(0xFF64748B),
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Search Input Field
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2E8F0)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.02),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: TextField(
                controller: _searchController,
                onChanged: (val) => setState(() => _searchQuery = val),
                style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                decoration: InputDecoration(
                  hintText: 'Search city or locality (e.g. Bandra, HSR)...',
                  hintStyle: const TextStyle(
                    color: Color(0xFF94A3B8),
                    fontSize: 13,
                    fontWeight: FontWeight.normal,
                  ),
                  prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFF059669), size: 22),
                  suffixIcon: _searchQuery.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.cancel_rounded, size: 18, color: Color(0xFF94A3B8)),
                          onPressed: () {
                            _searchController.clear();
                            setState(() => _searchQuery = '');
                          },
                        )
                      : null,
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 18),

            // Use Current Location Button
            InkWell(
              onTap: () {
                _selectAndReturn('Mumbai', 'Mira Road');
              },
              borderRadius: BorderRadius.circular(16),
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFFECFDF5),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF059669).withValues(alpha: 0.3)),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: const BoxDecoration(
                        color: Color(0xFF059669),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.my_location_rounded, color: Colors.white, size: 18),
                    ),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                'Use Current Location',
                                style: TextStyle(
                                  fontWeight: FontWeight.w800,
                                  fontSize: 13.5,
                                  color: Color(0xFF065F46),
                                ),
                              ),
                              SizedBox(width: 6),
                              Icon(Icons.bolt_rounded, size: 14, color: Color(0xFF059669)),
                            ],
                          ),
                          SizedBox(height: 2),
                          Text(
                            'Mira Road, Mumbai (Auto-detected)',
                            style: TextStyle(
                              fontSize: 11.5,
                              color: Color(0xFF047857),
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Icon(Icons.arrow_forward_ios_rounded, size: 14, color: Color(0xFF059669)),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Popular Metros Header
            if (query.isEmpty) ...[
              const Text(
                'Select City',
                style: TextStyle(
                  fontWeight: FontWeight.w900,
                  fontSize: 15,
                  color: Color(0xFF0F172A),
                  letterSpacing: -0.2,
                ),
              ),
              const SizedBox(height: 12),
              // City Pills / Selector
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                child: Row(
                  children: _citiesData.map((c) {
                    final cityName = c['name'] as String;
                    final isSelected = _currentCity == cityName;

                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ChoiceChip(
                        label: Text(cityName),
                        selected: isSelected,
                        onSelected: (_) {
                          setState(() {
                            _currentCity = cityName;
                            _currentArea = (c['areas'] as List<String>).first;
                          });
                        },
                        selectedColor: const Color(0xFF059669),
                        backgroundColor: Colors.white,
                        labelStyle: TextStyle(
                          color: isSelected ? Colors.white : const Color(0xFF334155),
                          fontWeight: FontWeight.w800,
                          fontSize: 12.5,
                        ),
                        side: BorderSide(
                          color: isSelected ? const Color(0xFF059669) : const Color(0xFFCBD5E1),
                          width: isSelected ? 1.5 : 1,
                        ),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 24),
            ],

            // Available Localities
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  query.isEmpty ? 'Areas in $_currentCity' : 'Matching Localities',
                  style: const TextStyle(
                    fontWeight: FontWeight.w900,
                    fontSize: 15,
                    color: Color(0xFF0F172A),
                    letterSpacing: -0.2,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFFECFDF5),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.check_circle_rounded, size: 12, color: Color(0xFF059669)),
                      SizedBox(width: 4),
                      Text(
                        'Doorstep Verified',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF059669),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // List of Localities
            if (filteredCities.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: const Column(
                  children: [
                    Icon(Icons.location_off_rounded, size: 36, color: Color(0xFF94A3B8)),
                    SizedBox(height: 10),
                    Text(
                      'No matching city or area found',
                      style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: Color(0xFF0F172A)),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Try searching for another locality or city name.',
                      style: TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                    ),
                  ],
                ),
              )
            else
              ...filteredCities.map((c) {
                final cityName = c['name'] as String;
                final areas = (c['areas'] as List<String>).where((a) {
                  if (query.isEmpty) return cityName == _currentCity;
                  return cityName.toLowerCase().contains(query) || a.toLowerCase().contains(query);
                }).toList();

                if (areas.isEmpty) return const SizedBox.shrink();

                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (query.isNotEmpty) ...[
                      Padding(
                        padding: const EdgeInsets.only(top: 8, bottom: 6),
                        child: Text(
                          cityName,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF059669),
                          ),
                        ),
                      ),
                    ],
                    Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.02),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: ListView.separated(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: areas.length,
                        separatorBuilder: (context, index) => const Divider(height: 1, color: Color(0xFFF1F5F9)),
                        itemBuilder: (context, index) {
                          final area = areas[index];
                          final isSelected = _currentCity == cityName && _currentArea == area;

                          return InkWell(
                            onTap: () => _selectAndReturn(cityName, area),
                            borderRadius: BorderRadius.circular(16),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
                              child: Row(
                                children: [
                                  Icon(
                                    isSelected ? Icons.check_circle_rounded : Icons.place_outlined,
                                    size: 18,
                                    color: isSelected ? const Color(0xFF059669) : const Color(0xFF94A3B8),
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      area,
                                      style: TextStyle(
                                        fontSize: 13.5,
                                        fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                                        color: isSelected ? const Color(0xFF059669) : const Color(0xFF1E293B),
                                      ),
                                    ),
                                  ),
                                  if (isSelected)
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2.5),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFDCFCE7),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: const Text(
                                        'SELECTED',
                                        style: TextStyle(
                                          fontSize: 9.5,
                                          fontWeight: FontWeight.w900,
                                          color: Color(0xFF059669),
                                        ),
                                      ),
                                    )
                                  else
                                    const Icon(Icons.arrow_forward_ios_rounded, size: 12, color: Color(0xFFCBD5E1)),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                );
              }),

            const SizedBox(height: 20),

            // Service Guarantee Banner
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.verified_rounded, size: 14, color: Color(0xFF059669)),
                  SizedBox(width: 6),
                  Flexible(
                    child: Text(
                      'Free Doorstep Inspection & Pickup in All Supported Localities',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF64748B)),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
