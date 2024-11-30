import nodemailer from 'nodemailer';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Email configuration:', {
      user: process.env.EMAIL_USER ? 'Set' : 'Not set',
      pass: process.env.EMAIL_PASSWORD ? 'Set' : 'Not set'
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const { to, subject, text, html, attachments } = req.body;
    console.log('Request body:', { to, subject, text, attachments });

    // Get the absolute path to the public directory
    const publicDir = path.join(process.cwd(), 'public');
    console.log('Public directory:', publicDir);
    
    // Map attachments to include absolute paths
    const processedAttachments = attachments?.map(attachment => {
      const fullPath = path.join(publicDir, path.basename(attachment.path));
      console.log('Processing attachment:', fullPath);
      return {
        ...attachment,
        path: fullPath
      };
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
      attachments: processedAttachments
    };
    console.log('Mail options:', mailOptions);

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ 
      message: 'Error sending email',
      error: error.message 
    });
  }
} 