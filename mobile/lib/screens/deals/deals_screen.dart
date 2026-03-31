import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../models/deal.dart';
import '../../providers/providers.dart';

class DealsScreen extends ConsumerWidget {
  const DealsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dealsAsync = ref.watch(dealsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Deals'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.view_agenda_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: dealsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: Colors.red),
              const SizedBox(height: 16),
              Text('Error: $error'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => ref.invalidate(dealsProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (deals) {
          if (deals.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.handshake_outlined, size: 64, color: Colors.grey[400]),
                  const SizedBox(height: 16),
                  Text(
                    'No deals yet',
                    style: TextStyle(fontSize: 18, color: Colors.grey[600]),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Create your first deal',
                    style: TextStyle(color: Colors.grey[500]),
                  ),
                ],
              ),
            );
          }

          // Group deals by stage (placeholder stages for demo)
          return _DealsKanban(deals: deals);
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddDealDialog(context, ref),
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showAddDealDialog(BuildContext context, WidgetRef ref) {
    final titleController = TextEditingController();
    final amountController = TextEditingController();

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Padding(
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
              'Add Deal',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: titleController,
              decoration: const InputDecoration(
                labelText: 'Deal Title',
                prefixIcon: Icon(Icons.handshake_outlined),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: amountController,
              decoration: const InputDecoration(
                labelText: 'Amount',
                prefixIcon: Icon(Icons.attach_money),
              ),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: () async {
                if (titleController.text.isNotEmpty) {
                  // TODO: Create deal via provider
                  if (context.mounted) Navigator.pop(context);
                }
              },
              child: const Text('Add Deal'),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}

class _DealsKanban extends StatelessWidget {
  final List<Deal> deals;

  const _DealsKanban({required this.deals});

  // Demo stages
  static const stages = [
    {'id': '1', 'name': 'Lead', 'color': Colors.grey},
    {'id': '2', 'name': 'Qualified', 'color': Colors.blue},
    {'id': '3', 'name': 'Proposal', 'color': Colors.orange},
    {'id': '4', 'name': 'Won', 'color': Colors.green},
    {'id': '5', 'name': 'Lost', 'color': Colors.red},
  ];

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.all(16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: stages.map((stage) {
          final stageDeals = deals.where((d) => d.stageId == stage['id']).toList();
          return _KanbanColumn(
            name: stage['name'] as String,
            color: stage['color'] as Color,
            deals: stageDeals,
          );
        }).toList(),
      ),
    );
  }
}

class _KanbanColumn extends StatelessWidget {
  final String name;
  final Color color;
  final List<Deal> deals;

  const _KanbanColumn({
    required this.name,
    required this.color,
    required this.deals,
  });

  @override
  Widget build(BuildContext context) {
    final formatter = NumberFormat.currency(symbol: '\$', decimalDigits: 0);

    return Container(
      width: 280,
      margin: const EdgeInsets.only(right: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Stage Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  name,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    deals.length.toString(),
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: color,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),

          // Deal Cards
          ...deals.map((deal) => Draggable<Deal>(
                data: deal,
                feedback: Material(
                  elevation: 4,
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    width: 260,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(deal.title),
                  ),
                ),
                childWhenDragging: Opacity(
                  opacity: 0.5,
                  child: _DealCard(deal: deal, formatter: formatter),
                ),
                child: _DealCard(deal: deal, formatter: formatter),
              )),
        ],
      ),
    );
  }
}

class _DealCard extends StatelessWidget {
  final Deal deal;
  final NumberFormat formatter;

  const _DealCard({required this.deal, required this.formatter});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: InkWell(
        onTap: () {
          // TODO: Navigate to deal detail
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                deal.title,
                style: const TextStyle(fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    formatter.format(deal.amount),
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.green,
                    ),
                  ),
                  Text(
                    '${deal.probability}%',
                    style: TextStyle(
                      color: Colors.grey[600],
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
