import { user } from "@app/store/auth.store";
import type { addUsersInWorkspacePayload } from "@sparrow/common/dto";
import type { InviteBody } from "@sparrow/common/dto/team-dto";
import {
  Events,
  ResponseMessage,
  UntrackedItems,
  WorkspaceRole,
  WorkspaceType,
} from "@sparrow/common/enums";
import type { HttpClientResponseInterface } from "@app/types/http-client";
import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
import type { WorkspaceDocument } from "../../../../database/database";
import { CollectionRepository } from "../../../../repositories/collection.repository";
import { EnvironmentRepository } from "../../../../repositories/environment.repository";
import { GuestUserRepository } from "../../../../repositories/guest-user.repository";
import { TabRepository } from "../../../../repositories/tab.repository";
import { TeamRepository } from "../../../../repositories/team.repository";
import { WorkspaceRepository } from "../../../../repositories/workspace.repository";
import { TeamService } from "../../../../services/team.service";
import { UserService } from "../../../../services/user.service";
import { WorkspaceService } from "../../../../services/workspace.service";
import { Sleep } from "@sparrow/common/utils";
import { notifications } from "@sparrow/library/ui";
import { BehaviorSubject, Observable } from "rxjs";
import { navigate } from "svelte-navigator";
import { v4 as uuidv4 } from "uuid";
import { getClientUser } from "../../../../utils/jwt";
import { WorkspaceTabAdapter } from "@app/adapter/workspace-tab";
import constants from "@app/constants/constants";
import { RecentWorkspaceRepository } from "@app/repositories/recent-workspace.repository";
import { PlanRepository } from "@app/repositories/plan.repository";
import { open } from "@tauri-apps/plugin-shell";

export class TeamExplorerPageViewModel {
  constructor() {}
  private teamRepository = new TeamRepository();
  private tabRepository = new TabRepository();
  private workspaceRepository = new WorkspaceRepository();
  private collectionRepository = new CollectionRepository();
  private environmentRepository = new EnvironmentRepository();
  private workspaceService = new WorkspaceService();
  private teamService = new TeamService();
  private guestUserRepository = new GuestUserRepository();
  private userService = new UserService();
  private recentWorkspaceRepository = new RecentWorkspaceRepository();
  private planRepository = new PlanRepository();

  private _activeTeamTab: BehaviorSubject<string> = new BehaviorSubject(
    "Workspaces",
  );

  /**
   * @description - get environment list from local db
   */
  get teams() {
    const teams = this.teamRepository.getTeams();
    return teams;
  }

  /**
   * @description - get environment list from local db
   */
  get tabs() {
    const tabs = this.tabRepository.getTabList();
    return tabs;
  }

  /**
   * @description - get open team from local db
   */
  public get openTeam() {
    return this.teamRepository.getOpenTeam();
  }

  /**
   * @description - get all workspaces from local db
   */
  public get workspaces() {
    return this.workspaceRepository.getWorkspaces();
  }

  /**
   * @description - get the active team tab
   */
  public get activeTeamTab(): Observable<string> {
    return this._activeTeamTab.asObservable();
  }

  /**
   * @description - set the active team tab
   */
  private set activeTeamTab(value: string) {
    this._activeTeamTab.next(value);
  }

  /**
   * @description - Update the active team tab
   */
  public updateActiveTeamTab = (tab: string) => {
    this.activeTeamTab = tab;
  };

  /**
   * Generate available name of new workspace like My Workspace 2 if My Workspace is already taken
   * @param list :any[] - list of workspaces
   * @param name :string - name to be chacked
   * @returns :string - new unique name
   */
  private getNextWorkspace: (list: WorkspaceDocument[], name: string) => any = (
    list,
    name,
  ) => {
    const isNameAvailable: (proposedName: string) => boolean = (
      proposedName,
    ) => {
      return list.some((element) => {
        return element.name === proposedName;
      });
    };

    if (!isNameAvailable(name)) {
      return name;
    }

    for (let i = 2; i < list.length + 10; i++) {
      const proposedName: string = `${name} ${i}`;
      if (!isNameAvailable(proposedName)) {
        return proposedName;
      }
    }

    return null;
  };

