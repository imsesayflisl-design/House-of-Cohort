'use client';

import React from 'react';
import { formatOrderForReceipt, getReceiptContent } from '@/lib/receipt';

interface ReceiptPrintProps {
  order: any; // Order data from Prisma
  className?: string;
}

export function ReceiptPrint({ order, className = '' }: ReceiptPrintProps) {
  const formattedOrder = formatOrderForReceipt(order);
  const content = getReceiptContent(formattedOrder);
  const { company, order: orderInfo, customer, delivery, items, pricing, payment, coupon } = formattedOrder;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`receipt-print ${className}`}>
      {/* Print button - hidden when printing */}
      <div className="print-controls no-print mb-8 text-center">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-ink/25 bg-transparent text-[11px] uppercase tracking-[0.32em] text-ink transition-colors hover:border-brand-gold hover:text-brand-gold"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a1 1 0 001-1v-4a1 1 0 00-1-1H9a1 1 0 00-1 1v4a1 1 0 001 1zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Receipt
        </button>
      </div>

      {/* Receipt content */}
      <div className="receipt-content max-w-4xl mx-auto bg-white">
        {/* Header */}
        <header className="receipt-header text-center mb-8 pb-6 border-b-2 border-brand-gold">
          <h1 className="company-name text-3xl font-display font-light text-ink mb-2 tracking-wide">
            {company.name}
          </h1>
          <div className="company-info text-sm text-ink/70 mb-4">
            <p>{company.address.split('\\n').join(' • ')}</p>
            <p>{company.email} • {company.website}</p>
          </div>
          <h2 className="receipt-title text-xl font-display text-ink mb-2">
            Order Receipt
          </h2>
          <p className="receipt-number text-sm text-brand-gold font-mono">
            Receipt #{formattedOrder.receiptNumber}
          </p>
          <p className="issue-date text-xs text-ink/60">
            Issued: {formattedOrder.issueDate}
          </p>
        </header>

        {/* Order Information */}
        <section className="order-info mb-6">
          <h3 className="section-title text-sm font-bold uppercase tracking-[0.5em] text-ink mb-4 pb-2 border-b border-ink/20">
            Order Information
          </h3>
          <div className="info-grid grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="label text-ink/60 font-medium">Order ID:</span>
              <span className="value text-ink ml-2">{orderInfo.id}</span>
            </div>
            <div>
              <span className="label text-ink/60 font-medium">Order Date:</span>
              <span className="value text-ink ml-2">{orderInfo.date}</span>
            </div>
            <div>
              <span className="label text-ink/60 font-medium">Reference:</span>
              <span className="value text-ink ml-2">{orderInfo.reference}</span>
            </div>
            <div>
              <span className="label text-ink/60 font-medium">Status:</span>
              <span className="value text-ink ml-2">{orderInfo.status}</span>
            </div>
          </div>
        </section>

        {/* Customer Information */}
        <section className="customer-info mb-6">
          <h3 className="section-title text-sm font-bold uppercase tracking-[0.5em] text-ink mb-4 pb-2 border-b border-ink/20">
            Customer Information
          </h3>
          <div className="info-grid grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="label text-ink/60 font-medium">Name:</span>
              <span className="value text-ink ml-2">{customer.name}</span>
            </div>
            <div>
              <span className="label text-ink/60 font-medium">Email:</span>
              <span className="value text-ink ml-2">{customer.email}</span>
            </div>
          </div>
        </section>

        {/* Delivery Information */}
        <section className="delivery-info mb-6">
          <h3 className="section-title text-sm font-bold uppercase tracking-[0.5em] text-ink mb-4 pb-2 border-b border-ink/20">
            Delivery Information
          </h3>
          <div className="text-sm">
            <div className="mb-2">
              <span className="label text-ink/60 font-medium">Recipient:</span>
              <span className="value text-ink ml-2">{delivery.recipientName}</span>
            </div>
            <div className="mb-2">
              <span className="label text-ink/60 font-medium">Address:</span>
              <div className="value text-ink ml-2 mt-1">
                {delivery.address.split('\\n').map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              </div>
            </div>
            <div>
              <span className="label text-ink/60 font-medium">Zone:</span>
              <span className="value text-ink ml-2">{delivery.zone}</span>
            </div>
          </div>
        </section>

        {/* Order Items */}
        <section className="order-items mb-6">
          <h3 className="section-title text-sm font-bold uppercase tracking-[0.5em] text-ink mb-4 pb-2 border-b border-ink/20">
            Order Items
          </h3>
          <div className="items-table overflow-hidden border border-ink/20">
            {/* Table Header */}
            <div className="table-header bg-ink/5 grid grid-cols-12 gap-2 p-3 text-xs font-bold uppercase tracking-wide text-ink">
              <div className="col-span-5">Product</div>
              <div className="col-span-2 text-center">Size</div>
              <div className="col-span-1 text-center">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {/* Table Rows */}
            <div className="table-body">
              {items.map((item, index) => (
                <div
                  key={index}
                  className={`table-row grid grid-cols-12 gap-2 p-3 text-sm border-b border-ink/10 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-ink/2'
                  }`}
                >
                  <div className="col-span-5 font-medium text-ink">{item.name}</div>
                  <div className="col-span-2 text-center text-ink/70">{item.size}</div>
                  <div className="col-span-1 text-center font-bold text-brand-gold">{item.quantity}</div>
                  <div className="col-span-2 text-right font-mono text-ink">{item.unitPrice}</div>
                  <div className="col-span-2 text-right font-mono font-bold text-ink">{item.totalPrice}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Order Summary */}
        <section className="order-summary mb-6">
          <h3 className="section-title text-sm font-bold uppercase tracking-[0.5em] text-ink mb-4 pb-2 border-b border-ink/20">
            Order Summary
          </h3>
          <div className="summary-table max-w-md ml-auto">
            <div className="summary-row flex justify-between items-center py-2 text-sm">
              <span className="label text-ink/60">Subtotal:</span>
              <span className="value font-mono text-ink">{pricing.subtotal}</span>
            </div>
            <div className="summary-row flex justify-between items-center py-2 text-sm">
              <span className="label text-ink/60">Delivery Fee:</span>
              <span className="value font-mono text-ink">{pricing.deliveryFee}</span>
            </div>
            {coupon && (
              <div className="summary-row flex justify-between items-center py-2 text-sm text-green-600">
                <span className="label">Discount ({coupon.code}):</span>
                <span className="value font-mono">-{pricing.discount}</span>
              </div>
            )}
            <div className="total-row flex justify-between items-center py-4 mt-4 pt-4 border-t-2 border-brand-gold bg-brand-gold/5 px-4 rounded">
              <span className="label text-lg font-bold text-ink uppercase tracking-wide">Total:</span>
              <span className="value text-xl font-bold font-mono text-brand-gold">{pricing.total}</span>
            </div>
          </div>
        </section>

        {/* Payment Information */}
        <section className="payment-info mb-8">
          <h3 className="section-title text-sm font-bold uppercase tracking-[0.5em] text-ink mb-4 pb-2 border-b border-ink/20">
            Payment Information
          </h3>
          <div className="payment-details bg-ink/3 p-4 rounded">
            <div className="info-grid grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="label text-ink/60 font-medium">Payment Method:</span>
                <span className="value text-ink ml-2">{payment.method}</span>
              </div>
              <div>
                <span className="label text-ink/60 font-medium">Payment Status:</span>
                <span className="value text-ink ml-2">{payment.status}</span>
              </div>
              <div className="col-span-2">
                <span className="label text-ink/60 font-medium">Transaction Reference:</span>
                <span className="value text-ink ml-2 font-mono text-xs">{payment.reference}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="receipt-footer text-center pt-6 border-t border-ink/20">
          <div className="thank-you mb-4">
            <p className="text-lg font-display text-ink italic">
              Thank you for choosing {company.name}!
            </p>
          </div>
          <div className="contact-info text-xs text-ink/60 leading-relaxed">
            <p>For support or inquiries, please contact us at {company.email}</p>
            <p>Visit us at {company.website}</p>
          </div>
          <div className="receipt-note mt-4 text-xs text-ink/50 italic">
            <p>This is an automatically generated receipt. Please keep this for your records.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}