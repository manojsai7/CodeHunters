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

interface PaymentFailedProps {
  name: string;
  productTitle: string;
  amount: number;
  reason: string;
  retryUrl: string;
}

export default function PaymentFailed({
  name,
  productTitle,
  amount,
  reason,
  retryUrl,
}: PaymentFailedProps) {
  return (
    <Html lang="en">
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Section
            style={{
              background: "#2D0A0A",
              padding: "24px",
              borderRadius: "12px 12px 0 0",
              borderBottom: "2px solid #DC2626",
            }}
          >
            <Heading style={heading}>Payment Failed</Heading>
            <Text style={text}>Hey {name},</Text>
            <Text style={text}>
              Your payment of <strong style={{ color: "#fff" }}>₹{amount}</strong>{" "}
              for <strong style={{ color: "#fff" }}>{productTitle}</strong> could
              not be processed.
            </Text>
          </Section>

          <Section style={{ padding: "24px" }}>
            <Text
              style={{
                ...text,
                background: "#1A1A2E",
                padding: "16px",
                borderRadius: "8px",
                borderLeft: "4px solid #DC2626",
              }}
            >
              <strong style={{ color: "#DC2626" }}>Reason:</strong>{" "}
              <span style={{ color: "#e0e0e0" }}>{reason}</span>
            </Text>

            <Text style={{ ...text, marginTop: "20px" }}>
              No amount was deducted from your account. You can try again
              anytime — your selection is saved.
            </Text>

            <Section
              style={{ textAlign: "center" as const, marginTop: "24px" }}
            >
              <Button href={retryUrl} style={button}>
                Try Again →
              </Button>
            </Section>
          </Section>

          <Hr style={hr} />
          <Section style={{ padding: "0 24px 24px" }}>
            <Text style={footer}>
              If the problem persists, try a different payment method or contact
              your bank. You can also reach us at support@codehunters.dev.
            </Text>
            <Text style={footer}>— Code Hunters Team</Text>
          </Section>
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
  color: "#DC2626",
};
const text = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#e0e0e0",
};
const button = {
  backgroundColor: "#FF6B35",
  color: "#ffffff",
  padding: "14px 32px",
  borderRadius: "8px",
  fontWeight: "600" as const,
  fontSize: "15px",
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
