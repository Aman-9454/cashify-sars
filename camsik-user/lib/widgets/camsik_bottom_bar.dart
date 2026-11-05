import 'package:flutter/material.dart';

class CamsikBottomBar extends StatelessWidget {
  final int selectedIndex;
  final Function(int) onItemSelected;

  const CamsikBottomBar({
    super.key,
    required this.selectedIndex,
    required this.onItemSelected,
  });

  @override
  Widget build(BuildContext context) {
    final items = [
      _BarItem(icon: Icons.home_rounded, outlineIcon: Icons.home_outlined, label: 'Home', activeColor: const Color(0xFF059669)),
      _BarItem(icon: Icons.currency_rupee_rounded, outlineIcon: Icons.currency_rupee, label: 'Sell', activeColor: const Color(0xFF059669)),
      _BarItem(icon: Icons.shopping_bag_rounded, outlineIcon: Icons.shopping_bag_outlined, label: 'Buy', activeColor: const Color(0xFF4F46E5)),
      _BarItem(icon: Icons.swap_horiz_rounded, outlineIcon: Icons.swap_horiz_outlined, label: 'Exchange', activeColor: const Color(0xFF7C3AED)),
      _BarItem(icon: Icons.person_rounded, outlineIcon: Icons.person_outline_rounded, label: 'Profile', activeColor: const Color(0xFF0F172A)),
    ];

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: const Border(
          top: BorderSide(color: Color(0xFFF1F5F9), width: 1),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 16,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: List.generate(items.length, (index) {
              final isSelected = selectedIndex == index;
              final item = items[index];

              return Expanded(
                child: InkWell(
                  onTap: () => onItemSelected(index),
                  borderRadius: BorderRadius.circular(16),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 220),
                    curve: Curves.easeOutCubic,
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 220),
                          padding: EdgeInsets.symmetric(
                            horizontal: isSelected ? 16 : 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? item.activeColor.withValues(alpha: 0.12)
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(
                            isSelected ? item.icon : item.outlineIcon,
                            size: 22,
                            color: isSelected ? item.activeColor : const Color(0xFF64748B),
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          item.label,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: isSelected ? FontWeight.w800 : FontWeight.w500,
                            color: isSelected ? item.activeColor : const Color(0xFF64748B),
                            letterSpacing: -0.2,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}

class _BarItem {
  final IconData icon;
  final IconData outlineIcon;
  final String label;
  final Color activeColor;

  const _BarItem({
    required this.icon,
    required this.outlineIcon,
    required this.label,
    required this.activeColor,
  });
}

