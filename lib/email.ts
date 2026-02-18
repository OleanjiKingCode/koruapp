import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import * as Sentry from "@sentry/nextjs";

// ── Lazy singleton SMTP transporter (Zoho Mail) ─────────────────────────

let transporterInstance: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporterInstance) {
    const user = process.env.ZOHO_MAIL_USER;
    const pass = process.env.ZOHO_MAIL_PASSWORD;

    if (!user || !pass) {
      throw new Error("ZOHO_MAIL_USER and ZOHO_MAIL_PASSWORD are required");
    }

    transporterInstance = nodemailer.createTransport({
      host: "smtp.zoho.com",
      port: 465,
      secure: true,
      auth: { user, pass },
    });
  }
  return transporterInstance;
}

// ── Send email (fire-and-forget safe) ────────────────────────────────────

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const from = process.env.ZOHO_MAIL_USER;
    if (!from) return;

    await getTransporter().sendMail({
      from: `Koru <${from}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      Sentry.captureException(error, {
        tags: { operation: "email:send" },
        extra: { to, subject },
      });
    }
    // Error already captured by Sentry in production
  }
}

// ── Branded HTML template wrapper (dark theme matching welcome email) ─────

function wrapInBrandedTemplate(body: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:rgb(11,11,16);font-family:Arial,Helvetica,sans-serif;color:rgb(255,255,255);">
  <table style="background:rgb(11,11,16)" cellspacing="0" cellpadding="0" width="100%">
    <tr>
      <td style="padding:30px 12px" align="center">
        <table style="max-width:600px;width:100%" cellspacing="0" cellpadding="0" width="600">
          <!-- Logo -->
          <tr>
            <td style="padding-bottom:18px" align="center">
              <img alt="Koru" style="display:block;border:0;max-width:190px;height:auto" width="190" src="https://files.catbox.moe/5kphfa.png" />
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="background:rgb(18,18,26);border-radius:14px;padding:26px 22px">
              ${body}
              <!-- Divider -->
              <div style="min-height:1px;background:rgb(38,38,48);margin:20px 0"></div>
              <!-- Footer -->
              <div style="text-align:center;font-size:13px;color:rgb(156,163,175);line-height:1.6">
                <div><b style="color:rgb(255,255,255)">Koru</b></div>
                <div>Structuring access to opportunity</div>
                <div>
                  <a target="_blank" style="color:rgb(167,139,250);text-decoration:none" href="https://koruapp.xyz">koruapp.xyz</a>
                  &nbsp;&nbsp;&bull;&nbsp;&nbsp;
                  <a target="_blank" style="color:rgb(167,139,250);text-decoration:none" href="mailto:hello@koruapp.xyz">hello@koruapp.xyz</a>
                </div>
              </div>
              <table style="margin-top:12px" cellspacing="0" cellpadding="0" width="100%">
                <tr>
                  <td align="center">
                    <a target="_blank" href="https://x.com/koaborations">
                      <img alt="X" style="display:inline-block;border:0" width="26" src="https://cdn-icons-png.flaticon.com/512/5968/5968958.png" />
                    </a>
                  </td>
                </tr>
              </table>
              <div style="text-align:center;margin-top:12px;font-size:11px;color:rgb(107,114,128)">
                <div>Update your email preferences in your <a target="_blank" style="color:rgb(167,139,250);text-decoration:none" href="https://koruapp.xyz/profile/edit">profile settings</a>.</div>
              </div>
              <div style="text-align:center;margin-top:14px;font-size:11px;color:rgb(107,114,128)">&copy; 2026 Koru &mdash; All rights reserved</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Template builders ────────────────────────────────────────────────────

interface EmailContent {
  subject: string;
  html: string;
}

export function buildBookingCreatedSeekerEmail(params: {
  hostName: string;
  hostUsername: string;
  amount: number;
  chatId: string;
}): EmailContent {
  const body = `
    <div style="font-size:24px;font-weight:bold;color:rgb(255,255,255)">Booking Confirmed</div>
    <div style="font-size:15px;color:rgb(209,213,219);margin-top:16px;line-height:1.6">
      <div>Your chat request with <strong style="color:rgb(255,255,255)">@${params.hostUsername}</strong> (${params.hostName}) has been submitted.</div>
      <div style="background:rgb(30,30,44);border-radius:10px;padding:14px 16px;margin:16px 0">
        <div style="font-size:13px;color:rgb(156,163,175)">Amount</div>
        <div style="font-size:22px;font-weight:bold;color:rgb(167,139,250);margin-top:4px">$${params.amount.toFixed(2)}</div>
      </div>
      <div>Funds are held in escrow until the chat is completed. You'll get a full refund if the host doesn't respond.</div>
    </div>
    <table style="margin-top:22px" cellspacing="0" cellpadding="0" width="100%">
      <tr><td align="center">
        <table cellspacing="0" cellpadding="0"><tr>
          <td style="border-radius:10px" bgcolor="#7c3aed">
            <a target="_blank" style="padding:12px 20px;display:inline-block;color:rgb(255,255,255);text-decoration:none;font-weight:bold;font-size:14px" href="https://koruapp.xyz/chats">View Your Chats</a>
          </td>
        </tr></table>
      </td></tr>
    </table>`;
  return {
    subject: `Booking confirmed with @${params.hostUsername}`,
    html: wrapInBrandedTemplate(body),
  };
}

export function buildBookingCreatedHostEmail(params: {
  seekerName: string;
  seekerUsername: string;
  amount: number;
  chatId: string;
}): EmailContent {
  const body = `
    <div style="font-size:24px;font-weight:bold;color:rgb(255,255,255)">New Chat Request</div>
    <div style="font-size:15px;color:rgb(209,213,219);margin-top:16px;line-height:1.6">
      <div><strong style="color:rgb(255,255,255)">@${params.seekerUsername}</strong> (${params.seekerName}) wants to chat with you.</div>
      <div style="background:rgb(30,30,44);border-radius:10px;padding:14px 16px;margin:16px 0">
        <div style="font-size:13px;color:rgb(156,163,175)">They're offering</div>
        <div style="font-size:22px;font-weight:bold;color:rgb(167,139,250);margin-top:4px">$${params.amount.toFixed(2)}</div>
      </div>
      <div>Accept the request in your inbox to start the conversation.</div>
    </div>
    <table style="margin-top:22px" cellspacing="0" cellpadding="0" width="100%">
      <tr><td align="center">
        <table cellspacing="0" cellpadding="0"><tr>
          <td style="border-radius:10px" bgcolor="#7c3aed">
            <a target="_blank" style="padding:12px 20px;display:inline-block;color:rgb(255,255,255);text-decoration:none;font-weight:bold;font-size:14px" href="https://koruapp.xyz/chats">View Request</a>
          </td>
        </tr></table>
      </td></tr>
    </table>`;
  return {
    subject: `New chat request from @${params.seekerUsername} ($${params.amount.toFixed(2)})`,
    html: wrapInBrandedTemplate(body),
  };
}

export function buildSummonCreatedEmail(params: {
  creatorName: string;
  creatorUsername: string;
  totalPledged: number;
}): EmailContent {
  const body = `
    <div style="font-size:24px;font-weight:bold;color:rgb(255,255,255)">You've Been Summoned!</div>
    <div style="font-size:15px;color:rgb(209,213,219);margin-top:16px;line-height:1.6">
      <div><strong style="color:rgb(255,255,255)">@${params.creatorUsername}</strong> (${params.creatorName}) created a summon for you on Koru.</div>
      <div style="background:rgb(30,30,44);border-radius:10px;padding:14px 16px;margin:16px 0">
        <div style="font-size:13px;color:rgb(156,163,175)">Total pledged</div>
        <div style="font-size:22px;font-weight:bold;color:rgb(212,168,67);margin-top:4px">$${params.totalPledged.toFixed(2)}</div>
      </div>
      <div>People are pooling funds to have a conversation with you. Check it out and respond when you're ready.</div>
    </div>
    <table style="margin-top:22px" cellspacing="0" cellpadding="0" width="100%">
      <tr><td align="center">
        <table cellspacing="0" cellpadding="0"><tr>
          <td style="border-radius:10px" bgcolor="#7c3aed">
            <a target="_blank" style="padding:12px 20px;display:inline-block;color:rgb(255,255,255);text-decoration:none;font-weight:bold;font-size:14px" href="https://koruapp.xyz/summons">View Summons</a>
          </td>
        </tr></table>
      </td></tr>
    </table>`;
  return {
    subject: `You've been summoned on Koru by @${params.creatorUsername}`,
    html: wrapInBrandedTemplate(body),
  };
}

