/**
 * Type declarations for the User-Agent Client Hints API.
 * This extends the Navigator interface to include userAgentData property.
 */

interface NavigatorUAData {
  /**
   * The platform the browser is running on.
   */
  platform: string;

  /**
   * Returns an array of UADataValues objects containing information about the browser.
   */
  getHighEntropyValues(hints: string[]): Promise<UADataValues>;

  /**
   * Returns a UADataValues object containing basic information about the browser.
   */
  toJSON(): UADataValues;
}

interface UADataValues {
  platform: string;
  architecture?: string;
  bitness?: string;
  model?: string;
  platformVersion?: string;
  uaFullVersion?: string;
}

interface Navigator {
  /**
   * Returns a UAData object containing information about the browser's user agent.
   */
  userAgentData?: NavigatorUAData;
}