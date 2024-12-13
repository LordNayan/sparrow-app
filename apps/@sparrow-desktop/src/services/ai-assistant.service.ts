import { getAuthHeaders, makeRequest } from "@app/containers/api/api.common";
import { ConfigService } from "@app/utils/config";
import type { PromptDto } from "@sparrow/common/dto/ai-assistant";

export class AiAssistantService {
  constructor() {}

  private get apiUrl(): string {
    return ConfigService.getApiUrl();
  }

  public generateAiResponse = async (_prompt: PromptDto) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/api/assistant/prompt`,
      {
        body: _prompt,
        headers: getAuthHeaders(),
      },
    );

    return response;
  };

  public updateAiStats = async (
    _threadId: string,
    _messageId: string,
    _isLiked: boolean,
  ) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/api/chatbotstats/feedback`,
      {
        body: {
          threadId: _threadId,
          messageId: _messageId,
          like: _isLiked,
        },
        headers: getAuthHeaders(),
      },
    );

    return response;
  };
}
