The user wants to add a complete receipt feature to the e-commerce system so that after customers place an order, they receive professional receipts for their purchases. This will ple options for record-keeping and significantly improvethe shopping experience.

Currently, the system has a complete order processing flow from checkout to payment confirmation, but lacks a proper receipt generation
system. Customers can view their order details on theccount order history, but there's no formal receipt theycan download, print, or save for their records.

The goal is to implement a comprehensive receipt system with all three formats: PDF download, email delivery, and printable web receipts,
providing maximum flexibility for customers.

Implementation Plan

Phase 1: Foundation Setup

Dependencies Installation:
npm install @react-pdf/renderer resend
npm install -D @types/react-pdf

Environment Configuration:
Add to .env.local and .env.example:
RESEND_API_KEY="re_your_api_key_here"
NEXT_PUBLIC_COMPANY_NAME="House of Cohort"
NEXT_PUBLIC_COMPANY_ADDRESS="Your Address\nFreetown,
NEXT_PUBLIC_SUPPORT_EMAIL="support@houseofcohort.com"

Core Receipt Library:
Create src/lib/receipt.ts for receipt utilities, datations.

Phase 2: PDF Receipt Generation

PDF Document Component:
Create src/components/receipt/ReceiptPDF.tsx using React-PDF with House of Cohort branding, including:
- Company header with logo and contact info
- Complete order details table
- Customer and delivery information
- Payment summary and receipt number
- Brand-consistent typography and colors

PDF Generation API:
Create src/app/api/orders/[orderId]/receipt/pdf/route.ts (GET endpoint) to:
- Fetch order data with all relations
- Generate PDF using React-PDF
- Return PDF with proper headers
- Verify user access rights for security

Download Components:
Create src/components/receipt/ReceiptDownload.tsx wittates, and error handling.

Phase 3: Email Receipt System

Email Templates:
- src/components/email/ReceiptEmailHTML.tsx - HTML email template
- src/components/email/ReceiptEmailText.tsx - Plain t

Email Service:
Create src/lib/email.ts for Resend integration, template rendering, attachment handling, and error handling.

Email API:
Create src/app/api/orders/[orderId]/receipt/email/rou
- Generate HTML and text email versions
- Attach PDF if requested
- Send via Resend service
- Log email delivery status

Automatic Email Integration:
Integrate with existing order creation flow in src/app/api/checkout/route.ts to automatically send receipts after payment confirmation.

Phase 4: Printable Web Receipt

Print-Optimized Component:
Create src/components/receipt/ReceiptPrint.tsx with:
- CSS print media queries
- Hidden navigation elements
- Optimized typography for printing
- Brand consistency maintained

Print Styles:
Create src/styles/print.css with print-specific optimizations.

Print Page Route:
Create src/app/(store)/orders/[orderId]/print/page.tsith simplified layout.

Phase 5: Integration Points

Success Page Integration:
Update src/app/(store)/checkout/success/CheckoutSuccessClient.tsx to add:
- PDF download button
- Email receipt option
- Print receipt link

Order History Integration:
Update src/app/(store)/account/orders/[id]/page.tsx to add receipt action buttons.

Admin Integration:
Update src/app/admin/orders/[id]/page.tsx for admin r functionality.

Phase 6: Database Enhancements

Receipt Tracking:
Add fields to Order model:
- receiptEmailSentAt (timestamp)
- receiptEmailStatus (text)
- receiptDownloadCount (integer)

Critical Files to Create

Core Components:
- src/lib/receipt.ts - Receipt utilities and formatting
- src/lib/email.ts - Email service integration
- src/components/receipt/ReceiptPDF.tsx - PDF generation component
- src/components/receipt/ReceiptDownload.tsx - Downlo
- src/components/receipt/ReceiptPrint.tsx - Print-optimized component

API Endpoints:
- src/app/api/orders/[orderId]/receipt/pdf/route.ts -
- src/app/api/orders/[orderId]/receipt/email/route.ts - Email sending API

Email Templates:
- src/components/email/ReceiptEmailHTML.tsx - HTML em
- src/components/email/ReceiptEmailText.tsx - Text email template

Print Page:
- src/app/(store)/orders/[orderId]/print/page.tsx - P
- src/styles/print.css - Print-specific styles

Files to Modify

Integration Points:
- src/app/(store)/checkout/success/CheckoutSuccessClis
- src/app/(store)/account/orders/[id]/page.tsx - Add receipt access
- src/app/admin/orders/[id]/page.tsx - Admin receipt
- src/app/(store)/checkout/success/CheckoutSuccessClient.tsx - Add receipt buttons
- src/app/(store)/account/orders/[id]/page.tsx - Add
- src/app/admin/orders/[id]/page.tsx - Admin receipt tools
- src/app/api/checkout/route.ts - Auto-send receipts
- prisma/schema.prisma - Add receipt tracking fields

Security & Performance

Security Measures:
- Verify user ownership of orders
- Guest access via secure tokens
- Rate limiting on email sending
- Data masking for sensitive information

Performance Optimizations:
- PDF caching for identical orders
- Async email sending
- Image optimization for email templates
- Error handling with retry mechanisms

Verification Steps

Testing Requirements:
1. PDF Generation: Test download from success page an
2. Email Delivery: Verify automatic sending and manual resend functionality

4. Integration: Verify all access points work correctly
5. Security: Test access controls and permissions
6. Performance: Monitor PDF generation and email sending times

User Experience Testing:
- Complete order flow with receipt generation
- Download and view PDF receipts
- Print web receipts
- Receive and verify email receipts
- Admin receipt management functionality

This comprehensive implementation provides customersn all requested formats while maintaining the House ofCohort's elegant design aesthetic and ensuring robust functionality across the entire order lifecycle.