import { formatOrderForReceipt, getReceiptContent } from '@/lib/receipt';

interface ReceiptEmailHTMLProps {
  order: any; // Order data from Prisma
  customMessage?: string;
}

export function ReceiptEmailHTML({ order, customMessage }: ReceiptEmailHTMLProps) {
  const formattedOrder = formatOrderForReceipt(order);
  const content = getReceiptContent(formattedOrder);
  const { company, order: orderInfo, customer, delivery, items, pricing, payment, coupon } = formattedOrder;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.emailSubject}</title>
    <style>
        /* Reset */
        body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        img {
            -ms-interpolation-mode: bicubic;
        }

        /* Base styles */
        body {
            margin: 0 !important;
            padding: 0 !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background-color: #f5f5f0;
        }

        /* Container */
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        /* Header */
        .header {
            background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
            color: #ffffff;
            padding: 40px;
            text-align: center;
        }

        .company-name {
            font-size: 32px;
            font-weight: bold;
            margin: 0 0 8px 0;
            color: #d4af37;
            text-transform: uppercase;
            letter-spacing: 2px;
        }

        .receipt-title {
            font-size: 18px;
            opacity: 0.9;
            margin: 0;
            font-style: italic;
        }

        .receipt-number {
            font-size: 14px;
            color: #d4af37;
            margin: 16px 0 0 0;
            font-family: monospace;
        }

        /* Content */
        .content {
            padding: 40px;
        }

        .custom-message {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border: 2px solid #d4af37;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 32px;
            font-style: italic;
            color: #1a1a1a;
            text-align: center;
        }

        /* Sections */
        .section {
            margin-bottom: 32px;
        }

        .section-title {
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #1a1a1a;
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 3px solid #d4af37;
            position: relative;
        }

        .section-title::after {
            content: '';
            position: absolute;
            bottom: -3px;
            left: 0;
            width: 50px;
            height: 3px;
            background-color: #1a1a1a;
        }

        /* Info grid */
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
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
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .info-value {
            font-size: 14px;
            color: #1a1a1a;
            font-weight: 500;
        }

        /* Order items table */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .items-table th {
            background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
            color: #d4af37;
            padding: 16px 12px;
            text-align: left;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .items-table td {
            padding: 16px 12px;
            border-bottom: 1px solid #f0f0f0;
            font-size: 14px;
            color: #1a1a1a;
        }

        .items-table tr:nth-child(even) {
            background-color: #fafafa;
        }

        .items-table tr:hover {
            background-color: #f5f5f0;
        }

        .product-name {
            font-weight: 600;
            color: #1a1a1a;
        }

        .product-size {
            text-align: center;
            color: #666666;
            font-style: italic;
        }

        .product-qty {
            text-align: center;
            font-weight: bold;
            color: #d4af37;
        }

        .product-price,
        .product-total {
            text-align: right;
            font-family: monospace;
            font-weight: 600;
        }

        /* Summary section */
        .summary-section {
            margin-top: 32px;
            border-top: 2px solid #e5e5e5;
            padding-top: 24px;
        }

        .summary-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            padding: 8px 0;
        }

        .summary-label {
            font-size: 14px;
            color: #666666;
            font-weight: 500;
        }

        .summary-value {
            font-size: 14px;
            font-weight: 600;
            color: #1a1a1a;
            font-family: monospace;
        }

        .discount-row {
            color: #16a34a;
        }

        .total-row {
            border-top: 3px solid #d4af37;
            padding-top: 16px;
            margin-top: 16px;
            background: linear-gradient(135deg, #f5f5f0 0%, #fafafa 100%);
            border-radius: 8px;
            padding: 20px;
        }

        .total-label {
            font-size: 18px;
            font-weight: bold;
            color: #1a1a1a;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .total-value {
            font-size: 24px;
            font-weight: bold;
            color: #d4af37;
            font-family: monospace;
        }

        /* Payment info */
        .payment-info {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
        }

        /* Footer */
        .footer {
            background-color: #1a1a1a;
            color: #ffffff;
            padding: 40px;
            text-align: center;
        }

        .footer-message {
            font-size: 18px;
            margin-bottom: 20px;
            color: #d4af37;
            font-style: italic;
        }

        .contact-info {
            font-size: 12px;
            color: #cccccc;
            line-height: 1.8;
        }

        .contact-info a {
            color: #d4af37;
            text-decoration: none;
        }

        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent 0%, #d4af37 50%, transparent 100%);
            margin: 20px 0;
        }

        /* Responsive */
        @media only screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
            }

            .header, .content, .footer {
                padding: 24px !important;
            }

            .company-name {
                font-size: 24px !important;
            }

            .info-grid {
                grid-template-columns: 1fr !important;
                gap: 12px !important;
            }

            .items-table th,
            .items-table td {
                padding: 8px 6px !important;
                font-size: 12px !important;
            }

            .total-value {
                font-size: 20px !important;
            }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            .custom-message {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                color: #e0e0e0;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1 class="company-name">${company.name}</h1>
            <p class="receipt-title">Order Receipt</p>
            <p class="receipt-number">Receipt #${formattedOrder.receiptNumber}</p>
        </div>

        <!-- Content -->
        <div class="content">
            ${customMessage ? `
            <div class="custom-message">
                <p style="margin: 0; font-size: 16px;">${customMessage}</p>
            </div>
            ` : ''}

            <!-- Order Information -->
            <div class="section">
                <h2 class="section-title">Order Information</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Order Reference</span>
                        <span class="info-value">${orderInfo.reference}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Order Date</span>
                        <span class="info-value">${orderInfo.date}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Customer</span>
                        <span class="info-value">${customer.name}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Status</span>
                        <span class="info-value">${orderInfo.status}</span>
                    </div>
                </div>
            </div>

            <!-- Delivery Information -->
            <div class="section">
                <h2 class="section-title">Delivery Information</h2>
                <div class="info-item">
                    <span class="info-label">Recipient</span>
                    <span class="info-value">${delivery.recipientName}</span>
                </div>
                <div style="margin-top: 12px;">
                    <span class="info-label">Delivery Address</span>
                    <div class="info-value" style="margin-top: 4px;">
                        ${delivery.address.split('\\n').join('<br>')}
                    </div>
                </div>
                <div style="margin-top: 12px;">
                    <span class="info-label">Delivery Zone</span>
                    <span class="info-value">${delivery.zone}</span>
                </div>
            </div>

            <!-- Order Items -->
            <div class="section">
                <h2 class="section-title">Order Items</h2>
                <table class="items-table">
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
                                <td class="product-name">${item.name}</td>
                                <td class="product-size">${item.size}</td>
                                <td class="product-qty">${item.quantity}</td>
                                <td class="product-price">${item.unitPrice}</td>
                                <td class="product-total">${item.totalPrice}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <!-- Order Summary -->
            <div class="summary-section">
                <h2 class="section-title">Order Summary</h2>
                <div class="summary-row">
                    <span class="summary-label">Subtotal:</span>
                    <span class="summary-value">${pricing.subtotal}</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Delivery Fee:</span>
                    <span class="summary-value">${pricing.deliveryFee}</span>
                </div>
                ${coupon ? `
                <div class="summary-row discount-row">
                    <span class="summary-label">Discount (${coupon.code}):</span>
                    <span class="summary-value">-${pricing.discount}</span>
                </div>
                ` : ''}
                <div class="total-row">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="total-label">Total Paid:</span>
                        <span class="total-value">${pricing.total}</span>
                    </div>
                </div>
            </div>

            <!-- Payment Information -->
            <div class="section">
                <h2 class="section-title">Payment Information</h2>
                <div class="payment-info">
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Payment Method</span>
                            <span class="info-value">${payment.method}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Transaction Reference</span>
                            <span class="info-value">${payment.reference}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Payment Status</span>
                            <span class="info-value">${payment.status}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Currency</span>
                            <span class="info-value">${pricing.currency}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p class="footer-message">Thank you for choosing ${company.name}!</p>
            <div class="divider"></div>
            <div class="contact-info">
                <strong>${company.name}</strong><br>
                ${company.address.split('\\n').join('<br>')}<br><br>
                Email: <a href="mailto:${company.email}">${company.email}</a><br>
                Website: <a href="${company.website}">${company.website}</a>
            </div>
            <div class="divider"></div>
            <p style="font-size: 10px; color: #999999; margin: 16px 0 0 0;">
                This is an automatically generated receipt. Please keep this for your records.<br>
                If you have any questions, please contact our support team.
            </p>
        </div>
    </div>
</body>
</html>
  `.trim();
}