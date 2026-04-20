import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashPassword } from '../lib/password.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const existingOrg = await prisma.organization.findUnique({
    where: { slug: 'acme' }
  });

  if (existingOrg) {
    await prisma.organization.delete({
      where: { id: existingOrg.id }
    });
  }

  const org = await prisma.organization.create({
    data: {
      name: 'Acme Retail',
      slug: 'acme'
    }
  });

  const hashedPassword = hashPassword('123456');

  await prisma.user.create({
    data: {
      organizationId: org.id,
      name: 'John Manager',
      email: 'manager@acme.com',
      passwordHash: hashedPassword,
      role: 'manager',
      department: 'Operations',
      managerProfile: {
        create: {}
      }
    }
  });

  const employeeRecords = [];
  const names = ['Alice', 'Bob', 'Charlie', 'David', 'Emma'];

  for (let i = 0; i < names.length; i++) {
    const user = await prisma.user.create({
      data: {
        organizationId: org.id,
        name: names[i],
        email: `${names[i].toLowerCase()}@acme.com`,
        passwordHash: hashedPassword,
        role: 'employee',
        department: 'Sales',
        position: 'Staff',
        preferredShift: i % 2 === 0 ? 'Morning' : 'Evening',
        weeklyHours: 40
      }
    });

    const employee = await prisma.employee.create({
      data: {
        organizationId: org.id,
        userId: user.id,
        status: 'Active'
      }
    });

    employeeRecords.push({ user, employee });
  }

  const schedule = await prisma.schedule.create({
    data: {
      organizationId: org.id,
      weekLabel: 'Week 1',
      status: 'Draft',
      fairnessScore: 8.8,
      coverageRate: 92
    }
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const shifts = ['Morning', 'Afternoon', 'Evening'];

  for (let i = 0; i < days.length; i++) {
    for (let j = 0; j < shifts.length; j++) {
      await prisma.scheduleAssignment.create({
        data: {
          scheduleId: schedule.id,
          employeeId: employeeRecords[(i + j) % employeeRecords.length].employee.id,
          day: days[i],
          shift: shifts[j]
        }
      });
    }
  }

  await prisma.request.createMany({
    data: [
      {
        organizationId: org.id,
        userId: employeeRecords[0].user.id,
        type: 'Leave',
        status: 'Pending',
        details: { reason: 'Sick leave', days: 2 }
      },
      {
        organizationId: org.id,
        userId: employeeRecords[1].user.id,
        type: 'Swap',
        status: 'Pending',
        details: { with: 'Alice', shift: 'Friday Evening' }
      }
    ]
  });

  await prisma.alert.createMany({
    data: [
      {
        organizationId: org.id,
        title: 'Overtime Warning',
        detail: 'Bob exceeds 45 hours this week',
        severity: 'high'
      },
      {
        organizationId: org.id,
        title: 'Understaffed Shift',
        detail: 'Friday evening needs 1 more staff',
        severity: 'medium'
      }
    ]
  });

  await prisma.forecast.createMany({
    data: [
      {
        organizationId: org.id,
        day: 'Friday',
        shift: 'Evening',
        requiredStaff: 4,
        predictedDemand: 120
      }
    ]
  });

  await prisma.aiSuggestion.createMany({
    data: [
      {
        organizationId: org.id,
        prompt: 'reduce overtime',
        response: 'Move one shift from Bob to Alice'
      },
      {
        organizationId: org.id,
        prompt: 'balance schedule',
        response: 'Distribute shifts evenly across employees'
      }
    ]
  });

  console.log('✅ Dummy data created');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });