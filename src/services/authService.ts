import { User } from '../models';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';

export interface RegisterDto {
  phoneNumber: string;
  email?: string;
  password: string;
  role: 'customer' | 'service_provider' | 'admin';
}

export interface LoginDto {
  phoneNumber?: string;
  email?: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    phoneNumber: string;
    email?: string;
    role: string;
    isVerified: boolean;
    isActive: boolean;
  };
  token: string;
}

/**
 * Register a new user
 */
export const register = async (registerDto: RegisterDto): Promise<AuthResponse> => {
  const { phoneNumber, email, password, role } = registerDto;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ phoneNumber }, ...(email ? [{ email }] : [])],
  });

  if (existingUser) {
    throw new Error(
      existingUser.phoneNumber === phoneNumber
        ? 'Phone number already registered'
        : 'Email already registered'
    );
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const user = await User.create({
    phoneNumber,
    email,
    passwordHash,
    role,
    isVerified: false,
    isActive: true,
  });

  // Generate token
  const token = generateToken({
    id: user._id.toString(),
    role: user.role,
  });

  return {
    user: {
      id: user._id.toString(),
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isActive: user.isActive,
    },
    token,
  };
};

/**
 * Login user
 */
export const login = async (loginDto: LoginDto): Promise<AuthResponse> => {
  const { phoneNumber, email, password } = loginDto;

  if (!phoneNumber && !email) {
    throw new Error('Phone number or email is required');
  }

  // Find user
  const user = await User.findOne({
    $or: [
      ...(phoneNumber ? [{ phoneNumber }] : []),
      ...(email ? [{ email }] : []),
    ],
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new Error('Account is deactivated. Please contact support.');
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  // Generate token
  const token = generateToken({
    id: user._id.toString(),
    role: user.role,
  });

  return {
    user: {
      id: user._id.toString(),
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isActive: user.isActive,
    },
    token,
  };
};

