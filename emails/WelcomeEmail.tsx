import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Hr,
  Section,
} from "@react-email/components";

interface WelcomeEmailProps {
  name: string;
  dashboardUrl: string;
  referralCode?: string;
}

export default function WelcomeEmail({
  name,
  dashboardUrl,
  referralCode,
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Welcome to Code Hunters 🚀</Heading>
          <Text style={text}>Hey {name},</Text>
          <Text style={text}>
            You&apos;re officially a Code Hunter. Browse our premium courses and
            developer projects — all built with real-world production patterns.
          </Text>
          <Section style={{ textAlign: "center" as const, marginTop: "24px" }}>
            <Button href={dashboardUrl} style={button}>
              Start Learning →
            </Button>
          </Section>
          {referralCode && (
            <>
              <Hr style={hr} />
              <Section
                style={{
                  background: "#1A1A2E",
                  padding: "20px",
                  borderRadius: "8px",
                  textAlign: "center" as const,
                }}
              >
                <Text
                  style={{ ...text, fontSize: "14px", marginBottom: "8px" }}
                >
                  Your referral code:
                </Text>
                <Text
                  style={{
                    fontSize: "24px",
                    fontWeight: "700" as const,
                    color: "#FF6B35",
                    letterSpacing: "2px",
                    margin: "0 0 8px",
                  }}
                >
                  {referralCode}
                </Text>
                <Text
                  style={{
                    fontSize: "13px",
                    color: "#A1A1AA",
                    margin: 0,
                  }}
                >
                  Share it. Earn coins. Get discounts.
                </Text>
              </Section>
            </>
          )}
          <Hr style={hr} />
          <Text style={footer}>
            Got a .edu email? Verify it in your profile to unlock 20% student
            discount on every purchase.
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
const button = {
  backgroundColor: "#FF6B35",
  color: "#ffffff",
  padding: "12px 28px",
  borderRadius: "8px",
  fontWeight: "600" as const,
  fontSize: "14px",
  textDecoration: "none",
};
const hr = {
  borderColor: "#2a2a2a",
  margin: "32px 0",
};
const footer = {
  fontSize: "13px",
  color: "#666666",
};