  /**
   * sync teams data with backend server
   * @param userId User id
   */
  public refreshTeams = async (userId: string): Promise<void> => {
    if (!userId) return;
    const response = await this.teamService.fetchTeams(userId);
    let isAnyTeamsOpen: undefined | string = undefined;
    if (response?.isSuccessful && response?.data?.data) {
      const data = [];
      for (const elem of response.data.data) {
        const {
          _id,
          name,
          hubUrl,
          xUrl,
          githubUrl,
          linkedinUrl,
          users,
          description,
          logo,
          workspaces,
          owner,
          admins,
          plan,
          createdAt,
          createdBy,
          updatedAt,
          updatedBy,
          isNewInvite,
        } = elem;
        const updatedWorkspaces = workspaces.map((workspace) => ({
          workspaceId: workspace.id,
          name: workspace.name,
        }));
        const isOpenTeam = await this.teamRepository.checkIsTeamOpen(_id);
        if (isOpenTeam) isAnyTeamsOpen = _id;
        const item = {
          teamId: _id,
          name,
          hubUrl,
          xUrl,
          githubUrl,
          linkedinUrl,
          users,
          description,
          logo,
          workspaces: updatedWorkspaces,
          owner,
          admins,
          plan,
          isActiveTeam: false,
          createdAt,
          createdBy,
          updatedAt,
          updatedBy,
          isNewInvite,
          isOpen: isOpenTeam,
        };
        data.push(item);
      }

      await this.teamRepository.bulkInsertData(data);
      await this.teamRepository.deleteOrphanTeams(
        data.map((_team) => {
          return _team.teamId;
        }),
      );
      if (!isAnyTeamsOpen) {
        this.teamRepository.setOpenTeam(data[0].teamId);
        return;
      }
    }
  };

  /**
   * sync workspace data with backend server
   * @param userId User id
   */
  public refreshWorkspaces = async (userId: string): Promise<void> => {
    if (!userId) return;
    const response = await this.workspaceService.fetchWorkspaces(userId);
    let isAnyWorkspaceActive: undefined | string = undefined;
    const data = [];
    const isSuccessful = response?.isSuccessful;
    const res = response?.data?.data;
    if (isSuccessful && res) {
      for (const elem of res) {
        const {
          _id,
          name,
          description,
          workspaceType,
          users,
          admins,
          team,
          createdAt,
          createdBy,
          collection,
          updatedAt,
          updatedBy,
          isNewInvite,
        } = elem;
        const isActiveWorkspace =
          await this.workspaceRepository.checkActiveWorkspace(_id);
        if (isActiveWorkspace) isAnyWorkspaceActive = _id;
        const item = {
          _id,
          name,
          description,
          workspaceType,
          users,
          collections: collection ? collection : [],
          admins: admins,
          team: {
            teamId: team.id,
            teamName: team.name,
            hubUrl: team?.hubUrl || "",
          },
          environmentId: "",
          isActiveWorkspace: isActiveWorkspace,
          createdAt,
          createdBy,
          updatedAt,
          updatedBy,
          isNewInvite,
        };
        data.push(item);
      }
      await this.workspaceRepository.bulkInsertData(data);
      await this.workspaceRepository.deleteOrphanWorkspaces(
        data.map((_workspace) => {
          return _workspace._id;
        }),
      );
      if (!isAnyWorkspaceActive) {
        this.workspaceRepository.setActiveWorkspace(data[0]._id);
        return;
      }
      return;
    }
  };

