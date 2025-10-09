interface GrpcRequestKeyValueCheckedBaseInterface {
  key: string;
  value: string;
  checked: boolean;
}

interface GrpcRequestBasicAuthBaseInterface {
  username?: string;
  password?: string;
}

interface GrpcRequestApiKeyBaseInterface {
  authKey: string;
  authValue: string;
}

interface GrpcRequestAuthBaseInterface {
  bearerToken?: string;
  basicAuth?: GrpcRequestBasicAuthBaseInterface;
  apiKey?: GrpcRequestApiKeyBaseInterface;
}

export enum GrpcRequestAuthModeBaseEnum {
  NO_AUTH = "No Auth",
  API_KEY = "API Key",
  BEARER_TOKEN = "Bearer Token",
  BASIC_AUTH = "Basic Auth",
}

export interface GrpcRequestBaseInterface {
  url: string;
  protoPath: string;
  selectedService: string;
  selectedMethod: string;
  message: string;
  metadata: GrpcRequestKeyValueCheckedBaseInterface[];
  auth: GrpcRequestAuthBaseInterface;
  selectedGrpcAuthType?: GrpcRequestAuthModeBaseEnum;
}

export enum GrpcRequestDefaultAliasBaseEnum {
  NAME = "gRPC",
}
