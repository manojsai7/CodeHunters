export interface CourseWithLessons {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDesc: string | null;
  price: number;
  mrp: number;
  category: string;
  difficulty: string;
  thumbnail: string;
  previewVideoUrl: string | null;
  instructorName: string;
  instructorBio: string | null;
  instructorAvatar: string | null;
  purchasesCount: number;
  rating: number;
  reviewCount: number;
  isPublished: boolean;
  isBestseller: boolean;
  techTags: string[];
  createdAt: Date;
  lessons: LessonType[];
  reviews?: ReviewType[];
}

export interface LessonType {
  id: string;
  courseId: string;
  title: string;
  videoUrl: string;
  duration: number;
  order: number;
  isFree: boolean;
}

export interface ProjectType {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDesc: string | null;
  price: number;
  mrp: number;
  zipUrl: string;
  thumbnail: string | null;
  previewImages: string[];
  techTags: string[];
  category: string;
  difficulty: string;
  purchasesCount: number;
  rating: number;
  reviewCount: number;
  isPublished: boolean;
  isBestseller: boolean;
  createdAt: Date;
}

export interface ProfileType {
  id: string;
  userId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  goldCoins: number;
  referralCode: string;
  studentVerified: boolean;
  studentEmail: string | null;
  phone: string | null;
  state: string | null;
  createdAt: Date;
}

export interface PurchaseType {
  id: string;
  userId: string | null;
  courseId: string | null;
  projectId: string | null;
  amount: number;
  originalAmount: number;
  discountApplied: number;
  isStudentDiscount: boolean;
  referralDiscount: boolean;
  couponCode: string | null;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  status: string;
  createdAt: Date;
  course?: CourseWithLessons | null;
  project?: ProjectType | null;
}

export interface ReferralType {
  id: string;
  referrerId: string;
  referredUserId: string;
  referredName: string;
  purchaseMade: boolean;
  coinsAwarded: boolean;
  createdAt: Date;
}

export interface CouponType {
  id: string;
  code: string;
  discount: number;
  type: string;
  expiresAt: Date;
  usageLimit: number;
  usedCount: number;
  userId: string | null;
  source: string;
  isActive: boolean;
  createdAt: Date;
}

export interface ReviewType {
  id: string;
  userId: string;
  courseId: string;
  rating: number;
  comment: string | null;
  userName: string;
  createdAt: Date;
}

export interface LessonProgressType {
  id: string;
  userId: string;
  lessonId: string;
  completed: boolean;
  createdAt: Date;
}

export interface DashboardStats {
  totalRevenue: number;
  totalEnrollments: number;
  activeUsers: number;
  coinsIssued: number;
  pendingVerifications: number;
  revenueByMonth: { month: string; revenue: number }[];
  enrollmentsByMonth: { month: string; count: number }[];
}

export interface RazorpayOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  name: string;
  email: string;
  phone: string;
  discountApplied: number;
  isStudentDiscount: boolean;
}
