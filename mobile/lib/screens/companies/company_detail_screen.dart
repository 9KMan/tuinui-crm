import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../models/company.dart';
import '../../providers/providers.dart';

class CompanyDetailScreen extends ConsumerStatefulWidget {
  final String companyId;

  const CompanyDetailScreen({super.key, required this.companyId});

  @override
  ConsumerState<CompanyDetailScreen> createState() => _CompanyDetailScreenState();
}

class _CompanyDetailScreenState extends ConsumerState<CompanyDetailScreen> {
  Company? _company;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCompany();
  }

  Future<void> _loadCompany() async {
    setState(() => _isLoading = true);
    final company = await ref.read(companiesProvider.notifier).getCompany(widget.companyId);
    setState(() {
      _company = company;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(title: const Text('Company')),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (_company == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Company')),
        body: const Center(child: Text('Company not found')),
      );
    }

    final company = _company!;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Company Details'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_outlined),
            onPressed: () {},
          ),
          PopupMenuButton<String>(
            onSelected: (value) {
              // TODO: Delete company
            },
            itemBuilder: (context) => [
              const PopupMenuItem(value: 'delete', child: Text('Delete')),
            ],
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Company Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.green.withOpacity(0.1),
              ),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 48,
                    backgroundColor: Colors.green,
                    child: Text(
                      company.name.isNotEmpty ? company.name[0].toUpperCase() : '?',
                      style: const TextStyle(
                        fontSize: 36,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    company.name,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  if (company.industry != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      company.industry!,
                      style: TextStyle(color: Colors.grey[600]),
                    ),
                  ],
                ],
              ),
            ),

            // Company Info Cards
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  if (company.domain != null)
                    _InfoCard(
                      icon: Icons.language_outlined,
                      title: 'Domain',
                      value: company.domain!,
                    ),
                  if (company.size != null)
                    _InfoCard(
                      icon: Icons.groups_outlined,
                      title: 'Company Size',
                      value: company.size!,
                    ),
                  if (company.address != null)
                    _InfoCard(
                      icon: Icons.location_on_outlined,
                      title: 'Address',
                      value: company.address!,
                    ),
                ],
              ),
            ),

            // Linked Contacts
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Contacts',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 12),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Center(
                        child: Text(
                          'No contacts linked',
                          style: TextStyle(color: Colors.grey[500]),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;

  const _InfoCard({
    required this.icon,
    required this.title,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(icon, color: Colors.green),
        title: Text(title, style: const TextStyle(fontSize: 12, color: Colors.grey)),
        subtitle: Text(
          value,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
        ),
      ),
    );
  }
}
