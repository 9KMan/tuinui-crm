import 'package:equatable/equatable.dart';

enum TaskPriority { low, medium, high, urgent }

enum TaskStatus { todo, inProgress, done }

enum TaskLinkedType { contact, company, deal, none }

class Task extends Equatable {
  final String id;
  final String title;
  final String? description;
  final DateTime? dueDate;
  final DateTime? reminderAt;
  final TaskPriority priority;
  final TaskStatus status;
  final String? assigneeId;
  final TaskLinkedType linkedType;
  final String? linkedId;
  final Map<String, dynamic>? recurring;
  final DateTime? completedAt;
  final String? createdById;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Task({
    required this.id,
    required this.title,
    this.description,
    this.dueDate,
    this.reminderAt,
    this.priority = TaskPriority.medium,
    this.status = TaskStatus.todo,
    this.assigneeId,
    this.linkedType = TaskLinkedType.none,
    this.linkedId,
    this.recurring,
    this.completedAt,
    this.createdById,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Task.fromJson(Map<String, dynamic> json) {
    return Task(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      dueDate: json['dueDate'] != null
          ? DateTime.parse(json['dueDate'] as String)
          : null,
      reminderAt: json['reminderAt'] != null
          ? DateTime.parse(json['reminderAt'] as String)
          : null,
      priority: _parsePriority(json['priority'] as String?),
      status: _parseStatus(json['status'] as String?),
      assigneeId: json['assigneeId'] as String?,
      linkedType: _parseLinkedType(json['linkedType'] as String?),
      linkedId: json['linkedId'] as String?,
      recurring: json['recurring'] as Map<String, dynamic>?,
      completedAt: json['completedAt'] != null
          ? DateTime.parse(json['completedAt'] as String)
          : null,
      createdById: json['createdById'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  static TaskPriority _parsePriority(String? value) {
    switch (value) {
      case 'low':
        return TaskPriority.low;
      case 'high':
        return TaskPriority.high;
      case 'urgent':
        return TaskPriority.urgent;
      default:
        return TaskPriority.medium;
    }
  }

  static TaskStatus _parseStatus(String? value) {
    switch (value) {
      case 'in_progress':
        return TaskStatus.inProgress;
      case 'done':
        return TaskStatus.done;
      default:
        return TaskStatus.todo;
    }
  }

  static TaskLinkedType _parseLinkedType(String? value) {
    switch (value) {
      case 'contact':
        return TaskLinkedType.contact;
      case 'company':
        return TaskLinkedType.company;
      case 'deal':
        return TaskLinkedType.deal;
      default:
        return TaskLinkedType.none;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'dueDate': dueDate?.toIso8601String(),
      'reminderAt': reminderAt?.toIso8601String(),
      'priority': priority.name,
      'status': status == TaskStatus.inProgress ? 'in_progress' : status.name,
      'assigneeId': assigneeId,
      'linkedType': linkedType.name,
      'linkedId': linkedId,
      'recurring': recurring,
      'completedAt': completedAt?.toIso8601String(),
      'createdById': createdById,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  Task copyWith({
    String? id,
    String? title,
    String? description,
    DateTime? dueDate,
    DateTime? reminderAt,
    TaskPriority? priority,
    TaskStatus? status,
    String? assigneeId,
    TaskLinkedType? linkedType,
    String? linkedId,
    Map<String, dynamic>? recurring,
    DateTime? completedAt,
    String? createdById,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Task(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      dueDate: dueDate ?? this.dueDate,
      reminderAt: reminderAt ?? this.reminderAt,
      priority: priority ?? this.priority,
      status: status ?? this.status,
      assigneeId: assigneeId ?? this.assigneeId,
      linkedType: linkedType ?? this.linkedType,
      linkedId: linkedId ?? this.linkedId,
      recurring: recurring ?? this.recurring,
      completedAt: completedAt ?? this.completedAt,
      createdById: createdById ?? this.createdById,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [id, title, dueDate, priority, status];
}
