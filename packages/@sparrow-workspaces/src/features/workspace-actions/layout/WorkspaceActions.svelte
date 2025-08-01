<script lang="ts">
  import { doubleAngleLeftIcon as doubleangleLeft } from "@sparrow/library/assets";
  import { FilterIcon } from "@sparrow/library/assets";
  import { plusWhiteIcon as plusIcon } from "@sparrow/library/assets";
  import { HttpRequestDefaultNameBaseEnum } from "@sparrow/common/types/workspace/http-request-base";
  import { Search } from "@sparrow/library/forms";
  import { Events, WorkspaceRole } from "@sparrow/common/enums";
  import { Dropdown, Button } from "@sparrow/library/ui";
  import {
    isExpandCollection,
    isExpandEnvironment,
    isExpandTestflow,
  } from "../../../stores/recent-left-panel";
  import {
    AddRegular,
    ArrowClockWiseRegular,
    BetaVectorIcon,
    ChevronDoubleRightRegular,
    DatabaseStackRegular,
    PlusIcon2,
  } from "@sparrow/library/icons";
  import type { Observable } from "rxjs";
  import type {
    CollectionDocument,
    WorkspaceDocument,
  } from "@app/database/database";

  import { onDestroy, onMount, tick } from "svelte";
  import {
    CollectionIcon,
    DoubleArrowIcon,
    GithubIcon,
    SocketIcon,
    TreeIcon,
    VectorIcon,
    BubbleIcon,
    StackIcon,
    SocketIoIcon,
    GraphIcon,
    ChevronDoubleLeftRegular,
    AISparkleRegularIcon,
    BotRegular,
  } from "@sparrow/library/icons";
  import { WithButton } from "@sparrow/workspaces/hoc";
  import { createDeepCopy } from "@sparrow/common/utils";
  import { Input } from "@sparrow/library/forms";
  import { Tooltip } from "@sparrow/library/ui";
  import MixpanelEvent from "@app/utils/mixpanel/MixpanelEvent";
  import {
    CollectionList,
    EnvironmentList,
  } from "@sparrow/workspaces/features";
  import { TestflowList } from "../../testflow-list";
  import { TFDefaultEnum } from "@sparrow/common/types/workspace/testflow";

  import {
    currentStep,
    isTestFlowTourGuideOpen,
  } from "../../../stores/guide.tour";
  import { TestFlowTourGuide } from "@sparrow/workspaces/components";
  import { SocketIORequestDefaultAliasBaseEnum } from "@sparrow/common/types/workspace/socket-io-request-base";
  import { GraphqlRequestDefaultAliasBaseEnum } from "@sparrow/common/types/workspace/graphql-request-base";
  import {
    GithubStarRedirect,
    LaunchDesktop,
  } from "@sparrow/common/components";
  import { TabTypeEnum } from "@sparrow/common/types/workspace/tab";
  import {
    ArrowRightIcon,
    ArrowRightRegular,
    WorkspaceRegular,
  } from "@sparrow/library/icons";
  export let onOpenWorkspace: (workspaceId: string) => Promise<void>;
  export let appVersion;

  export let collectionList: Observable<CollectionDocument[]>;
  export let showImportCollectionPopup: () => void;
  export let showImportCurlPopup: () => void;
  export let onItemCreated: (entityType: string, args: any) => void;
  export let onItemDeleted: (entityType: string, args: any) => void;
  export let onItemRenamed: (entityType: string, args: any) => void;
  export let onItemOpened: (entityType: string, args: any) => void;
  export let onCreateMockCollection: (
    collectionId: string,
    workspaceId: string,
  ) => void;

  export let onBranchSwitched: (collection: CollectionDocument) => void;
  export let navigateToGithub: () => void;
  export let onRefetchCollection: (
    workspaceId: string,
    collection: CollectionDocument,
  ) => void;
  /**
   * path of the active tab - collection id, folder id, workspace id
   */
  export let activeTabPath;
  /**
   * id of the active tab
   */
  export let activeTabId;
  export let activeTabType;

  export let userRoleInWorkspace;
  export let currentWorkspace: Observable<WorkspaceDocument>;
  export let leftPanelController: {
    leftPanelCollapse: boolean;
    handleCollapseCollectionList: () => void;
  };
  export let githubRepo;
  /**
   * Flag to show app version
   */
  export let isAppVersionVisible = true;

  /**
   * Flag to check is user iu guest user
   */
  export let isGuestUser = false;

  /**
   * Role of user in active workspace
   */
  export let userRole;

  export let scrollList;

  export let environments;

  export let onCreateEnvironment;

  export let onOpenGlobalEnvironment;

  export let onDeleteEnvironment;

  export let onUpdateEnvironment;

  export let onOpenEnvironment;

  export let onSelectEnvironment;

  export let onCreateTestflow;

  export let testflows;

  export let launchSparrowWebApp: () => void;

  export let onDeleteTestflow;
  export let onUpdateTestflow;
  export let onOpenTestflow;
  export let isWebApp = false;
  export let isFirstCollectionExpand = false;
  export let refreshLoad = false;
  export let refreshWorkspace: () => void;
  export let userCount = 0;
  export let onCompareCollection;
  export let onSyncCollection;
  export let onUpdateRunningState;

  let collectionListMounted = false;
  function delayFrames(count: number): Promise<void> {
    return new Promise((resolve) => {
      function nextFrame(n: number) {
        if (n <= 0) return resolve();
        requestAnimationFrame(() => nextFrame(n - 1));
      }
      nextFrame(count);
    });
  }

  onMount(async () => {
    await tick(); // let Svelte bind DOM
    await delayFrames(10); // wait for 2 frames
    collectionListMounted = true;
  });

  let showfilterDropdown: boolean = false;
  let searchData: string = "";
  let addButtonMenu: boolean = false;
  let activeWorkspace: WorkspaceDocument;
  let currentWorkspaceId = "";
  let currentWorkspaceName: string = "";
  let isWorkspaceTabOpen: boolean = false;

  const currentWorkspaceSubscriber = currentWorkspace.subscribe((value) => {
    if (value?._data) {
      currentWorkspaceName = value._data.name;
      currentWorkspaceId = value._data._id;
      activeWorkspace = value;
    }
  });

  $: {
    isWorkspaceTabOpen =
      activeTabType === TabTypeEnum.WORKSPACE &&
      activeTabId === currentWorkspaceId;
  }

  $: {
    if (userRole === WorkspaceRole.WORKSPACE_VIEWER) {
      isExpandCollection.set(true);
    }
  }

  // export let isExpandCollection = false;
  // export let isExpandEnvironment = false;
  // export let isExpandTestflow = false;

  let isExpandCollectionLine = false;
  let isExpandEnviromentLine = false;
  let isExpandTestflowLine = false;

  const handleExpandCollectionLine = () => {
    isExpandCollectionLine = !isExpandCollectionLine;
    // console.log(isExpandCollectionLine);
  };
  const handleExpandEnviromentLine = () => {
    isExpandEnviromentLine = !isExpandEnviromentLine;
  };
  const handleTestflowLine = () => {
    isExpandTestflowLine = !isExpandTestflow;
  };

  // $: {
  //   if (isExpandCollectionLine) {
  //     isExpandCollectionLine = false;
  //   }
  //   if (isExpandEnviromentLine) {
  //     isExpandEnviromentLine = false;
  //   }
  //   if (isExpandTestflowLine) {
  //     isExpandTestflowLine = false;
  //   }
  // }

  let isBackgroundClickable = true;

  $: {
    if ($currentStep === 2 && $isTestFlowTourGuideOpen) {
      isBackgroundClickable = false;
    } else {
      isBackgroundClickable = true;
      addButtonMenu = false;
    }
  }

  onDestroy(() => {
    currentWorkspaceSubscriber.unsubscribe();
  });

  const addButtonData = isWebApp
    ? [
        {
          name: "Add Collection",
          icon: CollectionIcon,
          iconColor: "var(--icon-secondary-130)",
          iconSize: "13px",
          onclick: () => {
            if (isGuestUser) {
              onItemCreated("collection", {
                workspaceId: currentWorkspaceId,
                collection: collectionList,
              });
            } else {
              showImportCollectionPopup();
            }
            isExpandCollection.set(true);
          },
        },
        ...(!isGuestUser
          ? [
              {
                name: "Add Mock Collection",
                icon: DatabaseStackRegular,
                iconColor: "var(--icon-secondary-130)",
                iconSize: "13px",
                onclick: () => {
                  onItemCreated("mockCollection", {
                    workspaceId: currentWorkspaceId,
                    collection: collectionList,
                  });
                  isExpandCollection.set(true);
                },
              },
            ]
          : []),
        {
          name: `Add ${HttpRequestDefaultNameBaseEnum.NAME}`,
          icon: VectorIcon,
          iconColor: "var(--icon-secondary-130)",
          iconSize: "12px",
          onclick: () => onItemCreated("request", {}),
        },
        {
          name: "Import cURL",
          icon: BubbleIcon,
          iconColor: "var(--icon-secondary-130)",
          iconSize: "15px",
          onclick: () => {
            MixpanelEvent(Events.IMPORT_CURL, {
              source: "curl import popup",
            });
            showImportCurlPopup();
          },
        },
        {
          name: `Add AI Request`,
          icon: BotRegular,
          iconColor: "var(--icon-secondary-130)",
          iconSize: "16px",
          endIcon: BetaVectorIcon,
          onclick: () => {
            onItemCreated("aiRequest", {});
            // MixpanelEvent(Events.Add_WebSocket);
          },
        },
        {
          name: "Add WebSocket",
          icon: SocketIcon,
          iconColor: "var(--icon-secondary-130)",
          iconSize: "15px",
          onclick: () => {
            onItemCreated("web-socket", {});
            MixpanelEvent(Events.Add_WebSocket);
          },
        },
        {
          name: `Add ${SocketIORequestDefaultAliasBaseEnum.NAME}`,
          icon: SocketIoIcon,
          iconColor: "var(--icon-secondary-130)",
          iconSize: "14px",
          onclick: () => {
            onItemCreated("socket-io", {});
            MixpanelEvent(Events.Add_SocketIO, {
              description: "Add Socket.IO From + Icon in Left Panel",
            });
          },
        },
        {
          name: `Add ${GraphqlRequestDefaultAliasBaseEnum.NAME}`,
          icon: GraphIcon,
          iconColor: "var(--icon-secondary-130)",
          iconSize: "14px",
          onclick: () => {
            onItemCreated("graphql", {});
            MixpanelEvent(Events.Add_GraphQL, {
              description: "Add GraphQL From + Icon in Left Panel",
            });
          },
        },
        {
          name: "Add Environment",
          icon: StackIcon,
          iconColor: "var(--icon-secondary-130)",
          iconSize: "15px",
          onclick: () => {
            isExpandEnvironment.set(true);
            onCreateEnvironment();
          },
        },

        {
          name: `Add ${TFDefaultEnum.FULL_NAME}`,
          icon: TreeIcon,
          iconColor: "var(--icon-secondary-130)",
          iconSize: "15px",
          onclick: () => {
            onCreateTestflow();
            MixpanelEvent(Events.LeftPanel_Plus_Icon);
            isExpandTestflow.set(true);
          },
          isHoverConstant: false,
        },
      ]
    : [
        {
          name: "Add Collection",
          icon: CollectionIcon,
          iconColor: "var(--icon-secondary-130)",
          iconSize: "13px",
          onclick: () => {
            if (isGuestUser) {
              onItemCreated("collection", {
                workspaceId: currentWorkspaceId,
                collection: collectionList,
              });
            } else {
              showImportCollectionPopup();
            }
            isExpandCollection.set(true);
          },
        },
        ...(!isGuestUser
          ? [
              {
                name: "Add Mock Collection",
                icon: DatabaseStackRegular,
                iconColor: "var(--icon-secondary-130)",
                iconSize: "13px",
                onclick: () => {
                  onItemCreated("mockCollection", {
                    workspaceId: currentWorkspaceId,
                    collection: collectionList,
                  });
                  isExpandCollection.set(true);
                },
              },
            ]
          : []),
        {
          name: `Add ${HttpRequestDefaultNameBaseEnum.NAME}`,
          icon: VectorIcon,
          iconColor: "var(--icon-secondary-130)",
          iconSize: "12px",
          onclick: () => onItemCreated("request", {}),
        },
        {
          name: "Import cURL",
          icon: BubbleIcon,
          iconColor: "var(--icon-secondary-130)",
          iconSize: "15px",
          onclick: () => {
            MixpanelEvent(Events.IMPORT_CURL, {
              source: "curl import popup",
            });
            showImportCurlPopup();
          },
        },
        {
          name: `Add AI Request`,
          icon: BotRegular,
          iconColor: "var(--icon-secondary-130)",
          iconSize: "16px",
          endIcon: BetaVectorIcon,
          onclick: () => {
            onItemCreated("aiRequest", {});
            // MixpanelEvent(Events.Add_WebSocket);
          },
        },
        {
          name: "Add WebSocket",
          icon: SocketIcon,
          iconColor: "var(--icon-secondary-130)",
          iconSize: "15px",
          onclick: () => {
            onItemCreated("web-socket", {});
            MixpanelEvent(Events.Add_WebSocket);
          },
        },
        {
          name: `Add ${SocketIORequestDefaultAliasBaseEnum.NAME}`,
          icon: SocketIoIcon,
          iconColor: "var(--icon-secondary-130)",
          iconSize: "14px",
          onclick: () => {
            onItemCreated("socket-io", {});
            MixpanelEvent(Events.Add_SocketIO, {
              description: "Add Socket.IO From + Icon in Left Panel",
            });
          },
        },
        {
          name: `Add ${GraphqlRequestDefaultAliasBaseEnum.NAME}`,
          icon: GraphIcon,
          iconColor: "var(--icon-secondary-130)",
          iconSize: "14px",
          onclick: () => {
            onItemCreated("graphql", {});
            MixpanelEvent(Events.Add_GraphQL, {
              description: "Add GraphQL From + Icon in Left Panel",
            });
          },
        },
        {
          name: "Add Environment",
          icon: StackIcon,
          iconColor: "var(--icon-secondary-130)",
          iconSize: "15px",
          onclick: () => {
            isExpandEnvironment.set(true);
            onCreateEnvironment();
          },
        },
        {
          name: `Add ${TFDefaultEnum.FULL_NAME}`,
          icon: TreeIcon,
          iconColor: "var(--icon-secondary-130)",
          iconSize: "15px",
          onclick: () => {
            onCreateTestflow();
            MixpanelEvent(Events.LeftPanel_Plus_Icon);
            isExpandTestflow.set(true);
          },
          isHoverConstant: false,
        },
      ];

  const toggleExpandCollection = () => {
    isExpandCollection.update((value) => !value);
  };

  const toggleExpandEnvironment = () => {
    isExpandEnvironment.update((value) => !value);
  };
  const toggleExpandTestflow = () => {
    isExpandTestflow.update((value) => !value);
  };

  const toggleTourGuideActive = () => {
    addButtonData.forEach((option) => {
      if (option.hasOwnProperty("isHoverConstant")) {
        option.isHoverConstant = !option.isHoverConstant; // Toggle the value
      }
    });
  };

  const formatVersion = (version) => {
    try {
      const parts = version.split(".");
      const major = parts[0];
      const minor = parts[1];
      const patch = parts[2];

      return patch === "0" ? `${major}.${minor}` : `${major}.${minor}.${patch}`;
    } catch (error) {
      return version;
    }
  };

  let ActiveTab = "";

  const handleTabUpdate = (tabName: string) => {
    ActiveTab = tabName;
  };
