type NotificationField = {
  label: string;
  value: unknown;
};

type SubmissionNotificationInput = {
  title: string;
  subject: string;
  customerEmail?: string | null;
  fields: NotificationField[];
  whatsappMessage: string;
};

function text(value: unknown) {
  return String(value ?? "").trim();
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function sendEmail(input: SubmissionNotificationInput) {
  const apiKey = text(process.env.RESEND_API_KEY);
  const recipient = text(
    process.env.TONA_NOTIFICATION_EMAIL ?? process.env.NOTIFICATION_EMAIL,
  );
  if (!apiKey || !recipient) return false;

  const from =
    text(process.env.RESEND_FROM_EMAIL) || "Tona Coffee <onboarding@resend.dev>";
  const rows = input.fields
    .map(
      (field) =>
        `<tr><th align="left" style="padding:8px 12px;border-bottom:1px solid #eee">${escapeHtml(field.label)}</th><td style="padding:8px 12px;border-bottom:1px solid #eee">${escapeHtml(text(field.value))}</td></tr>`,
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
      html: `<div style="font-family:Arial,sans-serif;color:#1a1a1a"><h2>${escapeHtml(input.title)}</h2><table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:680px">${rows}</table></div>`,
    }),
  });
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
        text: { preview_url: false, body: input.whatsappMessage },
      }),
    },
  );
  return response.ok;
}

export async function sendSubmissionNotifications(
  input: SubmissionNotificationInput,
) {
  const [emailSent, whatsappSent] = await Promise.all([
    sendEmail(input).catch(() => false),
    sendWhatsApp(input).catch(() => false),
  ]);
  return { emailSent, whatsappSent };
}
