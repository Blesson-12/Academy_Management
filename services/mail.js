const nodemailer = require('nodemailer');

const isMailConfigured = () => {
  return Boolean(
    process.env.MAIL_HOST &&
    process.env.MAIL_PORT &&
    process.env.MAIL_USER &&
    process.env.MAIL_PASS &&
    process.env.MAIL_FROM &&
    process.env.ADMIN_EMAIL
  );
};

const buildEnquiryEmail = ({ name, mobile, email, course }) => {
  return {
    subject: `New course enquiry: ${course || 'Unknown course'}`,
    text: [
      'A new enquiry was submitted through the website.',
      `Name: ${name}`,
      `Mobile: ${mobile}`,
      `Email: ${email || '-'} `,
      `Course: ${course || '-'} `,
    ].join('\n'),
    html: `
      <div>
        <h2>New course enquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Mobile:</strong> ${mobile}</p>
        <p><strong>Email:</strong> ${email || '-'}</p>
        <p><strong>Course:</strong> ${course || '-'}</p>
      </div>
    `,
  };
};

const sendEnquiryMail = async (enquiry) => {
  if (!isMailConfigured()) {
    return {
      sent: false,
      skipped: true,
      reason: 'Email service is not configured on the server.',
    };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
    // fail fast on connection issues
    connectionTimeout: Number(process.env.MAIL_CONNECTION_TIMEOUT_MS || 10000),
    greetingTimeout: Number(process.env.MAIL_GREETING_TIMEOUT_MS || 10000),
  });

  const { subject, text, html } = buildEnquiryEmail(enquiry);

  // Verify connection first to provide faster, clearer errors on failure
  try {
    await transporter.verify();
  } catch (err) {
    return {
      sent: false,
      skipped: false,
      reason: `SMTP verify failed: ${err.message}`,
    };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.ADMIN_EMAIL,
      subject,
      text,
      html,
    });

    return {
      sent: true,
      skipped: false,
      messageId: info.messageId,
      envelope: info.envelope,
    };
  } catch (err) {
    return {
      sent: false,
      skipped: false,
      reason: `sendMail failed: ${err.message}`,
    };
  }
};

module.exports = {
  isMailConfigured,
  sendEnquiryMail,
};
