import { RequestDefault } from "$lib/utils/enums";
import {
  AuthSectionEnum,
  AuthTypeEnum,
  RequestDataTypeEnum,
  RequestDatasetEnum,
  RequestMethodEnum,
  RequestSectionEnum,
  ResponseFormatterEnum,
  ResponseSectionEnum,
  type Auth,
  type Body,
  type Path,
  type KeyValueChecked,
  type RequestTab,
  TabTypeEnum,
  FormDataTypeEnum,
  type StatePartial,
} from "@common/types/workspace";
import { v4 as uuidv4 } from "uuid";

class InitRequestTab {
  private _tab: RequestTab;
  /**
   *
   * @param _id - Request mongo id
   * @param _workspaceId - Workspace Id to which Request belongs to
   */
  constructor(_id: string, _workspaceId: string) {
    this._tab = {
      id: _id,
      tabId: uuidv4(),
      name: RequestDefault.NAME,
      type: TabTypeEnum.REQUEST,
      description: "",
      source: "USER",
      isDeleted: false,
      activeSync: false,
      property: {
        request: {
          method: RequestMethodEnum.GET,
          body: {
            raw: "",
            urlencoded: [
              {
                key: "",
                value: "",
                checked: false,
              },
            ],
            formdata: [
              {
                key: "",
                value: "",
                base: "",
                checked: false,
                type: FormDataTypeEnum.TEXT,
              },
            ],
          },
          url: "",
          headers: [
            {
              key: "",
              value: "",
              checked: false,
            },
          ],
          queryParams: [
            {
              key: "",
              value: "",
              checked: false,
            },
          ],
          autoGeneratedHeaders: [
            {
              key: "Accept",
              value: "*/*",
              checked: true,
            },
            {
              key: "Connection",
              value: "keep-alive",
              checked: true,
            },
            {
              key: "User-Agent",
              value:
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
              checked: true,
            },
            {
              key: "Accept-Encoding",
              value: "gzip, br",
              checked: true,
            },
          ],
          state: {
            requestBodyLanguage: RequestDataTypeEnum.TEXT,
            requestBodyNavigation: RequestDatasetEnum.NONE,
            requestAuthNavigation: AuthTypeEnum.NO_AUTH,
            requestNavigation: RequestSectionEnum.PARAMETERS,
            responseNavigation: ResponseSectionEnum.RESPONSE,
            responseBodyLanguage: RequestDataTypeEnum.TEXT,
            responseBodyFormatter: ResponseFormatterEnum.PRETTY,
            requestExtensionNavigation: "",
            requestLeftSplitterWidthPercentage: 50,
            requestRightSplitterWidthPercentage: 50,
            isExposeEditDescription: true,
            isSendRequestInProgress: false,
            isSaveDescriptionInProgress: false,
            isSaveRequestInProgress: false,
            isParameterBulkEditActive: false,
            isHeaderBulkEditActive: false,
            isChatbotActive: false,
          },
          auth: {
            bearerToken: "",
            basicAuth: {
              username: "",
              password: "",
            },
            apiKey: {
              authKey: "",
              authValue: "",
              addTo: AuthSectionEnum.HEADER,
            },
          },
          ai: {
            prompt: "",
            conversations: [],
          },
          response: {
            headers: [],
            status: "",
            body: "",
            time: 0,
            size: 0,
          },
        },
      },
      path: {
        workspaceId: _workspaceId,
        collectionId: "",
        folderId: "",
      },
      isSaved: true,
      index: 0,
      isActive: true,
      timestamp: new Date().toString(),
    };
    if (!_id || !_workspaceId) {
      console.error("invalid id or workspace id on create new tab request!");
    }
  }
  public getValue(): RequestTab {
    return this._tab;
  }
  public getSpacificValue(_value: string) {
    return this._tab[_value];
  }
  public updateId(_id: string) {
    this._tab.id = _id;
  }
  public updateName(_name: string) {
    this._tab.name = _name;
  }
  public updateDescription(_description: string) {
    this._tab.description = _description;
  }
  public updatePath(_path: Path) {
    this._tab.path = _path;
  }
  public updateUrl(_url: string) {
    if (_url) {
      this._tab.property.request.url = _url;
    }
  }
  public updateMethod(_method: RequestMethodEnum) {
    if (_method) {
      this._tab.property.request.method = _method;
    }
  }
  public updateBody(_body: Body) {
    if (_body) {
      this._tab.property.request.body = _body;
    }
  }
  public updateQueryParams(_queryParams: KeyValueChecked[]) {
    if (_queryParams) {
      this._tab.property.request.queryParams = _queryParams;
    }
  }
  public updateHeaders(_headers: KeyValueChecked[]) {
    if (_headers) {
      this._tab.property.request.headers = _headers;
    }
  }
  public updateAuth(_auth: Auth) {
    if (_auth) {
      this._tab.property.request.auth = _auth;
    }
  }
  public updateAutoGeneratedHeaders(_autoGeneratedHeaders: KeyValueChecked[]) {
    this._tab.property.request.autoGeneratedHeaders = _autoGeneratedHeaders;
  }
  public updateIsSave(_isSave: boolean) {
    this._tab.isSaved = _isSave;
  }
  public updateState(_state: StatePartial) {
    this._tab.property.request.state = {
      ...this._tab.property.request.state,
      ..._state,
    };
  }
}

export { InitRequestTab };
