<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { CollectionsMethods } from "$lib/utils/interfaces/collections.interface";

  import {
    collapsibleState,
    isApiCreatedFirstTime,
  } from "$lib/store/request-response-section";
  import type { NewTab } from "$lib/utils/interfaces/request.interface";
  import { MyFolderViewModel } from "./MyFolder.viewModel";
  import { isFolderCreatedFirstTime } from "$lib/store/collection";
  import type { CollectionListViewModel } from "../collections-list/CollectionList.ViewModel";
  import type { CollectionDocument } from "$lib/database/app.database";
  import type { Observable } from "rxjs";
  import type { WorkspaceRole } from "$lib/utils/enums";
  import {
    PERMISSION_NOT_FOUND_TEXT,
    workspaceLevelPermissions,
  } from "$lib/utils/constants/permissions.constant";
  import { hasWorkpaceLevelPermission } from "$lib/utils/helpers/common.helper";
  import Tooltip from "$lib/components/tooltip/Tooltip.svelte";
  export let loaderColor = "default";
  export let activeTab;
  export let collectionsMethods: CollectionsMethods;
  export let loggedUserRoleInWorkspace: WorkspaceRole;
  export let _collectionListViewModel: CollectionListViewModel;
  const collections: Observable<CollectionDocument[]> =
    _collectionListViewModel.collection;
  let isLoading: boolean = false;
  let collapsExpandToggle: boolean = false;
  let tabName = "";
  let tabDescription = "";
  let componentData: NewTab;
  let totalRequest: number = 0;
  let collectionId: string;
  let folderId: string;
  const _myFolderViewModel = new MyFolderViewModel();

  const tabSubscribe = activeTab.subscribe(async (event: NewTab) => {
    if (event) {
      tabName = event?.name;
      tabDescription = event?.description;
      componentData = event;
      collectionId = event.path?.collectionId;
      folderId = event.path?.folderId;
    }
  });
  let collectionCountArr = [];

  const refreshCount = () => {
    if (collectionCountArr && collectionId) {
      collectionCountArr.forEach(async (collection) => {
        if (collection._data.id === collectionId) {
          const collectionData = await collectionsMethods.getNoOfApisandFolders(
            collection,
            folderId,
          );
          totalRequest = collectionData.requestCount;
        }
      });
    }
  };
  const collectionSubscribe = collections.subscribe(
    (value: CollectionDocument[]) => {
      if (value) {
        collectionCountArr = value;
        refreshCount();
      }
    },
  );

  $: {
    if (folderId) {
      refreshCount();
    }
  }

  const onUpdate = async (property: string, event) => {
    const value = event.target.value;
    await _myFolderViewModel.modifyFolder(
      componentData,
      property,
      value,
      collectionsMethods,
    );
  };

  const handleApiRequest = async () => {
    isApiCreatedFirstTime.set(true);
    const response = await _myFolderViewModel.createApiRequest(
      componentData,
      collectionsMethods,
    );
    if (response.isSuccessful) {
      isLoading = false;
    }
  };

  const collapsibleStateUnsubscribe = collapsibleState.subscribe((value) => {
    collapsExpandToggle = value;
  });

  let isFolderNameVisibility: boolean;
  const unsubscribeisCollectionCreatedFirstTime =
    isFolderCreatedFirstTime.subscribe((value) => {
      isFolderNameVisibility = value;
    });

  let autofocus = isFolderNameVisibility;

  let inputElement;

  $: if ($isFolderCreatedFirstTime) {
    inputElement?.select();
  }

  onDestroy(() => {
    tabSubscribe();
    collapsibleStateUnsubscribe();
    unsubscribeisCollectionCreatedFirstTime();
    collectionSubscribe.unsubscribe();
  });
  onDestroy(() => {});

  const onRenameInputKeyPress = (event) => {
    if (event.key === "Enter") {
      const inputField = document.getElementById(
        "renameInputFieldFolder",
      ) as HTMLInputElement;
      inputField.blur();
    }
  };

  const onDescInputKeyPress = (event) => {
    if (event.shiftKey && event.key === "Enter") {
      const inputField = document.getElementById(
        "updateFolderDescField",
      ) as HTMLInputElement;
      inputField.blur();
    }
  };
</script>

<div class="main-container d-flex">
  <div
    class="my-collection d-flex flex-column"
    style="width:calc(100% - 280px); margin-top: 15px;"
  >
    <Tooltip
      title={PERMISSION_NOT_FOUND_TEXT}
      show={!hasWorkpaceLevelPermission(
        loggedUserRoleInWorkspace,
        workspaceLevelPermissions.SAVE_REQUEST,
      )}
    >
      <div class="d-flex aling-items-center justify-content-between gap-2 mb-4">
        <input
          type="text"
          required
          {autofocus}
          id="renameInputFieldFolder"
          value={tabName}
          class="bg-backgroundColor input-outline border-0 text-left w-100 ps-2 py-0 fs-5"
          maxlength={100}
          on:blur={(event) => onUpdate("name", event)}
          on:keydown={onRenameInputKeyPress}
          bind:this={inputElement}
        />

        <button
          disabled={!hasWorkpaceLevelPermission(
            loggedUserRoleInWorkspace,
            workspaceLevelPermissions.SAVE_REQUEST,
          )}
          class="btn w-25 btn-primary rounded border-0 text-align-right py-1"
          on:click={handleApiRequest}>New Request</button
        >
      </div>
    </Tooltip>

    <div class="d-flex gap-4 mb-4 ps-2">
      <div class="d-flex align-items-center gap-2">
        <span class="fs-4 text-plusButton">{totalRequest}</span>
        <p style="font-size: 12px;" class="mb-0">API Requests</p>
      </div>
    </div>
    <div class="d-flex align-items-start ps-0 h-100">
      <textarea
        disabled={!hasWorkpaceLevelPermission(
          loggedUserRoleInWorkspace,
          workspaceLevelPermissions.EDIT_FOLDER_DESC,
        )}
        id="updateFolderDescField"
        style="font-size: 12px; "
        class="form-control bg-backgroundColor border-0 text-textColor fs-6 h-50 input-outline"
        value={tabDescription}
        placeholder="Describe the folder. Add code examples and tips for your team to effectively use the APIs."
        on:blur={(event) => onUpdate("description", event)}
        on:keydown={onDescInputKeyPress}
      />
    </div>
  </div>
  <div
    class="d-flex flex-column align-items-left justify-content-start"
    style="width: 280px;border-left:2px solid #313233"
  >
    <div
      style="text-align:left;font-size:16px; font-weigh:400;"
      class="mt-5 ps-3 text-whiteColor"
    >
      <p>Index</p>
    </div>
    <div class="mt-2 ps-3" style="font-size:12px; font-weight:400">
      <p class="text-textColor">
        Begin adding content, and the Index will automatically populate here.
        This will help you easily navigate and organize your documentation as it
        grows.
      </p>
    </div>
  </div>
</div>

<style>
  .main-container {
    height: calc(100vh - 80px);
    background-color: var(--background-color);
  }

  .my-collection {
    padding: 20px;
  }

  .input-outline {
    border-radius: 0%;
  }
  textarea::placeholder {
    font-size: 12px;
    color: var(--text-color);
  }

  .input-outline:focus {
    outline: 2px solid var(--sparrow-blue);
  }
</style>
