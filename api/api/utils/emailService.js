const nodemailer = require("nodemailer");

const port = Number(process.env.SMTP_PORT) || 587;

const smtpConfig = {
  host: process.env.SMTP_HOST,
  port,
  secure: port === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

const hasCredentials =
  smtpConfig.host &&
  smtpConfig.auth.user &&
  smtpConfig.auth.pass;

let transporter = null;

if (hasCredentials) {
  try {
    transporter = nodemailer.createTransport(smtpConfig);

    transporter.verify((error) => {
      if (error) {
        console.error("[Email Service] SMTP verification failed:", error.message);
        transporter = null; // Fallback to simulation if verify fails
      } else {
        console.log("[Email Service] SMTP Transporter configured and verified.");
      }
    });
  } catch (error) {
    console.error("[Email Service] Failed to create transport:", error.message);
  }
} else {
  console.log("[Email Service] No SMTP credentials provided. Using Simulation mode.");
}

function getTransporterStatus() {
  return transporter ? "Active" : "Simulation";
}

/* =========================
   SEND SINGLE EMAIL
========================= */
async function sendEmail(to, subject, html, attachments = []) {
  const recipients = Array.isArray(to) ? to.join(",") : to;

  if (!transporter) {
    console.log(`\n=== [SIMULATION] EMAIL OUT ===`);
    console.log(`To: ${recipients}`);
    console.log(`Subject: ${subject}`);
    console.log(`Attachments: ${attachments.length} file(s)`);
    console.log(`============================\n`);
    return { success: true, message: "Simulated Sent" };
  }

  try {
    const mailOptions = {
      from: `"AKNU Admin" <${smtpConfig.auth.user}>`,
      to: recipients,
      subject,
      html,
    };

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments;
    }

    const info = await transporter.sendMail(mailOptions);

    console.log(`[Email Service] Sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[Email Service] Error sending email:", error.message);
    return { success: false, error: error.message };
  }
}

/* =========================
   SEND BATCH EMAILS
========================= */
async function sendBatch(recipients, subject, htmlTemplate, attachments = []) {
  console.log(`[Email Service] Starting batch of ${recipients.length} emails...`);
  let sent = 0;

  for (const r of recipients) {
    if (!r.email) continue;

    const personalizedBody = htmlTemplate.replace(
      "{{name}}",
      r.name || "Student"
    );

    const result = await sendEmail(r.email, subject, personalizedBody, attachments);
    if (result.success) sent++;
  }

  return sent;
}

/* =========================
   EXPORTS (THIS FIXES YOUR ERROR)
========================= */
module.exports = {
  sendEmail,
  sendBatch,
};
