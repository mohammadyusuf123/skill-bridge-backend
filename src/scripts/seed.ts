import { prisma } from '../lib/prisma';
import { UserRole } from '../lib/middleware/authMiddleware';

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data (except users and accounts)
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.tutorCategory.deleteMany();
  await prisma.tutorProfile.deleteMany();
  await prisma.category.deleteMany();

  console.log('✅ Cleared existing data');

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

  console.log('✅ Created 6 categories');

  // Find existing users by email
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@skillbridge.com' },
  });

  const tutor1User = await prisma.user.findUnique({
    where: { email: 'john.doe@example.com' },
  });

  const tutor2User = await prisma.user.findUnique({
    where: { email: 'sarah.smith@example.com' },
  });

  const tutor3User = await prisma.user.findUnique({
    where: { email: 'maria.garcia@example.com' },
  });

  const student1 = await prisma.user.findUnique({
    where: { email: 'alice.johnson@example.com' },
  });

  const student2 = await prisma.user.findUnique({
    where: { email: 'bob.williams@example.com' },
  });

  if (!tutor1User || !tutor2User || !tutor3User || !student1 || !student2) {
    console.error('❌ Required users not found. Please create the following users first:');
    console.log('\nRequired Users:');
    if (!admin) console.log('  - admin@skillbridge.com (role: ADMIN)');
    if (!tutor1User) console.log('  - john.doe@example.com (role: TUTOR)');
    if (!tutor2User) console.log('  - sarah.smith@example.com (role: TUTOR)');
    if (!tutor3User) console.log('  - maria.garcia@example.com (role: TUTOR)');
    if (!student1) console.log('  - alice.johnson@example.com (role: STUDENT)');
    if (!student2) console.log('  - bob.williams@example.com (role: STUDENT)');
    process.exit(1);
  }

  // Update tutor users with additional info
  await prisma.user.update({
    where: { id: tutor1User.id },
    data: {
      bio: 'Passionate about teaching programming',
      phone: '+1234567890',
    },
  });

  await prisma.user.update({
    where: { id: tutor2User.id },
    data: {
      bio: 'Math expert with 10 years teaching experience',
      phone: '+1234567891',
    },
  });

  await prisma.user.update({
    where: { id: tutor3User.id },
    data: {
      bio: 'Native Spanish speaker and language enthusiast',
      phone: '+1234567892',
    },
  });

  // Update student users with additional info
  await prisma.user.update({
    where: { id: student1.id },
    data: {
      bio: 'Aspiring web developer',
    },
  });

  await prisma.user.update({
    where: { id: student2.id },
    data: {
      bio: 'Learning math for college entrance exam',
    },
  });

  console.log('✅ Updated user information');

  // Create Tutor Profiles
  const tutor1Profile = await prisma.tutorProfile.create({
    data: {
      userId: tutor1User.id,
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
  });

  const tutor2Profile = await prisma.tutorProfile.create({
    data: {
      userId: tutor2User.id,
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
  });

  const tutor3Profile = await prisma.tutorProfile.create({
    data: {
      userId: tutor3User.id,
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
  });

  console.log('✅ Created 3 tutor profiles with availability');

  // Create Sample Bookings
  const booking1 = await prisma.booking.create({
    data: {
      studentId: student1.id,
      tutorId: tutor1User.id,
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
      tutorId: tutor2User.id,
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
      tutorId: tutor1User.id,
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

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Summary:');
  console.log('─────────────────────────────────────');
  console.log('✅ 6 Categories created');
  console.log('✅ 3 Tutor profiles created');
  console.log('✅ 3 Bookings created');
  console.log('✅ 1 Review created');
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