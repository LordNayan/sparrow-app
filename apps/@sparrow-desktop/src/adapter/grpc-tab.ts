import { createDeepCopy } from "@sparrow/common/utils";
import { type Path, type Tab } from "@sparrow/common/types/workspace/tab";
import { InitTab } from "@sparrow/common/factory";
import { GrpcRequestAuthTypeTabEnum } from "../../../../packages/@sparrow-common/src/types/workspace/grpc-request-tab";
import { GrpcRequestAuthModeBaseEnum } from "../../../../packages/@sparrow-common/src/types/workspace/grpc-request-base";
import type { GrpcRequestMetaDataDtoInterface } from "../../../../packages/@sparrow-common/src/types/workspace/grpc-request-dto";
import { GrpcRequestSectionTabEnum } from "../../../../packages/@sparrow-common/src/types/workspace/grpc-request-tab";

/**
 * @class - this class makes grpc tab compatible with backend server
 */
export class GrpcTabAdapter {
  constructor() {}

  private unsetAuthType = (
    auth: GrpcRequestAuthTypeTabEnum,
  ): GrpcRequestAuthModeBaseEnum => {
    let authType = GrpcRequestAuthModeBaseEnum.NO_AUTH;
    switch (auth) {
      case GrpcRequestAuthTypeTabEnum.NO_AUTH:
        authType = GrpcRequestAuthModeBaseEnum.NO_AUTH;
        break;
      case GrpcRequestAuthTypeTabEnum.API_KEY:
        authType = GrpcRequestAuthModeBaseEnum.API_KEY;
        break;
      case GrpcRequestAuthTypeTabEnum.BASIC_AUTH:
        authType = GrpcRequestAuthModeBaseEnum.BASIC_AUTH;
        break;
      case GrpcRequestAuthTypeTabEnum.BEARER_TOKEN:
        authType = GrpcRequestAuthModeBaseEnum.BEARER_TOKEN;
        break;
    }
    return authType;
  };

  private setAuthType = (
    auth: GrpcRequestAuthModeBaseEnum,
  ): GrpcRequestAuthTypeTabEnum => {
    let requestAuthNavigation = GrpcRequestAuthTypeTabEnum.NO_AUTH;
    switch (auth) {
      case GrpcRequestAuthModeBaseEnum.NO_AUTH:
        requestAuthNavigation = GrpcRequestAuthTypeTabEnum.NO_AUTH;
        break;
      case GrpcRequestAuthModeBaseEnum.API_KEY:
        requestAuthNavigation = GrpcRequestAuthTypeTabEnum.API_KEY;
        break;
      case GrpcRequestAuthModeBaseEnum.BASIC_AUTH:
        requestAuthNavigation = GrpcRequestAuthTypeTabEnum.BASIC_AUTH;
        break;
      case GrpcRequestAuthModeBaseEnum.BEARER_TOKEN:
        requestAuthNavigation = GrpcRequestAuthTypeTabEnum.BEARER_TOKEN;
        break;
    }
    return requestAuthNavigation;
  };

  /**
   * @description - parse backend data to frontend compatible
   * @param workspaceId - workspace id
   * @param collectionId - collection id
   * @param folderId - folder id
   * @param request - request tab frontend data
   * @returns
   */
  public adapt(
    workspaceId: string,
    collectionId: string,
    folderId: string,
    request: any,
  ): Tab {
    request = createDeepCopy(request);
    const adaptedRequest = new InitTab().grpc(request.id, workspaceId);
    const path: Path = {
      workspaceId: workspaceId,
      collectionId: collectionId,
      folderId: folderId,
    };
    adaptedRequest.updateName(request.name);
    adaptedRequest.updateDescription(request.description);
    adaptedRequest.updateUrl(request.grpc?.url);
    adaptedRequest.updateProtoPath(request.grpc?.protoPath);
    adaptedRequest.updateSelectedService(request.grpc?.selectedService);
    adaptedRequest.updateSelectedMethod(request.grpc?.selectedMethod);
    adaptedRequest.updateMessage(request.grpc?.message);
    adaptedRequest.updateServices(request.grpc?.services || []);
    adaptedRequest.updateAuth(request.grpc?.auth);
    adaptedRequest.updateMetadata(request.grpc?.metadata);
    adaptedRequest.updatePath(path);
    const AuthType = this.setAuthType(request.grpc?.selectedGrpcAuthType);
    adaptedRequest.updateState({
      requestAuthNavigation: AuthType,
      requestNavigation:
        adaptedRequest.getValue().property.grpc?.state?.requestNavigation ??
        GrpcRequestSectionTabEnum.MESSAGE,
      requestLeftSplitterWidthPercentage:
        adaptedRequest.getValue().property.grpc?.state
          ?.requestLeftSplitterWidthPercentage ?? 50,
      requestRightSplitterWidthPercentage:
        adaptedRequest.getValue().property.grpc?.state
          ?.requestRightSplitterWidthPercentage ?? 50,
      isMetadataBulkEditActive:
        adaptedRequest.getValue().property.grpc?.state
          ?.isMetadataBulkEditActive ?? false,
      isProtoLoaded:
        adaptedRequest.getValue().property.grpc?.state?.isProtoLoaded ?? false,
    });
    return adaptedRequest.getValue();
  }

  /**
   * @description - parse frontend data to backend compatible
   * @param requestTab - request backend data
   * @returns
   */
  public unadapt(requestTab: Tab): GrpcRequestMetaDataDtoInterface {
    requestTab = createDeepCopy(requestTab);
    return {
      url: requestTab.property.grpc?.url,
      protoPath: requestTab.property.grpc?.protoPath,
      selectedService: requestTab.property.grpc?.selectedService,
      selectedMethod: requestTab.property.grpc?.selectedMethod,
      message: requestTab.property.grpc?.message,
      metadata: requestTab.property.grpc?.metadata,
      auth: requestTab.property.grpc?.auth,
      selectedGrpcAuthType: this.unsetAuthType(
        requestTab.property?.grpc?.state
          ?.requestAuthNavigation as GrpcRequestAuthTypeTabEnum,
      ),
    };
  }
}
