import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../models/event.dart';
import '../../providers/providers.dart';

class CalendarScreen extends ConsumerStatefulWidget {
  const CalendarScreen({super.key});

  @override
  ConsumerState<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends ConsumerState<CalendarScreen> {
  DateTime _selectedDate = DateTime.now();
  late DateTime _focusedMonth;

  @override
  void initState() {
    super.initState();
    _focusedMonth = DateTime(_selectedDate.year, _selectedDate.month);
  }

  @override
  Widget build(BuildContext context) {
    final eventsAsync = ref.watch(eventsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Calendar'),
        actions: [
          IconButton(
            icon: const Icon(Icons.today),
            onPressed: () {
              setState(() {
                _selectedDate = DateTime.now();
                _focusedMonth = DateTime.now();
              });
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Calendar Header
          _CalendarHeader(
            focusedMonth: _focusedMonth,
            onPreviousMonth: () {
              setState(() {
                _focusedMonth = DateTime(_focusedMonth.year, _focusedMonth.month - 1);
              });
            },
            onNextMonth: () {
              setState(() {
                _focusedMonth = DateTime(_focusedMonth.year, _focusedMonth.month + 1);
              });
            },
          ),

          // Calendar Grid
          _CalendarGrid(
            focusedMonth: _focusedMonth,
            selectedDate: _selectedDate,
            events: eventsAsync.valueOrNull ?? [],
            onDateSelected: (date) {
              setState(() => _selectedDate = date);
            },
          ),

          const Divider(),

          // Events for Selected Date
          Expanded(
            child: _EventsList(
              selectedDate: _selectedDate,
              events: eventsAsync.valueOrNull ?? [],
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddEventDialog(context),
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showAddEventDialog(BuildContext context) {
    final titleController = TextEditingController();
    DateTime startTime = _selectedDate;
    DateTime endTime = _selectedDate.add(const Duration(hours: 1));

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
            left: 16,
            right: 16,
            top: 16,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Add Event',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: titleController,
                decoration: const InputDecoration(
                  labelText: 'Event Title',
                  prefixIcon: Icon(Icons.event_outlined),
                ),
              ),
              const SizedBox(height: 12),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.access_time),
                title: const Text('Start'),
                subtitle: Text(DateFormat('MMM d, h:mm a').format(startTime)),
                onTap: () async {
                  final time = await showTimePicker(
                    context: context,
                    initialTime: TimeOfDay.fromDateTime(startTime),
                  );
                  if (time != null) {
                    setState(() {
                      startTime = DateTime(
                        startTime.year,
                        startTime.month,
                        startTime.day,
                        time.hour,
                        time.minute,
                      );
                    });
                  }
                },
              ),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.access_time),
                title: const Text('End'),
                subtitle: Text(DateFormat('MMM d, h:mm a').format(endTime)),
                onTap: () async {
                  final time = await showTimePicker(
                    context: context,
                    initialTime: TimeOfDay.fromDateTime(endTime),
                  );
                  if (time != null) {
                    setState(() {
                      endTime = DateTime(
                        endTime.year,
                        endTime.month,
                        endTime.day,
                        time.hour,
                        time.minute,
                      );
                    });
                  }
                },
              ),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: () async {
                  if (titleController.text.isNotEmpty) {
                    // TODO: Create event via provider
                    if (context.mounted) Navigator.pop(context);
                  }
                },
                child: const Text('Add Event'),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}

class _CalendarHeader extends StatelessWidget {
  final DateTime focusedMonth;
  final VoidCallback onPreviousMonth;
  final VoidCallback onNextMonth;

  const _CalendarHeader({
    required this.focusedMonth,
    required this.onPreviousMonth,
    required this.onNextMonth,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          IconButton(
            icon: const Icon(Icons.chevron_left),
            onPressed: onPreviousMonth,
          ),
          Text(
            DateFormat('MMMM yyyy').format(focusedMonth),
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          IconButton(
            icon: const Icon(Icons.chevron_right),
            onPressed: onNextMonth,
          ),
        ],
      ),
    );
  }
}

class _CalendarGrid extends StatelessWidget {
  final DateTime focusedMonth;
  final DateTime selectedDate;
  final List<Event> events;
  final Function(DateTime) onDateSelected;

  const _CalendarGrid({
    required this.focusedMonth,
    required this.selectedDate,
    required this.events,
    required this.onDateSelected,
  });

  @override
  Widget build(BuildContext context) {
    final firstDayOfMonth = DateTime(focusedMonth.year, focusedMonth.month, 1);
    final lastDayOfMonth = DateTime(focusedMonth.year, focusedMonth.month + 1, 0);
    final firstWeekday = firstDayOfMonth.weekday % 7;
    final daysInMonth = lastDayOfMonth.day;

    // Day names
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return Column(
      children: [
        // Day names header
        Row(
          children: dayNames.map((day) {
            return Expanded(
              child: Center(
                child: Text(
                  day,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: Colors.grey[600],
                    fontSize: 12,
                  ),
                ),
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 8),

        // Calendar days
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 8),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 7,
            childAspectRatio: 1,
          ),
          itemCount: 42, // 6 weeks
          itemBuilder: (context, index) {
            final dayOffset = index - firstWeekday;
            final date = firstDayOfMonth.add(Duration(days: dayOffset));

            if (dayOffset < 0 || dayOffset >= daysInMonth) {
              return const SizedBox();
            }

            final isSelected = date.year == selectedDate.year &&
                date.month == selectedDate.month &&
                date.day == selectedDate.day;

            final isToday = date.year == DateTime.now().year &&
                date.month == DateTime.now().month &&
                date.day == DateTime.now().day;

            final hasEvents = events.any((e) =>
                e.startAt.year == date.year &&
                e.startAt.month == date.month &&
                e.startAt.day == date.day);

            return InkWell(
              onTap: () => onDateSelected(date),
              borderRadius: BorderRadius.circular(8),
              child: Container(
                margin: const EdgeInsets.all(2),
                decoration: BoxDecoration(
                  color: isSelected
                      ? Theme.of(context).colorScheme.primary
                      : isToday
                          ? Theme.of(context).colorScheme.primaryContainer
                          : null,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      date.day.toString(),
                      style: TextStyle(
                        fontWeight: isSelected || isToday ? FontWeight.bold : null,
                        color: isSelected
                            ? Colors.white
                            : isToday
                                ? Theme.of(context).colorScheme.onPrimaryContainer
                                : null,
                      ),
                    ),
                    if (hasEvents)
                      Container(
                        width: 4,
                        height: 4,
                        margin: const EdgeInsets.only(top: 2),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isSelected
                              ? Colors.white
                              : Theme.of(context).colorScheme.primary,
                        ),
                      ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }
}

class _EventsList extends StatelessWidget {
  final DateTime selectedDate;
  final List<Event> events;

  const _EventsList({
    required this.selectedDate,
    required this.events,
  });

  @override
  Widget build(BuildContext context) {
    final dayEvents = events.where((e) =>
        e.startAt.year == selectedDate.year &&
        e.startAt.month == selectedDate.month &&
        e.startAt.day == selectedDate.day).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
          child: Text(
            DateFormat('EEEE, MMMM d').format(selectedDate),
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
        ),
        Expanded(
          child: dayEvents.isEmpty
              ? Center(
                  child: Text(
                    'No events for this day',
                    style: TextStyle(color: Colors.grey[500]),
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: dayEvents.length,
                  itemBuilder: (context, index) {
                    final event = dayEvents[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        leading: Container(
                          width: 4,
                          height: 40,
                          decoration: BoxDecoration(
                            color: Theme.of(context).colorScheme.primary,
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                        title: Text(event.title),
                        subtitle: Text(
                          '${DateFormat('h:mm a').format(event.startAt)} - ${event.endAt != null ? DateFormat('h:mm a').format(event.endAt!) : 'TBD'}',
                        ),
                        trailing: event.location != null
                            ? const Icon(Icons.location_on_outlined, size: 16)
                            : null,
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }
}
