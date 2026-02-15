import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST!;
const SMTP_PORT = Number(process.env.SMTP_PORT || "465");
const SMTP_SECURE = process.env.SMTP_SECURE === "false"; // true for 465 usually
const SMTP_USER = process.env.SMTP_USER!;
const SMTP_PASS = process.env.SMTP_PASS!;
const SMTP_FROM = process.env.SMTP_FROM || "SplitNest <no-reply@domain.com>";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: Number(process.env.SMTP_PORT || "2525"),
  secure: process.env.SMTP_SECURE === "true", // should be false for 2525/587
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },

  // Optional: forces STARTTLS upgrade (helpful for some setups)
  requireTLS: true,
});

export async function sendInviteEmail(opts: {
  to: string;
  inviteLink: string;
  inviterEmail?: string;
}) {
  console.log('SMTP_HOST: ', SMTP_HOST)
  console.log('SMTP_PORT: ', SMTP_PORT)
  console.log('SECURE : ', SMTP_SECURE)
  console.log('SMTP_PASS : ', SMTP_PASS)
  console.log('SMTP_FROM', SMTP_FROM)
  const { to, inviteLink, inviterEmail } = opts;

  return transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject: "You're invited to SplitNest",
    text: `You've been invited to SplitNest.\n\nAccept invite: ${inviteLink}\n\nInvited by: ${inviterEmail ?? "SplitNest"}`,
    html: `
      <p>You’ve been invited to <b>SplitNest</b>.</p>
      <p><a href="${inviteLink}">Accept invite</a></p>
      <p style="color:#666;font-size:12px;">Invited by: ${inviterEmail ?? "SplitNest"}</p>
    `,
  });
}
