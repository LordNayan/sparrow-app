<script lang="ts">
  // ---- Components
  import {
    Spinner,
    Modal,
    Button,
    Tooltip,
    Options,
  } from "@sparrow/library/ui";

  // --- Icons
  import { GrpcIcon, MoreHorizontalRegular } from "@sparrow/library/icons";

  // --- Types
  import {
    type CollectionBaseInterface,
    type CollectionItemBaseInterface,
  } from "@sparrow/common/types/workspace/collection-base";
  import { UntrackedItems, WorkspaceRole } from "@sparrow/common/enums";
  import { GrpcRequestDefaultAliasBaseEnum } from "../../../../../../@sparrow-common/src/types/workspace/grpc-request-base";

  export let onItemDeleted: (entityType: string, args: any) => void;
  export let onItemRenamed: (entityType: string, args: any) => void;
  export let onItemOpened: (entityType: string, args: any) => void;
  export let collection: CollectionBaseInterface;
  export let folder: CollectionItemBaseInterface | null;
  export let grpc: CollectionItemBaseInterface;
  export let activeTabId: string;
  export let userRole;
  export let isSharedWorkspace = false;

  let isDeletePopup: boolean = false;
  let showMenu: boolean = false;
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
    const selectElement = document.getElementById(`show-more-grpc-${grpc.id}`);
    if (selectElement && !selectElement.contains(event.target as Node)) {
      showMenu = false;
    }
  }

  let newRequestName: string = "";

  const handleRenameInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    newRequestName = target.value.trim();
  };

  const onRenameBlur = async () => {
    if (newRequestName) {
      await onItemRenamed("grpc", {
        workspaceId: collection.workspaceId,
        collection,
        folder: folder ? folder : { id: "" },
        grpc: grpc,
        newName: newRequestName,
      });
    }
    isRenaming = false;
    newRequestName = "";
  };

  const onRenameInputKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      const inputField = document.getElementById(
        "renameInputFieldGrpc",
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
  title={`Delete ${GrpcRequestDefaultAliasBaseEnum.NAME}?`}
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
      Are you sure you want to delete this {GrpcRequestDefaultAliasBaseEnum.NAME}?
      <span
        class="text-ds-font-weight-semi-bold"
        style="color: var(--text-ds-neutral-50);">"{grpc.name}"</span
      >
      will be removed and cannot be restored.
    </p>
  </div>

  <div
    class="d-flex align-items-center justify-content-end gap-3 mt-1 mb-0 rounded w-100 text-ds-font-size-16"
  >
    <Button
      disable={deleteLoader}
      title="Cancel"
      type="secondary"
      loader={false}
      onClick={() => {
        isDeletePopup = false;
      }}
    />

    <Button
      disable={deleteLoader}
      title="Delete"
      type="danger"
      loader={deleteLoader}
      onClick={() => {
        deleteLoader = true;
        onItemDeleted("grpc", {
          workspaceId: collection.workspaceId,
          collection,
          grpc: grpc,
          folder,
        });
        deleteLoader = false;
        isDeletePopup = false;
      }}
    />
  </div>
</Modal>

{#if showMenu && userRole !== WorkspaceRole.WORKSPACE_VIEWER && !isSharedWorkspace}
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
          onItemOpened("grpc", {
            workspaceId: collection.workspaceId,
            collection,
            folder,
            grpc: grpc,
          });
        },
        displayText: `Open ${GrpcRequestDefaultAliasBaseEnum.NAME}`,
        disabled: false,
        hidden: false,
      },
      {
        onClick: () => {
          isRenaming = true;
          setTimeout(() => inputField.focus(), 100);
        },
        displayText: `Rename ${GrpcRequestDefaultAliasBaseEnum.NAME}`,
        disabled: false,
        hidden:
          !collection.activeSync ||
          (grpc.source === "USER" && collection.activeSync)
            ? false
            : true,
      },
      {
        onClick: () => {
          isDeletePopup = true;
        },
        displayText: "Delete",
        disabled: false,
        hidden:
          !collection.activeSync ||
          (grpc.source === "USER" && collection.activeSync) ||
          grpc.isDeleted
            ? false
            : true,
      },
    ]}
  />
{/if}

<div
  tabindex="0"
  bind:this={requestTabWrapper}
  class="d-flex align-items-center justify-content-between my-button btn-primary {grpc.id ===
  activeTabId
    ? 'active-request-tab'
    : ''} "
  style="height:32px; padding-left:3px;"
