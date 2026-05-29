import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { formatOrderForReceipt, getReceiptContent } from '@/lib/receipt';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2 solid #d4af37',
    paddingBottom: 20,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  companyInfo: {
    fontSize: 10,
    color: '#666666',
    lineHeight: 1.4,
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginVertical: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  leftColumn: {
    width: '48%',
  },
  rightColumn: {
    width: '48%',
  },
  label: {
    fontSize: 10,
    color: '#666666',
    fontWeight: 'bold',
  },
  value: {
    fontSize: 10,
    color: '#1a1a1a',
    marginLeft: 8,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f0',
    padding: 8,
    borderBottom: '1 solid #e5e5e5',
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1 solid #f0f0f0',
  },
  tableCell: {
    fontSize: 10,
    color: '#1a1a1a',
  },
  productName: {
    width: '40%',
  },
  productSize: {
    width: '15%',
    textAlign: 'center',
  },
  productQty: {
    width: '15%',
    textAlign: 'center',
  },
  productPrice: {
    width: '15%',
    textAlign: 'right',
  },
  productTotal: {
    width: '15%',
    textAlign: 'right',
  },
  summarySection: {
    marginTop: 20,
    borderTop: '2 solid #e5e5e5',
    paddingTop: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#666666',
  },
  summaryValue: {
    fontSize: 10,
    color: '#1a1a1a',
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTop: '1 solid #d4af37',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#d4af37',
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: '1 solid #e5e5e5',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 9,
    color: '#666666',
    lineHeight: 1.4,
  },
  receiptNumber: {
    fontSize: 11,
    color: '#d4af37',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  issueDate: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'right',
    marginTop: 4,
  },
});

interface ReceiptPDFProps {
  order: any; // Order data from Prisma
}

export function ReceiptPDF({ order }: ReceiptPDFProps) {
  const formattedOrder = formatOrderForReceipt(order);
  const content = getReceiptContent(formattedOrder);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.row}>
            <View style={styles.leftColumn}>
              <Text style={styles.companyName}>
                {formattedOrder.company.name}
              </Text>
              <Text style={styles.companyInfo}>
                {formattedOrder.company.address.split('\\n').join('\n')}
              </Text>
              <Text style={styles.companyInfo}>
                {formattedOrder.company.email}
              </Text>
              <Text style={styles.companyInfo}>
                {formattedOrder.company.website}
              </Text>
            </View>
            <View style={styles.rightColumn}>
              <Text style={styles.receiptNumber}>
                Receipt #{formattedOrder.receiptNumber}
              </Text>
              <Text style={styles.issueDate}>
                Issued: {formattedOrder.issueDate}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.receiptTitle}>{content.title}</Text>

        {/* Order Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Information</Text>
          <View style={styles.row}>
            <View style={styles.leftColumn}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.label}>Order ID:</Text>
                <Text style={styles.value}>{formattedOrder.order.id}</Text>
              </View>
              <View style={{ flexDirection: 'row', marginTop: 4 }}>
                <Text style={styles.label}>Reference:</Text>
                <Text style={styles.value}>{formattedOrder.order.reference}</Text>
              </View>
            </View>
            <View style={styles.rightColumn}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.label}>Order Date:</Text>
                <Text style={styles.value}>{formattedOrder.order.date}</Text>
              </View>
              <View style={{ flexDirection: 'row', marginTop: 4 }}>
                <Text style={styles.label}>Status:</Text>
                <Text style={styles.value}>{formattedOrder.order.status}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.row}>
            <View style={styles.leftColumn}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.value}>{formattedOrder.customer.name}</Text>
              </View>
            </View>
            <View style={styles.rightColumn}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{formattedOrder.customer.email}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Delivery Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Information</Text>
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.label}>Recipient:</Text>
            <Text style={styles.value}>{formattedOrder.delivery.recipientName}</Text>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 4 }}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>
              {formattedOrder.delivery.address.split('\\n').join(' • ')}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 4 }}>
            <Text style={styles.label}>Delivery Zone:</Text>
            <Text style={styles.value}>{formattedOrder.delivery.zone}</Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, styles.productName]}>Product</Text>
              <Text style={[styles.tableHeaderCell, styles.productSize]}>Size</Text>
              <Text style={[styles.tableHeaderCell, styles.productQty]}>Qty</Text>
              <Text style={[styles.tableHeaderCell, styles.productPrice]}>Price</Text>
              <Text style={[styles.tableHeaderCell, styles.productTotal]}>Total</Text>
            </View>

            {/* Table Rows */}
            {formattedOrder.items.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.productName]}>{item.name}</Text>
                <Text style={[styles.tableCell, styles.productSize]}>{item.size}</Text>
                <Text style={[styles.tableCell, styles.productQty]}>{item.quantity}</Text>
                <Text style={[styles.tableCell, styles.productPrice]}>{item.unitPrice}</Text>
                <Text style={[styles.tableCell, styles.productTotal]}>{item.totalPrice}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Pricing Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>{formattedOrder.pricing.subtotal}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee:</Text>
            <Text style={styles.summaryValue}>{formattedOrder.pricing.deliveryFee}</Text>
          </View>
          {formattedOrder.coupon && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Discount ({formattedOrder.coupon.code}):
              </Text>
              <Text style={styles.summaryValue}>-{formattedOrder.pricing.discount}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{formattedOrder.pricing.total}</Text>
          </View>
        </View>

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment Method:</Text>
            <Text style={styles.summaryValue}>{formattedOrder.payment.method}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Transaction Reference:</Text>
            <Text style={styles.summaryValue}>{formattedOrder.payment.reference}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment Status:</Text>
            <Text style={styles.summaryValue}>{formattedOrder.payment.status}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for your business!
          </Text>
          <Text style={styles.footerText}>
            For support or inquiries, please contact us at {formattedOrder.company.email}
          </Text>
          <Text style={[styles.footerText, { marginTop: 10 }]}>
            This is an automatically generated receipt.
          </Text>
        </View>
      </Page>
    </Document>
  );
}