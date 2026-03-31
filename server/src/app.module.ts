import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ContactsModule } from './contacts/contacts.module';
import { CompaniesModule } from './companies/companies.module';
import { DealsModule } from './deals/deals.module';
import { TasksModule } from './tasks/tasks.module';
import { EventsModule } from './events/events.module';
import { FilesModule } from './files/files.module';
import { NotesModule } from './notes/notes.module';
import { ActivitiesModule } from './activities/activities.module';
import { AutomationModule } from './automation/automation.module';
import { WebhookModule } from './webhooks/webhook.module';
import { CustomObjectsModule } from './custom-objects/custom-objects.module';
import { ViewsModule } from './views/views.module';
import { RolesModule } from './roles/roles.module';
import { AuditModule } from './audit/audit.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { SearchModule } from './search/search.module';
import { CustomFieldsModule } from './custom-fields/custom-fields.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database (Prisma)
    PrismaModule,

    // Redis Queue
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),

    // Feature Modules
    AuthModule,
    UsersModule,
    ContactsModule,
    CompaniesModule,
    DealsModule,
    TasksModule,
    EventsModule,
    FilesModule,
    NotesModule,
    ActivitiesModule,
    AutomationModule,
    WebhookModule,
    CustomObjectsModule,
    ViewsModule,
    RolesModule,
    AuditModule,
    ApiKeysModule,
    SearchModule,
    CustomFieldsModule,
  ],
  providers: [
    // Global guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
