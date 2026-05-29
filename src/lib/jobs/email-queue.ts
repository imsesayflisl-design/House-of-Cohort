import { prisma } from '@/lib/prisma';
import { sendOrderConfirmationEmail } from '@/lib/email';
import type { BackgroundJob, JobQueue, EmailJob, JobResult } from './types';

// Simple in-memory job queue implementation
class InMemoryEmailQueue implements JobQueue {
  private jobs: Map<string, BackgroundJob> = new Map();
  private processing = false;
  private processingInterval: NodeJS.Timeout | null = null;

  async add(job: BackgroundJob): Promise<void> {
    const jobId = `${job.type}_${job.orderId}_${Date.now()}`;
    this.jobs.set(jobId, job);

    // Start processing if not already running
    if (!this.processing) {
      this.startProcessing();
    }
  }

  private startProcessing() {
    if (this.processing) return;

    this.processing = true;
    this.processingInterval = setInterval(async () => {
      await this.processNextJob();

      // Stop processing if no jobs remain
      if (this.jobs.size === 0) {
        this.stopProcessing();
      }
    }, 1000); // Process every second
  }

  private stopProcessing() {
    this.processing = false;
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  private async processNextJob(): Promise<void> {
    if (this.jobs.size === 0) return;

    const [jobId, job] = this.jobs.entries().next().value;
    this.jobs.delete(jobId);

    try {
      await this.executeJob(job);
    } catch (error) {
      console.error(`Job ${jobId} failed:`, error);

      // Retry logic
      const retryCount = job.retry || 0;
      const maxRetries = job.maxRetries || 3;

      if (retryCount < maxRetries) {
        const retryJob = {
          ...job,
          retry: retryCount + 1
        };

        // Add back to queue with exponential backoff delay
        setTimeout(() => {
          this.add(retryJob);
        }, Math.pow(2, retryCount) * 1000);
      } else {
        console.error(`Job ${jobId} failed after ${maxRetries} retries`);

        // Update order status to failed
        if (job.type === 'send_order_confirmation_email') {
          try {
            await prisma.order.update({
              where: { id: job.orderId },
              data: {
                receiptEmailStatus: 'failed',
              },
            });
          } catch (dbError) {
            console.error('Failed to update order email status:', dbError);
          }
        }
      }
    }
  }

  private async executeJob(job: BackgroundJob): Promise<JobResult> {
    switch (job.type) {
      case 'send_order_confirmation_email':
        return await this.processEmailJob(job);
      default:
        throw new Error(`Unknown job type: ${(job as any).type}`);
    }
  }

  private async processEmailJob(job: EmailJob): Promise<JobResult> {
    try {
      console.log(`Processing email job for order ${job.orderId}`);

      // Fetch order with all required relations
      const order = await prisma.order.findUnique({
        where: { id: job.orderId },
        include: {
          user: true,
          address: {
            include: {
              deliveryZone: true
            }
          },
          items: {
            include: {
              product: true,
              variant: true
            }
          },
          deliveryZone: true,
          coupon: true
        }
      });

      if (!order) {
        throw new Error(`Order ${job.orderId} not found`);
      }

      // Update email status to sending
      await prisma.order.update({
        where: { id: job.orderId },
        data: {
          receiptEmailStatus: 'sending',
        },
      });

      // Send the email with custom message if provided
      const emailResult = await sendOrderConfirmationEmail(order);

      if (emailResult.success) {
        // Update email status to sent
        await prisma.order.update({
          where: { id: job.orderId },
          data: {
            receiptEmailStatus: 'sent',
            receiptEmailSentAt: new Date(),
          },
        });

        console.log(`Email sent successfully for order ${job.orderId}`);
        return { success: true };
      } else {
        throw new Error(emailResult.error || 'Email sending failed');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Email job failed for order ${job.orderId}:`, error);

      // Update email status to error
      try {
        await prisma.order.update({
          where: { id: job.orderId },
          data: {
            receiptEmailStatus: 'error',
          },
        });
      } catch (dbError) {
        console.error('Failed to update order email status to error:', dbError);
      }

      return {
        success: false,
        error: errorMessage,
        retryIn: 30 // Retry in 30 seconds
      };
    }
  }

  async getJobStatus(jobId: string): Promise<JobResult | null> {
    // For in-memory queue, we don't track individual job statuses
    // In a production system, you'd use a proper job queue like Bull or BullMQ
    return null;
  }

  async process(): Promise<void> {
    // This method would be used for manual processing
    await this.processNextJob();
  }
}

// Global queue instance
const emailQueue = new InMemoryEmailQueue();

// Helper functions
export async function queueOrderConfirmationEmail(orderId: string, customMessage?: string): Promise<void> {
  const job: EmailJob = {
    type: 'send_order_confirmation_email',
    orderId,
    customMessage,
    retry: 0,
    maxRetries: 3
  };

  await emailQueue.add(job);
}

export async function queueEmailJob(job: EmailJob): Promise<void> {
  await emailQueue.add(job);
}

export { emailQueue };