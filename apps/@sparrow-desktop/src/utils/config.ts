export class ConfigService {
  private static apiUrl: string = import.meta.env.VITE_BASE_URL;

  static getApiUrl(): string {
    console.log(this.apiUrl);
    return this.apiUrl;
  }

  static setApiUrl(newUrl: string): void {
    this.apiUrl = newUrl;
  }
}
