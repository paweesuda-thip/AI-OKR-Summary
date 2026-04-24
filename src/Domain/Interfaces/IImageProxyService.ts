/**
 * Contract for server-side image proxying (used by the toonify feature to
 * bypass third-party image CORS before client-side processing).
 */
export interface IImageProxyService {
  /** Fetches the image at `imageUrl` and returns a base64 data URL. */
  fetchAsDataUrl(imageUrl: string): Promise<string>;
}