export function buildDisputeRaisedEmail(params: {
  disputerUsername: string;
  amount: number;
  chatId: string;
}): EmailContent {
  const body = `
    <div style="font-size:24px;font-weight:bold;color:rgb(255,255,255)">Dispute Raised</div>
    <div style="font-size:15px;color:rgb(209,213,219);margin-top:16px;line-height:1.6">
      <div><strong style="color:rgb(255,255,255)">@${params.disputerUsername}</strong> has raised a dispute on an escrow payment.</div>
      <div style="background:rgb(40,20,20);border-radius:10px;padding:14px 16px;margin:16px 0;border:1px solid rgb(80,30,30)">
        <div style="font-size:13px;color:rgb(156,163,175)">Disputed amount</div>
        <div style="font-size:22px;font-weight:bold;color:rgb(248,113,113);margin-top:4px">$${params.amount.toFixed(2)}</div>
      </div>
      <div>Funds are frozen until an admin resolves the dispute. You can submit a counter-dispute if you believe this is unjustified.</div>
    </div>
    <table style="margin-top:22px" cellspacing="0" cellpadding="0" width="100%">
      <tr><td align="center">
        <table cellspacing="0" cellpadding="0"><tr>
          <td style="border-radius:10px" bgcolor="#7c3aed">
            <a target="_blank" style="padding:12px 20px;display:inline-block;color:rgb(255,255,255);text-decoration:none;font-weight:bold;font-size:14px" href="https://koruapp.xyz/chats">View Details</a>
          </td>
        </tr></table>
      </td></tr>
    </table>`;
  return {
    subject: `Dispute raised by @${params.disputerUsername}`,
    html: wrapInBrandedTemplate(body),
  };
}

