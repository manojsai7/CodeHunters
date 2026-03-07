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
  Row,
  Column,
} from "@react-email/components";

interface PurchaseInvoiceProps {
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
  accessUrl: string;
}

export default function PurchaseInvoice({
  invoiceNumber,
  invoiceDate,
  buyerName,
  buyerEmail,
  buyerState,
  productTitle,
  productType,
  originalAmount,
  discountAmount,
  taxableAmount,
  cgst,
  sgst,
  igst,
  totalAmount,
  razorpayPaymentId,
  accessUrl,
}: PurchaseInvoiceProps) {
  const isSameState = buyerState === "Andhra Pradesh";

  return (
    <Html lang="en">
      <Head />
      <Body
        style={{
          background: "#0F0F0F",
          fontFamily: "Inter, -apple-system, sans-serif",
          margin: 0,
        }}
      >
        <Container
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            background: "#1A1A2E",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Section style={{ background: "#FF6B35", padding: "24px 32px" }}>
            <Row>
              <Column>
                <Heading
                  style={{
                    color: "#fff",
                    margin: 0,
                    fontSize: "24px",
                  }}
                >
                  Code Hunters
                </Heading>
                <Text
                  style={{
                    color: "#fff",
                    margin: 0,
                    fontSize: "12px",
                  }}
                >
                  Hunt the Skills. Build the Future.
                </Text>
              </Column>
              <Column align="right">
                <Text
                  style={{
                    color: "#fff",
                    fontSize: "20px",
                    fontWeight: "bold",
                    margin: 0,
                  }}
                >
                  TAX INVOICE
                </Text>
                <Text
                  style={{
                    color: "#ffe0d0",
                    fontSize: "12px",
                    margin: 0,
                  }}
                >
                  #{invoiceNumber}
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Invoice Meta */}
          <Section
            style={{
              padding: "24px 32px",
              borderBottom: "1px solid #2a2a3e",
            }}
          >
            <Row>
              <Column>
                <Text
                  style={{
                    color: "#A1A1AA",
                    fontSize: "11px",
                    margin: "0 0 4px",
                  }}
                >
                  BILLED TO
                </Text>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: "bold",
                    margin: 0,
                  }}
                >
                  {buyerName}
                </Text>
                <Text
                  style={{
                    color: "#A1A1AA",
                    fontSize: "13px",
                    margin: "2px 0",
                  }}
                >
                  {buyerEmail}
                </Text>
                <Text
                  style={{
                    color: "#A1A1AA",
                    fontSize: "13px",
                    margin: 0,
                  }}
                >
                  {buyerState}, India
                </Text>
              </Column>
              <Column align="right">
                <Text
                  style={{
                    color: "#A1A1AA",
                    fontSize: "11px",
                    margin: "0 0 4px",
                  }}
                >
                  INVOICE DETAILS
                </Text>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: "13px",
                    margin: "2px 0",
                  }}
                >
                  Date: {invoiceDate}
                </Text>
                <Text
                  style={{
                    color: "#A1A1AA",
                    fontSize: "12px",
                    margin: "2px 0",
                  }}
                >
                  Payment ID: {razorpayPaymentId}
                </Text>
                <Text
                  style={{
                    color: "#A1A1AA",
                    fontSize: "12px",
                    margin: 0,
                  }}
                >
                  GSTIN: {process.env.SELLER_GSTIN || "Pending Registration"}
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Product Line Item */}
          <Section style={{ padding: "24px 32px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #2a2a3e" }}>
                  <th
                    style={{
                      color: "#A1A1AA",
                      fontSize: "11px",
                      textAlign: "left" as const,
                      padding: "8px 0",
                    }}
                  >
                    DESCRIPTION
                  </th>
                  <th
                    style={{
                      color: "#A1A1AA",
                      fontSize: "11px",
                      textAlign: "right" as const,
                      padding: "8px 0",
                    }}
                  >
                    HSN/SAC
                  </th>
                  <th
                    style={{
                      color: "#A1A1AA",
                      fontSize: "11px",
                      textAlign: "right" as const,
                      padding: "8px 0",
                    }}
                  >
                    AMOUNT
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    style={{
                      color: "#fff",
                      fontSize: "14px",
                      padding: "12px 0",
                    }}
                  >
                    {productTitle}
                    <br />
                    <span
                      style={{
                        color: "#A1A1AA",
                        fontSize: "12px",
                      }}
                    >
                      Digital{" "}
                      {productType === "course"
                        ? "Online Course"
                        : "Software Project"}{" "}
                      — Lifetime Access
                    </span>
                  </td>
                  <td
                    style={{
                      color: "#A1A1AA",
                      fontSize: "13px",
                      textAlign: "right" as const,
                      padding: "12px 0",
                    }}
                  >
                    998431
                  </td>
                  <td
                    style={{
                      color: "#fff",
                      fontSize: "14px",
                      textAlign: "right" as const,
                      padding: "12px 0",
                    }}
                  >
                    ₹{originalAmount}
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* Tax Breakdown */}
          <Section
            style={{
              padding: "0 32px 24px",
              borderTop: "1px solid #2a2a3e",
            }}
          >
            <table style={{ width: "100%" }}>
              <tbody>
                <tr>
                  <td style={{ color: "#A1A1AA", padding: "6px 0" }}>
                    Subtotal
                  </td>
                  <td
                    style={{
                      color: "#fff",
                      textAlign: "right" as const,
                    }}
                  >
                    ₹{originalAmount}
                  </td>
                </tr>
                {discountAmount > 0 && (
                  <tr>
                    <td style={{ color: "#22C55E", padding: "6px 0" }}>
                      Discount Applied
                    </td>
                    <td
                      style={{
                        color: "#22C55E",
                        textAlign: "right" as const,
                      }}
                    >
                      - ₹{discountAmount}
                    </td>
                  </tr>
                )}
                <tr>
                  <td style={{ color: "#A1A1AA", padding: "6px 0" }}>
                    Taxable Amount
                  </td>
                  <td
                    style={{
                      color: "#fff",
                      textAlign: "right" as const,
                    }}
                  >
                    ₹{taxableAmount}
                  </td>
                </tr>
                {isSameState ? (
                  <>
                    <tr>
                      <td style={{ color: "#A1A1AA", padding: "6px 0" }}>
                        CGST @ 9%
                      </td>
                      <td
                        style={{
                          color: "#fff",
                          textAlign: "right" as const,
                        }}
                      >
                        ₹{cgst}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ color: "#A1A1AA", padding: "6px 0" }}>
                        SGST @ 9%
                      </td>
                      <td
                        style={{
                          color: "#fff",
                          textAlign: "right" as const,
                        }}
                      >
                        ₹{sgst}
                      </td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td style={{ color: "#A1A1AA", padding: "6px 0" }}>
                      IGST @ 18%
                    </td>
                    <td
                      style={{
                        color: "#fff",
                        textAlign: "right" as const,
                      }}
                    >
                      ₹{igst}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <Hr style={{ borderColor: "#FF6B35", margin: "8px 0" }} />
            <table style={{ width: "100%" }}>
              <tbody>
                <tr>
                  <td
                    style={{
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: "18px",
                      padding: "8px 0",
                    }}
                  >
                    Total Paid
                  </td>
                  <td
                    style={{
                      color: "#FF6B35",
                      fontWeight: "bold",
                      fontSize: "18px",
                      textAlign: "right" as const,
                    }}
                  >
                    ₹{totalAmount}
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          {/* CTA */}
          <Section
            style={{
              padding: "24px 32px",
              textAlign: "center" as const,
              background: "#111127",
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              Your {productType} is ready!
            </Text>
            <Button
              href={accessUrl}
              style={{
                background: "#FF6B35",
                color: "#fff",
                padding: "14px 32px",
                borderRadius: "8px",
                fontWeight: "bold",
                fontSize: "15px",
                textDecoration: "none",
              }}
            >
              Access Now →
            </Button>
            <Text
              style={{
                color: "#A1A1AA",
                fontSize: "12px",
                marginTop: "16px",
              }}
            >
              Keep this email as your payment receipt. For support:
              support@codehunters.dev
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
