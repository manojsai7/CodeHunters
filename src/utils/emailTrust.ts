export const TEMP_MAIL_DOMAINS: string[] = [
  "mailinator.com",
  "guerrillamail.com",
  "throwam.com",
  "yopmail.com",
  "10minutemail.com",
  "trashmail.com",
  "sharklasers.com",
  "dispostable.com",
  "maildrop.cc",
  "tempmail.com",
  "fakeinbox.com",
  "getairmail.com",
  "spamgourmet.com",
  "mailnull.com",
  "discard.email",
  "guerrillamail.info",
  "grr.la",
  "guerrillamail.net",
  "guerrillamail.org",
  "guerrillamailblock.com",
  "pokemail.net",
  "spam4.me",
  "bccto.me",
  "byom.de",
  "trashmail.net",
  "trashmail.org",
  "wegwerfmail.de",
  "wegwerfmail.net",
  "emailondeck.com",
  "33mail.com",
  "maildrop.cc",
  "temp-mail.org",
  "tempail.com",
  "mohmal.com",
  "getnada.com",
  "guerrillamail.de",
  "harakirimail.com",
  "mailcatch.com",
  "throwaway.email",
  "tmpmail.net",
  "tmpmail.org",
  "burnermail.io",
  "minutemail.com",
  "guerrillamail.biz",
];

export const CONSUMER_EMAIL_DOMAINS: string[] = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "protonmail.com",
  "icloud.com",
  "live.com",
  "aol.com",
  "yandex.com",
  "rediffmail.com",
  "yahoo.in",
  "hotmail.in",
  "outlook.in",
  "zoho.com",
  "zohomail.in",
  "mail.com",
  "gmx.com",
  "pm.me",
  "fastmail.com",
  "tutanota.com",
];

export type EmailTrustLevel = "blocked" | "consumer" | "student" | "suspicious";

export function classifyEmail(email: string): EmailTrustLevel {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return "blocked";
  if (TEMP_MAIL_DOMAINS.includes(domain)) return "blocked";
  if (CONSUMER_EMAIL_DOMAINS.includes(domain)) return "consumer";
  // Unknown domain treated as potential student/institutional
  return "student";
}

export function isStudentEmail(email: string): boolean {
  const level = classifyEmail(email);
  return level === "student";
}

export function isBlockedEmail(email: string): boolean {
  return classifyEmail(email) === "blocked";
}

export function getEmailDomain(email: string): string {
  return email.split("@")[1]?.toLowerCase() ?? "";
}
