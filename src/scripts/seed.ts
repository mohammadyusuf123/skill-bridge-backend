
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { UserRole } from '../lib/middleware/authMiddleware';


async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.tutorCategory.deleteMany();
  await prisma.tutorProfile.deleteMany();
  await prisma.category.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Hash password
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  // Create Admin User
  const admin = await prisma.user.create({
    data: {
      email: 'admin@skillbridge.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      emailVerified: true,
      accounts: {
        create: {
          accountId: 'admin@skillbridge.com',
          providerId: 'credential',
          password: hashedPassword,
        },
      },
    },
  });

  console.log('✅ Admin created:', admin.email);

  // Create Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Programming',
        slug: 'programming',
        description: 'Learn coding and software development',
        icon: '💻',
        color: '#3B82F6',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Mathematics',
        slug: 'mathematics',
        description: 'Master math concepts from basics to advanced',
        icon: '🔢',
        color: '#8B5CF6',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Languages',
        slug: 'languages',
        description: 'Learn new languages and improve communication',
        icon: '🗣️',
        color: '#10B981',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Science',
        slug: 'science',
        description: 'Explore physics, chemistry, and biology',
        icon: '🔬',
        color: '#F59E0B',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Music',
        slug: 'music',
        description: 'Learn instruments and music theory',
        icon: '🎵',
        color: '#EC4899',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Business',
        slug: 'business',
        description: 'Business, marketing, and entrepreneurship',
        icon: '💼',
        color: '#6366F1',
      },
    }),
  ]);

 

  // Create Sample Tutors
  const tutorPassword = await bcrypt.hash('Tutor@123', 10);

  const tutor1 = await prisma.user.create({
    data: {
      email: 'john.doe@example.com',
      name: 'John Doe',
      role: UserRole.TUTOR,
      emailVerified: true,
      bio: 'Passionate about teaching programming',
      phone: '+1234567890',
      accounts: {
        create: {
          accountId: 'john.doe@example.com',
          providerId: 'credential',
          password: tutorPassword,
        },
      },
      tutorProfile: {
        create: {
          title: 'Full Stack Developer & Coding Instructor',
          headline: 'Learn web development from industry expert',
          description: 'I have 8+ years of experience in full-stack development and 5 years of teaching. Specialized in JavaScript, React, Node.js, and Python.',
          hourlyRate: 50,
          experience: 8,
          education: 'BS Computer Science - MIT',
          isVerified: true,
          averageRating: 4.8,
          totalReviews: 45,
          totalSessions: 120,
          categories: {
            create: [
              { categoryId: categories[0].id, isPrimary: true },
            ],
          },
          availability: {
            create: [
              { dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00' },
              { dayOfWeek: 'WEDNESDAY', startTime: '09:00', endTime: '17:00' },
              { dayOfWeek: 'FRIDAY', startTime: '09:00', endTime: '17:00' },
            ],
          },
        },
      },
    },
  });

  const tutor2 = await prisma.user.create({
    data: {
      email: 'sarah.smith@example.com',
      name: 'Sarah Smith',
      role: UserRole.TUTOR,
      emailVerified: true,
      bio: 'Math expert with 10 years teaching experience',
      phone: '+1234567891',
      accounts: {
        create: {
          accountId: 'sarah.smith@example.com',
          providerId: 'credential',
          password: tutorPassword,
        },
      },
      tutorProfile: {
        create: {
          title: 'Mathematics Professor',
          headline: 'Making math simple and fun',
          description: 'PhD in Mathematics with 10 years of teaching experience. Specialized in algebra, calculus, and statistics.',
          hourlyRate: 45,
          experience: 10,
          education: 'PhD Mathematics - Stanford University',
          isVerified: true,
          averageRating: 4.9,
          totalReviews: 89,
          totalSessions: 230,
          categories: {
            create: [
              { categoryId: categories[1].id, isPrimary: true },
            ],
          },
          availability: {
            create: [
              { dayOfWeek: 'TUESDAY', startTime: '10:00', endTime: '18:00' },
              { dayOfWeek: 'THURSDAY', startTime: '10:00', endTime: '18:00' },
              { dayOfWeek: 'SATURDAY', startTime: '09:00', endTime: '15:00' },
            ],
          },
        },
      },
    },
  });

  const tutor3 = await prisma.user.create({
    data: {
      email: 'maria.garcia@example.com',
      name: 'Maria Garcia',
      role: UserRole.TUTOR,
      emailVerified: true,
      bio: 'Native Spanish speaker and language enthusiast',
      phone: '+1234567892',
      accounts: {
        create: {
          accountId: 'maria.garcia@example.com',
          providerId: 'credential',
          password: tutorPassword,
        },
      },
      tutorProfile: {
        create: {
          title: 'Spanish Language Expert',
          headline: 'Learn Spanish naturally with a native speaker',
          description: 'Native Spanish speaker from Spain with 6 years of teaching experience. I make learning Spanish fun and practical!',
          hourlyRate: 35,
          experience: 6,
          education: 'BA Spanish Literature - University of Barcelona',
          isVerified: true,
          averageRating: 4.7,
          totalReviews: 34,
          totalSessions: 95,
          categories: {
            create: [
              { categoryId: categories[2].id, isPrimary: true },
            ],
          },
          availability: {
            create: [
              { dayOfWeek: 'MONDAY', startTime: '14:00', endTime: '20:00' },
              { dayOfWeek: 'WEDNESDAY', startTime: '14:00', endTime: '20:00' },
              { dayOfWeek: 'FRIDAY', startTime: '14:00', endTime: '20:00' },
            ],
          },
        },
      },
    },
  });

  console.log('✅ Created 3 tutors with profiles');

  // Create Sample Students
  const studentPassword = await bcrypt.hash('Student@123', 10);

  const student1 = await prisma.user.create({
    data: {
      email: 'alice.johnson@example.com',
      name: 'Alice Johnson',
      role: UserRole.STUDENT,
      emailVerified: true,
      bio: 'Aspiring web developer',
      accounts: {
        create: {
          accountId: 'alice.johnson@example.com',
          providerId: 'credential',
          password: studentPassword,
        },
      },
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'bob.williams@example.com',
      name: 'Bob Williams',
      role: UserRole.STUDENT,
      emailVerified: true,
      bio: 'Learning math for college entrance exam',
      accounts: {
        create: {
          accountId: 'bob.williams@example.com',
          providerId: 'credential',
          password: studentPassword,
        },
      },
    },
  });

  console.log('✅ Created 2 students');

  // Create Sample Bookings
  const tutor1Profile = await prisma.tutorProfile.findUnique({
    where: { userId: tutor1.id },
  });

  const tutor2Profile = await prisma.tutorProfile.findUnique({
    where: { userId: tutor2.id },
  });

  if (tutor1Profile && tutor2Profile) {
    const booking1 = await prisma.booking.create({
      data: {
        studentId: student1.id,
        tutorId: tutor1.id,
        tutorProfileId: tutor1Profile.id,
        subject: 'React.js Fundamentals',
        sessionDate: new Date('2026-02-15'),
        startTime: '10:00',
        endTime: '12:00',
        duration: 120,
        price: 100,
        status: 'COMPLETED',
        studentNotes: 'Need help with React hooks and state management',
      },
    });

    // Create review for completed booking
    await prisma.review.create({
      data: {
        bookingId: booking1.id,
        studentId: student1.id,
        tutorId: tutor1Profile.id,
        rating: 5,
        comment: 'Excellent tutor! Very patient and knowledgeable. Highly recommend!',
      },
    });

    await prisma.booking.create({
      data: {
        studentId: student2.id,
        tutorId: tutor2.id,
        tutorProfileId: tutor2Profile.id,
        subject: 'Calculus I',
        sessionDate: new Date('2026-02-20'),
        startTime: '14:00',
        endTime: '15:30',
        duration: 90,
        price: 67.5,
        status: 'CONFIRMED',
        studentNotes: 'Struggling with derivatives and limits',
      },
    });

    await prisma.booking.create({
      data: {
        studentId: student1.id,
        tutorId: tutor1.id,
        tutorProfileId: tutor1Profile.id,
        subject: 'Node.js Backend Development',
        sessionDate: new Date('2026-03-01'),
        startTime: '09:00',
        endTime: '11:00',
        duration: 120,
        price: 100,
        status: 'PENDING',
        studentNotes: 'Want to learn RESTful API development',
      },
    });

    console.log('✅ Created 3 sample bookings with 1 review');
  }

  console.log('🎉 Seed completed successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('─────────────────────────────────────');
  console.log('Admin:');
  console.log('  Email: admin@skillbridge.com');
  console.log('  Password: Admin@123');
  console.log('\nTutors:');
  console.log('  Email: john.doe@example.com');
  console.log('  Email: sarah.smith@example.com');
  console.log('  Email: maria.garcia@example.com');
  console.log('  Password: Tutor@123');
  console.log('\nStudents:');
  console.log('  Email: alice.johnson@example.com');
  console.log('  Email: bob.williams@example.com');
  console.log('  Password: Student@123');
  console.log('─────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });