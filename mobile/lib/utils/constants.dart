import 'package:flutter/material.dart';

/// App color constants
class AppColors {
  // Primary brand colors
  static const primary = Color(0xFF6366F1);
  static const primaryLight = Color(0xFF818CF8);
  static const primaryDark = Color(0xFF4F46E5);

  // Status colors
  static const success = Color(0xFF22C55E);
  static const warning = Color(0xFFF59E0B);
  static const error = Color(0xFFEF4444);
  static const info = Color(0xFF3B82F6);

  // Priority colors
  static const priorityUrgent = Color(0xFFEF4444);
  static const priorityHigh = Color(0xFFF59E0B);
  static const priorityMedium = Color(0xFF3B82F6);
  static const priorityLow = Color(0xFF9CA3AF);

  // Deal stage colors
  static const stageLead = Color(0xFF9CA3AF);
  static const stageQualified = Color(0xFF3B82F6);
  static const stageProposal = Color(0xFFF59E0B);
  static const stageWon = Color(0xFF22C55E);
  static const stageLost = Color(0xFFEF4444);
}

/// App text styles
class AppTextStyles {
  static const heading1 = TextStyle(
    fontSize: 28,
    fontWeight: FontWeight.bold,
  );

  static const heading2 = TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.bold,
  );

  static const heading3 = TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.w600,
  );

  static const subtitle = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w500,
  );

  static const body = TextStyle(
    fontSize: 14,
  );

  static const caption = TextStyle(
    fontSize: 12,
    color: Colors.grey,
  );
}

/// App spacing constants
class AppSpacing {
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 16;
  static const double lg = 24;
  static const double xl = 32;
  static const double xxl = 48;
}

/// App border radius constants
class AppRadius {
  static const sm = BorderRadius.all(Radius.circular(4));
  static const md = BorderRadius.all(Radius.circular(8));
  static const lg = BorderRadius.all(Radius.circular(12));
  static const xl = BorderRadius.all(Radius.circular(16));
  static const full = BorderRadius.all(Radius.circular(999));
}
