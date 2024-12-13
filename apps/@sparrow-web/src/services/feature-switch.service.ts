import { getAuthHeaders, makeRequest } from "@app/containers/api/api.common";
import { ConfigService } from "@app/utils/config";

export class FeatureSwitchService {
  constructor() {}

  private get apiUrl(): string {
    return ConfigService.getApiUrl();
  }

  /**
   * @description - fetches all features from db
   * @returns - all features
   */
  public getAllFeatures = async () => {
    const response = await makeRequest("GET", `${this.apiUrl}/api/feature`, {
      headers: getAuthHeaders(),
    });
    return response;
  };
}
