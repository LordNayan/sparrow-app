<script lang="ts">
  // ---- Components
  import { Spinner } from "@sparrow/library/ui";
  import { Modal } from "@sparrow/library/ui";
  import { Button } from "@sparrow/library/ui";
  import { Tooltip } from "@sparrow/library/ui";
  import { Options } from "@sparrow/library/ui";

  import { captureEvent } from "@app/utils/posthog/posthogConfig";
  import { HttpRequestDefaultNameBaseEnum } from "@sparrow/common/types/workspace/http-request-base";

  // ---- Helper functions
  import { getMethodStyle } from "@sparrow/common/utils/conversion.helper";

  import { UntrackedItems, WorkspaceRole } from "@sparrow/common/enums";

  import { reloadSyncIcon } from "@sparrow/library/assets";

  import type {
    CollectionBaseInterface,
    CollectionItemBaseInterface,
  } from "@sparrow/common/types/workspace/collection-base";
  import { HttpRequestMethodBaseEnum } from "@sparrow/common/types/workspace/http-request-base";
  import { MoreHorizontalRegular } from "@sparrow/library/icons";

  /**
   * Callback for Item Deleted
   * @param entityType - type of item to delete like request/folder
   * @param args - Arguments to pass on delete
   */
  export let onItemDeleted: (entityType: string, args: any) => void;
  /**
   * Callback for Item Rename
   * @param entityType - type of item to rename like request/folder
   * @param args - Arguments to pass on rename
   */
  export let onItemRenamed: (entityType: string, args: any) => void;
  /**
   * Callback for Item Open
   * @param entityType - type of item to open like request/folder
   * @param args - Arguments to pass on open
   */
  export let onItemOpened: (entityType: string, args: any) => void;
  /**
   * Whole Collection Document
   */
  export let collection: CollectionBaseInterface;
  /**
   * Selected folder details
   */
  export let folder: CollectionItemBaseInterface | null;
  /**
   * Selected API details
   */
  export let api: CollectionItemBaseInterface;
  /**
   * Current Tab Path
   */
  export let activeTabId: string;

  /**
   * Role of user in workspace
   */
  export let userRole;

  export let request;

  let isDeletePopup: boolean = false;
  let showMenu: boolean = false;
  let noOfColumns = 180;
  let inputField: HTMLInputElement;
  let isRenaming = false;
  let deleteLoader: boolean = false;

  let requestTabWrapper: HTMLElement;

  function rightClickContextMenu(e: Event) {
    setTimeout(() => {
      showMenu = !showMenu;
    }, 100);
  }

  function handleSelectClick(event: MouseEvent) {
    const selectElement = document.getElementById(`show-more-api-${api.id}`);
    if (selectElement && !selectElement.contains(event.target as Node)) {
      showMenu = false;
    }
  }

  const handleresponseEvent = ({
    event_title,
    event_name,
  }: {
    event_title: string;
    event_name: string;
  }) => {
    captureEvent(event_title, {
      component: "SavedRequest",
      button_text: event_name,
      destination: event_name,
    });
  };
  let newRequestName: string = "";

  const handleRenameInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    newRequestName = target.value.trim();
  };

  const onRenameBlur = async () => {
    if (newRequestName) {
      await onItemRenamed("saved_request", {
        workspaceId: collection.workspaceId,
        collection,
        folder: folder ? folder : { id: "" },
        request: request,
        requestResponse: api,
        newName: newRequestName,
      });
    }
    isRenaming = false;
    newRequestName = "";
  };

  const onRenameInputKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      const inputField = document.getElementById(
        "renameInputFieldFile",
      ) as HTMLInputElement;
      inputField.blur();
    }
  };
</script>

<svelte:window
  on:click={handleSelectClick}
  on:contextmenu|preventDefault={handleSelectClick}
/>

<Modal
  title={"Delete Response?"}
  type={"danger"}
  width={"35%"}
  zIndex={1000}
  isOpen={isDeletePopup}
  handleModalState={() => (isDeletePopup = false)}
