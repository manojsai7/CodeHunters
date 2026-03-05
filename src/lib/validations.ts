import { z } from "zod";

export const preCheckoutSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  state: z.string().min(1, "Please select your state"),
  selfDeclaredStudent: z.boolean().default(false),
  productId: z.string().uuid(),
  productType: z.enum(["course", "project"]),
  referralCode: z.string().optional(),
  couponCode: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    referralCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const createOrderSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  state: z.string().min(1),
  selfDeclaredStudent: z.boolean().default(false),
  productId: z.string(),
  productType: z.enum(["course", "project"]),
  referralCode: z.string().optional(),
  couponCode: z.string().optional(),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export const verifyStudentSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const courseSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().min(10),
  shortDesc: z.string().optional(),
  price: z.number().min(0),
  mrp: z.number().min(0),
  category: z.string(),
  difficulty: z.string(),
  thumbnail: z.string().url(),
  previewVideoUrl: z.string().url().optional(),
  instructorName: z.string().optional(),
  instructorBio: z.string().optional(),
  techTags: z.array(z.string()),
  isPublished: z.boolean().default(false),
});

export const lessonSchema = z.object({
  title: z.string().min(3),
  videoUrl: z.string().url(),
  duration: z.number().min(0),
  order: z.number().min(0),
  isFree: z.boolean().default(false),
});

export const projectSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  description: z.string().min(10),
  shortDesc: z.string().optional(),
  price: z.number().min(0),
  mrp: z.number().min(0),
  zipUrl: z.string(),
  thumbnail: z.string().optional(),
  techTags: z.array(z.string()),
  category: z.string(),
  difficulty: z.string(),
  isPublished: z.boolean().default(false),
});

export const couponSchema = z.object({
  code: z.string().min(3),
  discount: z.number().min(1).max(100),
  type: z.enum(["percent", "flat"]),
  expiresAt: z.string(),
  usageLimit: z.number().min(1),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  avatarUrl: z.string().url().optional(),
  phone: z.string().optional(),
  state: z.string().optional(),
});

export type PreCheckoutFormData = z.infer<typeof preCheckoutSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CreateOrderData = z.infer<typeof createOrderSchema>;
export type VerifyPaymentData = z.infer<typeof verifyPaymentSchema>;
export type VerifyStudentData = z.infer<typeof verifyStudentSchema>;
