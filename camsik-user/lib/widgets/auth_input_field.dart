import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class AuthInputField extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final IconData icon;
  final String hint;
  final FocusNode? focusNode;
  final TextInputType keyboardType;
  final TextCapitalization textCapitalization;
  final bool isPassword;
  final bool obscureText;
  final VoidCallback? onToggleVisibility;
  final List<TextInputFormatter>? inputFormatters;
  final int? maxLength;

  const AuthInputField({
    super.key,
    required this.label,
    required this.controller,
    required this.icon,
    required this.hint,
    this.focusNode,
    this.keyboardType = TextInputType.text,
    this.textCapitalization = TextCapitalization.none,
    this.isPassword = false,
    this.obscureText = false,
    this.onToggleVisibility,
    this.inputFormatters,
    this.maxLength,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600)),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          focusNode: focusNode,
          keyboardType: keyboardType,
          textCapitalization: textCapitalization,
          obscureText: isPassword ? obscureText : false,
          inputFormatters: inputFormatters,
          maxLength: maxLength,
          style: const TextStyle(color: Colors.white, fontSize: 14),
          decoration: InputDecoration(
            counterText: '',
            hintText: hint,
            hintStyle: const TextStyle(color: Colors.white30, fontSize: 13),
            prefixIcon: Icon(icon, color: const Color(0xFF34D399), size: 20),
            suffixIcon: isPassword
                ? IconButton(
                    icon: Icon(
                      obscureText ? Icons.visibility_off : Icons.visibility,
                      color: Colors.white54,
                      size: 20,
                    ),
                    onPressed: onToggleVisibility,
                  )
                : null,
            filled: true,
            fillColor: const Color(0xFF1E293B),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: Color(0xFF34D399), width: 1.5),
            ),
          ),
        ),
      ],
    );
  }
}
