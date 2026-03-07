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

interface CoinRewardEmailProps {
  name: string;
  couponCode: string;
  goldCoins: number;
  dashboardUrl: string;
}

export default function CoinRewardEmail({
  name,
  couponCode,
  goldCoins,
  dashboardUrl,
}: CoinRewardEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>
            🪙 You&apos;ve unlocked a reward!
          </Heading>
          <Text style={text}>Hey {name},</Text>
          <Text style={text}>
            You&apos;ve earned <strong style={{ color: "#FFD700" }}>{goldCoins} gold coins</strong>{" "}
            through referrals. As a thank you, here&apos;s an exclusive 20% off
            coupon:
          </Text>
          <Section style={couponBox}>
            <Text style={couponLabel}>YOUR COUPON</Text>
            <Text style={couponCodeStyle}>{couponCode}</Text>
            <Text style={couponExpiry}>Valid for 6 months • Single use</Text>
          </Section>
          <Section style={{ textAlign: "center" as const, marginTop: "24px" }}>
            <Button href={dashboardUrl} style={button}>
              Use Your Coupon →
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            Keep referring friends to earn more gold coins!
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
const couponBox = {
  textAlign: "center" as const,
  margin: "24px 0",
  padding: "20px",
  backgroundColor: "#1A1A2E",
  borderRadius: "12px",
  border: "1px solid #FFD700",
};
const couponLabel = {
  fontSize: "12px",
  color: "#888888",
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
  margin: "0 0 4px 0",
};
const couponCodeStyle = {
  fontSize: "28px",
  fontWeight: "700" as const,
  color: "#FFD700",
  margin: "0",
};
const couponExpiry = {
  fontSize: "12px",
  color: "#888888",
  margin: "4px 0 0 0",
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
