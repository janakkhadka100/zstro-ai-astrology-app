'use server';

import { z } from 'zod';
import { createUser, getUser, storeAstrologicalData, resetTokenUpdate, getUserByResetToken, updateUserPassword } from '@/lib/db/queries';
import { signIn } from './auth';
import { sendResetPasswordEmail } from '@/lib/mail';
import crypto from 'crypto';

// Define authentication form validation schema
const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// Define login action state
export interface LoginActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
}

// Login function
export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};

// Define register action state
export interface RegisterActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'user_exists' | 'invalid_data';
  message?: string;
}
export const register = async (
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  try {
    // ✅ Step 1: Validate input
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    // ✅ Step 2: Check if user exists
    const [existingUser] = await getUser(validatedData.email);
    if (existingUser) {
      return { status: 'user_exists', message: 'User already exists' };
    }

    // ✅ Step 3: Extract extra user data
    const name = formData.get('name') as string;
    const gender = formData.get('gender') as string;
    if (!['male', 'female', 'other'].includes(gender)) {
      return { status: 'invalid_data', message: 'Invalid gender' };
    }
    const validatedGender = gender as 'male' | 'female' | 'other';

    const dob = formData.get('dob') as string;
    const time = formData.get('time') as string;
    const latitude = formData.get('latitude') as string;
    const longitude = formData.get('longitude') as string;
    const timezone = formData.get('timezone') as string;
    const place = formData.get('place') as string;

    // ✅ Step 4: Create new user
    const newUser = await createUser(
      validatedData.email,
      validatedData.password,
      name,
      validatedGender,
      dob,
      time || '',
      latitude || '',
      longitude || '',
      timezone,
      place,
      'user'
    );

    if (!newUser?.id) {
      console.error('❌ Failed to create user');
      return { status: 'failed', message: 'User creation failed' };
    }

    // ✅ Step 5: Fetch astrology data if DOB, time, and location exist
    if (dob && time && latitude && longitude) {
      try {
        const formattedTime = time.length === 5 ? `${time}:00` : time;
        const datetime = `${dob} ${formattedTime}`;

        const baseParams = `datetime=${datetime}&latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&ayanamsa=1`;

        const endpoints = [
          { key: 'kundli', url: `https://api-zestkhabar-com.sobizcloud.com/api/astro/kundli?${baseParams}` },
          { key: 'planetPosition', url: `https://api-zestkhabar-com.sobizcloud.com/api/astro/planet-position?${baseParams}` },
          { key: 'dashaPeriods', url: `https://api-zestkhabar-com.sobizcloud.com/api/astro/dasha-periods?${baseParams}` },
        ];

        // ✅ Parallel API calls
        await Promise.all(endpoints.map(async ({ key, url }) => {
          try {
            const response = await fetch(url, { cache: 'no-store' });
            if (!response.ok) throw new Error(`Failed to fetch ${key}: ${response.statusText}`);

            const data = await response.json();
            const astroData = data?.data?.data;

            if (!astroData) {
              console.warn(`⚠️ No data received for ${key}`);
              return;
            }

            await storeAstrologicalData(newUser.id, key, {
              kundliData: JSON.stringify(astroData),
            });

            console.log(`✅ ${key} data stored successfully for user ${newUser.id}`);
          } catch (err) {
            console.error(`❌ Error fetching/storing ${key}:`, err);
          }
        }));
      } catch (err) {
        console.error('❌ Astrology API process failed:', err);
      }
    }

    // ✅ Step 6: Auto-login new user
    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success', message: 'Registration successful' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.warn('⚠️ Validation failed:', error.errors);
      return { status: 'invalid_data', message: 'Invalid input' };
    }

    console.error('❌ Registration failed:', error);
    return { status: 'failed', message: 'Unexpected error occurred' };
  }
};

// Forgot Password Schema
const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

// Define forgot password action state
export interface ForgotPasswordActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
}

// Forgot Password Function
export const forgotPassword = async (
  _: ForgotPasswordActionState,
  formData: FormData,
): Promise<ForgotPasswordActionState> => {
  try {
    const validatedData = forgotPasswordSchema.parse({
      email: formData.get('email'),
    });

    const [user] = await getUser(validatedData.email);
    if (!user) {
      return { status: 'failed' }; // Prevents email enumeration
    }

    // Generate a secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour expiry

    // Store the reset token and expiry in the database
    await resetTokenUpdate(user.id, resetToken, resetTokenExpiry);


    // Send reset password email
    await sendResetPasswordEmail(user.email, resetToken);

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    console.error('Forgot password request failed:', error);
    return { status: 'failed' };
  }
};

// Schema to validate reset form
const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});


export interface ResetPasswordActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data' | 'token_invalid' | 'token_expired' | 'error';
  message?: string;
}
export const resetPassword = async (
  _: ResetPasswordActionState,
  formData: FormData,
): Promise<ResetPasswordActionState> => {
  console.log('FormData:', Object.fromEntries(formData)); // Log form data
  try {
    const validated = resetPasswordSchema.parse({
      token: formData.get('token'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirm-password'),
    });

    // Fetch user by token
    const user = await getUserByResetToken(validated.token); // Make sure you implement this DB call

    if (!user) {
      return { status: 'token_invalid' };
    }
    if (!user.resetTokenExpiry || new Date(user.resetTokenExpiry) < new Date()) {
      return { status: 'token_expired' };
    }

    // Hash and save new password
    await updateUserPassword(user.id, validated.password); // You need to hash inside this function

    // Clear the reset token so it can't be reused
    await resetTokenUpdate(user.id, null, null);

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log('ZodError:', error.errors); // Log specific validation errors
      return { status: 'invalid_data' };
    }
    console.error('Password reset error:', error);
    return { status: 'error', message: 'An unexpected error occurred' };
  }
};
