<script lang="ts">
  import { onDestroy } from "svelte";
  import Card from "../card/Card.svelte";
  import MenuView from "../menu-view/MenuView.svelte";
  import {
    ArrowForward,
    GlobeRegular,
    LinkRegular,
    LockClosedRegular,
    StatusSuccess,
  } from "@sparrow/library/icons";
  import { MoreVerticalRegular } from "@sparrow/library/icons";
  // import Tags from "@sparrow-library/src/ui/tags/Tags.svelte";
  import { Tag } from "@sparrow/library/ui";
  import { WorkspaceType } from "@sparrow/common/enums";
  import { Tooltip } from "@sparrow/library/ui";
  import { Button } from "@sparrow/library/ui";

  export let workspace: any;
  export let isAdminOrOwner: boolean;
  export let onSwitchWorkspace: (id: string) => void;
  export let onDeleteWorkspace;
  export let onAddMember;
  export let openInDesktop: (workspaceID: string) => void;
  export let isWebEnvironment: boolean;
  export let onCopyLink;

  let pos = { x: 0, y: 0 };
  let showMenu: boolean = false;
  let workspaceTabWrapper: HTMLElement;
  let menuItems = [];
  let noOfColumns = 180;
  let noOfRows = 3;
  let isWorkspaceLinkCopied = false;
  export let cardType: "teams" | "marketplace" = "teams";

  const handleOpenWorkspace = async () => {
    onSwitchWorkspace(workspace._id);
  };

  const handleWindowClick = (event) => {};

  window.addEventListener("click", handleWindowClick);

  onDestroy(() => {
    window.removeEventListener("click", handleWindowClick);
  });

  const rightClickContextMenu = (e) => {
    e.preventDefault();
    setTimeout(() => {
      const mouseX = workspaceTabWrapper.getBoundingClientRect().right - 180;
      const mouseY = workspaceTabWrapper.getBoundingClientRect().top + 30;
      pos = { x: mouseX, y: mouseY };
      showMenu = true;
    }, 100);
  };

  $: {
    if (isAdminOrOwner) {
      menuItems = [
        {
          onClick: () => {
            handleOpenWorkspace();
          },
          displayText: "Open Workspace",
          disabled: false,
        },
        {
          onClick: () => {
            onAddMember({
              workspaceID: workspace._id,
              workspaceName: workspace.name,
              users: workspace.users,
            });
          },
          displayText: "Add Members",
          disabled: false,
        },
        {
          onClick: () => {
            onDeleteWorkspace(workspace);
          },
          displayText: "Delete Workspace",
          disabled: false,
        },
      ];
    } else {
      menuItems = [
        {
          onClick: () => {
            handleOpenWorkspace();
          },
          displayText: "Open Workspace",
          disabled: false,
        },
      ];
    }
  }

  function closeRightClickContextMenu() {
    showMenu = false;
  }
  const formateUpdateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(seconds / 3600);
    const days = Math.floor(seconds / 86400);
    const months = Math.floor(days / 30); // Approximation

    if (seconds < 60) {
      return "just now";
    } else if (minutes < 60) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (days < 30) {
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (months) {
      return `${months} month${months > 1 ? "s" : ""} ago`;
    } else {
      return ``;
    }
  };
</script>

<svelte:window
  on:click={closeRightClickContextMenu}
  on:contextmenu|preventDefault={closeRightClickContextMenu}
/>

