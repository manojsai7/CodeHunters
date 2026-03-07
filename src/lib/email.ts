import { Resend } from "resend";
import PurchaseConfirmation from "@emails/PurchaseConfirmation";
import PurchaseInvoice from "@emails/PurchaseInvoice";
import PaymentFailed from "@emails/PaymentFailed";
import OtpVerification from "@emails/OtpVerification";
import WelcomeEmail from "@emails/WelcomeEmail";
import DripDay3 from "@emails/DripDay3";
import DripDay7 from "@emails/DripDay7";
import CoinRewardEmail from "@emails/CoinRewardEmail";

// Lazily initialized — never called at build time, only at request time
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "Code Hunters <noreply@codehunters.dev>";
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://www.codehunters.dev";

async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: React.ReactElement;
}) {
  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      react,
    });
  } catch (err) {
    console.error("[Resend email failed]", err);
    // Never throw — email failure must never break user flows
  }
}

export async function sendPurchaseConfirmationEmail(
  email: string,
  name: string,
  productTitle: string,
  amount: number,
  paymentId: string
) {
  await sendEmail({
    to: email,
    subject: `🎉 You're in! Access your purchase — ${productTitle}`,
    react: PurchaseConfirmation({
      name,
      product: productTitle,
      amount,
      paymentId,
      accessUrl: `${APP_URL}/dashboard/my-learning`,
    }),
  });
}

export async function sendWelcomeEmail(
  email: string,
  name: string,
  referralCode?: string
) {
  await sendEmail({
    to: email,
    subject: "Welcome to Code Hunters 🚀",
    react: WelcomeEmail({
      name,
      dashboardUrl: `${APP_URL}/dashboard/my-learning`,
      referralCode,
    }),
  });
}

export async function sendPurchaseInvoiceEmail(
  email: string,
  name: string,
  invoiceProps: {
    invoiceNumber: string;
    invoiceDate: string;
    buyerName: string;
    buyerEmail: string;
    buyerState: string;
    productTitle: string;
    productType: "course" | "project";
    originalAmount: number;
    discountAmount: number;
    taxableAmount: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalAmount: number;
    razorpayPaymentId: string;
  }
) {
  await sendEmail({
    to: email,
    subject: `Invoice ${invoiceProps.invoiceNumber} — Code Hunters`,
    react: PurchaseInvoice({
      ...invoiceProps,
      accessUrl: `${APP_URL}/dashboard/my-learning`,
    }),
  });
}

export async function sendPaymentFailedEmail(
  email: string,
  name: string,
  productTitle: string,
  amount: number,
  reason: string,
  retryUrl: string
) {
  await sendEmail({
    to: email,
    subject: "Payment Failed — Code Hunters",
    react: PaymentFailed({
      name,
      productTitle,
      amount,
      reason,
      retryUrl,
    }),
  });
}

export async function sendReferralRewardEmail(
  email: string,
  name: string,
  couponCode: string,
  goldCoins: number
) {
  await sendEmail({
    to: email,
    subject: "🪙 You've unlocked 20% off!",
    react: CoinRewardEmail({
      name,
      couponCode,
      goldCoins,
      dashboardUrl: `${APP_URL}/dashboard/referrals`,
    }),
  });
}

export async function sendStudentOtpEmail(
  email: string,
  name: string,
  otp: string
) {
  await sendEmail({
    to: email,
    subject: `Your Code Hunters OTP: ${otp}`,
    react: OtpVerification({ name, otp }),
  });
}

export async function sendOnboardingDay3Email(email: string, name: string) {
  await sendEmail({
    to: email,
    subject: "Top picks for you this week 🔥",
    react: DripDay3({
      name,
      coursesUrl: `${APP_URL}/courses`,
    }),
  });
}

export async function sendOnboardingDay7Email(email: string, name: string) {
  await sendEmail({
    to: email,
    subject: "Still hunting? Here's 10% off 🎯",
    react: DripDay7({
      name,
      coursesUrl: `${APP_URL}/courses`,
    }),
  });
}
