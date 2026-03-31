import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../api/client.dart';
import '../models/contact.dart';
import '../models/company.dart';
import '../models/deal.dart';
import '../models/task.dart';
import '../models/event.dart';

// API Client Provider
final apiClientProvider = StateProvider<ApiClient>((ref) {
  throw UnimplementedError('API Client must be initialized before use');
});

// Auth State
final isAuthenticatedProvider = StateProvider<bool>((ref) => false);

// Contacts Providers
final contactsProvider = StateNotifierProvider<ContactsNotifier, AsyncValue<List<Contact>>>((ref) {
  return ContactsNotifier(ref);
});

class ContactsNotifier extends StateNotifier<AsyncValue<List<Contact>>> {
  final Ref _ref;

  ContactsNotifier(this._ref) : super(const AsyncValue.loading()) {
    loadContacts();
  }

  Future<void> loadContacts() async {
    state = const AsyncValue.loading();
    try {
      final api = _ref.read(apiClientProvider);
      final response = await api.get<List<dynamic>>('/contacts');
      final contacts = (response.data ?? []).map((e) => Contact.fromJson(e as Map<String, dynamic>)).toList();
      
      // Cache in Hive
      final box = Hive.box('contacts');
      for (final contact in contacts) {
        await box.put(contact.id, contact.toJson());
      }
      
      state = AsyncValue.data(contacts);
    } catch (e, st) {
      // Try to load from cache on error
      try {
        final box = Hive.box('contacts');
        final cached = box.values.map((e) => Contact.fromJson(Map<String, dynamic>.from(e as Map))).toList();
        state = AsyncValue.data(cached);
      } catch (_) {
        state = AsyncValue.error(e, st);
      }
    }
  }

  Future<Contact?> getContact(String id) async {
    try {
      final api = _ref.read(apiClientProvider);
      final response = await api.get<Map<String, dynamic>>('/contacts/$id');
      return Contact.fromJson(response.data!);
    } catch (_) {
      // Try cache
      final box = Hive.box('contacts');
      final cached = box.get(id);
      if (cached != null) {
        return Contact.fromJson(Map<String, dynamic>.from(cached as Map));
      }
    }
    return null;
  }

  Future<void> createContact(Map<String, dynamic> data) async {
    final api = _ref.read(apiClientProvider);
    await api.post('/contacts', data: data);
    await loadContacts();
  }

  Future<void> updateContact(String id, Map<String, dynamic> data) async {
    final api = _ref.read(apiClientProvider);
    await api.put('/contacts/$id', data: data);
    await loadContacts();
  }

  Future<void> deleteContact(String id) async {
    final api = _ref.read(apiClientProvider);
    await api.delete('/contacts/$id');
    await loadContacts();
  }
}

// Companies Providers
final companiesProvider = StateNotifierProvider<CompaniesNotifier, AsyncValue<List<Company>>>((ref) {
  return CompaniesNotifier(ref);
});

class CompaniesNotifier extends StateNotifier<AsyncValue<List<Company>>> {
  final Ref _ref;

  CompaniesNotifier(this._ref) : super(const AsyncValue.loading()) {
    loadCompanies();
  }

  Future<void> loadCompanies() async {
    state = const AsyncValue.loading();
    try {
      final api = _ref.read(apiClientProvider);
      final response = await api.get<List<dynamic>>('/companies');
      final companies = (response.data ?? []).map((e) => Company.fromJson(e as Map<String, dynamic>)).toList();
      
      final box = Hive.box('companies');
      for (final company in companies) {
        await box.put(company.id, company.toJson());
      }
      
      state = AsyncValue.data(companies);
    } catch (e, st) {
      try {
        final box = Hive.box('companies');
        final cached = box.values.map((e) => Company.fromJson(Map<String, dynamic>.from(e as Map))).toList();
        state = AsyncValue.data(cached);
      } catch (_) {
        state = AsyncValue.error(e, st);
      }
    }
  }

