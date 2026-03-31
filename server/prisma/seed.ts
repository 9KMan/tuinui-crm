/**
 * Prisma Database Seed Script
 * Run: npx prisma db seed
 * Or: ts-node prisma/seed.ts (dev)
 */

import { PrismaClient, RoleName } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Roles ───────────────────────────────────────────────

  const roles = [
    {
      name: RoleName.ADMIN,
      permissions: JSON.stringify([
        'users:read', 'users:write', 'users:delete',
        'contacts:read', 'contacts:write', 'contacts:delete',
        'companies:read', 'companies:write', 'companies:delete',
        'deals:read', 'deals:write', 'deals:delete',
        'tasks:read', 'tasks:write', 'tasks:delete',
        'events:read', 'events:write', 'events:delete',
        'roles:read', 'roles:write',
        'settings:read', 'settings:write',
        'audit:read',
      ]),
      isDefault: false,
    },
    {
      name: RoleName.MANAGER,
      permissions: JSON.stringify([
        'contacts:read', 'contacts:write',
        'companies:read', 'companies:write',
        'deals:read', 'deals:write',
        'tasks:read', 'tasks:write',
        'events:read', 'events:write',
      ]),
      isDefault: false,
    },
    {
      name: RoleName.USER,
      permissions: JSON.stringify([
        'contacts:read', 'contacts:write',
        'companies:read', 'companies:write',
        'deals:read', 'deals:write',
        'tasks:read', 'tasks:write',
        'events:read', 'events:write',
      ]),
      isDefault: true,
    },
    {
      name: RoleName.VIEWER,
      permissions: JSON.stringify([
        'contacts:read',
        'companies:read',
        'deals:read',
        'tasks:read',
        'events:read',
      ]),
      isDefault: false,
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: role,
      create: role,
    });
  }

  console.log('✅ Roles seeded');

  // ─── Admin User ───────────────────────────────────────────

  const adminRole = await prisma.role.findUnique({ where: { name: RoleName.ADMIN } });
  const passwordHash = await bcrypt.hash('admin123', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@crm.local' },
    update: {},
    create: {
      email: 'admin@crm.local',
      passwordHash,
      name: 'Admin User',
      roleId: adminRole!.id,
    },
  });

  console.log(`✅ Admin user created: ${adminUser.email} (password: admin123)`);

  // ─── Demo Data ────────────────────────────────────────────

  const userRole = await prisma.role.findFirst({ where: { isDefault: true } });

  // Create a demo company
  const company = await prisma.company.upsert({
    where: { id: 'demo-company-001' },
    update: {},
    create: {
      id: 'demo-company-001',
      name: 'Acme Corporation',
      domain: 'acme.com',
      industry: 'Technology',
      size: 'MID',
      address: '123 Innovation Drive, San Francisco, CA',
      createdById: adminUser.id,
    },
  });

  // Create demo contacts
  const contacts = [
    { name: 'Alice Johnson', email: 'alice@acme.com', phone: '+1-555-0101', jobTitle: 'CEO' },
    { name: 'Bob Smith', email: 'bob@acme.com', phone: '+1-555-0102', jobTitle: 'CTO' },
    { name: 'Carol Williams', email: 'carol@acme.com', phone: '+1-555-0103', jobTitle: 'Sales Director' },
  ];

  for (const c of contacts) {
    await prisma.contact.upsert({
      where: { id: `demo-contact-${c.email}` },
      update: {},
      create: {
        id: `demo-contact-${c.email}`,
        name: c.name,
        email: c.email,
        phone: c.phone,
        jobTitle: c.jobTitle,
        companyId: company.id,
        createdById: adminUser.id,
      },
    });
  }

  console.log('✅ Demo data seeded');

  // ─── Default Settings ─────────────────────────────────────

  await prisma.settings.upsert({
    where: { id: 'default-settings' },
    update: {},
    create: {
      id: 'default-settings',
      companyName: 'My Company',
      currency: 'USD',
      timezone: 'UTC',
    },
  });

  console.log('✅ Settings seeded');
  console.log('');
  console.log('🎉 Database seeding complete!');
  console.log('');
  console.log('📋 Default credentials:');
  console.log('   Email: admin@crm.local');
  console.log('   Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
