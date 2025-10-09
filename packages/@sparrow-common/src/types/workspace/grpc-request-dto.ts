import type { CollectionItemTypeBaseEnum } from "./collection-base";
import { CollectionSourceTypeDtoEnum } from "./collection-dto";
import type { GrpcRequestAuthModeBaseEnum } from "./grpc-request-base";

export interface GrpcRequestKeyValueDtoInterface {
  key: string;
  value: string;
  checked: boolean;
}

export interface GrpcRequestAuthDtoInterface {
  bearerToken?: string;
  basicAuth?: {
    username: string;
    password: string;
  };
  apiKey?: {
    authKey: string;
    authValue: string;
  };
}

export type GrpcRequestSourceDtoType = "SPEC" | "USER";

export interface GrpcRequestMetaDataDtoInterface {
  url?: string;
  protoPath?: string;
  selectedService?: string;
  selectedMethod?: string;
  message?: string;
  metadata?: GrpcRequestKeyValueDtoInterface[];
  auth?: GrpcRequestAuthDtoInterface;
  selectedGrpcAuthType?: GrpcRequestAuthModeBaseEnum;
}

export interface GrpcRequestCreateUpdateInCollectionPayloadDtoInterface {
  collectionId: string;
  workspaceId: string;
  folderId?: string;
  source?: GrpcRequestSourceDtoType;

  items?: {
    id?: string;
    name: string;
    description?: string;
    type: CollectionItemTypeBaseEnum.GRPC;
    source?: CollectionSourceTypeDtoEnum;
    grpc?: GrpcRequestMetaDataDtoInterface;
    isDeleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
  };

  currentBranch?: string;
}

export interface GrpcRequestCreateUpdateInFolderPayloadDtoInterface {
  collectionId: string;
  workspaceId: string;
  folderId?: string;
  source?: GrpcRequestSourceDtoType;
  items?: {
    name?: string;
    type: CollectionItemTypeBaseEnum.FOLDER;
    id: string;
    items?: {
      id?: string;
      name: string;
      description?: string;
      type: CollectionItemTypeBaseEnum.GRPC;
      source?: CollectionSourceTypeDtoEnum;
      grpc?: GrpcRequestMetaDataDtoInterface;
      isDeleted?: boolean;
      createdAt?: string;
      updatedAt?: string;
      createdBy?: string;
      updatedBy?: string;
    };
  };
  currentBranch?: string;
}

export interface GrpcRequestDeletePayloadDtoInterface {
  collectionId: string;
  workspaceId: string;
  folderId?: string;
  source?: CollectionSourceTypeDtoEnum;
  currentBranch?: string;
}
