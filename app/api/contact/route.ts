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
    const to = process.env.CONTACT_EMAIL_TO || process.env.SMTP_USER;
    const from =
      process.env.CONTACT_EMAIL_FROM ||
      process.env.SMTP_USER ||
      "no-reply@localhost";

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
    const html = `
      <h2>New Contact Message</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Subject:</strong> ${escapeHtml(subjectLine)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
    `;

    await transporter.sendMail({
      from,
      to,
      replyTo: email,
      subject: subjectLine,
      html,
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
