type NotificationField = {
  label: string;
  value: unknown;
};

type SubmissionNotificationInput = {
  title: string;
  subject: string;
  customerEmail?: string | null;
  fields: NotificationField[];
};

function text(value: unknown) {
  return String(value ?? "").trim();
}

function filledFields(fields: NotificationField[]) {
  return fields.filter(({ value }) => text(value) !== "");
}

function notificationText(input: SubmissionNotificationInput) {
  return [input.title, "", ...filledFields(input.fields).map(
    ({ label, value }) => `${label}: ${text(value)}`,
  )].join("\n");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function sendEmail(input: SubmissionNotificationInput, recipientOverride?: string) {
  const apiKey = text(process.env.RESEND_API_KEY);
  const recipient = text(
    recipientOverride ?? process.env.TONA_NOTIFICATION_EMAIL ?? process.env.NOTIFICATION_EMAIL ?? "info@tonacoffee.et",
  );
  if (!apiKey || !recipient) throw new Error("Email service is not configured.");

  const from =
    text(process.env.RESEND_FROM_EMAIL) || "Tona Coffee <onboarding@resend.dev>";
  const rows = filledFields(input.fields)
    .map(
      (field) =>
        `<tr><th align="left" style="padding:8px 12px;border-bottom:1px solid #eee">${escapeHtml(field.label)}</th><td style="padding:8px 12px;border-bottom:1px solid #eee">${escapeHtml(text(field.value)).replace(/\r?\n/g, "<br>")}</td></tr>`,
    )
    .join("");
  const replyTo = text(input.customerEmail);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: recipient,
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject: input.subject,
      text: notificationText(input),
      html: `<div style="font-family:Arial,sans-serif;color:#1a1a1a"><h2>${escapeHtml(input.title)}</h2><table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:680px">${rows}</table></div>`,
    }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({})) as { name?: string; message?: string };
    console.error("Email notification rejected", { status: response.status, name: error.name, message: error.message });
    throw new Error(`Email service rejected the notification (${response.status}${error.name ? ": " + error.name.replace(/[^a-zA-Z0-9_-]/g, "") : ""}).`);
  }
  return response.ok;
}

async function sendWhatsApp(input: SubmissionNotificationInput) {
  const accessToken = text(process.env.WHATSAPP_ACCESS_TOKEN);
  const phoneNumberId = text(process.env.WHATSAPP_PHONE_NUMBER_ID);
  const recipient = text(process.env.WHATSAPP_NOTIFICATION_TO);
  if (!accessToken || !phoneNumberId || !recipient) return false;

  const graphVersion = text(process.env.WHATSAPP_GRAPH_API_VERSION) || "v23.0";
  const response = await fetch(
    `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: recipient,
        type: "text",
        text: { preview_url: false, body: notificationText(input) },
      }),
    },
  );
  return response.ok;
}

export async function sendSubmissionNotifications(
  input: SubmissionNotificationInput,
  channel?: "email" | "whatsapp",
) {
  let emailError: string | null = null;
  const [emailSent, whatsappSent] = await Promise.all([
    channel === "whatsapp" ? false : sendEmail(input, channel === "email" ? "info@tonacoffee.et" : undefined).catch((error: unknown) => {
      console.error("Email notification failed", error instanceof Error ? error.message : "Unknown email error");
      emailError = error instanceof Error && /^(Email service)/.test(error.message) ? error.message : "Email service could not be reached.";
      return false;
    }),
    channel === "email" ? false : sendWhatsApp(input).catch(() => false),
  ]);
  return { emailSent, whatsappSent, emailError, whatsappMessage: notificationText(input) };
}

// Direct enquiries are emailed only; they do not create database records.
export async function sendEnquiryEmail(input: SubmissionNotificationInput) {
  const sent = await sendEmail(input, "info@tonacoffee.et");
  if (!sent) throw new Error("Your email could not be sent. Please try WhatsApp or contact info@tonacoffee.et.");
  return { ok: true };
}
