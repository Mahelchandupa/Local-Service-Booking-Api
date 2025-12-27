import { User } from '../models';
import { hashPassword } from './password';

/**
 * Create default admin user if it doesn't exist
 * This runs at application startup
 */
export const createDefaultAdmin = async (): Promise<void> => {
  try {
    const adminPhoneNumber = process.env.ADMIN_PHONE_NUMBER || '1234567890';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      $or: [{ phoneNumber: adminPhoneNumber }, { email: adminEmail }],
      role: 'admin',
    });

    if (existingAdmin) {
      console.log('✅ Default admin user already exists');
      return;
    }

    // Create default admin
    const passwordHash = await hashPassword(adminPassword);

    const admin = await User.create({
      phoneNumber: adminPhoneNumber,
      email: adminEmail,
      passwordHash,
      role: 'admin',
      isVerified: true,
      isActive: true,
    });

    console.log('✅ Default admin user created successfully');
    console.log(`   Phone: ${adminPhoneNumber}`);
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword} (Please change this in production!)`);
  } catch (error) {
    console.error('❌ Failed to create default admin user:', error);
    // Don't throw - allow server to start even if admin creation fails
  }
};

