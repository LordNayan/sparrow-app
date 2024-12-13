import { getAuthHeaders, makeRequest } from "@app/containers/api/api.common";
import { ConfigService } from "@app/utils/config";
import type { HttpClientResponseInterface } from "@app/types/http-client";

export class UserService {
  constructor() {}
  private get apiUrl(): string {
    return ConfigService.getApiUrl();
  }
  public disableNewInviteTag = async (userId: string, teamId: string) => {
    const response: HttpClientResponseInterface = await makeRequest(
      "GET",
      `${this.apiUrl}/api/team/${teamId}/user/${userId}/disableTeamNewInvite`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  /**
   * Disables the new invite tag for a user in a workspace.
   *
   * @param userId - The ID of the user for whom the new invite tag should be disabled.
   * @param workspaceId - The ID of the workspace.
   * @returns A promise that resolves to the response of the request.
   */
  public disableWorkspaceNewInviteTag = async (
    userId: string,
    workspaceId: string,
  ) => {
    const response: HttpClientResponseInterface = await makeRequest(
      "GET",
      `${this.apiUrl}/api/workspace/${workspaceId}/user/${userId}/disableWorkspaceNewInvite`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  /**
   * Validates the user email by making a GET request to the server.
   *
   * @param email - The email address to be validated.
   * @return A promise that resolves to the server's response.
   */
  public validateUserEmail = async (email: string) => {
    const response: HttpClientResponseInterface = await makeRequest(
      "GET",
      `${this.apiUrl}/api/user/email/${email}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };
}