>
  <div
    class="text-lightGray mb-1 text-ds-font-size-14 text-ds-font-weight-medium"
  >
    <p>
      Are you sure you want to delete this response? <span
        class="text-ds-font-weight-semi-bold"
        style="color: var(--text-ds-neutral-50);">"{api.name}"</span
      >
      will be removed and cannot be restored.
    </p>
  </div>

  <div
    class="d-flex align-items-center justify-content-end gap-3 mt-1 mb-0 rounded w-100 text-ds-font-size-16"
  >
    <Button
      disable={deleteLoader}
      title={"Cancel"}
      textStyleProp={"font-size: var(--base-text)"}
      type={"secondary"}
      loader={false}
      onClick={() => {
        isDeletePopup = false;
      }}
    />

    <Button
      disable={deleteLoader}
      title={"Delete"}
      textStyleProp={"font-size: var(--base-text)"}
      loaderSize={18}
      type={"danger"}
      loader={deleteLoader}
      onClick={() => {
        handleresponseEvent({
          event_title: "delete_response",
          event_name: "Delete Response",
        });
        deleteLoader = true;
        onItemDeleted("saved_request", {
          workspaceId: collection.workspaceId,
          collection,
          request: request,
          folder,
          requestResponse: api,
        });
        deleteLoader = false;
        isDeletePopup = false;
      }}
    />
  </div></Modal
>

{#if showMenu && userRole !== WorkspaceRole.WORKSPACE_VIEWER}
  <Options
    xAxis={requestTabWrapper.getBoundingClientRect().right - 30}
    yAxis={[
      requestTabWrapper.getBoundingClientRect().top - 5,
      requestTabWrapper.getBoundingClientRect().bottom + 5,
    ]}
    zIndex={500}
    menuItems={[
      {
        onClick: () => {
          onItemOpened("saved_request", {
            workspaceId: collection.workspaceId,
            collection,
            folder,
            request: request,
            savedRequest: api,
          });
        },
        displayText: `Open Response`,
        disabled: false,
        hidden: false,
      },
      {
        onClick: () => {
          isRenaming = true;
          handleresponseEvent({
            event_title: "rename_response",
            event_name: "Rename Response",
          });
          setTimeout(() => inputField.focus(), 100);
        },
        displayText: `Rename Response`,
        disabled: false,
        hidden:
          !collection.activeSync ||
          (api.source === "USER" && collection.activeSync)
            ? false
            : true,
      },
      {
        onClick: () => {
          handleresponseEvent({
            event_title: "delete_response",
            event_name: "Delete Response",
          });
          isDeletePopup = true;
        },
        displayText: "Delete",
        disabled: false,
        hidden:
          !collection.activeSync ||
          (api.source === "USER" && collection.activeSync) ||
          api.isDeleted
            ? false
            : true,
      },
    ]}
  />
{/if}

<div
  tabindex="0"
  bind:this={requestTabWrapper}
  class="d-flex draggable align-items-center justify-content-between my-button btn-primary {api.id ===
  activeTabId
    ? 'active-request-tab'
    : ''}"
  style="height:32px; padding-left:3px;"
