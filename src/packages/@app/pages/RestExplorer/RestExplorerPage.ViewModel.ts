// ---- Utils
import {
  DecodeRequest,
  ReduceRequestURL,
  ReduceQueryParams,
  ReduceAuthHeader,
  ReduceAuthParameter,
} from "@workspaces/features/rest-explorer/utils";
import {
  createDeepCopy,
  moveNavigation,
  setContentTypeHeader,
} from "$lib/utils/helpers";
import { InitRequestTab } from "@common/utils";

// ---- DB
import type {
  CollectionDocument,
  TabDocument,
  WorkspaceDocument,
} from "$lib/database/app.database";

// ---- Repo
import { TabRepository } from "$lib/repositories/tab.repository";
import { CollectionRepository } from "$lib/repositories/collection.repository";
import { WorkspaceRepository } from "$lib/repositories/workspace.repository";
import { EnvironmentRepository } from "$lib/repositories/environment.repository";
import { EnvironmentTabRepository } from "$lib/repositories/environment-tab.repository";

import { BehaviorSubject, Observable } from "rxjs";
import { Events, ItemType, UntrackedItems } from "$lib/utils/enums";
import type { CreateDirectoryPostBody } from "$lib/utils/dto";

// ---- Service
import { makeHttpRequestV2 } from "$lib/api/api.common";
import {
  insertCollection,
  insertCollectionDirectory,
  insertCollectionRequest,
  updateCollectionRequest,
} from "$lib/services/collection";
import { EnvironmentService } from "$lib/services/environment.service";

// ---- Events
import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
import {
  type UpdateRequestUrl,
  type UpdateRequestName,
  type UpdateRequestDescription,
  type UpdateRequestMethod,
  type UpdateHeaders,
  type UpdateParams,
  type UpdateAutoGeneratedHeaders,
  type UpdateRequestState,
  type UpdateRequestAuth,
  type UpdateRequestBody,
  type UpdateResponse,
  type ClearResponse,
  type SendRequest,
  type ReadCollection,
  type ReadRequestOrFolderInCollection,
  type ReadRequestInFolder,
  type CreateFolder,
  type CreateCollection,
  type ReadWorkspace,
  type AddRequestOrFolderInCollection,
  type AddCollection,
  type AddRequestInFolder,
  type SaveRequest,
  type SaveAsRequest,
} from "@workspaces/common/type";
import {
  type Auth,
  type Body,
  type KeyValueChecked,
  type Path,
  type Request,
  type Response,
  type KeyValue,
  type RequestNavigationWrapper,
  type RequestBodyNavigationWrapper,
  type RequestBodyLanguageWrapper,
  type ResponseNavigationWrapper,
  type ResponseBodyLanguageWrapper,
  type ResponseBodyFormatterWrapper,
  type RequestExtensionNavigationWrapper,
  type IsExposeEditDescriptionWrapper,
  type RequestSplitterDirectionWrapper,
  type RequestLeftSplitterWidthPercentageWrapper,
  type RequestRightSplitterWidthPercentageWrapper,
  type IsSendRequestInProgressWrapper,
  type IsSaveDescriptionInProgressWrapper,
  type IsSaveRequestInProgressWrapper,
  type RequestTab,
  RequestDatasetEnum,
} from "@common/types/rest-explorer";
import { notifications } from "$lib/components/toast-notification/ToastNotification";

