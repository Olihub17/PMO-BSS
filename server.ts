import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for sending notifications
  app.post("/api/notify-resource", async (req, res) => {
    const { email, projectName, taskName, role, projectUrl } = req.body;

    if (!email || !projectName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // Configure transporter
      // Note: In a real app, use environment variables for these
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER || 'mock-user',
          pass: process.env.SMTP_PASS || 'mock-pass',
        },
      });

      const mailOptions = {
        from: '"BSS PMO System" <noreply@bssconnects.com>',
        to: email,
        subject: `New Assignment: ${projectName}`,
        text: `Hello,\n\nYou have been assigned to the project "${projectName}" as a ${role}.\n\nTask: ${taskName || 'General Assignment'}\n\nYou can access the project here: ${projectUrl}\n\nBest regards,\nPMO Team`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
            <h2 style="color: #1e293b;">New Project Assignment</h2>
            <p>Hello,</p>
            <p>You have been assigned to the project <strong>${projectName}</strong> as a <strong>${role}</strong>.</p>
            ${taskName ? `<p><strong>Specific Task:</strong> ${taskName}</p>` : ''}
            <div style="margin: 30px 0;">
              <a href="${projectUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Access Project</a>
            </div>
            <p style="color: #64748b; font-size: 0.875rem;">Note: You will have limited authority based on your assigned tasks.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 0.75rem; color: #94a3b8;">BSSconnects PMO Tool</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true, message: "Notification sent" });
    } catch (error) {
      console.error("Email error:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
