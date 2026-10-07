// Thin mail wrapper. Falls back to console logging when RESEND_API_KEY is unset,
// so the full flow is testable without an email provider configured.

type MailInput = {
  to: string;
  subject: string;
  html: string;
};

export async function sendMail({ to, subject, html }: MailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[mail:dev] to=${to} subject="${subject}"\n${html}\n`);
    return { dev: true };
  }
  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);
  return resend.emails.send({
    from: "Sponsor My Journey <onboarding@resend.dev>",
    to,
    subject,
    html,
  });
}

export function adminEmail() {
  return process.env.ADMIN_EMAIL || "admin@example.com";
}
