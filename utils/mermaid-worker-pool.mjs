#!/usr/bin/env node

/**
 * Simplified Mermaid Worker Pool
 * Manages worker threads for concurrent mermaid validation
 */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class SimpleMermaidWorkerPool {
  constructor(options = {}) {
    this.poolSize = options.poolSize || 3;
    this.timeout = options.timeout || 15000; // Reduced timeout

    this.workers = [];
    this.availableWorkers = [];
    this.requestQueue = [];
    this.nextRequestId = 1;
    this.isShuttingDown = false;
  }

  /**
   * Initialize worker pool
   */
  async initialize() {
    if (this.workers.length > 0) return; // Already initialized

    const workerPath = join(__dirname, "mermaid-worker.mjs");

    for (let i = 0; i < this.poolSize; i++) {
      await this.createWorker(workerPath, i);
    }
  }

  /**
   * Create a single worker
   */
  async createWorker(workerPath, workerId) {
    return new Promise((resolve, reject) => {
      try {
        const worker = new Worker(workerPath);
        worker.workerId = workerId;
        worker.isAvailable = true;
        worker.currentRequest = null;

        // Handle worker errors more gracefully
        worker.on("error", (error) => {
          if (worker.currentRequest) {
            worker.currentRequest.reject(new Error(`Worker error: ${error.message}`));
            worker.currentRequest = null;
          }
        });

        worker.on("exit", (_code) => {
          if (worker.currentRequest) {
            worker.currentRequest.reject(new Error("Worker exited unexpectedly"));
            worker.currentRequest = null;
          }
        });

        worker.on("message", (data) => {
          this.handleWorkerMessage(worker, data);
        });

        this.workers.push(worker);
        this.availableWorkers.push(worker);

        resolve(worker);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle worker message
   */
  handleWorkerMessage(worker, data) {
    if (!worker.currentRequest) return;

    const { resolve, reject, timeoutId } = worker.currentRequest;

    // Clear timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Reset worker state
    worker.currentRequest = null;
    worker.isAvailable = true;

    // Move worker back to available pool
    const workerIndex = this.workers.indexOf(worker);
    if (workerIndex > -1 && !this.availableWorkers.includes(worker)) {
      this.availableWorkers.push(worker);
    }

    // Process queued requests
    this.processQueue();

    // Handle response
    if (data.error) {
      reject(new Error(data.error));
    } else {
      resolve(data.result);
    }
  }

  /**
   * Process queued requests
   */
  processQueue() {
    while (this.requestQueue.length > 0 && this.availableWorkers.length > 0) {
      const queuedRequest = this.requestQueue.shift();
      const worker = this.availableWorkers.shift();

      this.executeRequest(worker, queuedRequest);
    }
  }

  /**
   * Execute a request on a worker
   */
  executeRequest(worker, request) {
    const { content, resolve, reject } = request;
    const requestId = this.nextRequestId++;

    // Set timeout
    const timeoutId = setTimeout(() => {
      worker.currentRequest = null;
      worker.isAvailable = true;
      if (!this.availableWorkers.includes(worker)) {
        this.availableWorkers.push(worker);
      }
      reject(new Error(`Validation timeout after ${this.timeout}ms`));
    }, this.timeout);

    // Store request info
    worker.currentRequest = { resolve, reject, timeoutId };
    worker.isAvailable = false;

    // Send request
    worker.postMessage({
      id: requestId,
      content: content,
    });
  }

  /**
   * Validate content using worker pool
   */
  async validate(content) {
    if (this.isShuttingDown) {
      throw new Error("Worker pool is shutting down");
    }

    // Initialize if needed
    await this.initialize();

    return new Promise((resolve, reject) => {
      const request = { content, resolve, reject };

      // If worker available, use it immediately
      if (this.availableWorkers.length > 0) {
        const worker = this.availableWorkers.shift();
        this.executeRequest(worker, request);
      } else {
        // Queue the request
        this.requestQueue.push(request);
      }
    });
  }

  /**
   * Get pool statistics
   */
  getStats() {
    return {
      poolSize: this.poolSize,
      totalWorkers: this.workers.length,
      availableWorkers: this.availableWorkers.length,
      busyWorkers: this.workers.length - this.availableWorkers.length,
      queuedRequests: this.requestQueue.length,
      isShuttingDown: this.isShuttingDown,
    };
  }

  /**
   * Shutdown the pool
   */
  async shutdown() {
    if (this.isShuttingDown) return;

    this.isShuttingDown = true;

    // Reject all queued requests
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      request.reject(new Error("Worker pool is shutting down"));
    }

    // Terminate all workers
    const terminationPromises = this.workers.map(async (worker) => {
      try {
        await worker.terminate();
      } catch (_error) {
        // Ignore termination errors
      }
    });

    await Promise.allSettled(terminationPromises);

    // Clear arrays
    this.workers.length = 0;
    this.availableWorkers.length = 0;
  }
}

// Global pool instance
let globalPool = null;

/**
 * Get global worker pool
 */
export function getMermaidWorkerPool(options = {}) {
  if (!globalPool) {
    globalPool = new SimpleMermaidWorkerPool(options);
  }
  return globalPool;
}

/**
 * Shutdown global pool
 */
export async function shutdownMermaidWorkerPool() {
  if (globalPool) {
    await globalPool.shutdown();
    globalPool = null;
  }
}

// Note: We don't add global process event listeners here to avoid preventing clean exit
// The application should call shutdownMermaidWorkerPool() explicitly when needed

export { SimpleMermaidWorkerPool };