  /**
   * Create workspace in the team
   * @param teamId ID of team where workspace need to be created
   */
  public handleCreateWorkspace = async (teamId: string) => {
    const workspaces = await this.workspaces;
    let workspaceList: WorkspaceDocument[] = [];
    await workspaces
      .subscribe((workspace) => (workspaceList = workspace))
      .unsubscribe();
    const updatgedWorkspaceList = workspaceList.filter(
      (workspace) => workspace.team?.teamId === teamId,
    );
    const newWorkspace = {
      id: UntrackedItems.UNTRACKED + uuidv4(),
      name: this.getNextWorkspace(updatgedWorkspaceList, "My Workspace"),
      items: [],
      createdAt: new Date().toISOString(),
    };
    const baseUrl = await this.constructBaseUrl(teamId);
    const response = await this.workspaceService.createWorkspace(
      {
        name: newWorkspace.name,
        id: teamId,
      },
      baseUrl,
    );
    if (response.isSuccessful && response.data.data) {
      const res = response.data.data;
      await this.workspaceRepository.addWorkspace({
        ...res,
        id: res._id,
      });
      await new Sleep().setTime(2000).exec();
      const clientUserId = getClientUser().id;
      if (clientUserId) {
        await this.refreshTeams(clientUserId);
        await this.refreshWorkspaces(clientUserId);
      }

      const initWorkspaceTab = new WorkspaceTabAdapter().adapt(res._id, res);
      await this.tabRepository.createTab(initWorkspaceTab, res._id);
      await this.workspaceRepository.setActiveWorkspace(res._id);
      navigate("collections");
      notifications.success("New Workspace created successfully.");
      MixpanelEvent(Events.Create_New_Workspace_TeamPage);
    }
    //else if (response?.data?.statusCode) {
    //   notifications.error(response?.data?.message);
    // }
    return response;
  };

  /**
   * disable the invite tag in user's workspace
   * @param workspaceId id of workspace
   */
  private handleDisableWorkspaceInviteTag = async (workspaceId: string) => {
    let loggedInUserId = "";
    user.subscribe((value) => {
      loggedInUserId = value?._id;
    });
    const response: HttpClientResponseInterface =
      await this.userService.disableWorkspaceNewInviteTag(
        loggedInUserId,
        workspaceId,
      );
    if (response.isSuccessful === true) {
      await this.workspaceRepository.updateWorkspace(workspaceId, {
        isNewInvite: false,
      });
      return response.data.data;
    }
    return;
  };

  /**
   * Switch from one workspace to another
   * @param id - Workspace id
   */
  public handleSwitchWorkspace = async (id: string) => {
    if (!id) return;
    const prevWorkspace = await this.workspaceRepository.readWorkspace(id);
    if (prevWorkspace?.isNewInvite) {
      await this.handleDisableWorkspaceInviteTag(id);
    }
    const res = await this.workspaceRepository.readWorkspace(id);
    const initWorkspaceTab = new WorkspaceTabAdapter().adapt(id, res);
    await this.tabRepository.createTab(initWorkspaceTab, id);
    await this.workspaceRepository.setActiveWorkspace(id);
    navigate("collections");
    // Update the recent workspace repository
    const existingRecentWorkspace =
      await this.recentWorkspaceRepository.readWorkspace(id);
    if (!existingRecentWorkspace) {
      const {
        _id,
        name,
        description,
        workspaceType,
        team,
        createdAt,
        createdBy,
        updatedAt,
        updatedBy,
      } = res;
      const recentWorkspaceItem = {
        _id,
        name,
        description,
        workspaceType,
        isShared: false,
        team: {
          teamId: team?.teamId,
          teamName: team?.teamName || "",
          hubUrl: team?.hubUrl || "",
        },
        lastVisited: new Date().toISOString(),
        createdAt,
        createdBy,
        updatedAt,
        updatedBy,
      };
      await this.recentWorkspaceRepository.addRecentWorkspace(
        recentWorkspaceItem,
      );
      // Limit public workspaces to 6 most recently visited
      await this.limitPrivateWorkspaces(6);
    }
  };

  private limitPrivateWorkspaces = async (maxCount: number): Promise<void> => {
    // Get all public workspaces sorted by lastVisited
    const allPublicWorkspaces =
      await this.recentWorkspaceRepository.getRecentWorkspacesDocs();
    const publicWorkspaces = allPublicWorkspaces.filter(
      (workspace) => workspace.workspaceType === "PRIVATE",
    );

    // If we have more than the max count, remove the oldest ones
    if (publicWorkspaces.length > maxCount) {
      // Sort by lastVisited (most recent first)
      const sortedWorkspaces = publicWorkspaces.sort((a, b) => {
        const dateA = a.lastVisited ? new Date(a.lastVisited).getTime() : 0;
        const dateB = b.lastVisited ? new Date(b.lastVisited).getTime() : 0;
        return dateB - dateA;
      });

      // Get the workspaces to remove (oldest ones)
      const workspacesToRemove = sortedWorkspaces.slice(maxCount);

      // Delete each workspace that exceeds our limit
      for (const workspace of workspacesToRemove) {
        await this.recentWorkspaceRepository.deleteWorkspace(workspace._id);
      }
    }
  };

