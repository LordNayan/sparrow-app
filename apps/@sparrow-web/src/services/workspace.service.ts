import { ConfigService } from "@app/utils/config";
import { makeRequest, getAuthHeaders } from "@app/containers/api/api.common";
import type {
  WorkspacePostBody,
  WorkspacePutBody,
  addUsersInWorkspacePayload,
} from "@sparrow/common/dto";
import type { WorkspaceRole } from "@sparrow/common/enums";
import type { HttpClientResponseInterface } from "@app/types/http-client";
/* eslint-disable @typescript-eslint/no-explicit-any */

export class WorkspaceService {
  constructor() {}
  private apiUrl(): string {
    return ConfigService.getApiUrl();
  }
  public fetchWorkspaces = async (userId: string) => {
    const response = await makeRequest(
      "GET",
      `${this.apiUrl}/api/workspace/user/${userId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public fetchTeamsWorkspaces = async (teamId: string) => {
    const response = await makeRequest(
      "GET",
      `${this.apiUrl}/api/workspace/team/${teamId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };
  public updateWorkspace = async (
    workspaceId: string,
    workspace: WorkspacePutBody,
  ) => {
    const response = await makeRequest(
      "PUT",
      `${this.apiUrl}/api/workspace/${workspaceId}`,
      {
        body: workspace,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public deleteWorkspace = async (
    workspaceId: string,
  ): Promise<HttpClientResponseInterface> => {
    const response: HttpClientResponseInterface = await makeRequest(
      "DELETE",
      `${this.apiUrl}/api/workspace/${workspaceId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public createWorkspace = async (workspace: WorkspacePostBody) => {
    const response = await makeRequest("POST", `${this.apiUrl}/api/workspace`, {
      body: workspace,
      headers: getAuthHeaders(),
    });
    return response;
  };

  public addUsersInWorkspace = async (
    workspaceId: string,
    addUsersInWorkspaceDto: addUsersInWorkspacePayload,
  ) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/api/workspace/${workspaceId}/user`,
      {
        body: addUsersInWorkspaceDto,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public getUserDetailsOfWorkspace = async (workspaceId: string) => {
    if (workspaceId) {
      const response = await makeRequest(
        "GET",
        `${this.apiUrl}/api/workspace/${workspaceId}/users`,
        {
          headers: getAuthHeaders(),
        },
      );
      return response;
    }
  };

  public changeUserRoleAtWorkspace = async (
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
  ): Promise<HttpClientResponseInterface> => {
    const response: HttpClientResponseInterface = await makeRequest(
      "PUT",
      `${this.apiUrl}/api/workspace/${workspaceId}/user/${userId}`,
      {
        body: { role },
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public removeUserFromWorkspace = async (
    workspaceId: string,
    userId: string,
  ): Promise<HttpClientResponseInterface> => {
    const response: HttpClientResponseInterface = await makeRequest(
      "DELETE",
      `${this.apiUrl}/api/workspace/${workspaceId}/user/${userId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };
}
