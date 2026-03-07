"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ImageIcon,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { INDIAN_STATES } from "@/utils/constants";

interface ProfileFormProps {
  profile: {
    name: string;
    email: string;
    phone: string;
    state: string;
    avatarUrl: string;
    studentVerified: boolean;
    studentEmail: string;
  };
}

interface FormData {
  name: string;
  phone: string;
  state: string;
  avatarUrl: string;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [studentEmailInput, setStudentEmailInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    defaultValues: {
      name: profile.name,
      phone: profile.phone,
      state: profile.state,
      avatarUrl: profile.avatarUrl,
    },
  });

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success("Profile updated successfully!");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update profile.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!studentEmailInput) {
      toast.error("Please enter your student email");
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch("/api/student/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: studentEmailInput }),
      });

      const data = await res.json();

      if (data.status === "otp_sent") {
        setOtpSent(true);
        toast.success("OTP sent! Check your student email inbox.");
      } else if (data.status === "not_eligible") {
        toast.error(data.message || "Not an educational email.");
      } else if (data.status === "blocked") {
        toast.error(data.message || "This email domain is not allowed.");
      } else {
        toast.error(data.error || "Failed to send verification email.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpInput || otpInput.length !== 6) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }
    setVerifyingOtp(true);
    try {
      const res = await fetch("/api/student/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: otpInput }),
      });

      const data = await res.json();

      if (data.verified) {
        toast.success("Student email verified! 🎉 20% discount unlocked.");
        window.location.reload();
      } else {
        toast.error(data.error || "Invalid OTP.");
      }
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const stateOptions = INDIAN_STATES.map((s) => ({ value: s, label: s }));

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Profile form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-white">
                <User className="h-3.5 w-3.5 text-muted" />
                Full Name
              </label>
              <Input
                {...register("name", {
                  required: "Name is required",
                  minLength: { value: 2, message: "Name too short" },
                })}
                placeholder="Your full name"
                error={errors.name?.message}
              />
            </div>

            {/* Email (read-only) */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-white">
                <Mail className="h-3.5 w-3.5 text-muted" />
                Email
              </label>
              <Input
                value={profile.email}
                disabled
                className="opacity-60 cursor-not-allowed"
              />
              <p className="text-xs text-muted">
                Email cannot be changed.
              </p>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-white">
                <Phone className="h-3.5 w-3.5 text-muted" />
                Phone Number
              </label>
              <Input
                {...register("phone", {
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: "Enter a valid 10-digit Indian phone number",
                  },
                })}
                placeholder="9876543210"
                error={errors.phone?.message}
              />
            </div>

            {/* State */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-white">
                <MapPin className="h-3.5 w-3.5 text-muted" />
                State
              </label>
              <Select
                {...register("state")}
                options={stateOptions}
                placeholder="Select your state"
                error={errors.state?.message}
              />
            </div>

            {/* Avatar URL */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-white">
                <ImageIcon className="h-3.5 w-3.5 text-muted" />
                Avatar URL
              </label>
              <Input
                {...register("avatarUrl")}
                placeholder="https://example.com/avatar.jpg"
                error={errors.avatarUrl?.message}
              />
              <p className="text-xs text-muted">
                Paste a direct link to your profile picture.
              </p>
            </div>

            <Button
              type="submit"
              disabled={saving || !isDirty}
              isLoading={saving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Student Verification */}
      <Card className={profile.studentVerified ? "border-success/20" : "border-border"}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-secondary" />
            Student Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profile.studentVerified ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 rounded-lg bg-success/10 border border-success/20 px-4 py-3"
            >
              <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
              <div>
                <p className="text-sm font-semibold text-success">
                  Student Verified
                </p>
                <p className="text-xs text-muted">
                  You&apos;re eligible for the 20% student discount on all
                  purchases.
                  {profile.studentEmail && (
                    <span className="ml-1 text-success/80">
                      ({profile.studentEmail})
                    </span>
                  )}
                </p>
              </div>
              <Badge variant="success" className="ml-auto shrink-0">
                Verified
              </Badge>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg bg-gold/5 border border-gold/20 px-4 py-3">
                <AlertCircle className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">
                    Not yet verified
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    Verify with your .edu or college email to unlock 20%
                    student discount on all courses and projects.
                  </p>
                </div>
              </div>

              {!otpSent ? (
                <div className="space-y-3">
                  <Input
                    placeholder="your-name@university.edu"
                    value={studentEmailInput}
                    onChange={(e) => setStudentEmailInput(e.target.value)}
                    type="email"
                  />
                  <Button
                    variant="secondary"
                    onClick={handleVerifyEmail}
                    disabled={verifying}
                    isLoading={verifying}
                    className="gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Send Verification OTP
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted">
                    OTP sent to{" "}
                    <span className="text-white font-medium">
                      {studentEmailInput}
                    </span>
                    . Enter the 6-digit code below:
                  </p>
                  <Input
                    placeholder="Enter 6-digit OTP"
                    value={otpInput}
                    onChange={(e) =>
                      setOtpInput(
                        e.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    maxLength={6}
                    className="text-center tracking-[0.5em] text-lg font-mono"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleVerifyOtp}
                      disabled={verifyingOtp || otpInput.length !== 6}
                      isLoading={verifyingOtp}
                      className="gap-2"
                    >
                      <KeyRound className="h-4 w-4" />
                      Verify OTP
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpInput("");
                      }}
                    >
                      Change Email
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