  /**
   * Invites new user to the team
   * @param _teamId - Team id in which users are invited.
   * @param _inviteBody - New team meta data.
   * @param _userId - Used id to be invited.
   */
  public handleTeamInvite = async (
    _teamId: string,
    _teamName: string,
    _inviteBody: InviteBody,
    _userId: string,
  ) => {
    const baseUrl = await this.constructBaseUrl(_teamId);
    const response = await this.teamService.inviteMembersAtTeam(
      _teamId,
      _inviteBody,
      baseUrl,
    );
    if (response.isSuccessful) {
      const responseData = response.data.data;
      await this.refreshWorkspaces(_userId);
      await this.teamRepository.modifyTeam(_teamId, responseData);
      notifications.success(
        `Invite sent to ${_inviteBody.users.length} ${
          _inviteBody.users.length === 1 ? "person" : "people"
        } for ${_teamName}.`,
      );
    } else {
      if (response?.message === "Plan limit reached") {
        // notifications.error("Failed to send invite. please upgrade your plan.");
      } else {
        notifications.error(response?.message || "Failed to send invite. Please try again.");
      }
    }
    return response;
  };

  /**
   * Removess a user from a specified team.
   * @param _teamId - The ID of the team.
   * @param _teamName - The name of the team.
   * @param _userId - The ID of the user.
   * @param _userName - The name of the user.
   */
  public removeMembersAtTeam = async (
    _teamId: string,
    _teamName: string,
    _userId: string,
    _userName: string,
  ) => {
    let loggedInUserId = "";
    user.subscribe((value) => {
      loggedInUserId = value?._id;
    });
    const baseUrl = await this.constructBaseUrl(_teamId);
    const response = await this.teamService.removeMembersAtTeam(
      _teamId,
      _userId,
      baseUrl,
    );
    if (response.isSuccessful) {
      const responseData = response.data.data;
      await this.teamRepository.modifyTeam(_teamId, responseData);
      await this.refreshWorkspaces(loggedInUserId);
      notifications.success(`${_userName} is removed from ${_teamName}`);
    } else {
      notifications.error(`Failed to remove ${_userName} from ${_teamName}`);
    }
    MixpanelEvent(Events.Remove_User_Team);
    return response;
  };

  /**
   * Demoted a user to member status in a specified team.
   * @param _teamId - The ID of the team.
   * @param _teamName - The name of the team.
   * @param _userId - The ID of the user.
   * @param _userName - The name of the user.
   */
  public demoteToMemberAtTeam = async (
    _teamId: string,
    _teamName: string,
    _userId: string,
    _userName: string,
  ) => {
    let loggedInUserId = "";
    user.subscribe((value) => {
      loggedInUserId = value?._id;
    });
    const baseUrl = await this.constructBaseUrl(_teamId);
    const response = await this.teamService.demoteToMemberAtTeam(
      _teamId,
      _userId,
      baseUrl,
    );
    if (response.isSuccessful === true) {
      const responseData = response.data.data;
      await this.teamRepository.modifyTeam(_teamId, responseData);
      await this.refreshWorkspaces(loggedInUserId);
      notifications.success(`${_userName} is now a member`);
    } else {
      notifications.error(
        `Failed to change role for ${_userName}. Please try again.`,
      );
    }
    MixpanelEvent(Events.Invite_To_Team_Member);
    return response;
  };

