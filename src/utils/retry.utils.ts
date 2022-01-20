/**
 * @return {number} - delay in milliseconds
 */
export function exponentialDelay(retryNumber: number): number {
    const delay: number = Math.pow(2, retryNumber) * 100;
    const randomSum: number = delay * 0.2 * Math.random(); // 0-20% of the delay

    return delay + randomSum;
}