  Future<Company?> getCompany(String id) async {
    try {
      final api = _ref.read(apiClientProvider);
      final response = await api.get<Map<String, dynamic>>('/companies/$id');
      return Company.fromJson(response.data!);
    } catch (_) {
      final box = Hive.box('companies');
      final cached = box.get(id);
      if (cached != null) {
        return Company.fromJson(Map<String, dynamic>.from(cached as Map));
      }
    }
    return null;
  }
}

// Deals Providers
final dealsProvider = StateNotifierProvider<DealsNotifier, AsyncValue<List<Deal>>>((ref) {
  return DealsNotifier(ref);
});

class DealsNotifier extends StateNotifier<AsyncValue<List<Deal>>> {
  final Ref _ref;

  DealsNotifier(this._ref) : super(const AsyncValue.loading()) {
    loadDeals();
  }

  Future<void> loadDeals() async {
    state = const AsyncValue.loading();
    try {
      final api = _ref.read(apiClientProvider);
      final response = await api.get<List<dynamic>>('/deals');
      final deals = (response.data ?? []).map((e) => Deal.fromJson(e as Map<String, dynamic>)).toList();
      
      final box = Hive.box('deals');
      for (final deal in deals) {
        await box.put(deal.id, deal.toJson());
      }
      
      state = AsyncValue.data(deals);
    } catch (e, st) {
      try {
        final box = Hive.box('deals');
        final cached = box.values.map((e) => Deal.fromJson(Map<String, dynamic>.from(e as Map))).toList();
        state = AsyncValue.data(cached);
      } catch (_) {
        state = AsyncValue.error(e, st);
      }
    }
  }

  Future<void> updateDealStage(String dealId, String newStageId) async {
    final api = _ref.read(apiClientProvider);
    await api.put('/deals/$dealId/stage', data: {'stageId': newStageId});
    await loadDeals();
  }
}

// Tasks Providers
final tasksProvider = StateNotifierProvider<TasksNotifier, AsyncValue<List<Task>>>((ref) {
  return TasksNotifier(ref);
});

class TasksNotifier extends StateNotifier<AsyncValue<List<Task>>> {
  final Ref _ref;

  TasksNotifier(this._ref) : super(const AsyncValue.loading()) {
    loadTasks();
  }

  Future<void> loadTasks() async {
    state = const AsyncValue.loading();
    try {
      final api = _ref.read(apiClientProvider);
      final response = await api.get<List<dynamic>>('/tasks');
      final tasks = (response.data ?? []).map((e) => Task.fromJson(e as Map<String, dynamic>)).toList();
      
      final box = Hive.box('tasks');
      for (final task in tasks) {
        await box.put(task.id, task.toJson());
      }
      
      state = AsyncValue.data(tasks);
    } catch (e, st) {
      try {
        final box = Hive.box('tasks');
        final cached = box.values.map((e) => Task.fromJson(Map<String, dynamic>.from(e as Map))).toList();
        state = AsyncValue.data(cached);
      } catch (_) {
        state = AsyncValue.error(e, st);
      }
    }
  }

  Future<void> updateTaskStatus(String taskId, TaskStatus status) async {
    final api = _ref.read(apiClientProvider);
    await api.put('/tasks/$taskId', data: {'status': status.name});
    await loadTasks();
  }
}

// Events/Calendar Providers
final eventsProvider = StateNotifierProvider<EventsNotifier, AsyncValue<List<Event>>>((ref) {
  return EventsNotifier(ref);
});

class EventsNotifier extends StateNotifier<AsyncValue<List<Event>>> {
  final Ref _ref;

  EventsNotifier(this._ref) : super(const AsyncValue.loading()) {
    loadEvents();
  }

  Future<void> loadEvents() async {
    state = const AsyncValue.loading();
    try {
      final api = _ref.read(apiClientProvider);
      final response = await api.get<List<dynamic>>('/events');
      final events = (response.data ?? []).map((e) => Event.fromJson(e as Map<String, dynamic>)).toList();
      state = AsyncValue.data(events);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

// Dashboard Stats Provider
final dashboardStatsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final api = ref.read(apiClientProvider);
  final response = await api.get<Map<String, dynamic>>('/dashboard/stats');
  return response.data ?? {};
});

// Theme Provider
final themeModeProvider = StateProvider<bool>((ref) => false); // false = light, true = dark