class RestExplorerViewModel
  implements
    UpdateRequestUrl,
    UpdateRequestName,
    UpdateRequestDescription,
    UpdateRequestMethod,
    UpdateHeaders,
    UpdateParams,
    UpdateAutoGeneratedHeaders,
    UpdateRequestState,
    UpdateRequestAuth,
    UpdateRequestBody,
    UpdateResponse,
    ClearResponse,
    SendRequest,
    ReadCollection,
    ReadRequestOrFolderInCollection,
    ReadRequestInFolder,
    CreateFolder,
    CreateCollection,
    ReadWorkspace,
    AddRequestOrFolderInCollection,
    AddCollection,
    AddRequestInFolder,
    SaveRequest,
    SaveAsRequest
{
  /**
   * Repository
   */
  private collectionRepository = new CollectionRepository();
  private workspaceRepository = new WorkspaceRepository();
  private environmentRepository = new EnvironmentRepository();
  private tabRepository = new TabRepository();
  private environmentTabRepository = new EnvironmentTabRepository();

  /**
   * Service
   */
  private environmentService = new EnvironmentService();
  /**
   * Utils
   */
  private _decodeRequest = new DecodeRequest();
  /**
   * Rest tools
   */
  private _authHeader: BehaviorSubject<KeyValue> = new BehaviorSubject({
    key: "",
    value: "",
  });
  private _authParameter: BehaviorSubject<KeyValue> = new BehaviorSubject({
    key: "",
    value: "",
  });
  private _tab: BehaviorSubject<RequestTab> = new BehaviorSubject({});

  public constructor(doc: TabDocument) {
    if (doc?.isActive) {
      setTimeout(() => {
        const t = createDeepCopy(doc.toMutableJSON());
        delete t.isActive;
        this.tab = t;
        this.authHeader = new ReduceAuthHeader(
          this._tab.getValue().property.request?.state,
          this._tab.getValue().property.request?.auth,
        ).getValue();
        this.authParameter = new ReduceAuthParameter(
          this._tab.getValue().property.request?.state,
          this._tab.getValue().property.request?.auth,
        ).getValue();
      }, 0);
    }
  }

  public get activeWorkspace() {
    return this.workspaceRepository.getActiveWorkspace();
  }

  public get environments() {
    return this.environmentRepository.getEnvironment();
  }

  public get tab(): Observable<RequestTab> {
    return this._tab.asObservable();
  }

  private set tab(value: RequestTab) {
    this._tab.next(value);
  }

  public get authHeader(): Observable<{
    key: string;
    value: string;
  }> {
    return this._authHeader.asObservable();
  }

  private set authHeader(value: KeyValue) {
    this._authHeader.next(value);
  }

  public get authParameter(): Observable<KeyValue> {
    return this._authParameter.asObservable();
  }

  private set authParameter(value: { key: string; value: string }) {
    this._authParameter.next(value);
  }

  /**
   *
   * @param _url - request url
   * @param _effectQueryParams  - flag that effect request query parameter
   */
  public updateRequestUrl = async (
    _url: string,
    _effectQueryParams: boolean = true,
  ) => {
    const progressiveTab: RequestTab = createDeepCopy(this._tab.getValue());
    if (_url === progressiveTab.property.request.url) {
      return;
    }
    progressiveTab.property.request.url = _url;
    progressiveTab.isSaved = false;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    if (_effectQueryParams) {
      const reducedURL = new ReduceRequestURL(_url);
      this.updateParams(reducedURL.getQueryParameters(), false);
    }
  };

  /**
   *
   * @param _path - request path
   */
  private updateRequestPath = async (_path: Path) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.path = _path;
    progressiveTab.isSaved = false;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
  };

  /**
   *
   * @param _id - request mongo id
   */
  private updateRequestId = async (_id: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.id = _id;
    progressiveTab.isSaved = false;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
  };

  /**
   *
   * @param _description - request description
   */
  public updateRequestDescription = async (_description: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.description = _description;
    progressiveTab.isSaved = false;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
  };

  /**
   *
   * @param _name - request name
   */
  public updateRequestName = async (_name: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.name = _name;
    progressiveTab.isSaved = false;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
  };

  /**
   *
   * @param method request method
   */
  public updateRequestMethod = async (method: string) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.request.method = method;
    progressiveTab.isSaved = false;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
  };

  /**
   *
   * @param _headers - request headers
   */
  public updateHeaders = async (_headers: KeyValueChecked[]) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.request.headers = _headers;
    progressiveTab.isSaved = false;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
  };

  /**
   *
   * @param _params - request query parameters
   * @param _effectURL - lag that effect request url
   */
  public updateParams = async (
    _params: KeyValueChecked[],
    _effectURL: boolean = true,
  ) => {
    const progressiveTab: RequestTab = createDeepCopy(this._tab.getValue());
    if (
      JSON.stringify(_params) ===
      JSON.stringify(progressiveTab.property.request.queryParams)
    ) {
      return;
    }
    progressiveTab.property.request.queryParams = _params;
    progressiveTab.isSaved = false;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    if (_effectURL) {
      const reducedQueryParams = new ReduceQueryParams(_params);
      const reducedURL = new ReduceRequestURL(
        progressiveTab.property.request?.url,
      );
      if (/^(\$|=)&?(=&?)*$/.test(reducedQueryParams.getValue())) {
        this.updateRequestUrl(reducedURL.getHost(), false);
      } else {
        this.updateRequestUrl(
          reducedURL.getHost() + "?" + reducedQueryParams.getValue(),
          false,
        );
      }
    }
  };

  /**
   *
   * @param headers - request auto generated headers
   */
  public updateAutoGeneratedHeaders = async (headers: KeyValueChecked[]) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.request.autoGeneratedHeaders = headers;
    progressiveTab.isSaved = false;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
  };

  /**
   *
   * @param _state - request state
   */
  public updateRequestState = async (
    _state:
      | RequestBodyLanguageWrapper
      | RequestBodyNavigationWrapper
      | RequestNavigationWrapper
      | ResponseNavigationWrapper
      | ResponseBodyLanguageWrapper
      | ResponseBodyFormatterWrapper
      | RequestExtensionNavigationWrapper
      | IsExposeEditDescriptionWrapper
      | RequestSplitterDirectionWrapper
      | RequestLeftSplitterWidthPercentageWrapper
      | RequestRightSplitterWidthPercentageWrapper
      | IsSendRequestInProgressWrapper
      | IsSaveDescriptionInProgressWrapper
      | IsSaveRequestInProgressWrapper,
  ) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.request.state = {
      ...progressiveTab.property.request.state,
      ..._state,
    };
    progressiveTab.isSaved = false;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
  };

  /**
   *
   * @param _auth - request auth
   */
  public updateRequestAuth = async (_auth: Auth) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.request.auth = {
      ...progressiveTab.property.request.auth,
      ..._auth,
    };
    progressiveTab.isSaved = false;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
    this.authHeader = new ReduceAuthHeader(
      progressiveTab.property.request.state,
      progressiveTab.property.request.auth,
    ).getValue();
    this.authParameter = new ReduceAuthParameter(
      progressiveTab.property.request.state,
      progressiveTab.property.request.auth,
    ).getValue();
  };

  /**
   *
   * @param _body - request body
   */
  public updateRequestBody = async (_body: Body) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.request.body = {
      ...progressiveTab.property.request.body,
      ..._body,
    };
    progressiveTab.isSaved = false;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
  };

  /**
   *
   * @param _response response
   */
  public updateResponse = async (_response: Response) => {
    const progressiveTab = createDeepCopy(this._tab.getValue());
    progressiveTab.property.request.response = _response;
    this.tab = progressiveTab;
    this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
  };

  /**
   * @description clear response of a request
   */
  public clearResponse = async () => {
    const response: Response = new InitRequestTab(
      UntrackedItems.UNTRACKED,
      "UNTRACKED-",
    ).getValue().property.request.response;
    this.updateResponse(response);
  };

  /**
   * @description send request
   */
  public sendRequest = async (environmentVariables = []) => {
    this.updateRequestState({ isSendRequestInProgress: true });
    const start = Date.now();

    this._tab
      .subscribe((tab) => {
        tab.property.request.url = tab.property.request.url.trim();
      })
      .unsubscribe();
    const decodeData = this._decodeRequest.init(
      this._tab.getValue().property.request,
      environmentVariables.filtered || [],
    );
    makeHttpRequestV2(...decodeData)
      .then((response) => {
        if (response.isSuccessful === false) {
          this.updateResponse({
            body: "",
            headers: [],
            status: "Not Found",
            time: 0,
            size: 0,
          });
          this.updateRequestState({ isSendRequestInProgress: false });
        } else {
          const end = Date.now();
          const byteLength = new TextEncoder().encode(
            JSON.stringify(response),
          ).length;
          const responseSizeKB = byteLength / 1024;
          const duration = end - start;
          const responseBody = response.data.body;
          const formattedHeaders = Object.entries(
            response?.data?.headers || {},
          );
          const responseHeaders = [];
          formattedHeaders.forEach((elem) => {
            responseHeaders.push({
              key: elem[0],
              value: elem[1],
            });
          });
          let responseStatus = response.data.status;
          const bodyLanguage =
            this._decodeRequest.setResponseContentType(responseHeaders);
          this.updateRequestState({
            responseBodyLanguage: bodyLanguage,
            isSendRequestInProgress: false,
          });

          const resData = {
            body: responseBody,
            headers: responseHeaders,
            status: responseStatus,
            time: duration,
            size: responseSizeKB,
          };

          this.updateResponse(resData);
        }
      })
      .catch((error) => {
        console.error(error);
        this.updateRequestState({ isSendRequestInProgress: false });

        this.updateResponse({
          body: "",
          headers: [],
          status: "Not Found",
          time: 0,
          size: 0,
        });
      });
  };

  /**
   *
   * @param uuid  - collection id
   * @returns - collection Document
   */
  public readCollection = (uuid: string): Promise<CollectionDocument> => {
    return this.collectionRepository.readCollection(uuid);
  };

  /**
   *
   * @param collectionId - collection id
   * @param uuid - request or folder id
   * @returns - request document
   */
  public readRequestOrFolderInCollection = (
    collectionId: string,
    uuid: string,
  ): Promise<object> => {
    return this.collectionRepository.readRequestOrFolderInCollection(
      collectionId,
      uuid,
    );
  };

  /**
   *
   * @param collectionId - collection id
   * @param folderId - folder id
   * @param uuid - request id
   * @returns - request document
   */
  public readRequestInFolder = (
    collectionId: string,
    folderId: string,
    uuid: string,
  ) => {
    return this.collectionRepository.readRequestInFolder(
      collectionId,
      folderId,
      uuid,
    );
  };

  /**
   *
   * @param _workspaceMeta - workspace meta data
   * @param _collectionId - collection id
   * @param _folderName - folder name
   * @returns - folder status message
   */
  public createFolder = async (
    _workspaceMeta: {
      id: string;
      name: string;
    },
    _collectionId: string,
    _folderName: string,
  ) => {
    let userSource = {};
    const _collection: CollectionDocument =
      await this.readCollection(_collectionId);
    if (_collection?.activeSync) {
      userSource = {
        currentBranch: _collection?.currentBranch,
        source: "USER",
      };
    }
    const directory: CreateDirectoryPostBody = {
      name: _folderName,
      description: "",
      ...userSource,
    };
    const res = await insertCollectionDirectory(
      _workspaceMeta.id,
      _collectionId,
      directory,
    );
    if (res.isSuccessful) {
      const latestRoute = {
        id: res.data.data.id,
      };
      return {
        status: "success",
        data: {
          latestRoute,
          collectionId: _collectionId,
          data: res.data.data,
          addRequestOrFolderInCollection: this.addRequestOrFolderInCollection,
        },
      };
    } else {
      return {
        status: "error",
        message: res.message,
      };
    }
  };

  /**
   *
   * @param _workspaceMeta - workspace meta data
   * @param _collectionName - collection name
   * @returns - collection status message
   */
  public createCollection = async (
    _workspaceMeta: {
      id: string;
      name: string;
    },
    _collectionName: string,
  ) => {
    const newCollection = {
      name: _collectionName,
      workspaceId: _workspaceMeta.id,
    };
    const res = await insertCollection(newCollection);
    if (res.isSuccessful) {
      const latestRoute = {
        id: res.data.data._id,
      };
      const storage = res.data.data;
      const _id = res.data.data._id;
      delete storage._id;
      storage.id = _id;
      storage.workspaceId = _workspaceMeta.id;
      MixpanelEvent(Events.CREATE_COLLECTION, {
        source: "SaveRequest",
        collectionName: res.data.data.name,
        collectionId: res.data.data._id,
      });
      return {
        status: "success",
        data: {
          latestRoute,
          storage,
          addCollection: this.addCollection,
        },
      };
    } else {
      return {
        status: "error",
        message: res.message,
      };
    }
  };

  /**
   * Save Request
   * @param saveDescriptionOnly - refers save overall request data or only description as a documentation purpose.
   * @returns save status
   */
  public saveRequest = async (saveDescriptionOnly = false) => {
    const componentData: RequestTab = this._tab.getValue();
    const { folderId, collectionId, workspaceId } = componentData.path;
    if (!workspaceId || !collectionId) {
      return {
        status: "error",
        message: "request is not a part of any workspace or collection",
      };
    }
    const _collection = await this.readCollection(collectionId);
    let userSource = {};
    if (_collection?.activeSync && componentData?.source === "USER") {
      userSource = {
        currentBranch: _collection?.currentBranch,
        source: "USER",
      };
    }
    const _id = componentData.id;
    let existingRequest;
    if (!folderId) {
      existingRequest = await this.readRequestOrFolderInCollection(
        collectionId,
        _id,
      );
    } else {
      existingRequest = await this.readRequestInFolder(
        collectionId,
        folderId,
        _id,
      );
    }
    const bodyType =
      componentData.property.request.state.requestBodyNavigation ===
      RequestDatasetEnum.RAW
        ? componentData.property.request.state.requestBodyLanguage
        : componentData.property.request.state.requestBodyNavigation;
    let expectedRequest: Request;
    let expectedMetaData;
    if (!saveDescriptionOnly) {
      // Save overall api
      let requestBody = {
        file: [],
        text: [],
      };
      componentData.property.request.body.formdata.map((pair) => {
        if (pair.type == "text") {
          requestBody.text.push({
            key: pair.key,
            value: pair.value,
            checked: pair.checked,
          });
        } else if (pair.type == "file") {
          requestBody.file.push({
            key: pair.key,
            value: pair.value,
            checked: pair.checked,
            base: pair.base,
          });
        }
      });
      componentData.property.request.body.formdata = requestBody;
      expectedRequest = {
        method: componentData.property.request.method,
        url: componentData.property.request.url,
        body: componentData.property.request.body,
        headers: componentData.property.request.headers,
        queryParams: componentData.property.request.queryParams,
        auth: componentData.property.request.auth,
        selectedRequestBodyType: setContentTypeHeader(bodyType),
        selectedRequestAuthType:
          componentData.property.request.state?.requestAuthNavigation,
      };
      expectedMetaData = {
        id: _id,
        name: componentData?.name,
        description: componentData?.description,
        type: ItemType.REQUEST,
      };
    } else {
      // Save api description only
      expectedRequest = {
        method: existingRequest?.request.method,
        url: existingRequest?.request.url,
        body: existingRequest?.request.body,
        headers: existingRequest?.request.headers,
        queryParams: existingRequest?.request.queryParams,
        auth: existingRequest?.request.auth,
        selectedRequestBodyType:
          existingRequest?.request?.selectedRequestBodyType,
        selectedRequestAuthType:
          existingRequest?.request?.selectedRequestAuthType,
      };
      expectedMetaData = {
        id: _id,
        name: existingRequest?.name,
        description: componentData?.description,
        type: ItemType.REQUEST,
      };
    }
    let folderSource;
    if (folderId) {
      folderSource = {
        folderId: folderId,
      };
    }

    const res = await updateCollectionRequest(_id, folderId, collectionId, {
      collectionId: collectionId,
      workspaceId: workspaceId,
      ...folderSource,
      ...userSource,
      items: {
        ...expectedMetaData,
        request: expectedRequest,
      },
    });
    if (res.isSuccessful) {
      const progressiveTab = this._tab.getValue();
      progressiveTab.isSaved = true;
      this.tab = progressiveTab;
      this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
      if (!folderId) {
        this.collectionRepository.updateRequestOrFolderInCollection(
          collectionId,
          _id,
          res.data.data,
        );
      } else {
        this.collectionRepository.updateRequestInFolder(
          collectionId,
          folderId,
          _id,
          res.data.data,
        );
      }
      return {
        status: "success",
        message: res.message,
      };
    } else {
      return {
        status: "error",
        message: res.message,
      };
    }
  };

  /**
   *
   * @param uuid - workspace id
   * @returns workspace document
   */
  public readWorkspace = (uuid: string): Promise<WorkspaceDocument> => {
    return this.workspaceRepository.readWorkspace(uuid);
  };

  get collection() {
    return this.collectionRepository.getCollection();
  }

  set collection(e) {}

  /**
   *
   * @param collectionId - collection id
   * @param items - request or folder item
   */
  public addRequestOrFolderInCollection = (
    collectionId: string,
    items: object,
  ) => {
    this.collectionRepository.addRequestOrFolderInCollection(
      collectionId,
      items,
    );
  };

  /**
   *
   * @param collection - collection document
   */
  public addCollection = (collection: object) => {
    this.collectionRepository.addCollection(collection);
  };

  /**
   *
   * @param collectionId - collection id
   * @param folderId - folder id
   * @param request - request document
   */
  public addRequestInFolder = (
    collectionId: string,
    folderId: string,
    request: object,
  ): void => {
    this.collectionRepository.addRequestInFolder(
      collectionId,
      folderId,
      request,
    );
  };

  /**
   *
   * @param _workspaceMeta - workspace meta data
   * @param path - request stack path
   * @param tabName - request name
   * @param description - request description
   * @param type - save over all request or description only
   */
  public saveAsRequest = async (
    _workspaceMeta: {
      id: string;
      name: string;
    },
    path: {
      name: string;
      id: string;
      type: string;
    }[],
    tabName: string,
    description: string,
    type: string,
  ) => {
    const saveType = {
      SAVE_DESCRIPTION: "SAVE_DESCRIPTION",
    };
    const componentData = this._tab.getValue();
    let userSource = {};
    const _id = componentData.id;
    if (path.length > 0) {
      let existingRequest;
      if (path[path.length - 1].type === ItemType.COLLECTION) {
        existingRequest = await this.readRequestOrFolderInCollection(
          path[path.length - 1].id,
          _id,
        );
      } else if (path[path.length - 1].type === ItemType.FOLDER) {
        existingRequest = await this.readRequestInFolder(
          path[0].id,
          path[path.length - 1].id,
          _id,
        );
      }
      const randomRequest: RequestTab = new InitRequestTab(
        "UNTRACKED-",
        "UNTRACKED-",
      ).getValue();
      const request = !existingRequest
        ? randomRequest.property.request
        : existingRequest.request;
      const expectedRequest = {
        method:
          type === saveType.SAVE_DESCRIPTION
            ? request.method
            : componentData.property.request.method,
        url:
          type === saveType.SAVE_DESCRIPTION
            ? request.url
            : componentData.property.request.url,
        body:
          type === saveType.SAVE_DESCRIPTION
            ? request.body
            : componentData.property.request.body,
        headers:
          type === saveType.SAVE_DESCRIPTION
            ? request.headers
            : componentData.property.request.headers,
        queryParams:
          type === saveType.SAVE_DESCRIPTION
            ? request.queryParams
            : componentData.property.request.queryParams,
        auth:
          type === saveType.SAVE_DESCRIPTION
            ? request.auth
            : componentData.property.request.auth,
      };
      if (path[path.length - 1].type === ItemType.COLLECTION) {
        /**
         * handle request at collection level
         */
        const _collection = await this.readCollection(path[path.length - 1].id);
        if (_collection?.activeSync) {
          userSource = {
            currentBranch: _collection?.currentBranch,
            source: "USER",
          };
        }
        const res = await insertCollectionRequest({
          collectionId: path[path.length - 1].id,
          workspaceId: _workspaceMeta.id,
          ...userSource,
          items: {
            name: tabName,
            description,
            type: ItemType.REQUEST,
            request: expectedRequest,
          },
        });
        if (res.isSuccessful) {
          this.addRequestOrFolderInCollection(
            path[path.length - 1].id,
            res.data.data,
          );
          const expectedPath = {
            folderId: "",
            folderName: "",
            collectionId: path[path.length - 1].id,
            workspaceId: _workspaceMeta.id,
          };
          if (
            !componentData.path.workspaceId ||
            !componentData.path.collectionId
          ) {
            /**
             * Update existing request
             */
            this.updateRequestName(res.data.data.name);
            this.updateRequestDescription(res.data.data.description);
            this.updateRequestPath(expectedPath);
            this.updateRequestId(res.data.data.id);
            const progressiveTab = this._tab.getValue();
            progressiveTab.isSaved = true;
            this.tab = progressiveTab;
            this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
          } else {
            /**
             * Create new copy of the existing request
             */
            const initRequestTab = new InitRequestTab(
              res.data.data.id,
              "UNTRACKED-",
            );
            initRequestTab.updateName(res.data.data.name);
            initRequestTab.updateDescription(res.data.data.description);
            initRequestTab.updatePath(expectedPath);
            initRequestTab.updateUrl(res.data.data.request.url);
            initRequestTab.updateMethod(res.data.data.request.method);
            initRequestTab.updateBody(res.data.data.request.body);
            initRequestTab.updateQueryParams(res.data.data.request.queryParams);
            initRequestTab.updateAuth(res.data.data.request.auth);
            initRequestTab.updateHeaders(res.data.data.request.headers);

            this.tabRepository.createTab(initRequestTab.getValue());
            moveNavigation("right");
          }
          return {
            status: "success",
            message: res.message,
            data: {
              id: res.data.data.id,
            },
          };
        } else {
          return {
            status: "error",
            message: res.message,
          };
        }
      } else if (path[path.length - 1].type === ItemType.FOLDER) {
        /**
         * handle request at folder level
         */
        const _collection = await this.readCollection(path[0].id);
        if (_collection?.activeSync) {
          userSource = {
            currentBranch: _collection?.currentBranch,
            source: "USER",
          };
        }
        const res = await insertCollectionRequest({
          collectionId: path[0].id,
          workspaceId: _workspaceMeta.id,
          folderId: path[path.length - 1].id,
          ...userSource,
          items: {
            name: path[path.length - 1].name,
            type: ItemType.FOLDER,
            items: {
              name: tabName,
              description,
              type: ItemType.REQUEST,
              request: expectedRequest,
            },
          },
        });
        if (res.isSuccessful) {
          this.addRequestInFolder(
            path[0].id,
            path[path.length - 1].id,
            res.data.data,
          );
          const expectedPath = {
            folderId: path[path.length - 1].id,
            folderName: path[path.length - 1].name,
            collectionId: path[0].id,
            workspaceId: _workspaceMeta.id,
          };
          if (
            !componentData.path.workspaceId ||
            !componentData.path.collectionId
          ) {
            this.updateRequestName(res.data.data.name);
            this.updateRequestDescription(res.data.data.description);
            this.updateRequestPath(expectedPath);
            this.updateRequestId(res.data.data.id);
            const progressiveTab = this._tab.getValue();
            progressiveTab.isSaved = true;
            this.tab = progressiveTab;
            this.tabRepository.updateTab(progressiveTab.tabId, progressiveTab);
          } else {
            const initRequestTab = new InitRequestTab(
              res.data.data.id,
              "UNTRACKED-",
            );
            initRequestTab.updateName(res.data.data.name);
            initRequestTab.updateDescription(res.data.data.description);
            initRequestTab.updatePath(expectedPath);
            initRequestTab.updateUrl(res.data.data.request.url);
            initRequestTab.updateMethod(res.data.data.request.method);
            initRequestTab.updateBody(res.data.data.request.body);
            initRequestTab.updateQueryParams(res.data.data.request.queryParams);
            initRequestTab.updateAuth(res.data.data.request.auth);
            initRequestTab.updateHeaders(res.data.data.request.headers);
            this.tabRepository.createTab(initRequestTab.getValue());
            moveNavigation("right");
          }
          return {
            status: "success",
            message: res.message,
            data: {
              id: res.data.data.id,
            },
          };
        } else {
          return {
            status: "error",
            message: res.message,
          };
        }
      }
      MixpanelEvent(Events.SAVE_API_REQUEST);
    }
  };

  /**
   *
   * @param isGlobalVariable - defines to save local or global
   * @param environmentVariables - pre existing environment data
   * @param newVariableObj - new entry to be extended
   * @returns
   */
  public updateEnvironment = async (
    isGlobalVariable: boolean,
    environmentVariables,
    newVariableObj: KeyValue,
  ) => {
    if (isGlobalVariable) {
      // api payload
      let payload = {
        name: environmentVariables.global.name,
        variable: [
          ...environmentVariables.global.variable,
          {
            key: newVariableObj.key,
            value: newVariableObj.value,
            checked: true,
          },
        ],
      };
      // removes blank key value pairs
      payload.variable = [
        ...payload.variable.filter((variable) => {
          return variable.key.length > 0;
        }),
        {
          key: "",
          value: "",
          checked: false,
        },
      ];
      const response = await this.environmentService.updateEnvironment(
        this._tab.getValue().path.workspaceId,
        environmentVariables.global.id,
        payload,
      );
      if (response.isSuccessful) {
        // updates environment list
        this.environmentRepository.updateEnvironment(
          response.data.data._id,
          response.data.data,
        );
        // updates environment tab
        await this.environmentTabRepository.setEnvironmentTabProperty(
          response.data.data.variable,
          "variable",
          response.data.data._id,
        );
        await this.environmentTabRepository.setEnvironmentTabProperty(
          true,
          "isSave",
          response.data.data._id,
        );
        notifications.success("Environment Variable Added");
      } else {
        notifications.error("Failed to add Environment Variable");
      }
      return response;
    } else {
      // api payload
      const payload = {
        name: environmentVariables.local.name,
        variable: [
          ...environmentVariables.local.variable,
          {
            key: newVariableObj.key,
            value: newVariableObj.value,
            checked: true,
          },
        ],
      };
      // removes blank key value pairs
      payload.variable = [
        ...payload.variable.filter((variable) => {
          return variable.key.length > 0;
        }),
        {
          key: "",
          value: "",
          checked: false,
        },
      ];
      // api response
      const response = await this.environmentService.updateEnvironment(
        this._tab.getValue().path.workspaceId,
        environmentVariables.local.id,
        payload,
      );
      if (response.isSuccessful) {
        // updates environment list
        this.environmentRepository.updateEnvironment(
          response.data.data._id,
          response.data.data,
        );
        // updates environment tab
        await this.environmentTabRepository.setEnvironmentTabProperty(
          response.data.data.variable,
          "variable",
          response.data.data._id,
        );
        await this.environmentTabRepository.setEnvironmentTabProperty(
          true,
          "isSave",
          response.data.data._id,
        );
        notifications.success("Environment Variable Added");
      } else {
        notifications.error("Failed to add Environment Variable");
      }
      return response;
    }
  };
}

export default RestExplorerViewModel;
