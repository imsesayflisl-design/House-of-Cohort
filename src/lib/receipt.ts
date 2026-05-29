import { format } from "date-fns";

// Receipt number generation
export function generateReceiptNumber(orderId: string): string {
  const timestamp = Date.now().toString().slice(-6);
  const orderPrefix = orderId.slice(0, 4).toUpperCase();
  return `RCP-${orderPrefix}-${timestamp}`;
}

// Format currency for receipts
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-SL', {
    style: 'currency',
    currency: 'SLE',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date for receipts
export function formatReceiptDate(date: Date): string {
  return format(date, "MMMM dd, yyyy 'at' h:mm a");
}

// Format address for display
export function formatAddress(address: {
  recipientName: string;
  streetAddress: string;
  city: string;
  phone: string;
}): string {
  return `${address.recipientName}\n${address.streetAddress}\n${address.city}\nPhone: ${address.phone}`;
}

// Company information
export function getCompanyInfo() {
  return {
    name: process.env.NEXT_PUBLIC_COMPANY_NAME || "House of Cohort",
    address: process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "Freetown, Sierra Leone",
    email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@houseofcohort.com",
    phone: "+232 XX XXX XXXX", // Add to env vars if needed
    website: process.env.NEXT_PUBLIC_APP_URL || "https://houseofcohort.com",
  };
}

// Extract order data for receipts
export function formatOrderForReceipt(order: any) {
  const company = getCompanyInfo();
  const receiptNumber = generateReceiptNumber(order.id);

  return {
    // Receipt metadata
    receiptNumber,
    issueDate: formatReceiptDate(new Date()),

    // Company information
    company,

    // Order information
    order: {
      id: order.id,
      reference: order.reference || order.id.slice(0, 8).toUpperCase(),
      date: formatReceiptDate(order.createdAt),
      status: order.status,
    },

    // Customer information
    customer: {
      name: order.user?.name || "Guest Customer",
      email: order.user?.email || order.guestEmail || "N/A",
    },

    // Delivery information
    delivery: {
      recipientName: order.address?.recipientName || "",
      address: order.address ? formatAddress(order.address) : "N/A",
      zone: order.address?.deliveryZone?.name || "N/A",
    },

    // Order items
    items: order.items?.map((item: any) => ({
      name: item.product?.name || "Unknown Product",
      size: item.variant?.size || "N/A",
      quantity: item.quantity,
      unitPrice: formatCurrency(item.price),
      totalPrice: formatCurrency(item.price * item.quantity),
    })) || [],

    // Pricing breakdown
    pricing: {
      subtotal: formatCurrency(order.subtotal),
      deliveryFee: formatCurrency(order.deliveryFee),
      discount: order.discount > 0 ? formatCurrency(order.discount) : null,
      total: formatCurrency(order.total),
      currency: "SLE",
    },

    // Payment information
    payment: {
      method: order.monimeReference ? "Card Payment" : "Pending",
      reference: order.monimeReference || "N/A",
      status: order.status === "PAID" ? "Completed" : "Pending",
    },

    // Coupon information
    coupon: order.coupon ? {
      code: order.coupon.code,
      type: order.coupon.type,
      value: order.coupon.type === "PERCENTAGE"
        ? `${order.coupon.value}%`
        : formatCurrency(order.coupon.value),
    } : null,
  };
}

// Generate receipt content for different formats
export function getReceiptContent(formattedOrder: ReturnType<typeof formatOrderForReceipt>) {
  const { receiptNumber, issueDate, company, order, customer, delivery, items, pricing, payment, coupon } = formattedOrder;

  return {
    // Email subject
    emailSubject: `Receipt for Order ${order.reference} - ${company.name}`,

    // Email preview text
    emailPreview: `Your receipt for ${items.length} item${items.length === 1 ? '' : 's'} totaling ${pricing.total}`,

    // Receipt title
    title: "Order Receipt",

    // Formatted text content for emails
    textContent: `
${company.name}
${company.address}
${company.email} | ${company.website}

RECEIPT: ${receiptNumber}
Issued: ${issueDate}

ORDER DETAILS
Order ID: ${order.id}
Order Reference: ${order.reference}
Order Date: ${order.date}
Status: ${order.status}

CUSTOMER INFORMATION
Name: ${customer.name}
Email: ${customer.email}

DELIVERY INFORMATION
Recipient: ${delivery.recipientName}
Address: ${delivery.address.replace(/\n/g, ', ')}
Zone: ${delivery.zone}

ORDER ITEMS
${items.map((item, index) =>
  `${index + 1}. ${item.name} (${item.size}) - Qty: ${item.quantity} - ${item.unitPrice} each - ${item.totalPrice}`
).join('\n')}

PRICING BREAKDOWN
Subtotal: ${pricing.subtotal}
Delivery Fee: ${pricing.deliveryFee}
${coupon ? `Discount (${coupon.code}): -${pricing.discount}` : ''}
Total: ${pricing.total}

PAYMENT INFORMATION
Method: ${payment.method}
Reference: ${payment.reference}
Status: ${payment.status}

Thank you for your business!
For support, contact us at ${company.email}
    `.trim(),
  };
}

// Style constants for PDF and print layouts
export const receiptStyles = {
  colors: {
    primary: '#1a1a1a',      // Ink
    secondary: '#d4af37',    // Brand gold
    text: '#4a4a4a',         // Gray text
    light: '#f5f5f0',        // Parchment
    border: '#e5e5e5',       // Light gray
  },
  fonts: {
    heading: 'Playfair Display, serif',
    body: 'Inter, sans-serif',
    mono: 'JetBrains Mono, monospace',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};