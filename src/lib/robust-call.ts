
// src/lib/robust-call.ts

/**
 * A simple promise-based delay function.
 * @param ms The number of milliseconds to wait.
 * @returns A promise that resolves after the specified delay.
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wraps an async function call with retry logic and exponential backoff.
 * @param fn The async function to call.
 * @param args The arguments to pass to the function.
 * @param retries The maximum number of retries (default: 3).
 * @param initialDelayMs The initial delay in milliseconds for backoff (default: 1000).
 * @returns The result of the function call.
 * @throws Throws an error if all attempts fail.
 */
export async function robustCall<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  args: Parameters<T>,
  retries: number = 3,
  initialDelayMs: number = 1000
): Promise<Awaited<ReturnType<T>>> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn(...args);
    } catch (e: any) {
      console.warn(`[robustCall] Attempt ${i + 1} of ${retries} for ${fn.name || 'anonymous function'} failed:`, e.message);
      if (i < retries - 1) {
        const delay = initialDelayMs * Math.pow(2, i); // Exponential backoff
        console.log(`[robustCall] Retrying in ${delay}ms...`);
        await wait(delay);
      } else {
        console.error(`[robustCall] All ${retries} attempts failed for ${fn.name || 'anonymous function'}.`);
        throw e; // Re-throw the last error
      }
    }
  }
  // This line should theoretically be unreachable due to the throw in the loop
  throw new Error("[robustCall] All attempts failed. This should not be reached.");
}

// Example usage (not part of the actual app code, just for illustration)
/*
async function potentiallyFailingOperation(attempt: number): Promise<string> {
  console.log(`Trying operation, attempt: ${attempt}`);
  if (attempt < 2) { // Fails on first two attempts
    throw new Error(`Simulated failure on attempt ${attempt}`);
  }
  return "Operation succeeded!";
}

async function testRobustCall() {
  try {
    const result = await robustCall(potentiallyFailingOperation, [1], 3);
    console.log("Result from robustCall:", result); // Should log "Operation succeeded!"
  } catch (error) {
    console.error("Robust call failed ultimately:", error.message);
  }

  try {
    // This one will fail all attempts
    await robustCall(potentiallyFailingOperation, [0], 2, 500); 
  } catch (error) {
    console.error("Robust call failed ultimately (expected):", error.message);
  }
}

// testRobustCall();
*/