  /**
   * Promotes a user to admin status in a specified team.
   * @param _teamId - The ID of the team.
   * @param _teamName - The name of the team.
   * @param _userId - The ID of the user.
   * @param _userName - The name of the user.
   */
  public promoteToAdminAtTeam = async (
    _teamId: string,
    _teamName: string,
    _userId: string,
    _userName: string,
  ) => {
    let loggedInUserId = "";
    user.subscribe((value) => {
      loggedInUserId = value?._id;
    });
    const baseUrl = await this.constructBaseUrl(_teamId);
    const response = await this.teamService.promoteToAdminAtTeam(
      _teamId,
      _userId,
      baseUrl,
    );
    if (response.isSuccessful) {
      const responseData = response.data.data;
      await this.teamRepository.modifyTeam(_teamId, responseData);
      await this.refreshWorkspaces(loggedInUserId);
      notifications.success(`${_userName} is now an admin`);
    } else {
      notifications.error(
        `Failed to change role for ${_userName}. Please try again.`,
      );
    }
    MixpanelEvent(Events.Invite_To_Team_Admin);
    return response;
  };

  /**
   * Promotes a user to owner status in a specified team.
   * @param _teamId - The ID of the team.
   * @param _teamName - The name of the team.
   * @param _userId - The ID of the user.
   * @param _userName - The name of the user.
   */
  public promoteToOwnerAtTeam = async (
    _teamId: string,
    _teamName: string,
    _userId: string,
    _userName: string,
  ) => {
    let userId;
    user.subscribe(async (value) => {
      if (value) {
        userId = value._id;
      }
    });
    const res = await this.teamRepository.getTeamData();
    let count = 0;
    for (let index = 0; index < res.length; index++) {
      let ownerId = res[index]._data.owner;

      if (ownerId === userId) {
        count++;
      }
    }

    if (count > 1) {
      const baseUrl = await this.constructBaseUrl(_teamId);
      const response = await this.teamService.promoteToOwnerAtTeam(
        _teamId,
        _userId,
        baseUrl,
      );

      if (response.isSuccessful === true) {
        const responseData = response.data.data;
        await this.teamRepository.modifyTeam(_teamId, responseData);
        await this.refreshWorkspaces(userId);
        notifications.success(
          `${_userName} is now the new Owner of ${_teamName}.`,
        );
      } else {
        notifications.error(
          `Failed to update access of Owner. Please try again.`,
        );
      }
      MixpanelEvent(Events.Team_Ownership_Transferred);
      return response;
    } else {
      notifications.error(
        "You must be owner of at least one other team to transfer ownership",
      );
      return;
    }
  };
  /**
   * Removes a user from a workspace.
   * @param _workspaceId - The ID of the workspace where remove user is to take place.
   * @param _workspaceName - The name of the workspace where remove user is to take place.
   * @param _userId - The ID of the user who is being removed.
   * @param _userName - The name of the user who is being removed.
   */
  public removeUserFromWorkspace = async (
    _workspaceId: string,
    _workspaceName: string,
    _userId: string,
    _userName: string,
  ) => {
    let loggedInUserId = "";
    user.subscribe((value) => {
      loggedInUserId = value?._id;
    });
    const baseUrl = await this.workspaceConstructBaseUrl(_workspaceId);
    const response = await this.workspaceService.removeUserFromWorkspace(
      _workspaceId,
      _userId,
      baseUrl,
    );
    if (response.isSuccessful === true) {
      await this.refreshWorkspaces(loggedInUserId);
      notifications.success(`${_userName} is removed from ${_workspaceName}`);
    } else {
      notifications.error(
        `Failed to remove ${_userName} from ${_workspaceName}`,
      );
    }
    MixpanelEvent(Events.Remove_User_Workspace);
  };

