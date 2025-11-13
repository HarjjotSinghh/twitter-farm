/**
 * Utility helper functions
 */

/**
 * Generate random number between min and max (inclusive)
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random float between min and max
 */
export function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get random element from array
 */
export function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Check if current time is within peak hours
 */
export function isWithinPeakHours(peakHours) {
  const currentHour = new Date().getHours();
  return peakHours.some(([start, end]) => 
    currentHour >= start && currentHour < end
  );
}

/**
 * Check if today is weekend
 */
export function isWeekend() {
  const day = new Date().getDay();
  return day === 0 || day === 6;
}

/**
 * Calculate delay with random variance
 */
export function calculateDelay(base, variance) {
  const min = base - variance;
  const max = base + variance;
  return randomInt(min, max);
}

/**
 * Retry async function with exponential backoff
 */
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) {
        throw error;
      }
      const delay = baseDelay * Math.pow(2, attempt);
      await sleep(delay);
    }
  }
}

/**
 * Format timestamp for logging
 */
export function formatTimestamp(date = new Date()) {
  return date.toISOString();
}

/**
 * Check if string contains any of the keywords (case insensitive)
 */
export function containsKeyword(text, keywords) {
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

/**
 * Calculate typing duration based on WPM
 */
export function calculateTypingDuration(text, wpm, variance) {
  const words = text.split(' ').length;
  const baseMs = (words / wpm) * 60000;
  return calculateDelay(baseMs, baseMs * (variance / 100));
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename) {
  return filename.replace(/[^a-z0-9.-]/gi, '_');
}

/**
 * Extract tweet ID from URL
 */
export function extractTweetId(url) {
  const match = url.match(/status\/(\d+)/);
  return match ? match[1] : null;
}
