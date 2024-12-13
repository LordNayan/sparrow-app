export class ConfigService {
  private static apiUrl: string = import.meta.env.VITE_API_URL;

  static getApiUrl(): string {
    return this.apiUrl;
  }

  static setApiUrl(newUrl: string): void {
    this.apiUrl = newUrl;
  }
}
