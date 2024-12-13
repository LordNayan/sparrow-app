import {
  getAuthHeaders,
  getMultipartAuthHeaders,
  makeRequest,
} from "@app/containers/api/api.common";
import { ConfigService } from "@app/utils/config";
import type { InviteBody, TeamPostBody } from "@sparrow/common/dto/team-dto";

export class TeamService {
  constructor() {}

  private get apiUrl(): string {
    return ConfigService.getApiUrl();
  }

  public fetchTeams = async (userId: string) => {
    const response = await makeRequest(
      "GET",
      `${this.apiUrl}/api/team/user/${userId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public createTeam = async (team: TeamPostBody) => {
    const response = await makeRequest("POST", `${this.apiUrl}/api/team`, {
      body: team,
      headers: getMultipartAuthHeaders(),
    });
    return response;
  };

  public updateTeam = async (teamId: string, team: TeamPostBody) => {
    const response = await makeRequest(
      "PUT",
      `${this.apiUrl}/api/team/${teamId}`,
      {
        body: team,
        headers: getMultipartAuthHeaders(),
      },
    );
    return response;
  };

  public leaveTeam = async (teamId: string) => {
    const response = await makeRequest(
      "PUT",
      `${this.apiUrl}/api/team/${teamId}/leave`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public inviteMembersAtTeam = async (
    teamId: string,
    inviteBody: InviteBody,
  ) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/api/team/${teamId}/user`,
      {
        body: inviteBody,
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public removeMembersAtTeam = async (teamId: string, userId: string) => {
    const response = await makeRequest(
      "DELETE",
      `${this.apiUrl}/api/team/${teamId}/user/${userId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public promoteToAdminAtTeam = async (teamId: string, userId: string) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/api/team/${teamId}/admin/${userId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public demoteToMemberAtTeam = async (teamId: string, userId: string) => {
    const response = await makeRequest(
      "PUT",
      `${this.apiUrl}/api/team/${teamId}/admin/${userId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };

  public promoteToOwnerAtTeam = async (teamId: string, userId: string) => {
    const response = await makeRequest(
      "POST",
      `${this.apiUrl}/api/team/${teamId}/owner/${userId}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response;
  };
}
