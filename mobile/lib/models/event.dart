import 'package:equatable/equatable.dart';

class Event extends Equatable {
  final String id;
  final String title;
  final String? description;
  final DateTime startAt;
  final DateTime? endAt;
  final String? location;
  final String? linkedType;
  final String? linkedId;
  final List<String>? attendees;
  final String? createdById;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Event({
    required this.id,
    required this.title,
    this.description,
    required this.startAt,
    this.endAt,
    this.location,
    this.linkedType,
    this.linkedId,
    this.attendees,
    this.createdById,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Event.fromJson(Map<String, dynamic> json) {
    return Event(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      startAt: DateTime.parse(json['startAt'] as String),
      endAt: json['endAt'] != null
          ? DateTime.parse(json['endAt'] as String)
          : null,
      location: json['location'] as String?,
      linkedType: json['linkedType'] as String?,
      linkedId: json['linkedId'] as String?,
      attendees: (json['attendees'] as List<dynamic>?)?.cast<String>(),
      createdById: json['createdById'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'startAt': startAt.toIso8601String(),
      'endAt': endAt?.toIso8601String(),
      'location': location,
      'linkedType': linkedType,
      'linkedId': linkedId,
      'attendees': attendees,
      'createdById': createdById,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  Event copyWith({
    String? id,
    String? title,
    String? description,
    DateTime? startAt,
    DateTime? endAt,
    String? location,
    String? linkedType,
    String? linkedId,
    List<String>? attendees,
    String? createdById,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Event(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      startAt: startAt ?? this.startAt,
      endAt: endAt ?? this.endAt,
      location: location ?? this.location,
      linkedType: linkedType ?? this.linkedType,
      linkedId: linkedId ?? this.linkedId,
      attendees: attendees ?? this.attendees,
      createdById: createdById ?? this.createdById,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [id, title, startAt, endAt];
}
