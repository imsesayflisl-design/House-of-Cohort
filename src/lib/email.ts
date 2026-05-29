import { Resend } from 'resend';
import { renderToBuffer } from '@react-pdf/renderer';
import { ReceiptPDF } from '@/components/receipt/ReceiptPDF';
import { formatOrderForReceipt, getReceiptContent } from './receipt';
import { withPDFTimeout, PDFTimeoutError, logPDFPerformance } from './pdf-timeout';

// Validate email configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY || RESEND_API_KEY.includes('placeholder')) {
  console.warn('⚠️  RESEND_API_KEY is missing or is a placeholder. Email functionality will be limited.');
}

// Initialize Resend client
const resend = new Resend(RESEND_API_KEY);

// Email configuration
const EMAIL_CONFIG = {
  from: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@houseofcohort.com',
  replyTo: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@houseofcohort.com',
  companyName: process.env.NEXT_PUBLIC_COMPANY_NAME || 'House of Cohort',
};

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: {
    filename: string;
    content: Buffer;
    contentType: string;
  }[];
  tags?: { name: string; value: string }[];
}

export interface SendReceiptEmailOptions {
  order: any; // Order data from Prisma
  includePDF?: boolean;
  customMessage?: string;
}

// Base email sending function
export async function sendEmail(options: EmailOptions) {
  try {
    const result = await resend.emails.send({
      from: `${EMAIL_CONFIG.companyName} <${EMAIL_CONFIG.from}>`,
      to: options.to,
      replyTo: EMAIL_CONFIG.replyTo,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments,
      tags: options.tags,
    });

    return {
      success: true,
      id: result.data?.id,
      error: null,
    };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      id: null,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

// Send receipt email
export async function sendReceiptEmail({
  order,
  includePDF = true,
  customMessage
}: SendReceiptEmailOptions) {
  try {
    // Format order data for receipt
    const formattedOrder = formatOrderForReceipt(order);
    const content = getReceiptContent(formattedOrder);

    // Determine recipient email
    const recipientEmail = order.user?.email || order.guestEmail;
    if (!recipientEmail) {
      throw new Error('No email address found for order');
    }

    // Generate PDF attachment if requested
    let attachments: EmailOptions['attachments'] = undefined;
    if (includePDF) {
      const pdfStartTime = Date.now();
      try {
        const pdfBuffer = await withPDFTimeout(
          renderToBuffer(ReceiptPDF({ order })),
          30000 // 30 second timeout for email PDFs (shorter than direct download)
        );
        const filename = `Receipt-${formattedOrder.order.reference}.pdf`;

        attachments = [{
          filename,
          content: pdfBuffer,
          contentType: 'application/pdf',
        }];

        logPDFPerformance(pdfStartTime, order.id, true);
      } catch (pdfError) {
        logPDFPerformance(pdfStartTime, order.id, false);

        if (pdfError instanceof PDFTimeoutError) {
          console.error('PDF generation timeout for email attachment:', pdfError.message);
        } else {
          console.error('PDF generation for email failed:', pdfError);
        }
        // Continue without PDF attachment if generation fails
      }
    }

    // Create email HTML content
    const html = createReceiptEmailHTML(formattedOrder, content, customMessage);

    // Create text content
    const text = createReceiptEmailText(formattedOrder, content, customMessage);

    // Send email
    const result = await sendEmail({
      to: recipientEmail,
      subject: content.emailSubject,
      html,
      text,
      attachments,
      tags: [
        { name: 'type', value: 'receipt' },
        { name: 'order_id', value: order.id },
      ],
    });

    return result;

  } catch (error) {
    console.error('Receipt email error:', error);
    return {
      success: false,
      id: null,
      error: error instanceof Error ? error.message : 'Failed to send receipt email',
    };
  }
}

// Create HTML email content
function createReceiptEmailHTML(
  formattedOrder: ReturnType<typeof formatOrderForReceipt>,
  content: ReturnType<typeof getReceiptContent>,
  customMessage?: string
): string {
  const { order, customer, delivery, items, pricing, payment, company, coupon } = formattedOrder;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.emailSubject}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background-color: #f5f5f0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
            color: #ffffff;
            padding: 40px;
            text-align: center;
        }
        .company-name {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 8px;
            color: #d4af37;
        }
        .receipt-title {
            font-size: 18px;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .section {
            margin-bottom: 32px;
        }
        .section-title {
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #1a1a1a;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 2px solid #d4af37;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 16px;
        }
        .info-item {
            display: flex;
            flex-direction: column;
        }
        .info-label {
            font-size: 12px;
            font-weight: 600;
            color: #666666;
            margin-bottom: 4px;
        }
        .info-value {
            font-size: 14px;
            color: #1a1a1a;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
        }
        .table th {
            background-color: #f5f5f0;
            padding: 12px 8px;
            text-align: left;
            font-size: 12px;
            font-weight: bold;
            color: #1a1a1a;
            text-transform: uppercase;
            border-bottom: 2px solid #e5e5e5;
        }
        .table td {
            padding: 12px 8px;
            border-bottom: 1px solid #f0f0f0;
            font-size: 14px;
            color: #1a1a1a;
        }
        .table tr:hover {
            background-color: #fafafa;
        }
        .summary-table {
            margin-top: 24px;
            border-top: 2px solid #e5e5e5;
            padding-top: 16px;
        }
        .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 4px 0;
        }
        .summary-label {
            font-size: 14px;
            color: #666666;
        }
        .summary-value {
            font-size: 14px;
            font-weight: 600;
            color: #1a1a1a;
        }
        .total-row {
            border-top: 2px solid #d4af37;
            padding-top: 12px;
            margin-top: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .total-label {
            font-size: 16px;
            font-weight: bold;
            color: #1a1a1a;
        }
        .total-value {
            font-size: 20px;
            font-weight: bold;
            color: #d4af37;
        }
        .footer {
            background-color: #f5f5f0;
            padding: 32px 40px;
            text-align: center;
            border-top: 1px solid #e5e5e5;
        }
        .footer-text {
            font-size: 14px;
            color: #666666;
            margin-bottom: 16px;
        }
        .contact-info {
            font-size: 12px;
            color: #888888;
            line-height: 1.5;
        }
        .custom-message {
            background-color: #f0f9ff;
            border: 1px solid #d4af37;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 24px;
            font-style: italic;
            color: #1a1a1a;
        }
        @media only screen and (max-width: 600px) {
            .container {
                width: 100% !important;
            }
            .header, .content, .footer {
                padding: 24px !important;
            }
            .info-grid {
                grid-template-columns: 1fr !important;
                gap: 12px !important;
            }
            .table th, .table td {
                padding: 8px 4px !important;
                font-size: 12px !important;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="company-name">${company.name}</div>
            <div class="receipt-title">Order Receipt</div>
        </div>

        <div class="content">
            ${customMessage ? `<div class="custom-message">${customMessage}</div>` : ''}

            <div class="section">
                <div class="section-title">Order Information</div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Order Reference</div>
                        <div class="info-value">${order.reference}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Order Date</div>
                        <div class="info-value">${order.date}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Customer</div>
                        <div class="info-value">${customer.name}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Status</div>
                        <div class="info-value">${order.status}</div>
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Delivery Information</div>
                <div class="info-item">
                    <div class="info-label">Recipient</div>
                    <div class="info-value">${delivery.recipientName}</div>
                </div>
                <div class="info-item" style="margin-top: 8px;">
                    <div class="info-label">Address</div>
                    <div class="info-value">${delivery.address.split('\\n').join('<br>')}</div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Order Items</div>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Size</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.size}</td>
                                <td>${item.quantity}</td>
                                <td>${item.unitPrice}</td>
                                <td>${item.totalPrice}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="summary-table">
                <div class="summary-row">
                    <div class="summary-label">Subtotal:</div>
                    <div class="summary-value">${pricing.subtotal}</div>
                </div>
                <div class="summary-row">
                    <div class="summary-label">Delivery Fee:</div>
                    <div class="summary-value">${pricing.deliveryFee}</div>
                </div>
                ${coupon ? `
                <div class="summary-row">
                    <div class="summary-label">Discount (${coupon.code}):</div>
                    <div class="summary-value">-${pricing.discount}</div>
                </div>
                ` : ''}
                <div class="total-row">
                    <div class="total-label">Total:</div>
                    <div class="total-value">${pricing.total}</div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">Payment Information</div>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Payment Method</div>
                        <div class="info-value">${payment.method}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Transaction Reference</div>
                        <div class="info-value">${payment.reference}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="footer">
            <div class="footer-text">
                Thank you for choosing ${company.name}!
            </div>
            <div class="contact-info">
                ${company.address.split('\\n').join('<br>')}<br>
                Email: ${company.email}<br>
                Website: ${company.website}
            </div>
        </div>
    </div>
</body>
</html>
  `.trim();
}

// Create text email content
function createReceiptEmailText(
  formattedOrder: ReturnType<typeof formatOrderForReceipt>,
  content: ReturnType<typeof getReceiptContent>,
  customMessage?: string
): string {
  let text = content.textContent;

  if (customMessage) {
    text = `${customMessage}\n\n${text}`;
  }

  return text;
}

// Send order confirmation email (called after order creation)
export async function sendOrderConfirmationEmail(order: any) {
  return sendReceiptEmail({
    order,
    includePDF: true,
    customMessage: "Thank you for your order! Your receipt is attached below."
  });
}

// Resend receipt email (manual resend)
export async function resendReceiptEmail(order: any, customMessage?: string) {
  return sendReceiptEmail({
    order,
    includePDF: true,
    customMessage: customMessage || "Here's a copy of your receipt as requested."
  });
}