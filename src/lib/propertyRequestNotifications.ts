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
const simulateEmails = process.env.EMAIL_SIMULATE?.toLowerCase() === "true";

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
        "Great news your property request has been approved and the listing is now published.",
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

function getLogOutput(input: NotificationInput, subject: string, textBody: string) {
  return [
    "[EMAIL_SIMULATION] Property request status notification",
    `[EMAIL_SIMULATION] To: ${input.recipientEmail}`,
    `[EMAIL_SIMULATION] Subject: ${subject}`,
    `[EMAIL_SIMULATION] Body:\n${textBody}`,
  ];
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

  const normalizedRequestType = input.requestType === "rent" ? "Rent" : "Buy";
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
    `If you have questions, you can contact our support team at ${mailerReplyTo || appName}.`,
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
    const logs = getLogOutput(input, subject, textBody);
    logs.forEach((line) => console.info(line));
    return;
  }

  try {
    console.warn(
      "SMTP configuration is present, but nodemailer is not wired in this build. " +
        "Use EMAIL_SIMULATE=true to keep logs flowing, or install nodemailer for real delivery."
    );
    const logs = getLogOutput(input, subject, textBody);
    logs.forEach((line) => console.info(line));
    console.info("[EMAIL_SIMULATION] HTML preview:", htmlBody);
  } catch (error) {
    console.error("Failed to send property request status email:", error);
  }
}