  /**
   * Change the role of a user in a workspace.
   * @param _workspaceId - The ID of the workspace where the role change is to take place.
   * @param _workspaceName - The name of the workspace where the role change is to take place.
   * @param _userId - The ID of the user whose role is being changed.
   * @param _userName - The name of the user whose role is being changed.
   * @param _body - Users role at workspace level example => editor or viewer.
   */
  public changeUserRoleAtWorkspace = async (
    _workspaceId: string,
    _workspaceName: string,
    _userId: string,
    _userName: string,
    _body: WorkspaceRole,
  ) => {
    let loggedInUserId = "";
    user.subscribe((value) => {
      loggedInUserId = value?._id;
    });
    const baseUrl = await this.workspaceConstructBaseUrl(_workspaceId);
    const response = await this.workspaceService.changeUserRoleAtWorkspace(
      _workspaceId,
      _userId,
      _body,
      baseUrl,
    );
    if (response.isSuccessful) {
      await this.refreshWorkspaces(loggedInUserId);
      if (_body === WorkspaceRole.WORKSPACE_VIEWER) {
        notifications.success(
          `${_userName} is now a viewer on ${_workspaceName}`,
        );
      } else if (_body === WorkspaceRole.WORKSPACE_EDITOR) {
        notifications.success(
          `${_userName} is now a editor on ${_workspaceName}`,
        );
      }
    } else {
      notifications.error(
        `Failed to change role for ${_userName}. Please try again.`,
      );
    }
    MixpanelEvent(Events.Teams_Role_Changed);
  };

  /**
   * Delete the workspace and update the local DB as per changes
   * Updates workspace, team, and tab repository.
   * Also updates active workspace state, if active workspace is deleted
   * @param workspace - workspace document
   * @returns - A promise that resolves when the delete workspace is complete.
   */
  public handleDeleteWorkspace = async (workspace: WorkspaceDocument) => {
    const isActiveWorkspace =
      await this.workspaceRepository.checkActiveWorkspace(workspace._id);
    const workspaces = await this.workspaceRepository.getWorkspacesDocs();
    if (isActiveWorkspace && workspaces.length === 1) {
      notifications.error(
        "Failed to delete the last workspace. Please create a new workspace before deleting this workspace.",
      );
      return;
    }
    const baseUrl = await this.constructBaseUrl(workspace.team?.teamId);
    const response = await this.workspaceService.deleteWorkspace(
      workspace._id,
      baseUrl,
    );
    if (response.isSuccessful) {
      await this.workspaceRepository.deleteWorkspace(workspace._id);
      if (isActiveWorkspace) {
        await this.workspaceRepository.activateInitialWorkspace();
      }
      await this.tabRepository.removeTabsByQuery({
        selector: {
          "path.workspaceId": workspace._id,
        },
      });
      await this.collectionRepository.removeCollections(workspace._id);
      await this.environmentRepository.removeEnvironments(workspace._id);

      await this.teamRepository.removeWorkspaceFromTeam(
        workspace.team?.teamId,
        workspace._id,
      );
      notifications.success(
        `${workspace.name} is removed from ${workspace?.team?.teamName}.`,
      );
    } else {
      notifications.error(
        `Failed to remove ${workspace.name} from ${workspace?.team?.teamName}. Please try again.`,
      );
    }
    MixpanelEvent(Events.Delete_Workspace);
    return response;
  };

  public constructBaseUrl = async (_teamId: string) => {
    const teamData = await this.teamRepository.getTeamDoc(_teamId);
    const hubUrl = teamData?.hubUrl;

    if (hubUrl && constants.APP_ENVIRONMENT_PATH !== "local") {
      const envSuffix = constants.APP_ENVIRONMENT_PATH;
      return `${hubUrl}/${envSuffix}`;
    }
    return constants.API_URL;
  };

  /*
   * updates the team details
   * @param _teamId - team id to be updated
   * @param _teamData - team data that will be override
   */
  public updateTeam = async (_teamId: string, _teamData: any) => {
    const baseUrl = await this.constructBaseUrl(_teamId);

    const response = await this.teamService.updateTeam(
      _teamId,
      _teamData,
      baseUrl,
    );
    if (response.isSuccessful) {
      delete response?._id;
      this.teamRepository.modifyTeam(_teamId, response.data.data);
      if (_teamData?.name) {
        // updates the workspace document with updated team name
        const ws = await this.workspaceRepository.getWorkspacesDocs();
        for (let i = 0; i < ws.length; i++) {
          const data = ws[i].toMutableJSON();
          if (data.team?.teamId === _teamId) {
            await this.workspaceRepository.updateWorkspace(data._id, {
              team: {
                teamId: _teamId,
                teamName: _teamData.name,
              },
            });
          }
        }
      }
    }
  };

  /**
   * Leaving a team 
   * @param teamId - The ID of the team where the user is trying to left.
   * @param _userId - The ID of the user who  is leaving the team.
  
**/

