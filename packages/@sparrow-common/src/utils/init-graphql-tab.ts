import {
  TabTypeEnum,
  type Tab,
  type Path,
} from "@sparrow/common/types/workspace/tab";
import { v4 as uuidv4 } from "uuid";
import {
  GraphqlRequestAuthTypeTabEnum,
  GraphqlRequestSectionTabEnum,
  type GraphqlRequestAuthTabInterface,
  type GraphqlRequestAutoGeneratedHeadersTabInterface,
  type GraphqlRequestHeadersTabInterface,
  type GraphqlRequestStateTabInterface,
} from "../types/workspace/graphql-request-tab";
import { GraphqlRequestDefaultAliasBaseEnum } from "../types/workspace/graphql-request-base";

class InitGraphqlTab {
  private _tab: Tab;
  /**
   *
   * @param _id - Request mongo id
   * @param _workspaceId - Workspace Id to which Request belongs to
   */
  constructor(_id: string, _workspaceId: string) {
    this._tab = {
      id: _id,
      tabId: uuidv4(),
      name: "New " + GraphqlRequestDefaultAliasBaseEnum.NAME,
      type: TabTypeEnum.GRAPHQL,
      description: "",
      source: "USER",
      isDeleted: false,
      activeSync: false,
      property: {
        graphql: {
          url: "",
          query: "",
          schema: "",
          headers: [
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
              key: "User-Agent",
              value:
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
              checked: true,
            },
          ],
          state: {
            requestNavigation: GraphqlRequestSectionTabEnum.QUERY,
            requestAuthNavigation: GraphqlRequestAuthTypeTabEnum.NO_AUTH,
            requestLeftSplitterWidthPercentage: 50,
            requestRightSplitterWidthPercentage: 50,
            isHeaderBulkEditActive: false,
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
            },
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
  public getValue(): Tab {
    return this._tab;
  }
  public updateId(_id: string) {
    this._tab.id = _id;
    return this;
  }
  public updateName(_name: string) {
    this._tab.name = _name;
    return this;
  }
  public updateDescription(_description: string) {
    this._tab.description = _description;
    return this;
  }
  public updatePath(_path: Path) {
    this._tab.path = _path;
    return this;
  }
  public updateUrl(_url: string) {
    if (_url && this._tab.property.graphql) {
      this._tab.property.graphql.url = _url;
    }
    return this;
  }
  public updateQuery(_query: string) {
    if (_query && this._tab.property.graphql) {
      this._tab.property.graphql.query = _query;
    }
    return this;
  }
  public updateSchema(_schema: string) {
    if (_schema && this._tab.property.graphql) {
      this._tab.property.graphql.schema = _schema;
    }
    return this;
  }

  public updateHeaders(_headers: GraphqlRequestHeadersTabInterface[]) {
    if (_headers && this._tab.property.graphql) {
      this._tab.property.graphql.headers = _headers;
    }
    return this;
  }
  public updateAuth(_auth: GraphqlRequestAuthTabInterface) {
    if (_auth && this._tab.property.graphql) {
      this._tab.property.graphql.auth = _auth;
    }
    return this;
  }
  public updateAutoGeneratedHeaders(
    _autoGeneratedHeaders: GraphqlRequestAutoGeneratedHeadersTabInterface[],
  ) {
    if (this._tab.property.graphql) {
      this._tab.property.graphql.autoGeneratedHeaders = _autoGeneratedHeaders;
    }
    return this;
  }
  public updateIsSave(_isSave: boolean) {
    this._tab.isSaved = _isSave;
    return this;
  }
  public updateState(_state: Partial<GraphqlRequestStateTabInterface>) {
    if (this._tab.property.graphql) {
      this._tab.property.graphql.state = {
        ...this._tab.property.graphql.state,
        ..._state,
      };
    }
    return this;
  }
}

export { InitGraphqlTab };
