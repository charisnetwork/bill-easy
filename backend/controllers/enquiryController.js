const { Enquiry } = require("../models");
const nodemailer = require("nodemailer");

exports.createEnquiry = async (req, res) => {
  try {
    const { name, phone, email, business_type, message } = req.body;

    if (!name || !phone || !email) {
      return res.status(400).json({ error: "Name, Phone Number, and Email are required." });
    }

    const enquiry = await Enquiry.create({
      name,
      phone,
      email,
      business_type,
      message: message || '',
      status: 'pending'
    });

    console.log(`>>> New Lead Generated: ${name} (${phone})`);

    // --- Email Forwarding Logic ---
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        console.log(`>>> [Brevo] Configuring SMTP with host: ${process.env.SMTP_HOST}, port: ${process.env.SMTP_PORT || 587}`);
        console.log(`>>> [Brevo] Login user: ${process.env.SMTP_USER}`);
        
        // Brevo SMTP configuration - using port 587 with STARTTLS
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: 587,
          secure: false, // false for 587 (STARTTLS), true for 465 (SSL)
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
          tls: {
            rejectUnauthorized: false,
            minVersion: 'TLSv1.2'
          },
          connectionTimeout: 10000, // 10 seconds
          greetingTimeout: 10000,
          socketTimeout: 10000
        });

        const mailOptions = {
          from: `"BillEasy System" <${process.env.SMTP_USER}>`,
          to: "support@charisbilleasy.store",
          subject: `New Enquiry: ${name}`,
          text: `
New Lead Details:
-----------------
Name: ${name}
Phone: ${phone}
Email: ${email || 'N/A'}
Business Type: ${business_type || 'N/A'}
Message: ${message || 'N/A'}

Timestamp: ${new Date().toLocaleString()}
          `,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">New Lead Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Name:</td>
                  <td style="padding: 10px; border: 1px solid #e5e7eb;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Phone:</td>
                  <td style="padding: 10px; border: 1px solid #e5e7eb;">${phone}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Email:</td>
                  <td style="padding: 10px; border: 1px solid #e5e7eb;">${email || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Business Type:</td>
                  <td style="padding: 10px; border: 1px solid #e5e7eb;">${business_type || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold; background: #f9fafb;">Message:</td>
                  <td style="padding: 10px; border: 1px solid #e5e7eb;">${message || 'N/A'}</td>
                </tr>
              </table>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px;">Sent from BillEasy SaaS Platform</p>
            </div>
          `
        };

        console.log(`>>> [Brevo] Sending email...`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`>>> [Brevo] Email sent successfully! Message ID: ${info.messageId}`);
        
      } catch (mailErr) {
        console.error(">>> [Brevo] Mail Sending Error:", mailErr.message);
        console.error(">>> [Brevo] Full Error:", mailErr);
        // Log but don't fail the request
      }
    } else {
      console.warn(">>> [Brevo] SMTP credentials missing. Email notification skipped.");
      console.warn(">>> [Brevo] Required env vars: SMTP_HOST, SMTP_USER, SMTP_PASS");
    }

    res.status(201).json({
      message: "Thank you! Our team will contact you soon.",
      data: enquiry
    });
  } catch (error) {
    console.error(">>> Enquiry Error:", error.message);
    console.error(">>> Enquiry Full Error:", error);
    res.status(500).json({ error: "Failed to submit enquiry. Please try again later." });
  }
};

// Test endpoint to verify email configuration
exports.testEmailConfig = async (req, res) => {
  try {
    console.log(">>> [Brevo] Testing email configuration...");
    console.log(">>> [Brevo] SMTP_HOST:", process.env.SMTP_HOST);
    console.log(">>> [Brevo] SMTP_PORT:", process.env.SMTP_PORT || 587);
    console.log(">>> [Brevo] SMTP_USER:", process.env.SMTP_USER);
    console.log(">>> [Brevo] SMTP_PASS exists:", !!process.env.SMTP_PASS);

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(400).json({
        success: false,
        error: "SMTP credentials not configured",
        missing: {
          SMTP_HOST: !process.env.SMTP_HOST,
          SMTP_USER: !process.env.SMTP_USER,
          SMTP_PASS: !process.env.SMTP_PASS
        }
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000
    });

    // Send a test email instead of verify (which hangs)
    console.log(">>> [Brevo] Sending test email...");
    const info = await transporter.sendMail({
      from: `"BillEasy Test" <${process.env.SMTP_USER}>`,
      to: "support@charisbilleasy.store",
      subject: "SMTP Test Email",
      text: "This is a test email to verify SMTP configuration."
    });
    
    console.log(">>> [Brevo] Test email sent! Message ID:", info.messageId);

    res.json({
      success: true,
      message: "Email configuration is valid - test email sent",
      messageId: info.messageId,
      config: {
        host: process.env.SMTP_HOST,
        port: 587,
        user: process.env.SMTP_USER
      }
    });
  } catch (error) {
    console.error(">>> [Brevo] Test Error:", error.message);
    console.error(">>> [Brevo] Full Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Email configuration test failed"
    });
  }
};
