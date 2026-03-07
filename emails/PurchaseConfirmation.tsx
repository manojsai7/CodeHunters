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

interface PurchaseConfirmationProps {
  name: string;
  product: string;
  amount: number;
  paymentId: string;
  accessUrl: string;
}

export default function PurchaseConfirmation({
  name,
  product,
  amount,
  paymentId,
  accessUrl,
}: PurchaseConfirmationProps) {
  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Hey {name}, you&apos;re in! 🎉</Heading>
          <Text style={text}>
            You&apos;ve successfully purchased <strong>{product}</strong> for{" "}
            <strong>₹{amount}</strong>.
          </Text>
          <Text style={subtext}>Payment ID: {paymentId}</Text>
          <Section style={{ textAlign: "center" as const, marginTop: "24px" }}>
            <Button href={accessUrl} style={button}>
              Access Your Purchase →
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            Questions? Reply to this email — we&apos;re happy to help.
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
const subtext = {
  fontSize: "13px",
  color: "#888888",
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