>
  <button
    tabindex="-1"
    on:contextmenu|preventDefault={(e) => rightClickContextMenu(e)}
    on:click|preventDefault={() => {
      if (!isRenaming) {
        onItemOpened("saved_request", {
          workspaceId: collection.workspaceId,
          collection,
          folder,
          request,
          savedRequest: api,
        });
      }
    }}
    style={folder?.id
      ? "padding-left: 88.5px; height:100%;"
      : "padding-left: 90.5px; height:100%;"}
    class="main-file d-flex align-items-center position-relative bg-transparent border-0 {api.id?.includes(
      UntrackedItems.UNTRACKED,
    )
      ? 'unclickable'
      : ''}"
  >
    {#if api?.isDeleted && "activeSync"}
      <span
        class="delete-ticker position-absolute sparrow-fs-10 px-2 d-none"
        style="right: 0; background-color: var(--background-color); "
        >DELETED</span
      >
    {/if}
    {#if "actSync" && api?.source === "SPEC"}
      <img src={reloadSyncIcon} class="ms-2 d-none" alt="" />
    {/if}
    <div
      class="api-method"
      style="font-size: 12px; {Number(
        api.requestResponse?.responseStatus.split(' ')[0],
      ) >= 200 &&
      Number(api.requestResponse?.responseStatus.split(' ')[0]) < 300
        ? 'color:var(--text-ds-success-300);'
        : 'color:var(--text-ds-danger-300);'}"
    >
      {api.requestResponse?.responseStatus.split(" ")[0]}
    </div>

    {#if isRenaming}
      <input
        class="py-0 renameInputFieldFile text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium"
        style=" width: calc(100% - 50px); "
        id="renameInputFieldFile"
        type="text"
        maxlength={100}
        value={api.name}
        on:click|stopPropagation={() => {}}
        bind:this={inputField}
        on:input={handleRenameInput}
        on:blur={onRenameBlur}
        on:keydown={onRenameInputKeyPress}
      />
    {:else}
      <div class="api-name ellipsis {api?.isDeleted && 'api-name-deleted'}">
        <p
          class="ellipsis m-0 p-0 text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium"
        >
          {api.name}
        </p>
      </div>
    {/if}
  </button>

  {#if api.id?.includes(UntrackedItems.UNTRACKED)}
    <Spinner size={"15px"} />
  {:else if userRole !== WorkspaceRole.WORKSPACE_VIEWER}
    <Tooltip
      title={"More"}
      show={!showMenu}
      placement={"bottom-center"}
      zIndex={701}
      distance={17}
    >
      <span class="threedot-icon-container d-flex">
        <Button
          tabindex={-1}
          id={`show-more-api-${api.id}`}
          size="extra-small"
          customWidth={"24px"}
          type="teritiary-regular"
          startIcon={MoreHorizontalRegular}
          onClick={(e) => {
            rightClickContextMenu(e);
          }}
        />
      </span>
    </Tooltip>
  {/if}
</div>

<style lang="scss">
  .delete-ticker {
    color: var(--error--color);
    font-weight: 500;
  }
  .api-method {
    font-size: 10px;
    font-weight: 500;
    width: 30px !important;
    height: 24px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .api-name {
    height: 24px;
    line-height: 18px;
    font-weight: 500;
    width: calc(100% - 48px);
    text-align: left;
    color: var(--bg-ds-neutral-200);
    display: flex;
    align-items: center;
    padding: 2px 4px;
    caret-color: var(--bg-ds-primary-300);
  }
  .api-name:focus {
    border: 1px solid var(--bg-ds-primary-300) !important;
  }
  .api-name-deleted {
    color: var(--editor-angle-bracket) !important;
  }
  .api-method-deleted {
    color: var(--deleted-api-method) !important;
  }
  .api-info {
    display: flex;
    flex-direction: column;
  }
  .path-name {
    margin-top: -4px;
    font-family: Roboto Mono;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    letter-spacing: 0em;
    text-align: left;
    color: #999999;
  }
  .highlight {
    color: var(--white-color);
  }

  .my-button:hover .threedot-icon-container {
    visibility: visible;
  }

  .threedot-icon-container {
    visibility: hidden;
  }

  .threedot-active {
    visibility: visible;
    background-color: var(--bg-tertiary-600);
  }

  .btn-primary {
    background-color: transparent;
    color: var(--bg-ds-neutral-50);
    padding-right: 5px;
    border-radius: 2px;
  }
  .btn-primary:hover {
    background-color: var(--bg-ds-surface-400);
    color: var(--text-ds-neutral-50);
    border-radius: 4px;
  }
  .btn-primary:hover .threedot-icon-container {
    visibility: visible;
  }
  .btn-primary:active {
    background-color: var(--bg-ds-surface-500);
    color: var(--text-ds-neutral-50);
    border-radius: 4px;
  }
  .btn-primary:focus-visible .threedot-icon-container {
    visibility: visible;
  }
  .btn-primary:focus-visible {
    border-radius: 4px;
    background-color: var(--bg-ds-surface-400);
    border: 2px solid var(--bg-ds-primary-300);
    outline: none;
  }
  .btn-primary:focus-visible .threedot-icon-container {
    visibility: visible;
  }
  .btn-primary:hover {
    .delete-ticker {
      background-color: var(--border-color) !important;
    }
  }

  .navbar {
    width: 180px;
    height: auto;
    overflow: hidden;
  }

  ul li {
    display: block;
  }

  ul li button {
    font-size: 12px;
    display: flex;
    width: 100%;
    border: 0px;
    background-color: var(--blackColor);
  }

  ul li button:hover {
    width: 100%;
    color: var(--white-color);
    border-radius: 8px;
    background-color: var(--background-color);
  }
  .unclickable {
    pointer-events: none;
  }
  .renameInputFieldFile {
    height: 24px;
    background-color: transparent;
    color: var(--bg-ds-neutral-50);
    padding: 4px 2px;
    outline: none;
    border-radius: 4px !important;
    border: 1px solid var(--bg-ds-primary-300);
    caret-color: var(--bg-ds-primary-300);
  }
  .renameInputFieldFile:focus {
    border: 1px solid var(--border-ds-primary-300) !important;
  }
  .main-file {
    width: calc(100% - 28px);
  }
  .active-request-tab {
    background-color: var(--bg-ds-surface-500) !important;
    border-radius: 4px;
    .delete-ticker {
      background-color: var(--selected-active-sidebar) !important;
    }
  }
  .active-request-tab:hover {
    border-radius: 4px;
    .delete-ticker {
      background-color: var(--selected-active-sidebar) !important;
    }
  }

  .draggable:active {
    opacity: 0.9;
  }
</style>
