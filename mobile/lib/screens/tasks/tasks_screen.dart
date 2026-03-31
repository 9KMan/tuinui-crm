import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../models/task.dart';
import '../../providers/providers.dart';

class TasksScreen extends ConsumerWidget {
  const TasksScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tasksAsync = ref.watch(tasksProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tasks'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.calendar_today_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: tasksAsync.when(
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
                onPressed: () => ref.invalidate(tasksProvider),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
        data: (tasks) {
          if (tasks.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.task_alt_outlined, size: 64, color: Colors.grey[400]),
                  const SizedBox(height: 16),
                  Text(
                    'No tasks yet',
                    style: TextStyle(fontSize: 18, color: Colors.grey[600]),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Create your first task',
                    style: TextStyle(color: Colors.grey[500]),
                  ),
                ],
              ),
            );
          }

          // Group tasks by status
          final todoTasks = tasks.where((t) => t.status == TaskStatus.todo).toList();
          final inProgressTasks = tasks.where((t) => t.status == TaskStatus.inProgress).toList();
          final doneTasks = tasks.where((t) => t.status == TaskStatus.done).toList();

          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(tasksProvider),
            child: ListView(
              padding: const EdgeInsets.only(bottom: 80),
              children: [
                if (todoTasks.isNotEmpty) ...[
                  _TaskSection(
                    title: 'To Do',
                    tasks: todoTasks,
                    color: Colors.grey,
                    ref: ref,
                  ),
                ],
                if (inProgressTasks.isNotEmpty) ...[
                  _TaskSection(
                    title: 'In Progress',
                    tasks: inProgressTasks,
                    color: Colors.blue,
                    ref: ref,
                  ),
                ],
                if (doneTasks.isNotEmpty) ...[
                  _TaskSection(
                    title: 'Done',
                    tasks: doneTasks,
                    color: Colors.green,
                    ref: ref,
                  ),
                ],
              ],
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddTaskDialog(context, ref),
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showAddTaskDialog(BuildContext context, WidgetRef ref) {
    final titleController = TextEditingController();
    final descriptionController = TextEditingController();
    TaskPriority selectedPriority = TaskPriority.medium;

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
                'Add Task',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: titleController,
                decoration: const InputDecoration(
                  labelText: 'Task Title',
                  prefixIcon: Icon(Icons.task_alt_outlined),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: descriptionController,
                decoration: const InputDecoration(
                  labelText: 'Description',
                  prefixIcon: Icon(Icons.description_outlined),
                ),
                maxLines: 3,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<TaskPriority>(
                value: selectedPriority,
                decoration: const InputDecoration(
                  labelText: 'Priority',
                  prefixIcon: Icon(Icons.flag_outlined),
                ),
                items: TaskPriority.values.map((p) {
                  return DropdownMenuItem(
                    value: p,
                    child: Row(
                      children: [
                        Icon(_getPriorityIcon(p), color: _getPriorityColor(p), size: 20),
                        const SizedBox(width: 8),
                        Text(p.name.toUpperCase()),
                      ],
                    ),
                  );
                }).toList(),
                onChanged: (value) {
                  if (value != null) setState(() => selectedPriority = value);
                },
              ),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: () async {
                  if (titleController.text.isNotEmpty) {
                    // TODO: Create task via provider
                    if (context.mounted) Navigator.pop(context);
                  }
                },
                child: const Text('Add Task'),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  IconData _getPriorityIcon(TaskPriority priority) {
    switch (priority) {
      case TaskPriority.urgent:
        return Icons.priority_high;
      case TaskPriority.high:
        return Icons.arrow_upward;
      case TaskPriority.medium:
        return Icons.remove;
      case TaskPriority.low:
        return Icons.arrow_downward;
    }
  }

  Color _getPriorityColor(TaskPriority priority) {
    switch (priority) {
      case TaskPriority.urgent:
        return Colors.red;
      case TaskPriority.high:
        return Colors.orange;
      case TaskPriority.medium:
        return Colors.blue;
      case TaskPriority.low:
        return Colors.grey;
    }
  }
}

class _TaskSection extends StatelessWidget {
  final String title;
  final List<Task> tasks;
  final Color color;
  final WidgetRef ref;

  const _TaskSection({
    required this.title,
    required this.tasks,
    required this.color,
    required this.ref,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Row(
            children: [
              Container(
                width: 4,
                height: 20,
                decoration: BoxDecoration(
                  color: color,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                title,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  tasks.length.toString(),
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
        ...tasks.map((task) => _TaskItem(task: task, ref: ref)),
      ],
    );
  }
}

class _TaskItem extends StatelessWidget {
  final Task task;
  final WidgetRef ref;

  const _TaskItem({required this.task, required this.ref});

  @override
  Widget build(BuildContext context) {
    final dateFormatter = DateFormat('MMM d');

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: InkWell(
        onTap: () {
          // TODO: Navigate to task detail
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              // Checkbox
              InkWell(
                onTap: () async {
                  final newStatus = task.status == TaskStatus.done
                      ? TaskStatus.todo
                      : TaskStatus.done;
                  await ref.read(tasksProvider.notifier).updateTaskStatus(task.id, newStatus);
                },
                child: Icon(
                  task.status == TaskStatus.done
                      ? Icons.check_circle
                      : Icons.check_circle_outline,
                  color: task.status == TaskStatus.done ? Colors.green : Colors.grey,
                ),
              ),
              const SizedBox(width: 12),

              // Task Content
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      task.title,
                      style: TextStyle(
                        fontWeight: FontWeight.w500,
                        decoration: task.status == TaskStatus.done
                            ? TextDecoration.lineThrough
                            : null,
                      ),
                    ),
                    if (task.dueDate != null) ...[
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(
                            Icons.schedule,
                            size: 14,
                            color: _isDue(task.dueDate!) ? Colors.red : Colors.grey,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            dateFormatter.format(task.dueDate!),
                            style: TextStyle(
                              fontSize: 12,
                              color: _isDue(task.dueDate!) ? Colors.red : Colors.grey,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),

              // Priority Badge
              _PriorityBadge(priority: task.priority),
            ],
          ),
        ),
      ),
    );
  }

  bool _isDue(DateTime dueDate) {
    final now = DateTime.now();
    return dueDate.isBefore(now) || dueDate.isAtSameMomentAs(DateTime(now.year, now.month, now.day));
  }
}

class _PriorityBadge extends StatelessWidget {
  final TaskPriority priority;

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
        priority.name.toUpperCase(),
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
      case TaskPriority.urgent:
        return Colors.red;
      case TaskPriority.high:
        return Colors.orange;
      case TaskPriority.medium:
        return Colors.blue;
      case TaskPriority.low:
        return Colors.grey;
    }
  }
}
