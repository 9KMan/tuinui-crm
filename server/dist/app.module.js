"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const bull_1 = require("@nestjs/bull");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const contacts_module_1 = require("./contacts/contacts.module");
const companies_module_1 = require("./companies/companies.module");
const deals_module_1 = require("./deals/deals.module");
const tasks_module_1 = require("./tasks/tasks.module");
const events_module_1 = require("./events/events.module");
const files_module_1 = require("./files/files.module");
const notes_module_1 = require("./notes/notes.module");
const activities_module_1 = require("./activities/activities.module");
const automation_module_1 = require("./automation/automation.module");
const custom_objects_module_1 = require("./custom-objects/custom-objects.module");
const views_module_1 = require("./views/views.module");
const roles_module_1 = require("./roles/roles.module");
const audit_module_1 = require("./audit/audit.module");
const search_module_1 = require("./search/search.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST', 'localhost'),
                    port: configService.get('DB_PORT', 5432),
                    username: configService.get('DB_USERNAME', 'crm'),
                    password: configService.get('DB_PASSWORD', 'crm'),
                    database: configService.get('DB_DATABASE', 'crm'),
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    synchronize: configService.get('DB_SYNCHRONIZE', 'false') === 'true',
                    logging: configService.get('DB_LOGGING', 'false') === 'true',
                }),
                inject: [config_1.ConfigService],
            }),
            bull_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    redis: {
                        host: configService.get('REDIS_HOST', 'localhost'),
                        port: configService.get('REDIS_PORT', 6379),
                        password: configService.get('REDIS_PASSWORD'),
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            contacts_module_1.ContactsModule,
            companies_module_1.CompaniesModule,
            deals_module_1.DealsModule,
            tasks_module_1.TasksModule,
            events_module_1.EventsModule,
            files_module_1.FilesModule,
            notes_module_1.NotesModule,
            activities_module_1.ActivitiesModule,
            automation_module_1.AutomationModule,
            custom_objects_module_1.CustomObjectsModule,
            views_module_1.ViewsModule,
            roles_module_1.RolesModule,
            audit_module_1.AuditModule,
            search_module_1.SearchModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map