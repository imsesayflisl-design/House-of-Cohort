"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Payment validation schema
const paymentSchema = z.object({
  cardNumber: z
    .string()
    .min(1, "Card number is required")
    .regex(/^\d{16}$/, "Card number must be 16 digits"),
  expiryDate: z
    .string()
    .min(1, "Expiry date is required")
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY format"),
  cvv: z
    .string()
    .min(1, "CVV is required")
    .regex(/^\d{3,4}$/, "CVV must be 3 or 4 digits"),
  cardholderName: z
    .string()
    .min(1, "Cardholder name is required")
    .min(2, "Name must be at least 2 characters"),
  bankCode: z
    .string()
    .min(1, "Bank is required"),
});

type PaymentInput = z.infer<typeof paymentSchema>;

type Props = {
  orderId: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
  isVisible: boolean;
};

// Sierra Leone banks (common ones)
const banks = [
  { code: "ECO", name: "Ecobank Sierra Leone" },
  { code: "UBA", name: "United Bank for Africa" },
  { code: "GTB", name: "Guaranty Trust Bank" },
  { code: "ZEN", name: "Zenith Bank" },
  { code: "FIB", name: "First International Bank" },
  { code: "STD", name: "Standard Chartered Bank" },
  { code: "SKY", name: "Skyebank Sierra Leone" },
  { code: "ROB", name: "Rokel Commercial Bank" },
];

export function PaymentForm({
  orderId,
  amount,
  onSuccess,
  onCancel,
  isVisible,
}: Props) {
  const [isProcessing, startProcessing] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PaymentInput>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
      bankCode: "",
    },
  });

  // Format card number as user types
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    e.target.value = formatted;
    setValue("cardNumber", value);
  };

  // Format expiry date as user types
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (value.length >= 2) {
      value = value.slice(0, 2) + "/" + value.slice(2);
    }
    e.target.value = value;
    setValue("expiryDate", value);
  };

  // Format CVV as user types
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    e.target.value = value;
    setValue("cvv", value);
  };

  function onSubmit(values: PaymentInput) {
    startProcessing(async () => {
      try {
        const res = await fetch("/api/checkout/process-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            paymentData: {
              ...values,
              amount,
            },
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data?.error ?? "Payment failed. Please try again.");
          return;
        }

        toast.success("Payment processed successfully!");
        onSuccess();
      } catch (err) {
        toast.error("Network error. Please check your connection and try again.");
        console.error("Payment processing error:", err);
      }
    });
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-parchment rounded-lg border border-ink/20 p-8 shadow-xl">
        <div className="mb-6">
          <h2 className="font-display text-2xl font-light text-ink">
            Payment Details
          </h2>
          <p className="mt-2 text-sm text-ink/65">
            Enter your bank card details to complete payment
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Bank Selection */}
          <PaymentField label="Bank" error={errors.bankCode?.message}>
            <select
              {...register("bankCode")}
              className="w-full appearance-none border-b border-ink/25 bg-transparent pb-2 pr-8 font-display text-lg text-ink focus:border-brand-gold focus:outline-none"
            >
              <option value="">Select your bank</option>
              {banks.map((bank) => (
                <option key={bank.code} value={bank.code}>
                  {bank.name}
                </option>
              ))}
            </select>
          </PaymentField>

          {/* Cardholder Name */}
          <PaymentField label="Cardholder Name" error={errors.cardholderName?.message}>
            <input
              {...register("cardholderName")}
              type="text"
              placeholder="John Doe"
              className="w-full border-b border-ink/25 bg-transparent pb-2 font-display text-lg text-ink placeholder:text-ink/30 focus:border-brand-gold focus:outline-none"
            />
          </PaymentField>

          {/* Card Number */}
          <PaymentField label="Card Number" error={errors.cardNumber?.message}>
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              onChange={handleCardNumberChange}
              maxLength={19}
              className="w-full border-b border-ink/25 bg-transparent pb-2 font-mono text-lg text-ink placeholder:text-ink/30 focus:border-brand-gold focus:outline-none"
            />
          </PaymentField>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <PaymentField label="Expiry Date" error={errors.expiryDate?.message}>
              <input
                type="text"
                placeholder="MM/YY"
                onChange={handleExpiryChange}
                maxLength={5}
                className="w-full border-b border-ink/25 bg-transparent pb-2 font-mono text-lg text-ink placeholder:text-ink/30 focus:border-brand-gold focus:outline-none"
              />
            </PaymentField>

            <PaymentField label="CVV" error={errors.cvv?.message}>
              <input
                type="password"
                placeholder="123"
                onChange={handleCvvChange}
                maxLength={4}
                className="w-full border-b border-ink/25 bg-transparent pb-2 font-mono text-lg text-ink placeholder:text-ink/30 focus:border-brand-gold focus:outline-none"
              />
            </PaymentField>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1 rounded-full border border-ink/30 px-6 py-3 text-sm uppercase tracking-wide text-ink transition-colors hover:bg-ink/5 disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 rounded-full bg-ink px-6 py-3 text-sm uppercase tracking-wide text-parchment transition-all duration-500 hover:bg-brand-gold hover:text-ink disabled:opacity-40"
            >
              {isProcessing ? "Processing..." : "Pay Now"}
            </button>
          </div>
        </form>

        {/* Security Notice */}
        <div className="mt-6 rounded border border-brand-gold/20 bg-brand-gold/5 p-3">
          <p className="text-xs text-ink/65">
            🔒 Your payment information is encrypted and secure. We use bank-level security.
          </p>
        </div>
      </div>
    </div>
  );
}

function PaymentField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs uppercase tracking-wide text-ink/55">
        {label}
      </label>
      {children}
      {error && (
        <span className="font-serif text-xs italic text-brand-rose">{error}</span>
      )}
    </div>
  );
}