{#if showMenu}
  <MenuView xAxis={pos.x} yAxis={pos.y} {noOfRows} {noOfColumns} {menuItems} />
{/if}

<div class="workspace-card-outer w-100">
  <Card
    cardClassProp={"flex-grow-1 col-lg-3 col-md-10  position-relative"}
    cardStyleProp={"max-width: 32.8%; max-height: 32%;"}
  >
    <div class="d-flex gap-1 position-absolute" style="top:20px; right:16px;">
      {#if workspace?.workspaceType === WorkspaceType.PUBLIC}
        {#if isWorkspaceLinkCopied}
          <div
            class="border-0 rounded d-flex justify-content-center align-items-center justify-content-center p-2 public-link-icon"
          >
            <StatusSuccess
              height="14"
              width="14"
              color="var(--icon-ds-success-400)"
            />
          </div>
        {:else}
          <div
            class="border-0 rounded d-flex justify-content-center align-items-center public-link-icon"
          >
            <Tooltip
              placement="top-center"
              distance={10}
              title="Copy Public Link"
            >
              <Button
                startIcon={LinkRegular}
                type={"teritiary-regular"}
                size={"small"}
                onClick={async () => {
                  await onCopyLink(workspace._id);
                  isWorkspaceLinkCopied = true;
                  setTimeout(() => {
                    isWorkspaceLinkCopied = false;
                  }, 2000);
                }}
              />
            </Tooltip>
          </div>
        {/if}
      {/if}

      {#if cardType === "teams"}
        <div
          class="threedot-icon-container border-0 rounded d-flex justify-content-center align-items-center {showMenu
            ? 'threedot-active'
            : ''}"
          bind:this={workspaceTabWrapper}
        >
          <Button
            type={"teritiary-regular"}
            size={"small"}
            startIcon={MoreVerticalRegular}
            onClick={(e) => rightClickContextMenu(e)}
          />
        </div>
      {/if}
    </div>
    <div
      class="bg-tertiary-750 workspace-card p-4"
      tabindex="0"
      on:click={() => {
        handleOpenWorkspace();
      }}
      style={`${
        showMenu ? "background-color: var(--bg-tertiary-600) !important;" : null
      }`}
      on:contextmenu|preventDefault={(e) => rightClickContextMenu(e)}
    >
      <div>
        <div class="d-flex flex-column" style="gap: 10px">
          {#if cardType === "teams"}
            <div class="d-flex" style="justify-content: space-between;">
              {#if workspace?.workspaceType === WorkspaceType.PUBLIC}
                <Tag
                  text={WorkspaceType.PUBLIC}
                  type="green"
                  endIcon={GlobeRegular}
                />
              {:else}
                <Tag
                  text={WorkspaceType.PRIVATE}
                  type="cyan"
                  endIcon={LockClosedRegular}
                />
              {/if}
            </div>
          {/if}

          <div
            class="d-flex overflow-hidden justify-content-between"
            style={isWebEnvironment ? "width:calc(100% - 60px);" : ""}
          >
            <div
              class="ellipsis overflow-hidden"
              style={`
                  ${cardType === "teams" ? "margin-bottom: 8px" : ""}
                `}
            >
              <span
                class="text-ds-font-size-20 text-ds-line-height-150 text-ds-font-weight-medium"
                style=" color:var(--text-ds-neutral-50)">{workspace.name}</span
              >
            </div>
          </div>
        </div>
      </div>
      {#if cardType != "teams"}
        <span
          class="ellipsis overflow-hidden text-ds-font-size-12 text-ds-font-weight-semi-bold"
          style="color: var(--text-ds-primary-300); display: block; margin-bottom: 5px; margin-top:3px;"
          >By {workspace.team.name}</span
        >
      {/if}
      <p
        class="teams-workspace__para mb-1"
        style={`${
          showMenu ? "color: var(--sparrow-text-color) !important;" : null
        }`}
      >
        <span
          >{cardType === "teams"
            ? workspace?.collections?.length
            : (workspace?.collection?.length ?? 0)}</span
        >
        <span
          class="text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium"
          style="color:var(--text-secondary-200)"
        >
          Collections
        </span>
      </p>
      <p
        class="ellipsis text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium"
        style="color:var(--text-secondary-200)"
      >
        {workspace?.description ? workspace.description : "No summary added"}
      </p>
      <hr style="color: var(--border-ds-surface-50);" />

      <div class="d-flex justify-content-between">
        <p
          class="teams-workspace__date mb-0"
          style={`${
            showMenu ? "color: var(--sparrow-text-color) !important;" : null
          }`}
        >
          <span
            class="text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium"
            style=" color:var(--text-secondary-200); margin-right: 5px;"
            >Last updated
          </span><span
            class="text-ds-font-size-12 text-ds-line-height-150 text-ds-font-weight-semi-bold"
            style=" color:var(--text-ds-neutral-50)"
            >{formateUpdateTime(workspace?.updatedAt)}</span
          >
        </p>

        {#if isWebEnvironment && !workspace?.isShared && cardType === "teams"}
          <button
            class="me-2 open-desktop-btn border-0 rounded d-flex justify-content-center align-items-center text-decoration-underline"
            on:click|stopPropagation={() => {
              openInDesktop(workspace._id);
            }}
          >
            Open in Desktop
            <div class="arrow-up">
              <ArrowForward
                width={"19px"}
                height={"19px"}
                color={"var(--icon-primary-300)"}
              />
            </div>
          </button>
        {/if}
      </div>
    </div>
  </Card>
</div>

<style lang="scss">
  .workspace-card-outer {
    display: contents;
  }

  .arrow-up {
    position: relative;
    top: -5px;
  }

  .workspace-card-outer:hover .workspace-card {
    background-color: var(--bg-ds-surface-400);
    cursor: pointer;
  }
  .workspace-card {
    background-color: var(--bg-ds-surface-600);
    z-index: 0 !important;
    border-radius: 8px;
    cursor: pointer;
  }
  .workspace-card:hover {
    transition: background-color 0.5s ease-in-out;
  }
  .workspace-card:active {
    background-color: var(--bg-ds-surface-600) !important;
  }
  .workspace-card:focus-visible {
    border: 2px solid var(--border-ds-primary-300);
    background-color: var(--bg-ds-surface-600);
    outline: none;
  }
  .workspace-card-outer:hover .workspace-card .teams-workspace__para,
  .workspace-card-outer:hover .workspace-card .teams-workspace__date {
    color: var(--sparrow-text-color) !important;
  }
  .teams-workspace__para {
    font-size: 12px;
    color: var(--text-secondary-200);
  }
  .teams-workspace__para span {
    color: var(--text-primary-300);
    font-size: 16px;
  }
  .teams-workspace__date {
    color: var(--text-secondary-200);
    font-size: 16px;
  }
  .teams-workspace__date span {
    color: var(--text-secondary-110);
  }
  .threedot-icon-container {
    visibility: hidden;
    background-color: transparent;
  }
  .public-link-icon {
    visibility: hidden;
    background-color: transparent;
  }
  .workspace-card-outer:hover .threedot-icon-container {
    visibility: visible;
  }
  .threedot-icon-container:hover {
    background-color: var(--bg-tertiary-500) !important;
  }
  .threedot-icon-container:active {
    background-color: var(--bg-tertiary-800) !important;
  }
  .workspace-card-outer:hover .public-link-icon {
    visibility: visible;
  }
  .public-link-txt {
    visibility: hidden;
    background-color: transparent;
  }
  .workspace-card-outer:hover .public-link-txt {
    visibility: visible;
  }
  .threedot-active {
    visibility: visible;
    background-color: var(--bg-tertiary-800) !important;
  }

  .open-desktop-btn {
    font-size: 12px;
    font-weight: 500;
    background-color: var(--color-primary);
    color: #3670f7;
    padding: 5px 10px;
    visibility: hidden;
    opacity: 0;
    transition:
      opacity 0.3s ease,
      visibility 0.3s;
  }
  .workspace-card-outer:hover .open-desktop-btn {
    visibility: visible;
    opacity: 1;
  }
  .open-desktop-btn:hover {
    background-color: var(--color-primary-dark);
  }

  .workspace-delete-confirmation {
    .btn-close1 {
      background-color: var(--background-color);
    }

    .btn-close1:hover {
      background-color: var(--background-dropdown);
    }

    .btn-close1:active {
      background-color: var(--background-dropdown);
    }
    .btn-primary {
      background-color: var(--border-color);
    }

    .btn-primary:hover {
      color: var(--blackColor);
      background-color: var(--workspace-hover-color);
    }

    .btn-primary:active {
      color: var(--blackColor);
      background-color: var(--button-pressed);
    }

    .btn-secondary {
      background-color: var(--dangerColor);
    }

    .btn-secondary:hover {
      background-color: var(--delete-hover);
    }
    .team-icon {
      height: 24px;
      width: 24px;
    }
    .asterik {
      color: var(--dangerColor);
      margin-left: 4px;
    }
    .input-container {
      background-color: var(--background-dropdown);
      padding: 8px;
      border-radius: 4px;
      border: 1px solid var(--border-color) !important;
      width: 100%;
    }
    .error-text {
      margin-top: 2px;
      margin-bottom: 0 !important;
      color: var(--error--color);
    }
    .error-border {
      border: 1px solid var(--error--color) !important;
    }
  }
</style>
