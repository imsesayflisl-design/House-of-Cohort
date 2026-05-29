import { formatOrderForReceipt, getReceiptContent } from '@/lib/receipt';

interface ReceiptEmailTextProps {
  order: any; // Order data from Prisma
  customMessage?: string;
}

export function ReceiptEmailText({ order, customMessage }: ReceiptEmailTextProps) {
  const formattedOrder = formatOrderForReceipt(order);
  const content = getReceiptContent(formattedOrder);
  const { company, order: orderInfo, customer, delivery, items, pricing, payment, coupon } = formattedOrder;

  return `
${company.name.toUpperCase()}
${company.address.split('\\n').join('\n')}
${company.email} | ${company.website}

================================================
              ORDER RECEIPT
            ${formattedOrder.receiptNumber}
================================================

Issued: ${formattedOrder.issueDate}

${customMessage ? `
${customMessage}

` : ''}

ORDER INFORMATION
-----------------
Order ID: ${orderInfo.id}
Order Reference: ${orderInfo.reference}
Order Date: ${orderInfo.date}
Status: ${orderInfo.status}

CUSTOMER INFORMATION
--------------------
Name: ${customer.name}
Email: ${customer.email}

DELIVERY INFORMATION
--------------------
Recipient: ${delivery.recipientName}
Address: ${delivery.address.replace(/\\n/g, '\n         ')}
Delivery Zone: ${delivery.zone}

ORDER ITEMS
-----------
${items.map((item, index) =>
  `${String(index + 1).padStart(2, ' ')}. ${item.name} (${item.size})
    Quantity: ${item.quantity}
    Unit Price: ${item.unitPrice}
    Total: ${item.totalPrice}`
).join('\n\n')}

ORDER SUMMARY
-------------
Subtotal:                           ${pricing.subtotal.padStart(12)}
Delivery Fee:                       ${pricing.deliveryFee.padStart(12)}${coupon ? `
Discount (${coupon.code}):                    -${pricing.discount?.padStart(11)}` : ''}
                                    ____________
TOTAL PAID:                         ${pricing.total.padStart(12)}

PAYMENT INFORMATION
-------------------
Payment Method: ${payment.method}
Transaction Reference: ${payment.reference}
Payment Status: ${payment.status}
Currency: ${pricing.currency}

================================================

Thank you for your business!

For support or inquiries, please contact us:
Email: ${company.email}
Website: ${company.website}

This is an automatically generated receipt.
Please keep this for your records.

${company.name} - Premium Fashion & Lifestyle

================================================
  `.trim();
}