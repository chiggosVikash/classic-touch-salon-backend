import {
  TransactionalEmailsApi,
  SendSmtpEmail,
  TransactionalEmailsApiApiKeys,
} from "@getbrevo/brevo";
import dotenv from "dotenv";
dotenv.config();

type EmailRecipient = {
  amount: number;
  date: string;
  serviceBy: string;
  customerName: string;
  customerPhone: string;
};

class EmailService {
  private apiInstance = new TransactionalEmailsApi();

  constructor() {
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (!brevoApiKey) {
      throw new Error("BREVO_API_KEY is not set");
    }
    this.apiInstance.setApiKey(
      TransactionalEmailsApiApiKeys.apiKey,
      brevoApiKey
    );
  }

  async sendPaymentReceivedNotification(to: EmailRecipient): Promise<void> {
    const sendSmtpEmail = new SendSmtpEmail();

    sendSmtpEmail.subject = `Payment Received Notification`;

    sendSmtpEmail.htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #333;
              background-color: #f4f4f4;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              background: #fff;
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            h2 {
              color: #007BFF;
            }
            .details {
              background: #28a745;
              color: #fff;
              padding: 10px;
              border-radius: 5px;
              display: inline-block;
            }
            .footer {
              margin-top: 20px;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Payment Received</h2>
            <p>Dear Owner,</p>
            <p>A payment has been received for services provided at <strong>Classic Touch Men's Salon</strong>.</p>
            <h3>Payment Details</h3>
            <p><strong>Customer Name:</strong> ${to.customerName}</p>
            <p><strong>Phone:</strong> ${to.customerPhone}</p>
            <p><strong>Service By:</strong> ${to.serviceBy}</p>
            <p><strong>Amount Paid:</strong> <span class="details">₹${to.amount}</span></p>
            <p><strong>Payment Date:</strong> ${to.date}</p>
            <br>
            <p>Best Regards,</p>
            <p><strong>Classic Touch Men's Salon</strong></p>
            <p class="footer">This is an automated email, please do not reply.</p>
          </div>
        </body>
      </html>`;

    sendSmtpEmail.sender = {
      name: "Classic Touch Men's Salon",
      email: "classictouchsalon.server@gmail.com",
    };

    sendSmtpEmail.to = [{ email: "avinash150174@gmail.com", name: "Salon Owner" }];

    try {
      const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail)
      console.log("Email sent successfully:", response.response.statusCode);
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }
}

const emailService = new EmailService();
export default emailService;
