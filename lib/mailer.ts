const nodemailer = require("nodemailer");

// Create a transporter using Ethereal test credentials.
// For production, replace with your actual SMTP server details.
var transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "378fbec8376663",
    pass: "f10bc2adcc68b3",
  },
});

export async function sendOtp(opts: { to: string; code: string }) {
  const { to, code } = opts;
  await transporter.sendMail({
    from: process.env.SMTP_FROM!,
    to,
    subject: "Your login code",
    text: `Your SplitNest login code is: ${code}\n\nThis code expires in 10 minutes.`,
    html: `
      <div style="font-family:system-ui, -apple-system, Segoe UI, Roboto, Arial; line-height:1.4">
        <h2>Your login code</h2>
        <p>Use this code to sign in:</p>
        <p style="font-size:28px; letter-spacing:6px; font-weight:700">${code}</p>
        <p>This code expires in 10 minutes.</p>
      </div>
    `,
  });
}

// Send an email using async/await
// (async () => {
//   const info = await transporter.sendMail({
//     from: '"Maddison Foo Koch" <maddison53@ethereal.email>',
//     to: "bar@example.com, baz@example.com",
//     subject: "Hello ✔",
//     text: "Hello world?", // Plain-text version of the message
//     html: "<b>Nest App!</b>", // HTML version of the message
//   });

//   console.log("Message sent:", info.messageId);
// })();
