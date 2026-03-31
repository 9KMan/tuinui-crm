import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../providers/providers.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDarkMode = ref.watch(themeModeProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: ListView(
        children: [
          // User Profile Section
          _SettingsSection(
            title: 'Profile',
            children: [
              ListTile(
                leading: CircleAvatar(
                  child: const Icon(Icons.person),
                ),
                title: const Text('John Doe'),
                subtitle: const Text('john@example.com'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {},
              ),
            ],
          ),

          // Appearance Section
          _SettingsSection(
            title: 'Appearance',
            children: [
              SwitchListTile(
                secondary: Icon(
                  isDarkMode ? Icons.dark_mode : Icons.light_mode,
                ),
                title: const Text('Dark Mode'),
                subtitle: Text(isDarkMode ? 'Dark theme enabled' : 'Light theme enabled'),
                value: isDarkMode,
                onChanged: (value) {
                  ref.read(themeModeProvider.notifier).state = value;
                },
              ),
            ],
          ),

          // Notifications Section
          _SettingsSection(
            title: 'Notifications',
            children: [
              SwitchListTile(
                secondary: const Icon(Icons.notifications_outlined),
                title: const Text('Push Notifications'),
                subtitle: const Text('Receive push notifications'),
                value: true,
                onChanged: (value) {},
              ),
              SwitchListTile(
                secondary: const Icon(Icons.email_outlined),
                title: const Text('Email Notifications'),
                subtitle: const Text('Receive email updates'),
                value: false,
                onChanged: (value) {},
              ),
            ],
          ),

          // Data & Storage Section
          _SettingsSection(
            title: 'Data & Storage',
            children: [
              ListTile(
                leading: const Icon(Icons.cloud_outlined),
                title: const Text('Sync Data'),
                subtitle: const Text('Last synced: Just now'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  ref.invalidate(contactsProvider);
                  ref.invalidate(companiesProvider);
                  ref.invalidate(dealsProvider);
                  ref.invalidate(tasksProvider);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Syncing data...')),
                  );
                },
              ),
              ListTile(
                leading: const Icon(Icons.storage_outlined),
                title: const Text('Clear Cache'),
                subtitle: const Text('Free up storage space'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  showDialog(
                    context: context,
                    builder: (context) => AlertDialog(
                      title: const Text('Clear Cache'),
                      content: const Text('This will remove cached data. Your data is safe on the server.'),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(context),
                          child: const Text('Cancel'),
                        ),
                        FilledButton(
                          onPressed: () {
                            Navigator.pop(context);
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Cache cleared')),
                            );
                          },
                          child: const Text('Clear'),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ],
          ),

          // About Section
          _SettingsSection(
            title: 'About',
            children: [
              ListTile(
                leading: const Icon(Icons.info_outlined),
                title: const Text('App Version'),
                subtitle: const Text('1.0.0'),
              ),
              ListTile(
                leading: const Icon(Icons.description_outlined),
                title: const Text('Terms of Service'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {},
              ),
              ListTile(
                leading: const Icon(Icons.privacy_tip_outlined),
                title: const Text('Privacy Policy'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {},
              ),
              ListTile(
                leading: const Icon(Icons.help_outline),
                title: const Text('Help & Support'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () {},
              ),
            ],
          ),

          // Logout Section
          Padding(
            padding: const EdgeInsets.all(16),
            child: OutlinedButton.icon(
              onPressed: () async {
                final confirmed = await showDialog<bool>(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text('Logout'),
                    content: const Text('Are you sure you want to logout?'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context, false),
                        child: const Text('Cancel'),
                      ),
                      FilledButton(
                        onPressed: () => Navigator.pop(context, true),
                        child: const Text('Logout'),
                      ),
                    ],
                  ),
                );
                if (confirmed == true) {
                  final apiClient = ref.read(apiClientProvider);
                  await apiClient.clearToken();
                  ref.read(isAuthenticatedProvider.notifier).state = false;
                }
              },
              icon: const Icon(Icons.logout, color: Colors.red),
              label: const Text('Logout', style: TextStyle(color: Colors.red)),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Colors.red),
              ),
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}

class _SettingsSection extends StatelessWidget {
  final String title;
  final List<Widget> children;

  const _SettingsSection({
    required this.title,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Text(
            title,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Theme.of(context).colorScheme.primary,
            ),
          ),
        ),
        Card(
          margin: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            children: children,
          ),
        ),
      ],
    );
  }
}
