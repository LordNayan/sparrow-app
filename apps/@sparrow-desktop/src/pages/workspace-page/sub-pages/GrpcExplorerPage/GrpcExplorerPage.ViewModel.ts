import { CollectionRepository } from "@app/repositories/collection.repository";
import { EnvironmentRepository } from "@app/repositories/environment.repository";
import { TabRepository } from "@app/repositories/tab.repository";
import { WorkspaceRepository } from "@app/repositories/workspace.repository";
import type {
  CollectionDocument,
  EnvironmentDocument,
  WorkspaceDocument,
  TabDocument,
} from "@app/database/database";
import type { Observable } from "rxjs";
import { BehaviorSubject } from "rxjs";
import { createDeepCopy } from "@sparrow/common/utils";
import type { Tab } from "@sparrow/common/types/workspace/tab";

class GrpcExplorerViewModel {
  private workspaceRepository = new WorkspaceRepository();
  private collectionRepository = new CollectionRepository();
  private environmentRepository = new EnvironmentRepository();
  private tabRepository = new TabRepository();

  private _tab = new BehaviorSubject<Partial<Tab>>({});

  public collections: Observable<CollectionDocument[]>;
  public environments: Observable<EnvironmentDocument[]>;
  public activeWorkspace: Observable<WorkspaceDocument>;
  public authHeader = new BehaviorSubject({ key: "", value: "" });
  public environmentVariables;

  constructor(doc: TabDocument) {
    const tabData = doc.toMutableJSON();

    this.collections = this.collectionRepository.getCollection(
      tabData.path.workspaceId,
    );
    this.environments = this.environmentRepository.getEnvironment(
      tabData.path.workspaceId,
    );
    this.activeWorkspace = this.workspaceRepository.getActiveWorkspace(
      tabData.path.workspaceId,
    );

    this.environmentVariables = {
      filtered: [],
      local: [],
      global: [],
    };

    if (doc?.isActive) {
      setTimeout(() => {
        const t = createDeepCopy(tabData);
        delete t.isActive;
        delete t.index;
        this._tab.next(t);
      }, 0);
    }
  }

  public get tab(): Observable<Partial<Tab>> {
    return this._tab.asObservable();
  }

  public getWorkspaceById = async (workspaceId: string) => {
    return await this.workspaceRepository.readWorkspace(workspaceId);
  };

  public onUpdateRequestUrl = async (url: string) => {
    try {
      const currentTab = this._tab.getValue();
      if (!currentTab?.tabId) {
        console.error("No tab ID available for URL update");
        return;
      }

      await this.tabRepository.updateTab(currentTab.tabId, {
        property: {
          grpc: {
            url: url,
          },
        },
      });

      // Update local state
      const updatedTab = { ...currentTab };
      if (!updatedTab.property) updatedTab.property = {};
      if (!(updatedTab.property as any).grpc)
        (updatedTab.property as any).grpc = {};
      (updatedTab.property as any).grpc.url = url;
      this._tab.next(updatedTab);
    } catch (error) {
      console.error("Error updating URL:", error);
    }
  };

  public onUpdateRequestState = async (data: any) => {
    try {
      const currentTab = this._tab.getValue();
      if (!currentTab?.tabId) {
        console.error("No tab ID available for update");
        return;
      }

      // Handle message separately since it's stored directly in grpc, not in state
      const updatePayload: any = {};

      if (data.message !== undefined) {
        // Update message directly in grpc object
        updatePayload.property = {
          grpc: {
            message: data.message,
          },
        };
      } else {
        // Update other state properties
        const currentState = (currentTab?.property as any)?.grpc?.state || {};
        updatePayload.property = {
          grpc: {
            state: {
              ...currentState,
              ...data,
            },
          },
        };
      }

      await this.tabRepository.updateTab(currentTab.tabId, updatePayload);

      // Update the local state to keep it in sync
      const updatedTab = { ...currentTab };
      if (!updatedTab.property) updatedTab.property = {};
      if (!(updatedTab.property as any).grpc)
        (updatedTab.property as any).grpc = {};

      if (data.message !== undefined) {
        // Update message directly
        (updatedTab.property as any).grpc.message = data.message;
      } else {
        // Update state properties
        if (!(updatedTab.property as any).grpc.state)
          (updatedTab.property as any).grpc.state = {};

        const currentState = (updatedTab.property as any).grpc.state || {};
        (updatedTab.property as any).grpc.state = {
          ...currentState,
          ...data,
        };
      }

      this._tab.next(updatedTab);
    } catch (error) {
      console.error("Error updating request state:", error);
    }
  };

