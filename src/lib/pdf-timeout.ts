// Utility function to handle PDF generation with timeout protection

export class PDFTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`PDF generation timed out after ${timeoutMs}ms`);
    this.name = 'PDFTimeoutError';
  }
}

export async function withPDFTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 60000 // 60 seconds default
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new PDFTimeoutError(timeoutMs)), timeoutMs)
    )
  ]);
}

// Log PDF generation performance
export function logPDFPerformance(startTime: number, orderId: string, success: boolean) {
  const duration = Date.now() - startTime;
  const status = success ? 'SUCCESS' : 'FAILED';
  console.log(`📄 PDF generation ${status} for order ${orderId}: ${duration}ms`);

  // Warn if generation takes longer than 30 seconds
  if (duration > 30000) {
    console.warn(`⚠️  PDF generation took ${duration}ms for order ${orderId} - consider optimization`);
  }
}