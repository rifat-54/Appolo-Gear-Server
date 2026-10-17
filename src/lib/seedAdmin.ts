import bcrypt from 'bcrypt';
import config from '../config';
import { prisma } from './prisma';

export const seedAdmin = async () => {
  try {
    const isAdminExists = await prisma.user.findFirst({
      where: {
        role: 'admin',
      },
    });

    if (isAdminExists) {
      console.log('Admin already exists:', isAdminExists.email);
      return;
    }

    const hashedPassword = await bcrypt.hash(
      config.admin.password,
      config.bcrypt_salt_round
    );

    const admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: config.admin.email,
        password: hashedPassword,
        role: 'admin',
        rating: 5,
      },
    });

    console.log('Admin seeded successfully:', admin.email);
  } catch (error) {
    console.error('Failed to seed admin:', error);
  }
};

if (require.main === module) {
  seedAdmin()
    .then(() => prisma.$disconnect())
    .catch((err) => {
      console.error(err);
      prisma.$disconnect();
      process.exit(1);
    });
}
