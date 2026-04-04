const TWILIO_API_BASE = "https://api.twilio.com/2010-04-01";

const sanitizePhoneNumber = (value) => String(value || "").replace(/\D/g, "");

const buildEnquiryMessage = ({ name, mobile, email, course }) => {
  return [
    "New enquiry from Success Academy website",
    `Name: ${name}`,
    `Mobile: ${mobile}`,
    `Email: ${email || "-"}`,
    `Course: ${course || "-"}`,
  ].join("\n");
};

const isWhatsAppConfigured = () => {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_WHATSAPP_FROM &&
    process.env.ADMIN_WHATSAPP_NUMBER
  );
};

const sendEnquiryWhatsApp = async (enquiry) => {
  if (!isWhatsAppConfigured()) {
    return {
      sent: false,
      skipped: true,
      reason: "WhatsApp service is not configured on the server.",
    };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;
  const adminNumber = sanitizePhoneNumber(process.env.ADMIN_WHATSAPP_NUMBER);
  const body = buildEnquiryMessage(enquiry);

  const authHeader = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const formData = new URLSearchParams({
    From: from.startsWith("whatsapp:") ? from : `whatsapp:${from}`,
    To: `whatsapp:+${adminNumber}`,
    Body: body,
  });

  const response = await fetch(`${TWILIO_API_BASE}/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authHeader}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Failed to send WhatsApp message.");
    error.details = data;
    throw error;
  }

  return {
    sent: true,
    skipped: false,
    sid: data.sid,
  };
};

module.exports = {
  isWhatsAppConfigured,
  sendEnquiryWhatsApp,
};