  public onUpdateRequestAuth = async (data: any) => {
    try {
      const currentTab = this._tab.getValue();
      if (!currentTab?.tabId) {
        console.error("No tab ID available for auth update");
        return;
      }

      await this.tabRepository.updateTab(currentTab.tabId, {
        property: {
          grpc: {
            auth: data,
          },
        },
      });

      // Update local state
      const updatedTab = { ...currentTab };
      if (!updatedTab.property) updatedTab.property = {};
      if (!(updatedTab.property as any).grpc)
        (updatedTab.property as any).grpc = {};
      (updatedTab.property as any).grpc.auth = data;
      this._tab.next(updatedTab);
    } catch (error) {
      console.error("Error updating auth:", error);
    }
  };

  public onUpdateHeaders = async (headers: any) => {
    try {
      const currentTab = this._tab.getValue();
      if (!currentTab?.tabId) {
        console.error("No tab ID available for headers update");
        return;
      }

      await this.tabRepository.updateTab(currentTab.tabId, {
        property: {
          grpc: {
            metadata: headers,
          },
        },
      });

      // Update local state
      const updatedTab = { ...currentTab };
      if (!updatedTab.property) updatedTab.property = {};
      if (!(updatedTab.property as any).grpc)
        (updatedTab.property as any).grpc = {};
      (updatedTab.property as any).grpc.metadata = headers;
      this._tab.next(updatedTab);
    } catch (error) {
      console.error("Error updating headers:", error);
    }
  };

  public onUpdateAutoGeneratedHeaders = async (headers: any) => {
    try {
      const currentTab = this._tab.getValue();
      if (!currentTab?.tabId) {
        console.error("No tab ID available for auto headers update");
        return;
      }

      await this.tabRepository.updateTab(currentTab.tabId, {
        property: {
          grpc: {
            autoGeneratedMetadata: headers,
          },
        },
      });

      // Update local state
      const updatedTab = { ...currentTab };
      if (!updatedTab.property) updatedTab.property = {};
      if (!(updatedTab.property as any).grpc)
        (updatedTab.property as any).grpc = {};
      (updatedTab.property as any).grpc.autoGeneratedMetadata = headers;
      this._tab.next(updatedTab);
    } catch (error) {
      console.error("Error updating auto-generated headers:", error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onUpdateEnvironment = async (envId: string) => {
    // TODO: Implement environment switching for gRPC
    // Environment ID can be used when implementing
  };

  public onUpdateServices = async (services: any[]) => {
    try {
      const currentTab = this._tab.getValue();
      if (!currentTab?.tabId) {
        console.error("No tab ID available for services update");
        return;
      }

      await this.tabRepository.updateTab(currentTab.tabId, {
        property: {
          grpc: {
            services: services,
          },
        },
      });

      // Update local state
      const updatedTab = { ...currentTab };
      if (!updatedTab.property) updatedTab.property = {};
      if (!(updatedTab.property as any).grpc)
        (updatedTab.property as any).grpc = {};
      (updatedTab.property as any).grpc.services = services;
      this._tab.next(updatedTab);
    } catch (error) {
      console.error("Error updating services:", error);
    }
  };

  public handleSaveGrpc = async () => {
    try {
      const currentTab = this._tab.getValue();
      if (!currentTab?.tabId) {
        return { status: "error", message: "No tab ID available" };
      }

      // TODO: Implement save logic for gRPC requests
      // For now, just mark as saved
      await this.tabRepository.updateTab(currentTab.tabId, {
        isSaved: true,
      });

      // Update local state
      const updatedTab = { ...currentTab };
      updatedTab.isSaved = true;
      this._tab.next(updatedTab);

      return { status: "success", message: "gRPC request saved" };
    } catch (error) {
      console.error("Error saving gRPC request:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return { status: "error", message: errorMessage };
    }
  };
}

export default GrpcExplorerViewModel;
