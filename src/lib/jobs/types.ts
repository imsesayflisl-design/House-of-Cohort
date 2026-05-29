// Job types for background processing

export interface EmailJob {
  type: 'send_order_confirmation_email';
  orderId: string;
  customMessage?: string;
  retry?: number;
  maxRetries?: number;
}

export interface JobResult {
  success: boolean;
  error?: string;
  retryIn?: number; // seconds to wait before retry
}

export type BackgroundJob = EmailJob;

export interface JobQueue {
  add(job: BackgroundJob): Promise<void>;
  process(): Promise<void>;
  getJobStatus(jobId: string): Promise<JobResult | null>;
}