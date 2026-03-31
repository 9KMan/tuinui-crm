import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import 'api/client.dart';
import 'providers/providers.dart';
import 'screens/dashboard/dashboard_screen.dart';
import 'screens/contacts/contacts_list_screen.dart';
import 'screens/contacts/contact_detail_screen.dart';
import 'screens/companies/companies_list_screen.dart';
import 'screens/companies/company_detail_screen.dart';
import 'screens/deals/deals_screen.dart';
import 'screens/tasks/tasks_screen.dart';
import 'screens/calendar/calendar_screen.dart';
import 'screens/settings/settings_screen.dart';
import 'widgets/app_shell.dart';

const secureStorage = FlutterSecureStorage();

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Hive for offline storage
  await Hive.initFlutter();
  
  // Open Hive boxes
  await Hive.openBox('contacts');
  await Hive.openBox('companies');
  await Hive.openBox('deals');
  await Hive.openBox('tasks');
  await Hive.openBox('settings');
  
  runApp(const ProviderScope(child: TwentyStyleCRMApp()));
}

class TwentyStyleCRMApp extends ConsumerStatefulWidget {
  const TwentyStyleCRMApp({super.key});

  @override
  ConsumerState<TwentyStyleCRMApp> createState() => _TwentyStyleCRMAppState();
}

class _TwentyStyleCRMAppState extends ConsumerState<TwentyStyleCRMApp> {
  late final ApiClient _apiClient;
  bool _isInitialized = false;

  @override
  void initState() {
    super.initState();
    _initializeApp();
  }

  Future<void> _initializeApp() async {
    // Get stored token
    final token = await secureStorage.read(key: 'access_token');
    
    _apiClient = ApiClient(
      baseUrl: 'http://localhost:3000/api/v1',
      token: token,
    );
    
    // Initialize API client in providers
    ref.read(apiClientProvider.notifier).state = _apiClient;
    
    // Try to authenticate (will silently fail if no token)
    if (token != null) {
      try {
        await _apiClient.get('/auth/me');
        ref.read(isAuthenticatedProvider.notifier).state = true;
      } catch (_) {
        // Token invalid, stay unauthenticated
      }
    }
    
    setState(() => _isInitialized = true);
  }

  @override
  Widget build(BuildContext context) {
    if (!_isInitialized) {
      return const MaterialApp(
        home: Scaffold(
          body: Center(child: CircularProgressIndicator()),
        ),
      );
    }

    return MaterialApp.router(
      title: 'Twenty Style CRM',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6366F1),
          brightness: Brightness.light,
        ),
        appBarTheme: const AppBarTheme(centerTitle: true),
        cardTheme: CardTheme(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: BorderSide(color: Colors.grey.shade200),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.grey.shade50,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.grey.shade200),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFF6366F1), width: 2),
          ),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        ),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6366F1),
          brightness: Brightness.dark,
        ),
      ),
      routerConfig: _router,
    );
  }

  static final _router = GoRouter(
    initialLocation: '/dashboard',
    routes: [
      ShellRoute(
        builder: (context, state, child) => AppShell(child: child),
        routes: [
          GoRoute(
            path: '/dashboard',
            name: 'dashboard',
            builder: (context, state) => const DashboardScreen(),
          ),
          GoRoute(
            path: '/contacts',
            name: 'contacts',
            builder: (context, state) => const ContactsListScreen(),
            routes: [
              GoRoute(
                path: ':id',
                name: 'contact-detail',
                builder: (context, state) => ContactDetailScreen(
                  contactId: state.pathParameters['id']!,
                ),
              ),
            ],
          ),
          GoRoute(
            path: '/companies',
            name: 'companies',
            builder: (context, state) => const CompaniesListScreen(),
            routes: [
              GoRoute(
                path: ':id',
                name: 'company-detail',
                builder: (context, state) => CompanyDetailScreen(
                  companyId: state.pathParameters['id']!,
                ),
              ),
            ],
          ),
          GoRoute(
            path: '/deals',
            name: 'deals',
            builder: (context, state) => const DealsScreen(),
          ),
          GoRoute(
            path: '/tasks',
            name: 'tasks',
            builder: (context, state) => const TasksScreen(),
          ),
          GoRoute(
            path: '/calendar',
            name: 'calendar',
            builder: (context, state) => const CalendarScreen(),
          ),
          GoRoute(
            path: '/settings',
            name: 'settings',
            builder: (context, state) => const SettingsScreen(),
          ),
        ],
      ),
    ],
  );
}