  public leaveTeam = async (userId: string, teamId: string) => {
    const baseUrl = await this.constructBaseUrl(teamId);
    const response = await this.teamService.leaveTeam(teamId, baseUrl);

    if (!response.isSuccessful) {
      notifications.error(
        response.message ?? "Failed to leave the team. Please try again.",
      );
      return response;
    }
    await this.teamRepository.removeTeam(teamId);
    const workspaceDoc =
      await this.workspaceRepository.findWorkspaceByTeamId(teamId);
    for (let i = 0; i < workspaceDoc.length; i++) {
      await this.collectionRepository.removeCollections(workspaceDoc[i]._id);
      await this.environmentRepository.removeEnvironments(workspaceDoc[i]._id);
      await this.workspaceRepository.deleteWorkspace(workspaceDoc[i]._id);
      await this.tabRepository.removeTabsByQuery({
        selector: {
          "path.workspaceId": workspaceDoc[i]._id,
        },
      });
    }

    await new Promise<void>((resolve) =>
      setTimeout(async () => {
        const activeTeam = await this.teamRepository.checkActiveTeam();
        if (activeTeam) {
          const teamIdToActivate =
            await this.workspaceRepository.activateInitialWorkspace();
          if (teamIdToActivate) {
            await this.teamRepository.setActiveTeam(teamIdToActivate);
          }
        }
        resolve();
      }, 500),
    );

    await new Promise<void>((resolve) =>
      setTimeout(async () => {
        await this.refreshTeams(userId);
        await this.refreshWorkspaces(userId);
        notifications.success("You've left a hub.");
        resolve();
      }, 500),
    );
    MixpanelEvent(Events.Leave_Team);
    return response;
  };

  /**
   * Fetch guest user state
   * @returns boolean for is user guest user or not
   */
  public getGuestUser = async () => {
    const guestUser = await this.guestUserRepository.findOne({
      name: "guestUser",
    });
    const isGuestUser = guestUser?.getLatest().toMutableJSON().isGuestUser;
    return isGuestUser;
  };

  /**
   * Validates the user email by making a GET request to the server.
   *
   * @param  email - The email address to be validated.
   * @returns A promise that resolves to the server's response.
   */
  public validateUserEmail = async (email: string) => {
    const response = await this.userService.validateUserEmail(email);
    if (response.isSuccessful) {
      if (response?.data?.data?.registeredWith === "unknown") {
        return false;
      }
      return true;
    }
    return false;
  };

  public workspaceConstructBaseUrl = async (_id: string) => {
    const workspaceData = await this.workspaceRepository.readWorkspace(_id);
    const hubUrl = workspaceData?.team?.hubUrl;

    if (hubUrl && constants.APP_ENVIRONMENT_PATH !== "local") {
      const envSuffix = constants.APP_ENVIRONMENT_PATH;
      return `${hubUrl}/${envSuffix}`;
    }
    return constants.API_URL;
  };

  /**
   * Invites users to a workspace.
   * @param _workspaceId current workspace Id.
   * @param _workspaceName current workspace name.
   * @param _data The payload containing users and their roles.
   * @param _invitedUserCount count of users to be invited.
   * @returns A promise resolving to the response from the invitation operation.
   */
  public inviteUserToWorkspace = async (
    _workspaceId: string,
    _workspaceName: string,
    _data: addUsersInWorkspacePayload,
    _invitedUserCount: number,
  ) => {
    const baseUrl = await this.workspaceConstructBaseUrl(_workspaceId);
    const response = await this.workspaceService.addUsersInWorkspace(
      _workspaceId,
      _data,
      baseUrl,
    );
    if (response?.isSuccessful && response?.data?.data) {
      const newTeam = response.data.data.users;
      this.workspaceRepository.addUserInWorkspace(_workspaceId, newTeam);
      notifications.success(
        `Invite sent to ${_invitedUserCount} ${
          _invitedUserCount === 1 ? "person" : "people"
        } for ${_workspaceName}.`,
      );
    }
    else{
        if (response?.message === "Plan limit reached") {
        // notifications.error("Failed to send invite. please upgrade your plan.");
      } else {
        notifications.error(
          response?.message || "Failed to send invite. Please try again.",
        );
      }
    }
    if (_data.role === WorkspaceRole.WORKSPACE_VIEWER) {
      MixpanelEvent(Events.Invite_To_Workspace_Viewer, {
        source: "invite to workspace as viewer",
      });
    } else if (_data.role === WorkspaceRole.WORKSPACE_EDITOR) {
      MixpanelEvent(Events.Invite_To_Workspace_Editor, {
        source: "invite to workspace as editor",
      });
    }

    return response;
  };

