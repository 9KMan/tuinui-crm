import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../providers/providers.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final contactsAsync = ref.watch(contactsProvider);
    final companiesAsync = ref.watch(companiesProvider);
    final dealsAsync = ref.watch(dealsProvider);
    final tasksAsync = ref.watch(tasksProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(contactsProvider);
          ref.invalidate(companiesProvider);
          ref.invalidate(dealsProvider);
          ref.invalidate(tasksProvider);
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Welcome Card
              _WelcomeCard(date: DateTime.now()),
              const SizedBox(height: 24),

              // Stats Grid
              _StatsGrid(
                contactsCount: contactsAsync.valueOrNull?.length ?? 0,
                companiesCount: companiesAsync.valueOrNull?.length ?? 0,
                dealsCount: dealsAsync.valueOrNull?.length ?? 0,
                tasksCount: tasksAsync.valueOrNull?.where((t) => t.status != TaskStatus.done).length ?? 0,
              ),
              const SizedBox(height: 24),

              // Tasks Due Today
              _TasksDueSection(tasks: tasksAsync.valueOrNull ?? []),
              const SizedBox(height: 24),

              // Recent Deals
              _RecentDealsSection(deals: dealsAsync.valueOrNull ?? []),
              const SizedBox(height: 24),

              // Recent Contacts
              _RecentContactsSection(contacts: contactsAsync.valueOrNull ?? []),
            ],
          ),
        ),
      ),
    );
  }
}

class _WelcomeCard extends StatelessWidget {
  final DateTime date;

  const _WelcomeCard({required this.date});

  @override
  Widget build(BuildContext context) {
    final greeting = _getGreeting(date.hour);
    final formattedDate = DateFormat('EEEE, MMMM d').format(date);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Theme.of(context).colorScheme.primary,
            Theme.of(context).colorScheme.secondary,
          ],
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            greeting,
            style: const TextStyle(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            formattedDate,
            style: TextStyle(
              fontSize: 16,
              color: Colors.white.withOpacity(0.9),
            ),
          ),
        ],
      ),
    );
  }

  String _getGreeting(int hour) {
    if (hour < 12) return 'Good Morning!';
    if (hour < 17) return 'Good Afternoon!';
    return 'Good Evening!';
  }
}

class _StatsGrid extends StatelessWidget {
  final int contactsCount;
  final int companiesCount;
  final int dealsCount;
  final int tasksCount;

  const _StatsGrid({
    required this.contactsCount,
    required this.companiesCount,
    required this.dealsCount,
    required this.tasksCount,
  });

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.5,
      children: [
        _StatCard(
          title: 'Contacts',
          count: contactsCount,
          icon: Icons.people_outline,
          color: Colors.blue,
        ),
        _StatCard(
          title: 'Companies',
          count: companiesCount,
          icon: Icons.business_outlined,
          color: Colors.green,
        ),
        _StatCard(
          title: 'Deals',
          count: dealsCount,
          icon: Icons.handshake_outlined,
          color: Colors.orange,
        ),
        _StatCard(
          title: 'Tasks',
          count: tasksCount,
          icon: Icons.task_alt_outlined,
          color: Colors.purple,
        ),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final int count;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.title,
    required this.count,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Icon(icon, color: color, size: 28),
                Text(
                  count.toString(),
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: TextStyle(
                color: Colors.grey[600],
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TasksDueSection extends StatelessWidget {
  final List tasks;

  const _TasksDueSection({required this.tasks});

  @override
  Widget build(BuildContext context) {
    final today = DateTime.now();
    final dueToday = tasks.where((task) {
      if (task.dueDate == null) return false;
      return task.dueDate!.year == today.year &&
          task.dueDate!.month == today.month &&
          task.dueDate!.day == today.day;
    }).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Tasks Due Today',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            TextButton(
              onPressed: () {},
              child: const Text('View All'),
            ),
          ],
        ),
        if (dueToday.isEmpty)
          Card(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Center(
                child: Text(
                  'No tasks due today',
                  style: TextStyle(color: Colors.grey[500]),
                ),
              ),
            ),
          )
        else
          ...dueToday.take(3).map((task) => _TaskItem(task: task)),
      ],
    );
  }
}

class _TaskItem extends StatelessWidget {
  final dynamic task;

  const _TaskItem({required this.task});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(
          Icons.check_circle_outline,
          color: _getPriorityColor(task.priority.name),
        ),
        title: Text(task.title),
        subtitle: Text(
          task.dueDate != null ? DateFormat('h:mm a').format(task.dueDate!) : '',
        ),
        trailing: _PriorityBadge(priority: task.priority.name),
      ),
    );
  }

  Color _getPriorityColor(String priority) {
    switch (priority) {
      case 'urgent':
        return Colors.red;
      case 'high':
        return Colors.orange;
      case 'medium':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }
}

class _PriorityBadge extends StatelessWidget {
  final String priority;

  const _PriorityBadge({required this.priority});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: _getPriorityColor().withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        priority.toUpperCase(),
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.bold,
          color: _getPriorityColor(),
        ),
      ),
    );
  }

  Color _getPriorityColor() {
    switch (priority) {
      case 'urgent':
        return Colors.red;
      case 'high':
        return Colors.orange;
      case 'medium':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }
}

class _RecentDealsSection extends StatelessWidget {
  final List deals;

  const _RecentDealsSection({required this.deals});

  @override
  Widget build(BuildContext context) {
    final recentDeals = deals.take(5).toList();
    final formatter = NumberFormat.currency(symbol: '\$');

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Recent Deals',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            TextButton(
              onPressed: () {},
              child: const Text('View All'),
            ),
          ],
        ),
        if (recentDeals.isEmpty)
          Card(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Center(
                child: Text(
                  'No deals yet',
                  style: TextStyle(color: Colors.grey[500]),
                ),
              ),
            ),
          )
        else
          Card(
            child: ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: recentDeals.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (context, index) {
                final deal = recentDeals[index];
                return ListTile(
                  leading: CircleAvatar(
                    backgroundColor: Colors.orange.withOpacity(0.1),
                    child: const Icon(Icons.handshake, color: Colors.orange),
                  ),
                  title: Text(deal.title),
                  subtitle: Text(deal.companyId ?? 'No company'),
                  trailing: Text(
                    formatter.format(deal.amount),
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.green,
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

class _RecentContactsSection extends StatelessWidget {
  final List contacts;

  const _RecentContactsSection({required this.contacts});

  @override
  Widget build(BuildContext context) {
    final recentContacts = contacts.take(5).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Recent Contacts',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            TextButton(
              onPressed: () {},
              child: const Text('View All'),
            ),
          ],
        ),
        if (recentContacts.isEmpty)
          Card(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Center(
                child: Text(
                  'No contacts yet',
                  style: TextStyle(color: Colors.grey[500]),
                ),
              ),
            ),
          )
        else
          Card(
            child: ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: recentContacts.length,
              separatorBuilder: (_, __) => const Divider(height: 1),
              itemBuilder: (context, index) {
                final contact = recentContacts[index];
                return ListTile(
                  leading: CircleAvatar(
                    child: Text(
                      contact.name.isNotEmpty ? contact.name[0].toUpperCase() : '?',
                    ),
                  ),
                  title: Text(contact.name),
                  subtitle: Text(contact.email ?? contact.phone ?? ''),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {},
                );
              },
            ),
          ),
      ],
    );
  }
}
