import 'package:equatable/equatable.dart';

class Deal extends Equatable {
  final String id;
  final String title;
  final double amount;
  final String currency;
  final String stageId;
  final int probability;
  final DateTime? expectedCloseDate;
  final String? companyId;
  final String? contactId;
  final Map<String, dynamic>? customFields;
  final String? createdById;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Deal({
    required this.id,
    required this.title,
    required this.amount,
    this.currency = 'USD',
    required this.stageId,
    required this.probability,
    this.expectedCloseDate,
    this.companyId,
    this.contactId,
    this.customFields,
    this.createdById,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Deal.fromJson(Map<String, dynamic> json) {
    return Deal(
      id: json['id'] as String,
      title: json['title'] as String,
      amount: (json['amount'] as num).toDouble(),
      currency: json['currency'] as String? ?? 'USD',
      stageId: json['stageId'] as String,
      probability: json['probability'] as int? ?? 0,
      expectedCloseDate: json['expectedCloseDate'] != null
          ? DateTime.parse(json['expectedCloseDate'] as String)
          : null,
      companyId: json['companyId'] as String?,
      contactId: json['contactId'] as String?,
      customFields: json['customFields'] as Map<String, dynamic>?,
      createdById: json['createdById'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'amount': amount,
      'currency': currency,
      'stageId': stageId,
      'probability': probability,
      'expectedCloseDate': expectedCloseDate?.toIso8601String(),
      'companyId': companyId,
      'contactId': contactId,
      'customFields': customFields,
      'createdById': createdById,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  Deal copyWith({
    String? id,
    String? title,
    double? amount,
    String? currency,
    String? stageId,
    int? probability,
    DateTime? expectedCloseDate,
    String? companyId,
    String? contactId,
    Map<String, dynamic>? customFields,
    String? createdById,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Deal(
      id: id ?? this.id,
      title: title ?? this.title,
      amount: amount ?? this.amount,
      currency: currency ?? this.currency,
      stageId: stageId ?? this.stageId,
      probability: probability ?? this.probability,
      expectedCloseDate: expectedCloseDate ?? this.expectedCloseDate,
      companyId: companyId ?? this.companyId,
      contactId: contactId ?? this.contactId,
      customFields: customFields ?? this.customFields,
      createdById: createdById ?? this.createdById,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  List<Object?> get props => [id, title, amount, stageId, probability];
}

class PipelineStage extends Equatable {
  final String id;
  final String name;
  final int position;
  final String color;
  final String pipelineId;

  const PipelineStage({
    required this.id,
    required this.name,
    required this.position,
    required this.color,
    required this.pipelineId,
  });

  factory PipelineStage.fromJson(Map<String, dynamic> json) {
    return PipelineStage(
      id: json['id'] as String,
      name: json['name'] as String,
      position: json['position'] as int,
      color: json['color'] as String,
      pipelineId: json['pipelineId'] as String,
    );
  }

  @override
  List<Object?> get props => [id, name, position, color];
}
