import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Section,
} from "@react-email/components";

interface OtpVerificationProps {
  name: string;
  otp: string;
}

export default function OtpVerification({ name, otp }: OtpVerificationProps) {
  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Verify Your Student Email</Heading>
          <Text style={text}>Hi {name},</Text>
          <Text style={text}>
            Use this one-time code to verify your student email on Code Hunters:
          </Text>
          <Section style={codeBox}>
            <Text style={codeText}>{otp}</Text>
          </Section>
          <Text style={subtext}>
            This code expires in 30 minutes. If you didn&apos;t request this, you
            can safely ignore this email.
          </Text>
          <Text style={footer}>— Code Hunters Team</Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#0F0F0F",
  fontFamily: "Inter, -apple-system, sans-serif",
  color: "#ffffff",
};
const container = {
  maxWidth: "560px",
  margin: "0 auto",
  padding: "40px 24px",
};
const heading = {
  fontSize: "24px",
  lineHeight: "1.3",
  fontWeight: "700" as const,
  color: "#ffffff",
};
const text = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#e0e0e0",
};
const codeBox = {
  textAlign: "center" as const,
  margin: "24px 0",
  padding: "20px",
  backgroundColor: "#1A1A2E",
  borderRadius: "12px",
  border: "1px solid #2a2a3e",
};
const codeText = {
  fontSize: "36px",
  fontWeight: "700" as const,
  letterSpacing: "8px",
  color: "#FF6B35",
  margin: "0",
};
const subtext = {
  fontSize: "13px",
  color: "#888888",
  marginTop: "24px",
};
const footer = {
  fontSize: "13px",
  color: "#666666",
  marginTop: "32px",
};
