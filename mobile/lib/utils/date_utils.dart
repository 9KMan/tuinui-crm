import 'package:intl/intl.dart';

/// Date formatting utilities
class DateUtils {
  static final DateFormat _dateFormat = DateFormat('MMM d, yyyy');
  static final DateFormat _timeFormat = DateFormat('h:mm a');
  static final DateFormat _dateTimeFormat = DateFormat('MMM d, yyyy h:mm a');
  static final DateFormat _apiFormat = DateFormat('yyyy-MM-dd');

  /// Format date for display (e.g., "Mar 29, 2026")
  static String formatDate(DateTime date) {
    return _dateFormat.format(date);
  }

  /// Format time for display (e.g., "2:30 PM")
  static String formatTime(DateTime time) {
    return _timeFormat.format(time);
  }

  /// Format date and time for display (e.g., "Mar 29, 2026 2:30 PM")
  static String formatDateTime(DateTime dateTime) {
    return _dateTimeFormat.format(dateTime);
  }

  /// Format date for API calls (e.g., "2026-03-29")
  static String formatForApi(DateTime date) {
    return _apiFormat.format(date);
  }

  /// Get relative time string (e.g., "2 hours ago", "Yesterday")
  static String getRelativeTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inDays > 7) {
      return formatDate(dateTime);
    } else if (difference.inDays > 1) {
      return '${difference.inDays} days ago';
    } else if (difference.inDays == 1) {
      return 'Yesterday';
    } else if (difference.inHours > 1) {
      return '${difference.inHours} hours ago';
    } else if (difference.inHours == 1) {
      return '1 hour ago';
    } else if (difference.inMinutes > 1) {
      return '${difference.inMinutes} minutes ago';
    } else {
      return 'Just now';
    }
  }

  /// Check if date is today
  static bool isToday(DateTime date) {
    final now = DateTime.now();
    return date.year == now.year && date.month == now.month && date.day == now.day;
  }

  /// Check if date is in the past
  static bool isPast(DateTime date) {
    return date.isBefore(DateTime.now());
  }

  /// Check if date is due today or overdue
  static bool isDueTodayOrOverdue(DateTime date) {
    final today = DateTime.now();
    final dateOnly = DateTime(date.year, date.month, date.day);
    final todayOnly = DateTime(today.year, today.month, today.day);
    return dateOnly.isBefore(todayOnly) || dateOnly.isAtSameMomentAs(todayOnly);
  }
}
