import 'package:equatable/equatable.dart';

class Company extends Equatable {
  final String id;
  final String name;
  final String? domain;
  final String? industry;
  final String? size; // startup/smb/mid/enterprise
  final String? address;
  final String? logo;
  final Map<String, dynamic>? customFields;
  final String? createdById;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Company({
    required this.id,
    required this.name,
    this.domain,
    this.industry,
    this.size,
    this.address,
    this.logo,
    this.customFields,
    this.createdById,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Company.fromJson(Map<String, dynamic> json) {
    return Company(
      id: json['id'] as String,
      name: json['name'] as String,
      domain: json['domain'] as String?,
      industry: json['industry'] as String?,
      size: json['size'] as String?,
      address: json['address'] as String?,
      logo: json['logo'] as String?,
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
      'domain': domain,
      'industry': industry,
      'size': size,
      'address': address,
      'logo': logo,
      'customFields': customFields,
      'createdById': createdById,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  Company copyWith({
    String? id,
    String? name,
    String? domain,
    String? industry,
    String? size,
    String? address,
    String? logo,
    Map<String, dynamic>? customFields,
    String? createdById,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Company(
      id: id ?? this.id,
      name: name ?? this.name,
      domain: domain ?? this.domain,
      industry: industry ?? this.industry,
      size: size ?? this.size,
      address: address ?? this.address,
      logo: logo ?? this.logo,
      customFields: customFields ?? this.customFields,
      createdById: createdById ?? this.createdById,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [id, name, domain, industry, size, address, logo];
}
