import { NextResponse } from "next/server";
import { Resend } from "resend";
import { captureApiError } from "@/lib/sentry";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message, category } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Format the email content
    const emailContent = `
New Contact Form Submission

Category: ${category || "General"}
From: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
Sent from Koru Contact Form
    `.trim();

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: "Koru Contact <onboarding@resend.dev>", // Use your verified domain in production
      to: "pingkoru@gmail.com",
      replyTo: email,
      subject: `[Koru Contact] ${subject}`,
      text: emailContent,
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #C385EE 0%, #DAB079 100%); padding: 20px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <div style="margin-bottom: 16px;">
              <span style="display: inline-block; background: #C385EE20; color: #C385EE; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 500;">
                ${category || "General"}
              </span>
            </div>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 80px;">From:</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Email:</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px;">
                  <a href="mailto:${email}" style="color: #C385EE; text-decoration: none;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Subject:</td>
                <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">${subject}</td>
              </tr>
            </table>
            
            <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              <h3 style="margin: 0 0 12px 0; color: #374151; font-size: 14px; font-weight: 600;">Message:</h3>
              <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; color: #374151; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</div>
            </div>
            
            <div style="margin-top: 24px; text-align: center;">
              <a href="mailto:${email}" style="display: inline-block; background: #C385EE; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; font-size: 14px;">
                Reply to ${name}
              </a>
            </div>
          </div>
          
          <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px;">
            Sent from Koru Contact Form
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (error) {
    captureApiError(error, "POST /api/contact");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