export function buildEscrowRefundEmail(params: {
  amount: number;
  reason: "rejection" | "expiry";
}): EmailContent {
  const reasonText =
    params.reason === "rejection"
      ? "The host declined the chat request."
      : "The escrow expired without being accepted.";

  const body = `
    <div style="font-size:24px;font-weight:bold;color:rgb(255,255,255)">Escrow Refund</div>
    <div style="font-size:15px;color:rgb(209,213,219);margin-top:16px;line-height:1.6">
      <div>${reasonText} Your funds have been returned.</div>
      <div style="background:rgb(20,40,20);border-radius:10px;padding:14px 16px;margin:16px 0;border:1px solid rgb(30,80,30)">
        <div style="font-size:13px;color:rgb(156,163,175)">Refunded amount</div>
        <div style="font-size:22px;font-weight:bold;color:rgb(74,222,128);margin-top:4px">$${params.amount.toFixed(2)}</div>
      </div>
    </div>
    <table style="margin-top:22px" cellspacing="0" cellpadding="0" width="100%">
      <tr><td align="center">
        <table cellspacing="0" cellpadding="0"><tr>
          <td style="border-radius:10px" bgcolor="#7c3aed">
            <a target="_blank" style="padding:12px 20px;display:inline-block;color:rgb(255,255,255);text-decoration:none;font-weight:bold;font-size:14px" href="https://koruapp.xyz/discover">Browse Experts</a>
          </td>
        </tr></table>
      </td></tr>
    </table>`;
  return {
    subject: `Escrow refund: $${params.amount.toFixed(2)} returned`,
    html: wrapInBrandedTemplate(body),
  };
}
