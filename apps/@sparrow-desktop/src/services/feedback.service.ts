import {
  getMultipartAuthHeaders,
  makeRequest,
} from "@app/containers/api/api.common";
import { ConfigService } from "@app/utils/config";

export class FeedbackService {
  constructor() {}

  private get apiUrl(): string {
    return ConfigService.getApiUrl();
  }

  public createFeedback = async (feedback) => {
    const response = await makeRequest("POST", `${this.apiUrl}/api/feedback`, {
      body: feedback,
      headers: getMultipartAuthHeaders(),
    });
    return response;
  };

  public fetchuploads = async (feedback) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/api/feedback/uploads`,
      {
        body: feedback,
        headers: getMultipartAuthHeaders(),
      },
    );
    return response;
  };
}
