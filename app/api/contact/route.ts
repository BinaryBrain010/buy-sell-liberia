import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    // Accept JSON body
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    const { name, email, subject, message } = body as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
    };
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "'name', 'email' and 'message' are required" },
        { status: 400 }
      );
    }

    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || "0", 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secure =
      String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
    // Destination address: explicit env var, otherwise hard‑coded business inbox, finally fallback to SMTP user
    const to =
      process.env.CONTACT_EMAIL_TO ||
      "info@buysellliberia.com" ||
      process.env.SMTP_USER;
    const from =
      process.env.CONTACT_EMAIL_FROM ||
      process.env.SMTP_USER ||
      "no-reply@localhost";
    const fromName = process.env.CONTACT_FROM_NAME || "BuySell Liberia";

    if (!user || !pass) {
      return NextResponse.json(
        { error: "Email not configured (missing SMTP_USER/SMTP_PASS)" },
        { status: 500 }
      );
    }

    // If explicit host/port provided, use them; otherwise fall back to Gmail service when using a Gmail account
    const isGmailUser = /@gmail\.com$|@googlemail\.com$/i.test(String(user));
    const transporter =
      host && port
        ? nodemailer.createTransport({
            host,
            port,
            secure,
            auth: { user, pass },
          })
        : nodemailer.createTransport({
            service: isGmailUser ? "gmail" : undefined,
            auth: { user, pass },
          });

    const subjectLine = subject?.trim() || "New contact message";
    const sentAt = new Date();
    const sentAtDisplay = sentAt.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Polished, responsive email with inline styles
    const html = `<!doctype html>
    <html lang="en">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <meta name="color-scheme" content="light dark"/>
      <title>${escapeHtml(subjectLine)}</title>
      <style>
        /* Fallback styles for some email clients */
        body { margin:0; padding:0; background:#f6f7f9; color:#111827; }
        a { color:#2563eb; text-decoration:none; }
        .container { width:100%; background:#f6f7f9; padding:24px 0; }
        .card { max-width:640px; margin:0 auto; background:#ffffff; border-radius:12px; border:1px solid #e5e7eb; overflow:hidden; }
        .header { padding:20px 24px; background:linear-gradient(135deg,#eef2ff,#ecfdf5); border-bottom:1px solid #e5e7eb; }
        .brand { font-size:18px; font-weight:700; color:#111827; }
        .content { padding:24px; font-size:16px; line-height:1.6; }
        .muted { color:#6b7280; font-size:14px; }
        .kv { width:100%; border-collapse:separate; border-spacing:0; margin:16px 0; }
        .kv th { text-align:left; color:#374151; padding:10px 12px; background:#f9fafb; border:1px solid #e5e7eb; width:160px; }
        .kv td { padding:10px 12px; border:1px solid #e5e7eb; }
        .message { white-space:pre-wrap; background:#fafafa; border:1px solid #e5e7eb; border-radius:8px; padding:14px; }
        .footer { padding:16px 24px; background:#fafafa; border-top:1px solid #e5e7eb; font-size:12px; color:#6b7280; }
        .btn { display:inline-block; padding:10px 16px; background:#16a34a; color:#ffffff !important; border-radius:8px; font-weight:600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <div class="brand">BuySell Liberia — Contact Form</div>
            <div class="muted" style="margin-top:4px;">${escapeHtml(
              sentAtDisplay
            )}</div>
          </div>
          <div class="content">
            <p style="margin:0 0 8px 0;" class="muted">You have received a new message from your website contact form.</p>

            <table class="kv" role="presentation" cellspacing="0" cellpadding="0">
              <tr>
                <th scope="row">Name</th>
                <td>${escapeHtml(name)}</td>
              </tr>
              <tr>
                <th scope="row">Email</th>
                <td><a href="mailto:${escapeHtml(email)}">${escapeHtml(
      email
    )}</a></td>
              </tr>
              <tr>
                <th scope="row">Subject</th>
                <td>${escapeHtml(subjectLine)}</td>
              </tr>
            </table>

            <div class="message">${escapeHtml(message)}</div>

            <div style="margin-top:16px;">
              <a class="btn" href="mailto:${escapeHtml(
                email
              )}?subject=Re:%20${encodeURIComponent(
      subjectLine
    )}">Reply to ${escapeHtml(name)}</a>
            </div>
          </div>
          <div class="footer">
            This message was sent via the BuySell Liberia website contact form. If you didn’t expect this, you can ignore it.
          </div>
        </div>
      </div>
    </body>
    </html>`;

    const text = `New Contact Message\n\nName: ${name}\nEmail: ${email}\nSubject: ${subjectLine}\n\nMessage:\n${message}`;

    await transporter.sendMail({
      from: `${fromName}` + (from ? ` <${from}>` : ""),
      to,
      replyTo: name ? `${name} <${email}>` : email,
      subject: subjectLine,
      html,
      text,
    });

    return NextResponse.json({ success: true, message: "Message sent" });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to send message" },
      { status: 500 }
    );
  }
}

function escapeHtml(input: string = "") {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
