import {
  toTypedRxJsonSchema,
  type ExtractDocumentTypeFromTypedRxJsonSchema,
  type RxJsonSchema,
} from "rxdb";

export const tabSchemaLiteral = {
  title: "Opened tabs that will be shown on dashboard",
  primaryKey: "tabId",
  type: "object",
  version: 16,
  properties: {
    tabId: {
      // ---- RxDocumentId
      type: "string",
      maxLength: 100,
    },
    id: {
      // ---- MongoDocumentId
      type: "string",
      maxLength: 100,
    },
    name: {
      type: "string",
    },
    description: {
      type: "string",
    },
    isDeleted: {
      type: "boolean",
    },
    activeSync: {
      type: "boolean",
    },
    source: {
      type: "string",
    },
    type: {
      type: "string",
    },
    property: {
      type: "object",
      properties: {
        request: {
          type: "object",
          properties: {
            method: {
              type: "string",
            },
            body: {
              type: "object",
              properties: {
                raw: {
                  type: "string",
                },
                urlencoded: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      key: {
                        type: "string",
                      },
                      value: {
                        type: "string",
                      },
                      checked: {
                        type: "boolean",
                      },
                    },
                  },
                },
                formdata: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      key: {
                        type: "string",
                      },
                      value: {
                        type: "string",
                      },
                      checked: {
                        type: "boolean",
                      },
                      base: {
                        type: "string",
                      },
                      type: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            url: {
              type: "string",
            },
            headers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  key: {
                    type: "string",
                  },
                  value: {
                    type: "string",
                  },
                  checked: {
                    type: "boolean",
                  },
                },
              },
            },
            queryParams: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  key: {
                    type: "string",
                  },
                  value: {
                    type: "string",
                  },
                  checked: {
                    type: "boolean",
                  },
                },
              },
            },
            autoGeneratedHeaders: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  key: {
                    type: "string",
                  },
                  value: {
                    type: "string",
                  },
                  checked: {
                    type: "boolean",
                  },
                },
              },
            },
            response: {
              type: "object",
              properties: {
                headers: {
                  type: "string",
                },
                status: {
                  type: "string",
                },
                body: {
                  type: "string",
                },
                size: {
                  type: "number",
                },
                time: {
                  type: "number",
                },
              },
            },
            state: {
              type: "object",
              properties: {
                requestBodyLanguage: {
                  type: "string",
                },
                requestBodyNavigation: {
                  type: "string",
                },
                requestAuthNavigation: {
                  type: "string",
                },
                requestNavigation: {
                  type: "string",
                },
                responseNavigation: {
                  type: "string",
                },
                responseBodyLanguage: {
                  type: "string",
                },
                responseBodyFormatter: {
                  type: "string",
                },
                requestExtensionNavigation: {
                  type: "string",
                },
                requestLeftSplitterWidthPercentage: {
                  type: "number",
                },
                requestRightSplitterWidthPercentage: {
                  type: "number",
                },
                isExposeEditDescription: {
                  type: "boolean",
                },
                isSendRequestInProgress: {
                  type: "boolean",
                  default: false,
                },
                isSaveDescriptionInProgress: {
                  type: "boolean",
                  default: false,
                },
                isSaveRequestInProgress: {
                  type: "boolean",
                },
                isParameterBulkEditActive: {
                  type: "boolean",
                },
                isHeaderBulkEditActive: {
                  type: "boolean",
                },
                isChatbotActive: {
                  type: "boolean",
                },
                isChatbotSuggestionsActive: {
                  type: "boolean",
                },
                isChatbotGeneratingResponse: {
                  type: "boolean",
                },
                isDocAlreadyGenerated: {
                  type: "boolean",
                },
                isDocGenerating: {
                  type: "boolean",
                },
              },
            },
            auth: {
              type: "object",
              properties: {
                bearerToken: {
                  type: "string",
                },
                basicAuth: {
                  type: "object",
                  properties: {
                    username: {
                      type: "string",
                    },
                    password: {
                      type: "string",
                    },
                  },
                },
                apiKey: {
                  type: "object",
                  properties: {
                    authKey: {
                      type: "string",
                    },
                    authValue: {
                      type: "string",
                    },
                    addTo: {
                      type: "string",
                    },
                  },
                },
              },
            },
            ai: {
              type: "object",
              properties: {
                prompt: {
                  type: "string",
                },
                threadId: {
                  type: "string",
                },
                conversations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      messageId: {
                        type: "string",
                      },
                      message: {
                        type: "string",
                      },
                      type: {
                        type: "string",
                      },
                      isLiked: {
                        type: "boolean",
                      },
                      isDisliked: {
                        type: "boolean",
                      },
                      status: {
                        type: "boolean",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        folder: {
          type: "string",
        },
        collection: {
          type: "string",
        },
        workspace: {
          type: "string",
        },
        graphql: {
          type: "object",
          properties: {
            url: {
              type: "string",
            },
            query: {
              type: "string",
            },
            schema: {
              type: "string",
            },
            headers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  key: {
                    type: "string",
                  },
                  value: {
                    type: "string",
                  },
                  checked: {
                    type: "boolean",
                  },
                },
              },
            },
            variables: {
              type: "string",
            },
            autoGeneratedHeaders: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  key: {
                    type: "string",
                  },
                  value: {
                    type: "string",
                  },
                  checked: {
                    type: "boolean",
                  },
                },
              },
            },
            operationSearch: {
              type: "string",
            },
            state: {
              type: "object",
              properties: {
                requestNavigation: {
                  type: "string",
                },
                operationNavigation: {
                  type: "string",
                },
                requestAuthNavigation: {
                  type: "string",
                },
                requestLeftSplitterWidthPercentage: {
                  type: "number",
                },
                requestRightSplitterWidthPercentage: {
                  type: "number",
                },
                requestBuilderLeftSplitterWidthPercentage: {
                  type: "number",
                },
                requestBuilderRightSplitterWidthPercentage: {
                  type: "number",
                },
                isHeaderBulkEditActive: {
                  type: "boolean",
                },
                isRequestSchemaFetched: {
                  type: "boolean",
                },
              },
            },
            auth: {
              type: "object",
              properties: {
                bearerToken: {
                  type: "string",
                },
                basicAuth: {
                  type: "object",
                  properties: {
                    username: {
                      type: "string",
                    },
                    password: {
                      type: "string",
                    },
                  },
                },
                apiKey: {
                  type: "object",
                  properties: {
                    authKey: {
                      type: "string",
                    },
                    authValue: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
        },
        environment: {
          type: "object",
          properties: {
            variable: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  key: {
                    type: "string",
                  },
                  value: {
                    type: "string",
                  },
                  checked: {
                    type: "boolean",
                  },
                },
                required: ["key", "value", "checked"],
              },
            },
            type: {
              type: "string",
            },
            state: {
              type: "object",
              properties: {
                isSaveInProgress: {
                  type: "boolean",
                },
              },
              required: ["isSaveInProgress"],
            },
          },
          required: ["variable", "type", "state"],
        },
        websocket: {
          type: "object",
          properties: {
            url: {
              type: "string",
            },
            headers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  key: {
                    type: "string",
                  },
                  value: {
                    type: "string",
                  },
                  checked: {
                    type: "boolean",
                  },
                },
              },
            },
            queryParams: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  key: {
                    type: "string",
                  },
                  value: {
                    type: "string",
                  },
                  checked: {
                    type: "boolean",
                  },
                },
              },
            },
            autoGeneratedHeaders: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  key: {
                    type: "string",
                  },
                  value: {
                    type: "string",
                  },
                  checked: {
                    type: "boolean",
                  },
                },
              },
            },
            message: {
              type: "string",
            },
            state: {
              type: "object",
              properties: {
                socketNavigation: {
                  type: "string",
                },
                socketMessageLanguage: {
                  type: "string",
                },
                socketLeftSplitterWidthPercentage: {
                  type: "string",
                },
                socketRightSplitterWidthPercentage: {
                  type: "string",
                },
                isSaveSocketInProgress: {
                  type: "string",
                },
                isParameterBulkEditActive: {
                  type: "string",
                },
                isHeaderBulkEditActive: {
                  type: "string",
                },
              },
            },
          },
        },
        socketio: {
          type: "object",
          properties: {
            url: {
              type: "string",
            },
            headers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  key: {
                    type: "string",
                  },
                  value: {
                    type: "string",
                  },
                  checked: {
                    type: "boolean",
                  },
                },
              },
            },
            queryParams: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  key: {
                    type: "string",
                  },
                  value: {
                    type: "string",
                  },
                  checked: {
                    type: "boolean",
                  },
                },
              },
            },
            autoGeneratedHeaders: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  key: {
                    type: "string",
                  },
                  value: {
                    type: "string",
                  },
                  checked: {
                    type: "boolean",
                  },
                },
              },
            },
            message: {
              type: "string",
            },
            events: {
              type: "array",
              properties: {
                event: {
                  type: "string",
                },
                listen: {
                  type: "boolean",
                },
              },
            },
            eventName: {
              type: "string",
            },
            state: {
              type: "object",
              properties: {
                requestNavigation: {
                  type: "string",
                },
                messageLanguage: {
                  type: "string",
                },
                leftSplitterWidthPercentage: {
                  type: "string",
                },
                rightSplitterWidthPercentage: {
                  type: "string",
                },
                isSaveInProgress: {
                  type: "string",
                },
                isParameterBulkEditActive: {
                  type: "string",
                },
                isHeaderBulkEditActive: {
                  type: "string",
                },
              },
            },
          },
        },
        testflow: {
          type: "object",
          properties: {
            nodes: {
              type: "array",
              default: [],
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                  },
                  type: {
                    type: "string",
                  },
                  data: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                      },
                      collectionId: {
                        type: "string",
                      },
                      folderId: {
                        type: "string",
                      },
                      requestId: {
                        type: "string",
                      },
                      method: {
                        type: " string",
                      },
                    },
                  },
                  position: {
                    type: "object",
                    properties: {
                      x: {
                        type: "number",
                      },
                      y: {
                        type: "number",
                      },
                    },
                    required: ["x", "y"],
                  },
                },
                required: ["id", "type", "data", "position"],
              },
            },
            edges: {
              type: "array",
              default: [],
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                  },
                  source: {
                    type: "string",
                  },
                  target: {
                    type: "string",
                  },
                },
                required: ["id", "source", "target"],
              },
            },
          },
        },
      },
    },
    isActive: {
      type: "boolean",
    },
    isSaved: {
      type: "boolean",
    },
    path: {
      type: "object",
      properties: {
        workspaceId: {
          type: "string",
        },
        collectionId: {
          type: "string",
        },
        folderId: {
          type: "string",
        },
      },
    },
    timestamp: {
      type: "string",
      maxLength: 100,
    },
    index: {
      type: "number",
    },
  },
  required: ["id", "name", "property"],
  indexes: ["timestamp"],
} as const;

const schemaTyped = toTypedRxJsonSchema(tabSchemaLiteral);

export type TabDocType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

export const tabSchema: RxJsonSchema<TabDocType> = tabSchemaLiteral;
