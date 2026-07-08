const nodemailer = require('nodemailer');
let sgMail;
if (process.env.SENDGRID_API_KEY) {
  try {
    sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  } catch (err) {
    sgMail = null;
  }
}

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

const isSendGridConfigured = () => {
  return Boolean(
    process.env.SENDGRID_API_KEY &&
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
  if (!isMailConfigured() && !isSendGridConfigured()) {
    return {
      sent: false,
      skipped: true,
      reason: 'Email service is not configured on the server.',
    };
  }

  const smtpConfigured = isMailConfigured();
  if (!smtpConfigured && isSendGridConfigured()) {
    return await sendViaSendGrid(enquiry);
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
    // If SendGrid API key is configured, use it directly if SMTP verification fails.
    const verifyErr = err;
    if (isSendGridConfigured()) {
      try {
        const sgResult = await sendViaSendGrid(enquiry);
        return sgResult;
      } catch (sgErr) {
        return {
          sent: false,
          skipped: false,
          reason: `SMTP verify failed: ${verifyErr.message}; SendGrid fallback failed: ${sgErr.message}`,
        };
      }
    }

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
    // try SendGrid if available
    if (isSendGridConfigured()) {
      try {
        const sgResult = await sendViaSendGrid(enquiry);
        return sgResult;
      } catch (sgErr) {
        return {
          sent: false,
          skipped: false,
          reason: `sendMail failed: ${err.message}; SendGrid fallback failed: ${sgErr.message}`,
        };
      }
    }

    return {
      sent: false,
      skipped: false,
      reason: `sendMail failed: ${err.message}`,
    };
  }
};

const sendViaSendGrid = async (enquiry) => {
  if (!sgMail) {
    throw new Error('SendGrid not configured');
  }
  const { subject, text, html } = buildEnquiryEmail(enquiry);
  const msg = {
    to: process.env.ADMIN_EMAIL,
    from: process.env.MAIL_FROM, // must be a verified sender in SendGrid
    subject,
    text,
    html,
  };

  const resp = await sgMail.send(msg);
  // sgMail.send returns an array of responses
  const info = Array.isArray(resp) ? resp[0] : resp;
  return {
    sent: true,
    skipped: false,
    provider: 'sendgrid',
    statusCode: info && info.statusCode,
  };
};

module.exports = {
  isMailConfigured,
  sendEnquiryMail,
};