</script>

{#if leftPanelController.leftPanelCollapse}
  <div>
    <span
      class="d-flex align-items-center justify-content-center border-0 angleRight w-16 position-absolute {leftPanelController.leftPanelCollapse
        ? 'd-block'
        : 'd-none'}"
      style="left:57px; bottom: 15px; width: 20px; height:20px; background-color:transparent; z-index: {leftPanelController.leftPanelCollapse
        ? '2'
        : '0'}"
      on:click={() => {
        leftPanelController.leftPanelCollapse =
          !leftPanelController.leftPanelCollapse;
        leftPanelController.handleCollapseCollectionList();
      }}
    >
      <Tooltip title={"Expand"} placement={"right-center"}>
        <Button
          type="teritiary-regular"
          size="extra-small"
          customWidth="24px"
          startIcon={ChevronDoubleRightRegular}
        />
      </Tooltip>
    </span>
  </div>
{/if}
{#if !leftPanelController.leftPanelCollapse}
  <div
    style="overflow-x: auto; overflow-y: auto ; position:relative; background-color:var(--bg-ds-surface-700); "
    class={`sidebar h-100 d-flex flex-column  scroll`}
  >
    <div
      class="d-flex justify-content-between align-items-center align-self-stretch px-0 pt-3 d-none"
    >
      <p class="mb-0 text-whiteColor ellipsis text-fs-16">
        {$currentWorkspace?.name || ""}
      </p>
      <button
        class=" border-0 rounded px-2 angleButton"
        on:click={() => {
          leftPanelController.leftPanelCollapse =
            !leftPanelController.leftPanelCollapse;
          leftPanelController.handleCollapseCollectionList();
        }}
        id="doubleAngleButton"
      >
        <img src={doubleangleLeft} alt="" class="filter-green" />
      </button>
    </div>

    <div
      class="d-flex align-items-center justify-content-between px-2 pt-3 gap-2"
    >
      <Search
        id="collection-list-search"
        variant={"primary"}
        size="small"
        bind:value={searchData}
        on:input={() => {
          isExpandCollection.set(true);
          isExpandEnvironment.set(true);
          isExpandTestflow.set(true);
        }}
        placeholder={"Search"}
      />
      {#if userCount > 1 && !activeWorkspace?.isShared}
        <Tooltip title={"Refresh"} placement={"bottom-center"}>
          <Button
            type="secondary"
            startIcon={refreshLoad ? "" : ArrowClockWiseRegular}
            size="small"
            loader={refreshLoad}
            onClick={refreshWorkspace}
          />
        </Tooltip>
      {/if}
      <div class="d-flex align-items-center justify-content-center d-none">
        <button
          id="filter-btn"
          class="filter-btn btn bg-backgroundDark d-flex align-items-center justify-content-center p-2 d-none
          {showfilterDropdown ? 'filter-active' : ''}"
          style="width: 32px; height:32px; position:relative"
          on:click={() => (showfilterDropdown = !showfilterDropdown)}
        >
          <FilterIcon width={300} height={30} color="gray" />
          {#if showfilterDropdown}
            <span
              class="position-absolute"
              style="right:4px; top:5px; height:4px; width:4px; background-color:#FF7878; border-radius: 50%;"
            />
          {/if}
        </button>
      </div>
      <!--  
        New dropdown button for adding new api, collection and import Curl
      -->
      <div id="options-container">
        {#if userRole !== WorkspaceRole.WORKSPACE_VIEWER && !activeWorkspace?.isShared}
          <Dropdown
            zIndex={600}
            buttonId="addButton"
            bind:isBackgroundClickable
            bind:isMenuOpen={addButtonMenu}
            options={addButtonData}
          >
            <Tooltip
              title={"Add Options"}
              placement={"bottom-center"}
              distance={12}
              show={!addButtonMenu}
              zIndex={10}
            >
              <!-- <button
              id="addButton"
              class="border-0 p-1 border-radius-2 add-button"
              on:click={() => {
                addButtonMenu = !addButtonMenu;
              }}
            > -->
              <!--               
              <img src={plusIcon} alt="" />
            </button> -->
              <Button
                type="primary"
                id="addButton"
                size={"small"}
                startIcon={AddRegular}
                onClick={() => {
                  addButtonMenu = !addButtonMenu;
                }}
              />
            </Tooltip>
          </Dropdown>
        {/if}
      </div>

      {#if $isTestFlowTourGuideOpen && $currentStep == 1}
        <div
          style="position:fixed; top:96px; left:{isWebApp
            ? '335px'
            : '310px'}; z-index:9999;"
        >
          <TestFlowTourGuide
            targetIds={["addButton"]}
            title="Welcome to Test Flow!"
            description={`Let’s begin by creating your first flow. Click the ‘+ Add’ button to get started.`}
            CardNumber={1}
            totalCards={7}
            onNext={() => {
              currentStep.set(2);
              addButtonMenu = true;
              toggleTourGuideActive();
            }}
            onClose={() => {
              isTestFlowTourGuideOpen.set(false);
            }}
          />
        </div>
      {/if}

      {#if $isTestFlowTourGuideOpen && $currentStep == 2}
        <div
          style="position:fixed; top:{isWebApp
            ? '330px'
            : '340px'}; left:{isWebApp ? '620px' : '550px'}; z-index:9999;"
        >
          <TestFlowTourGuide
            targetIds={["dropdown-items"]}
            title="Add Your Flow"
            description={`Click ‘Add Test Flow’ to instantly create a new flow. It’s that simple—your workspace is ready!`}
            CardNumber={2}
            totalCards={7}
            onNext={() => {
              currentStep.set(3);
              onCreateTestflow();
              isExpandTestflow.set(true);
              toggleTourGuideActive();
            }}
            onClose={() => {
              isTestFlowTourGuideOpen.set(false);
            }}
          />
        </div>
      {/if}
    </div>
    {#if !isGuestUser}
      <div
        class="d-flex flex-row justify-content-between align-items-center border-radius-2 collection-container {isWorkspaceTabOpen
          ? 'selected'
          : ''}"
        style="cursor:pointer; margin-top:5px;margin: 5px 5px 0 7px; height:32px;"
        tabindex="0"
        on:click={() => {
          // Open workspace tab when clicked
          if ($currentWorkspace) {
            onOpenWorkspace($currentWorkspace._id);
          }
        }}
      >
        <div class="d-flex flex-row align-items-center flex-grow-1">
          <span style="display: flex; margin-left:5px;">
            <WorkspaceRegular size="16px" color="var(--text-ds-neutral-50)" />
          </span>
          <span
            class="ms-2 text-ds-font-size-12 text-ds-font-weight-semi-bold text-truncate"
            style="max-width: 110px;"
          >
            {currentWorkspaceName}
          </span>
        </div>
        <span class="button-container">
          <ArrowRightRegular size="16px" color="var(--text-ds-neutral-50)" />
        </span>
      </div>

      <hr class="my-1 ms-1 me-1" />
    {/if}

    <!-- LHS Side of Collection Enivironment & Test Flows -->
    <div
      class="d-flex flex-column collections-list"
      style="overflow:hidden; margin-top:{isGuestUser ? '5px' : '0'};  flex:1; "
    >
      <!-----Collection Section------>
      <div
        class="ps-1"
        style=" overflow:auto; {$isExpandCollection ? 'flex:2;' : ''}"
      >
        {#if true}
          <CollectionList
            bind:scrollList
            bind:userRole
            bind:isFirstCollectionExpand
            {onRefetchCollection}
            {showImportCurlPopup}
            {collectionList}
            {isGuestUser}
            {currentWorkspace}
            {userRoleInWorkspace}
            {activeTabPath}
            {activeTabId}
            {activeTabType}
            {showImportCollectionPopup}
            {onItemCreated}
            {onItemDeleted}
            {onItemRenamed}
            {onItemOpened}
            {onBranchSwitched}
            {searchData}
            {toggleExpandCollection}
            {isExpandCollectionLine}
            {handleExpandCollectionLine}
            {isWebApp}
            {ActiveTab}
            {handleTabUpdate}
            {onCompareCollection}
            {onSyncCollection}
            {onUpdateRunningState}
            {onCreateMockCollection}
          />
        {/if}
      </div>

      <hr class="my-1 ms-1 me-1" />

      <!-- Environment Section -->

      <div
        class="ps-1"
        style=" overflow:auto; {$isExpandEnvironment ? 'flex:1;' : ''}"
      >
        <EnvironmentList
          loggedUserRoleInWorkspace={userRole}
          {onCreateEnvironment}
          {onOpenGlobalEnvironment}
          {onDeleteEnvironment}
          {onUpdateEnvironment}
          {onOpenEnvironment}
          {onSelectEnvironment}
          currentWorkspace={activeWorkspace}
          environments={$environments}
          {searchData}
          {activeTabId}
          {activeTabType}
          {toggleExpandEnvironment}
          {ActiveTab}
          {handleTabUpdate}
        />
      </div>

      <hr class="my-1 ms-1 me-1" />

      <!-- Testflow Section -->

      <div
        class="ps-1"
        style=" overflow:auto; {$isExpandTestflow ? 'flex:1;' : ''}"
      >
        <TestflowList
          testflows={$testflows}
          loggedUserRoleInWorkspace={userRole}
          {onCreateTestflow}
          {onDeleteTestflow}
          {onUpdateTestflow}
          {onOpenTestflow}
          currentWorkspace={activeWorkspace}
          {searchData}
          {activeTabId}
          {activeTabType}
          {toggleExpandTestflow}
          {isExpandTestflowLine}
          {handleTestflowLine}
          {ActiveTab}
          {handleTabUpdate}
        />
      </div>

      <hr class="my-1 ms-1 me-1" />

      <!-- <hr class="mt-1 mb-0 ms-1 me-0" /> -->
    </div>

    <!-- Github Data footer -->

    <!-- <hr class="ms-2 me-2 mb-0 mt-0" /> -->
    <div
      class="p-2 d-flex align-items-center justify-content-between"
      style="z-index: 4;"
    >
      <Tooltip title={"Star Us On GitHub"} placement={"top-center"}>
        <GithubStarRedirect
          onClick={navigateToGithub}
          count={githubRepo?.stargazers_count || ""}
        />
      </Tooltip>

      <div class="d-flex align-items-center">
        <!--Disabling the version feature switch as it was just for testing purpose, can be used for implementation example-->
        <!-- {#if isAppVersionVisible} -->
        {#if !isWebApp}
          <span class="text-fs-14 text-secondary-200 pe-2"
            >v{formatVersion(appVersion)}</span
          >
        {/if}

        <!-- {/if} -->
        <Button
          size="extra-small"
          type="teritiary-regular"
          startIcon={ChevronDoubleLeftRegular}
          onClick={() => {
            leftPanelController.leftPanelCollapse =
              !leftPanelController.leftPanelCollapse;
            leftPanelController.handleCollapseCollectionList();
          }}
          disable={false}
          loader={false}
        />
      </div>
    </div>

    <!-- Launch sparrow desktop -->
    {#if isWebApp}
      <LaunchDesktop {launchSparrowWebApp} />
    {/if}
  </div>
{/if}

<style>
  .collection-container .button-container {
    visibility: hidden;
    flex-shrink: 0;
    margin-left: auto;
    padding-right: 8px;
  }

  .collection-container:hover .button-container {
    visibility: visible;
  }

  .collection-container:hover {
    background-color: var(--bg-ds-surface-400);
    border-radius: 4px;
  }

  .collection-container.selected {
    background-color: var(--bg-ds-surface-500);
    border-radius: 4px;
  }

  .collection-container.selected:hover {
    background-color: var(--bg-ds-surface-500);
  }

  .button-container:hover {
    background-color: transparent;
  }

  .not-opened-any {
    height: 40px;
  }
  .full-height {
    height: calc(100% - 80px);
  }

  .half-height {
    height: 33%;
  }
  .half-height2 {
    height: calc((100% - 40px) / 2);
  }

  .add-button {
    background-color: var(--dropdown-button);
  }

  .add-button:hover {
    background-color: var(--dropdown-hover);
  }

  .view-active {
    filter: invert(98%) sepia(99%) saturate(24%) hue-rotate(160deg)
      brightness(107%) contrast(100%);
  }

  .view-active:hover {
    filter: invert(100%) sepia(100%) saturate(14%) hue-rotate(212deg)
      brightness(104%) contrast(104%);
  }

  .angleRight {
    background-color: var(--blackColor);
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
  }
  .angleRight:hover {
    color: var(--blackColor);
    font-weight: 600;
  }

  .angleRight:active {
    color: var(--white-color);
    /* background-color: var(--button-pressed); */
  }
  .angleButton {
    background-color: var(--background-color);
    cursor: pointer;
  }

  .angleButton:hover {
    background-color: var(--workspace-hover-color);
  }

  .angleButton:active {
    background-color: var(--button-pressed);
  }

  /* 
  @keyframes increaseWidth {
    0% {
      width: 0;
    }

    100% {
      width: 280px;
    }
  }
  @keyframes decreaseWidth {
    0% {
      width: 280px;
    }
    100% {
      width: 0px;
    }
  } */

  .decrease-width {
    animation: decreaseWidth 0.3s;
    /* width: 0; */
    /* max-width: 280px; */
  }
  .increase-width {
    animation: increaseWidth 0.3s;
    /* max-width: 280px; */
  }
  .spinner {
    width: 100%;
    height: 70vh;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }
  .searchField {
  }
  .filter-btn {
    /* border: 1px solid var(--border-color) !important; */
  }
  .filter-active {
    background-color: var(--send-button) !important;
  }
</style>
