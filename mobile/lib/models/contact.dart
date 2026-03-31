import 'package:equatable/equatable.dart';

class Contact extends Equatable {
  final String id;
  final String name;
  final String? email;
  final String? phone;
  final String? companyId;
  final String? jobTitle;
  final String? avatar;
  final Map<String, dynamic>? customFields;
  final String? createdById;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Contact({
    required this.id,
    required this.name,
    this.email,
    this.phone,
    this.companyId,
    this.jobTitle,
    this.avatar,
    this.customFields,
    this.createdById,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Contact.fromJson(Map<String, dynamic> json) {
    return Contact(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      companyId: json['companyId'] as String?,
      jobTitle: json['jobTitle'] as String?,
      avatar: json['avatar'] as String?,
      customFields: json['customFields'] as Map<String, dynamic>?,
      createdById: json['createdById'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'companyId': companyId,
      'jobTitle': jobTitle,
      'avatar': avatar,
      'customFields': customFields,
      'createdById': createdById,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  Contact copyWith({
    String? id,
    String? name,
    String? email,
    String? phone,
    String? companyId,
    String? jobTitle,
    String? avatar,
    Map<String, dynamic>? customFields,
    String? createdById,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Contact(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      companyId: companyId ?? this.companyId,
      jobTitle: jobTitle ?? this.jobTitle,
      avatar: avatar ?? this.avatar,
      customFields: customFields ?? this.customFields,
      createdById: createdById ?? this.createdById,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [id, name, email, phone, companyId, jobTitle, avatar];
}
