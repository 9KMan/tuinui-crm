import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../models/company.dart';
import '../../providers/providers.dart';

class CompaniesListScreen extends ConsumerWidget {
  const CompaniesListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final companiesAsync = ref.watch(companiesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Companies'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {},
          ),
        ],
      ),
      body: companiesAsync.when(
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
                onPressed: () => ref.invalidate(companiesProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (companies) {
          if (companies.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.business_outlined, size: 64, color: Colors.grey[400]),
                  const SizedBox(height: 16),
                  Text(
                    'No companies yet',
                    style: TextStyle(fontSize: 18, color: Colors.grey[600]),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Add your first company',
                    style: TextStyle(color: Colors.grey[500]),
                  ),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(companiesProvider),
            child: ListView.builder(
              padding: const EdgeInsets.only(bottom: 80),
              itemCount: companies.length,
              itemBuilder: (context, index) {
                final company = companies[index];
                return _CompanyListItem(company: company);
              },
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddCompanyDialog(context, ref),
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showAddCompanyDialog(BuildContext context, WidgetRef ref) {
    final nameController = TextEditingController();
    final domainController = TextEditingController();
    final industryController = TextEditingController();

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
              'Add Company',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: nameController,
              decoration: const InputDecoration(
                labelText: 'Company Name',
                prefixIcon: Icon(Icons.business_outlined),
              ),
              textCapitalization: TextCapitalization.words,
            ),
            const SizedBox(height: 12),
            TextField(
              controller: domainController,
              decoration: const InputDecoration(
                labelText: 'Domain',
                prefixIcon: Icon(Icons.language_outlined),
              ),
              keyboardType: TextInputType.url,
            ),
            const SizedBox(height: 12),
            TextField(
              controller: industryController,
              decoration: const InputDecoration(
                labelText: 'Industry',
                prefixIcon: Icon(Icons.category_outlined),
              ),
            ),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: () async {
                if (nameController.text.isNotEmpty) {
                  // TODO: Create company via provider
                  if (context.mounted) Navigator.pop(context);
                }
              },
              child: const Text('Add Company'),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}

class _CompanyListItem extends StatelessWidget {
  final Company company;

  const _CompanyListItem({required this.company});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Colors.green.withOpacity(0.1),
          child: const Icon(Icons.business, color: Colors.green),
        ),
        title: Text(
          company.name,
          style: const TextStyle(fontWeight: FontWeight.w500),
        ),
        subtitle: Text(
          company.industry ?? company.domain ?? '',
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        trailing: const Icon(Icons.chevron_right),
        onTap: () => context.push('/companies/${company.id}'),
      ),
    );
  }
}
