const { Enquiry } = require("../models");
const nodemailer = require("nodemailer");

exports.createEnquiry = async (req, res) => {
  try {
    const { name, phone, email, business_type, message } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: "Name and Phone Number are required." });
    }

    const enquiry = await Enquiry.create({
      name,
      phone,
      email,
      business_type,
      message,
      status: 'pending'
    });

    console.log(`>>> New Lead Generated: ${name} (${phone})`);

    // --- Email Forwarding Logic ---
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT || 587,
          secure: process.env.SMTP_PORT == 465,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
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
            Message: ${message}
            
            Timestamp: ${new Date().toLocaleString()}
          `,
          html: `
            <h3>New Lead Details</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Email:</strong> ${email || 'N/A'}</p>
            <p><strong>Business Type:</strong> ${business_type || 'N/A'}</p>
            <p><strong>Message:</strong> ${message}</p>
            <hr>
            <p><small>Sent from BillEasy SaaS Platform</small></p>
          `
        };

        await transporter.sendMail(mailOptions);
        console.log(`>>> Email notification sent to support for lead: ${name}`);
      } catch (mailErr) {
        console.error(">>> Mail Sending Error:", mailErr.message);
        // We don't fail the request if only the email fails
      }
    } else {
      console.warn(">>> SMTP credentials missing. Email notification skipped.");
    }

    res.status(201).json({
      message: "Thank you! Our team will contact you soon.",
      data: enquiry
    });
  } catch (error) {
    console.error(">>> Enquiry Error:", error.message);
    res.status(500).json({ error: "Failed to submit enquiry. Please try again later." });
  }
};