  public resendInvite = async (teamId: string, email: string) => {
    const baseUrl = await this.constructBaseUrl(teamId);
    const response = await this.teamService.resendInvite(
      teamId,
      email,
      baseUrl,
    );
    if (response.isSuccessful) {
      this.teamRepository.modifyTeam(teamId, response.data.data);
      notifications.success(`Invite resent successfully.`);
      return response;
    } else if (response?.data?.message === ResponseMessage.INVITE_DECLINED) {
      notifications.error(`The invite has been declined by Collaborator.`);
    } else {
      notifications.error("Failed to resend invite. Please try again.");
    }
  };

  public withdrawInvite = async (teamId: string, email: string) => {
    const baseUrl = await this.constructBaseUrl(teamId);
    const response = await this.teamService.withdrawInvite(
      teamId,
      email,
      baseUrl,
    );
    if (response?.isSuccessful) {
      this.teamRepository.modifyTeam(teamId, response.data.data);
      notifications.success(`Invite withdrawn successfully.`);
      return response;
    } else {
      notifications.error("Failed to withdraw invite. Please try again.");
    }
  };

  public acceptInvite = async (teamId: string, userId: string) => {
    const baseUrl = await this.constructBaseUrl(teamId);
    const response = await this.teamService.acceptInvite(teamId, baseUrl);
    if (response.isSuccessful) {
      this.teamRepository.modifyTeam(teamId, response.data.data);
      await this.refreshWorkspaces(userId);
      notifications.success(
        `You are now a member ${response?.data?.data.name} Hub.`,
      );
      return response;
    } else {
      notifications.error(`Failed to join the Hub. Please try again.`);
    }
  };

  public ignoreInvite = async (teamId: string) => {
    const baseUrl = await this.constructBaseUrl(teamId);
    const response = await this.teamService.ignoreInvite(teamId, baseUrl);
    if (response.isSuccessful) {
      const teams = await this.teamRepository.getTeamsDocuments();
      const team0 = teams[0]?.toMutableJSON();
      const team1 = teams[1]?.toMutableJSON();
      if (team0?.teamId !== teamId) {
        await this.teamRepository.setOpenTeam(team0.teamId);
      } else if (team1) {
        await this.teamRepository.setOpenTeam(team1.teamId);
      }
      await this.teamRepository.removeTeam(teamId);
      notifications.success(
        `Invite ignored. The hub has been removed from your panel.`,
      );
      return response;
    } else {
      notifications.error(`Failed to ignore invite. Please try again.`);
    }
  };

  public userPlanLimits = async (teamId: string) => {
    const teamDetails = await this.teamRepository.getTeamDoc(teamId);
    const currentPlan = teamDetails?.toMutableJSON().plan;
    if (currentPlan) {
      return currentPlan?.limits;
    }
  };

  public requestToUpgradePlan = async (teamId: string) => {
    const baseUrl = await this.constructBaseUrl(teamId);
    const res = await this.teamService.requestOwnerToUpgradePlan(
      teamId,
      baseUrl,
    );
    if (res?.isSuccessful) {
      notifications.success(
        `Request is Sent Successfully to Owner for Upgrade Plan.`,
      );
    } else {
      notifications.error(`Failed to Send Request for Upgrade Plan`);
    }
  };

  public handleRedirectToAdminPanel = async (teamId: string) => {
    await open(`${constants.ADMIN_URL}/billing/billingOverview/${teamId}`);
  };

  public handleContactSales = async () => {
    await open(`${constants.MARKETING_URL}/pricing/`);
  };
}
