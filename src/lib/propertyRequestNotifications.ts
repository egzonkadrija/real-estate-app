import nodemailer from "nodemailer";

type ReviewStatus = "pending" | "declined" | "approved";

type NotificationInput = {
  recipientEmail: string;
  recipientName: string;
  status: ReviewStatus;
  requestType: "buy" | "rent";
  category: string;
  location: string | null;
  propertyId?: number;
};

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
};

const mailerFrom = process.env.EMAIL_FROM?.trim();
const mailerReplyTo = process.env.EMAIL_REPLY_TO?.trim();
const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const appName = process.env.EMAIL_APP_NAME ?? "NovaBuildings";
const simulateEmails =
  process.env.EMAIL_SIMULATE?.toLowerCase() === "true";

function parseSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const portValue = process.env.SMTP_PORT?.trim();
  if (!host || !user || !pass || !portValue) return null;

  const port = Number.parseInt(portValue, 10);
  if (Number.isNaN(port) || port <= 0) return null;

  const secureValue = process.env.SMTP_SECURE?.trim().toLowerCase();
  const secure =
    secureValue === "true" ||
    secureValue === "1" ||
    (secureValue === undefined && port === 465);

  return { host, port, secure, user, pass };
}

function getEmailStatusLabels(status: ReviewStatus): {
  subject: string;
  message: string;
  action: string;
} {
  if (status === "approved") {
    return {
      subject: "Your property request was approved",
      message:
        "Great news—your property request has been approved and the listing is now published.",
      action: "published",
    };
  }

  if (status === "pending") {
    return {
      subject: "Your property request is pending review",
      message:
        "Your property request is still pending and is currently in the review queue.",
      action: "pending review",
    };
  }

  return {
    subject: "Your property request has been declined",
    message: "Your property request has been declined by our team.",
    action: "declined",
  };
}

export async function notifyPropertyRequestStatus(
  input: NotificationInput
): Promise<void> {
  const config = parseSmtpConfig();

  const recipient = input.recipientEmail.trim();
  if (!recipient) {
    console.warn("Missing recipient email; skipping request status email.");
    return;
  }

    const normalizedRequestType =
      input.requestType === "rent" ? "Rent" : "Buy";
    const details = [
      `Request Type: ${normalizedRequestType}`,
      `Category: ${input.category}`,
    `Location: ${input.location || "Not provided"}`,
  ];
  if (input.propertyId) {
    details.push(`Approved Property ID: ${input.propertyId}`);
    details.push(`Property Page: ${appBaseUrl}/en/properties/${input.propertyId}`);
  }

    const labels = getEmailStatusLabels(input.status);
    const subject = `${appName}: ${labels.subject}`;
    const textBody = [
    `Hello ${input.recipientName},`,
    "",
    labels.message,
    "",
    ...details,
    "",
    `This request is now marked as ${labels.action}.`,
    "",
    `If you have questions, you can contact our support team at ${process.env.EMAIL_REPLY_TO || appName}.`,
  ].join("\n");

  const htmlBody = `
    <div style="font-family: Arial, Helvetica, sans-serif; color: #0f172a; line-height: 1.6;">
      <h2 style="color: #0f172a; margin-bottom: 12px;">${labels.subject}</h2>
      <p>${labels.message}</p>
      <ul>
        ${details.map((line) => `<li>${line}</li>`).join("")}
      </ul>
      <p>This request is now marked as <strong>${labels.action}</strong>.</p>
    </div>
  `.trim();

  if (simulateEmails || !config || !mailerFrom) {
    console.info("[EMAIL_SIMULATION] Property request status notification");
    console.info(`[EMAIL_SIMULATION] To: ${recipient}`);
    console.info(`[EMAIL_SIMULATION] Subject: ${subject}`);
    console.info(`[EMAIL_SIMULATION] Body:\n${textBody}`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.pass },
    });

    await transporter.sendMail({
      from: mailerFrom,
      to: recipient,
      replyTo: mailerReplyTo || undefined,
      subject,
      text: textBody,
      html: htmlBody,
    });
  } catch (error) {
    console.error("Failed to send property request status email:", error);
  }
}
