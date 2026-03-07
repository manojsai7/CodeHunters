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

interface DripDay3Props {
  name: string;
  coursesUrl: string;
}

export default function DripDay3({ name, coursesUrl }: DripDay3Props) {
  return (
    <Html>
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Top picks for you this week 🔥</Heading>
          <Text style={text}>Hey {name},</Text>
          <Text style={text}>
            You joined Code Hunters a few days ago — here are some of this
            week&apos;s most popular courses and projects picked just for you.
          </Text>
          <Section style={{ textAlign: "center" as const, marginTop: "24px" }}>
            <Button href={coursesUrl} style={button}>
              Browse Courses →
            </Button>
          </Section>
          <Hr style={hr} />
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
