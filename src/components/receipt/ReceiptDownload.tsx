'use client';

import { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';

interface ReceiptDownloadProps {
  orderId: string;
  orderReference?: string;
  variant?: 'default' | 'minimal' | 'icon';
  className?: string;
}

export function ReceiptDownload({
  orderId,
  orderReference,
  variant = 'default',
  className = '',
}: ReceiptDownloadProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadReceipt = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/${orderId}/receipt/pdf`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download receipt');
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Set filename from Content-Disposition header or use fallback
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `Receipt-${orderReference || orderId.slice(0, 8)}.pdf`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="([^"]*)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      link.download = filename;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Receipt download error:', err);
      setError(err instanceof Error ? err.message : 'Failed to download receipt');
    } finally {
      setIsDownloading(false);
    }
  };

  // Icon variant - just an icon button
  if (variant === 'icon') {
    return (
      <div className="relative">
        <button
          onClick={downloadReceipt}
          disabled={isDownloading}
          className={`
            inline-flex items-center justify-center rounded-full p-2
            text-ink hover:text-brand-gold
            hover:bg-brand-gold/10 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          title="Download Receipt"
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </button>
        {error && (
          <div className="absolute top-full mt-1 left-1/2 transform -translate-x-1/2 z-10 bg-brand-rose text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {error}
          </div>
        )}
      </div>
    );
  }

  // Minimal variant - simple text link
  if (variant === 'minimal') {
    return (
      <div className="space-y-1">
        <button
          onClick={downloadReceipt}
          disabled={isDownloading}
          className={`
            inline-flex items-center gap-2 text-sm
            text-ink hover:text-brand-gold underline-offset-4 hover:underline
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
        >
          {isDownloading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <FileText className="h-3 w-3" />
          )}
          {isDownloading ? 'Generating...' : 'Download Receipt'}
        </button>
        {error && (
          <p className="text-xs text-brand-rose">{error}</p>
        )}
      </div>
    );
  }

  // Default variant - full button
  return (
    <div className="space-y-2">
      <button
        onClick={downloadReceipt}
        disabled={isDownloading}
        className={`
          inline-flex items-center justify-center gap-3 px-6 py-3
          rounded-full border border-ink/25 bg-transparent
          text-[11px] uppercase tracking-[0.32em] text-ink
          transition-all duration-300
          hover:border-brand-gold hover:text-brand-gold
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
      >
        {isDownloading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating PDF...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Download Receipt
          </>
        )}
      </button>

      {error && (
        <p className="text-xs text-brand-rose text-center font-serif italic">
          {error}
        </p>
      )}
    </div>
  );
}

// Additional component for multiple receipt actions
export function ReceiptActions({
  orderId,
  orderReference,
  className = '',
  showEmail = true,
  showPrint = true,
}: {
  orderId: string;
  orderReference?: string;
  className?: string;
  showEmail?: boolean;
  showPrint?: boolean;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      <ReceiptDownload
        orderId={orderId}
        orderReference={orderReference}
        variant="minimal"
      />

      {showPrint && (
        <a
          href={`/orders/${orderId}/print`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-ink hover:text-brand-gold underline-offset-4 hover:underline transition-colors"
        >
          <FileText className="h-3 w-3" />
          Print Receipt
        </a>
      )}

      {showEmail && (
        <button
          onClick={() => {
            // TODO: Implement email receipt functionality
            console.log('Email receipt functionality will be implemented in Phase 3');
          }}
          className="inline-flex items-center gap-2 text-sm text-ink hover:text-brand-gold underline-offset-4 hover:underline transition-colors"
        >
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Email Receipt
        </button>
      )}
    </div>
  );
}