>
  <button
    tabindex="-1"
    on:contextmenu|preventDefault={(e) => rightClickContextMenu(e)}
    on:click|preventDefault={() => {
      if (!isRenaming) {
        onItemOpened("grpc", {
          workspaceId: collection.workspaceId,
          collection,
          folder,
          grpc: grpc,
        });
      }
    }}
    style={folder?.id
      ? "padding-left: 41.5px; height:100%;"
      : "padding-left: 29px; height:100%;  "}
    class="main-file d-flex align-items-center position-relative bg-transparent border-0 {grpc.id?.includes(
      UntrackedItems.UNTRACKED,
    )
      ? 'unclickable'
      : ''}"
  >
    <div
      class="api-method"
      style="width: 24px !important; height:24px !important; padding:0;"
    ></div>
    <span class="api-method">
      <GrpcIcon
        height={"12px"}
        width={"12px"}
        color={"var(--icon-ds-warning-300)"}
      />
    </span>

    {#if isRenaming}
      <input
        class="py-0 rename-input-field-grpc text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium"
        style=" width: calc(100% - 50px);"
        id="renameInputFieldGrpc"
        type="text"
        maxlength={100}
        value={grpc.name}
        on:click|stopPropagation={() => {}}
        bind:this={inputField}
        on:input={handleRenameInput}
        on:blur={onRenameBlur}
        on:keydown={onRenameInputKeyPress}
      />
    {:else}
      <div
        class="api-name ellipsis {grpc?.isDeleted && 'api-name-deleted'}"
        style=" color: var(--text-ds-neutral-200);"
      >
        <p
          class=" ellipsis m-0 p-0 text-ds-font-size-12 text-ds-line-height-130 text-ds-font-weight-medium"
        >
          {grpc.name}
        </p>
      </div>
    {/if}
  </button>

  {#if grpc.id?.includes(UntrackedItems.UNTRACKED)}
    <Spinner size={"15px"} />
  {:else if userRole !== WorkspaceRole.WORKSPACE_VIEWER && !isSharedWorkspace}
    <Tooltip
      title={"More"}
      show={!showMenu}
      placement={"bottom-center"}
      zIndex={701}
      distance={17}
    >
      <span class="threedot-icon-container d-flex">
        <Button
          tabindex={"-1"}
          id={`show-more-grpc-${grpc.id}`}
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
  .api-method {
    font-size: 10px;
    font-weight: 400;
    width: 30px !important;
    height: 24px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: start;
    padding: 4px;
  }
  .api-name {
    font-weight: 500;
    width: calc(100% - 58px);
    text-align: left;
    font-size: 12px;
    line-height: 18px;
    padding: 2px 4px;
  }
  .api-name-deleted {
    color: var(--editor-angle-bracket) !important;
  }
  .my-button:hover .threedot-icon-container {
    visibility: visible;
  }
  .threedot-icon-container {
    visibility: hidden;
    background-color: transparent;
  }
  .btn-primary {
    background-color: transparent;
    color: var(--bg-ds-neutral-50);
    padding-right: 5px;
    border-radius: 2px;
  }
  .btn-primary:hover {
    background-color: var(--bg-ds-surface-400);
    border-radius: 4px;
  }
  .btn-primary:hover .threedot-icon-container {
    visibility: visible;
  }
  .btn-primary:active {
    background-color: var(--bg-ds-surface-500);
    border-radius: 4px;
  }
  .btn-primary:active .threedot-icon-container {
    visibility: visible;
  }
  .btn-primary:focus-visible {
    background-color: var(--bg-ds-surface-400);
    border-radius: 4px;
    outline: none;
    border: 2px solid var(--bg-ds-primary-300);
  }
  .btn-primary:focus-visible .threedot-icon-container {
    visibility: visible;
  }
  .unclickable {
    pointer-events: none;
  }
  .rename-input-field-grpc {
    border: none;
    background-color: transparent;
    color: var(--text-ds-neutral-50);
    padding: 4px 2px;
    outline: none;
    border-radius: 4px !important;
    height: 24px;
    font-size: 12px;
    line-height: 18px;
    caret-color: var(--bg-ds-primary-300);
  }
  .rename-input-field-grpc:focus {
    border: 1px solid var(--border-ds-primary-300) !important;
  }
  .main-file {
    width: calc(100% - 28px);
  }
  .active-request-tab {
    background-color: var(--bg-ds-surface-500) !important;
  }
</style>
