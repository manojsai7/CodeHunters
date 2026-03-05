import { NextRequest, NextResponse } from "next/server";

const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get("x-n8n-secret");

    if (!N8N_WEBHOOK_SECRET || secret !== N8N_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { event, data } = body;

    switch (event) {
      case "send_otp": {
        // Placeholder: integrate with SMS/email service
        console.log("n8n callback: send_otp", data);
        break;
      }

      case "send_welcome_email": {
        // Placeholder: integrate with email service
        console.log("n8n callback: send_welcome_email", data);
        break;
      }

      case "send_certificate": {
        // Placeholder: integrate with certificate generation service
        console.log("n8n callback: send_certificate", data);
        break;
      }

      default:
        console.log(`Unhandled n8n event: ${event}`, data);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("n8n webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
