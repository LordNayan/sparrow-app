<script lang="ts">
  export let handleModalState: (flag: boolean) => void;
  export let teamName: string = "";
  export let teamId: string = "";
  import {
    base64ToURL,
    createDynamicComponents,
    validateEmail,
  } from "@sparrow/common/utils";
  import { Avatar } from "@sparrow/library/ui";

  import { TeamRole, WorkspaceRole } from "@sparrow/common/enums/team.enum";
  import { Button, Chip } from "@sparrow/library/ui";

  export let onInviteClick;
  export let workspaces;
  export let teamLogo;
  export let userId;
  export let users;
  export let plan;
  /**
   * Validates the user email.
   */
  export let onValidateEmail;

  import { closeIconWhiteIcon as closeIconWhite } from "@sparrow/library/assets";
  import { MultiSelect, Select } from "@sparrow/library/forms";
  import { notifications } from "@sparrow/library/ui";

  let emailstoBeSentArr: string[] = [];
  let teamSpecificWorkspace = workspaces.map((elem) => {
    return {
      id: elem._id,
      name: elem.name,
      textColor: "whiteColor",
      checked: false,
    };
  });
  const defaultRole = "select";
  let selectedRole: string = defaultRole;
  let currentEmailEntered: string;

  let emailError: boolean = false;
  let roleError: boolean = false;
  let workspaceError: boolean = false;
  let invalidEmails: string[] = [];

  const removeElement = (email: string): void => {
    emailstoBeSentArr = emailstoBeSentArr.filter((e) => e != email);
    invalidEmails = invalidEmails.filter((e) => e != email);
    globalEmails = globalEmails.filter((e) => e.id != email);
  };

  /**
   * Checks if user already exist in team
   * @param email - email input
   */
  const isEmailAlreadyExistInTeam = (email: string) => {
    for (let i = 0; i < users.length; i++) {
      if (email.toLowerCase() === users[i].email.toLowerCase()) {
        return true;
      }
    }
    return false;
  };

  const isEmailAlreadyAdded = (email: string) => {
    for (let i = 0; i < emailstoBeSentArr.length; i++) {
      if (email.toLowerCase() === emailstoBeSentArr[i].toLowerCase()) {
        return true;
      }
    }
    return false;
  };

  let globalEmails: {
    id: string;
    isError: boolean;
  }[] = [];

  const handleEmailOnAdd = async (email: string) => {
    email = email.replace(",", "");
    email = email.trim();

    if (isEmailAlreadyAdded(email)) {
      currentEmailEntered = "";
      return;
    }
    const isEmailAlreadyExist = isEmailAlreadyExistInTeam(email);
    if (isEmailAlreadyExist) {
      notifications.error("User already in hub.");
    }
    // const isUserExist = await onValidateEmail(email); // checks if user exist on server
    // if (!isUserExist) {
    // notifications.error("User doesn't exist on sparrow!");
    // }
    // const isValidEmail =
    //   validateEmail(email) && !isEmailAlreadyExist && isUserExist;
    const isValidEmail = validateEmail(email) && !isEmailAlreadyExist;

    if (!isValidEmail) {
      invalidEmails.push(email);
      globalEmails = [...globalEmails, { id: email, isError: true }];
    } else {
      emailstoBeSentArr.push(email);
      globalEmails = [...globalEmails, { id: email, isError: false }];
    }
    currentEmailEntered = "";
    if (emailstoBeSentArr.length && !invalidEmails.length) {
      emailError = false;
    } else {
      emailError = true;
    }
  };

  const countCheckedList = (ls) => {
    let count = 0;
    ls.forEach((element) => {
      if (element.checked) {
        count++;
      }
    });
    return count;
  };
  let loader: boolean = false;

  const checkInviteValidation = () => {
    if (emailstoBeSentArr?.length === 0) {
      emailError = true;
    }
    if (!selectedRole || selectedRole === defaultRole) {
      roleError = true;
    }
    if (!teamSpecificWorkspace || !countCheckedList(teamSpecificWorkspace)) {
      workspaceError = true;
    } else {
      workspaceError = false;
    }
  };

  const handleInvite = async () => {
    checkInviteValidation();
    loader = true;
    if (
      emailstoBeSentArr &&
      emailstoBeSentArr.length > 0 &&
      !invalidEmails.length &&
      selectedRole &&
      selectedRole != defaultRole
    ) {
      if (
        selectedRole === WorkspaceRole.WORKSPACE_EDITOR ||
        selectedRole === WorkspaceRole.WORKSPACE_VIEWER
      ) {
        if (countCheckedList(teamSpecificWorkspace)) {
          let data = {
            users: emailstoBeSentArr,
            role: selectedRole,
            teamId: teamId,
            workspaces: teamSpecificWorkspace
              .filter((elem) => {
                if (elem.checked) {
                  return true;
                }
                return false;
              })
              .map((elem) => {
                return {
                  id: elem.id,
                  name: elem.name,
                };
              }),
          };
          const response = await onInviteClick(teamId, teamName, data, userId);
          if (response.isSuccessful) {
            handleModalState(false);
          } else {
            loader = false;
            handleModalState(false);
          }
        }
      } else {
        let data = {
          users: emailstoBeSentArr,
          role: selectedRole,
          teamId: teamId,
        };
        const response = await onInviteClick(teamId, teamName, data, userId);
        if (response.isSuccessful) {
          handleModalState(false);
        } else {
          loader = false;
          handleModalState(false);
        }
      }
    }
    loader = false;
  };

  const handleDropdown = (id) => {
    selectedRole = id;
  };

  const handleCheckSelectDropdown = (items: any[]) => {
    teamSpecificWorkspace = items;
  };
</script>

<div class="d-flex flex-column">
  <p
    class="invite-header mb-0 text-ds-font-size-14"
    style="color: var(--text-ds-neutral-200);"
  >
    Invite by email<span class="asterik">*</span>
  </p>

  <p
    style="padding: 2px 0px;color: var(--text-ds-neutral-400);"
    class="invite-subheader mt-0 mb-1 text-ds-font-size-12 text-ds-font-weight-regular text-ds-line-height-150"
  >
    You can add multiple emails.
  </p>
  <div
    class="email-container rounded {(emailError && invalidEmails.length) ||
    (emailError && emailstoBeSentArr.length === 0)
      ? 'isError'
      : ''}"
  >
    <div id="input-email">
      {#each globalEmails as email}
        <span class="m-0 p-0 d-flex me-2">
          <Chip
            label={email.id}
            type={"input"}
            isError={email.isError}
            onClose={() => {
              removeElement(email.id);
            }}
            disabled={false}
            id={email.id}
          />
        </span>
      {/each}
    </div>
    <input
      id="input"
      placeholder="Enter email ID"
      autocomplete="off"
      autocapitalize="none"
      style="outline:none;border:none;flex-grow:1; background:transparent;"
      bind:value={currentEmailEntered}
      class="input-container text-fs-14 text-ds-font-weight-medium text-ds-line-height-143"
      on:keyup={(event) => {
        if (
          (event.key === "," || event.key === "Enter") &&
          currentEmailEntered &&
          currentEmailEntered.trim() != "" &&
          currentEmailEntered.trim() != ","
        ) {
          handleEmailOnAdd(currentEmailEntered);
        }
      }}
      on:blur={() => {
        if (
          currentEmailEntered &&
          currentEmailEntered.trim() != "" &&
          currentEmailEntered.trim() != ","
        ) {
          handleEmailOnAdd(currentEmailEntered);
        }
      }}
    />
  </div>
  {#if emailError && invalidEmails.length}
    <p class="error-text sparrow-fs-12">
      Please check and enter correct email address.
    </p>
  {:else if emailError && emailstoBeSentArr.length === 0}
    <p class="error-text">Email ID cannot be empty.</p>
  {/if}
</div>

<div class="mt-4">
  <p
    class="role-title text-fs-14 text-secondary-1000 mb-1 text-ds-font-weight-regular text-ds-line-height-143"
  >
    Role<span class="asterik">*</span>
  </p>
  <Select
    id="invite-team"
    titleId={selectedRole ? selectedRole : ""}
    data={[
      {
        name: "Select the role",
        id: defaultRole,
        description: "Select role",
        hide: true,
      },
      {
        name: "Admin",
        id: WorkspaceRole.WORKSPACE_ADMIN,
        description:
          "Manage workspace resources and members. Add, edit, and remove resources, as well as invite or remove members.",
      },
      {
        name: "Editor",
        id: WorkspaceRole.WORKSPACE_EDITOR,
        description: "Create and modify resources within a workspace.",
      },
      {
        name: "Viewer",
        id: WorkspaceRole.WORKSPACE_VIEWER,
        description: "View resources in a workspace without making changes.",
      },
    ]}
    maxHeaderWidth={"100%"}
    variant={"tertiary"}
    size={"medium"}
    onclick={handleDropdown}
    position={"absolute"}
    menuItem={"v2"}
    isError={roleError && selectedRole === defaultRole}
  />
</div>
{#if selectedRole === TeamRole.TEAM_ADMIN}
  <p
    class="invite-subheader text-textColor mt-1 mb-1 text-ds-font-size-12 text-ds-font-weight-regular text-ds-line-height-150"
  >
    Admins will have access to all current and future hub workspaces.
  </p>
{/if}
{#if roleError && selectedRole === defaultRole}
  <p class="error-text">Role cannot be empty.</p>
{/if}

{#if selectedRole === WorkspaceRole.WORKSPACE_EDITOR || selectedRole === WorkspaceRole.WORKSPACE_VIEWER}
  <div class="mt-4">
    <p class="role-title text-fs-12 text-secondary-1000 mb-0">
      Specify Workspace<span class="asterik">*</span>
    </p>
    <p class="invite-subheader text-textColor mt-0 mb-1 text-ds-font-size-12">
      Select workspaces you would want to give access to.
    </p>
  </div>

  <!-- workspace selector -->

  <MultiSelect
    data={[...teamSpecificWorkspace]}
    id={"team-invite-multiple-workspace-selector"}
    onclick={handleCheckSelectDropdown}
    --body-background-color="var(--bg-tertiary-400)"
    --header-background-color="var(--bg-tertiary-300)"
    --header-item-background-color="var(--bg-tertiary-750)"
  />

  {#if workspaceError && !countCheckedList(teamSpecificWorkspace)}
    <p class="error-text text-ds-font-size-12">
      You need to select at least one workspace. If you wish to give access to
      all workspaces, please click on select all.
    </p>
  {/if}
{/if}
{#if plan?.name !== "Community"}
  <p class="text-fs-12 mt-3" style="color: var(--text-ds-neutral-400)">
    Note: Inviting a user reserves a license and may trigger a charge, unless an
    unused license is available.
  </p>
{/if}
<div class="mt-3">
  <div class="d-flex align-items-center ellipsis gap-1 text-ds-font-size-12">
    <div class="d-flex align-items-center" style="width: 36px;">
      {#if teamLogo?.size}
        <Avatar type={"image"} size={"large"} image={base64ToURL(teamLogo)} />
      {:else}
        <span class="">
          <Avatar
            type={"person"}
            size={"small"}
            bgColor={"var(--bg-tertiary-800)"}
          />
        </span>
      {/if}
    </div>
    <p
      class="mb-0 ellipsis me-1 text-ds-font-size-12 text-ds-font-weight-medium text-ds-line-height-130"
    >
      {teamName}
    </p>
  </div>
  <div style="margin-top: 1.8rem; display: flex; justify-content: flex-end;">
    <div style="padding-right:5px;">
      <Button
        title={"Cancel"}
        type={"secondary"}
        onClick={() => {
          handleModalState(false);
        }}
      />
    </div>
    <Button
      disable={loader}
      title={"Send Invite"}
      type={"primary"}
      {loader}
      onClick={() => {
        handleInvite();
      }}
    />
  </div>
</div>

<style>
  .asterik {
    color: var(--dangerColor);
    margin-left: 4px;
  }
  .error-text {
    margin-top: 4px;
    font-family: "Inter", sans-serif;
    font-weight: 400;
    font-size: 12px;
    margin-bottom: 0 !important;
    color: var(--error--color);
  }

  .email-container {
    display: flex;
    flex-wrap: wrap;
    background-color: var(--bg-ds-surface-400);
    border: 1px solid;
    padding: 3px 8px;
    border: 1px solid var(--border-color);
    max-height: 100px;
    overflow-y: auto;
  }
  input {
    margin-bottom: 4px !important;
    margin-top: 4px !important;
    caret-color: var(--text-primary-300);
  }
  #input-email {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 5px;
  }
  .team-icon {
    height: 24px;
    width: 24px;
  }
  .isError {
    border: 1px solid var(--error--color) !important;
  }
  :global(.email-container-item) {
    height: 26px;
    border: 1px solid transparent;
    background-color: var(--bg-tertiary-750);
  }
  :global(.email-container-item-invalid) {
    color: var(--text-danger-200);
  }
  :global(.email-container-item-invalid:hover) {
    border: 1px solid var(--text-danger-200);
    background-color: var(--bg-tertiary-600);
  }
  :global(.email-container-item-valid) {
    color: var(--text-secondary-100);
  }
  :global(.email-container-item-valid:hover) {
    background-color: var(--bg-tertiary-600);
  }
  input::placeholder {
    color: var(--text-secondary-200);
  }
  .email-container:hover {
    border: 1px solid var(--bg-primary-300);
  }
  :global(.email-container-img-invalid) {
    filter: brightness(0) saturate(100%) invert(60%) sepia(64%) saturate(544%)
      hue-rotate(308deg) brightness(109%) contrast(99%);
  }
  :global(.email-container-img-valid) {
    filter: brightness(0) saturate(100%) invert(65%) sepia(13%) saturate(217%)
      hue-rotate(166deg) brightness(87%) contrast(85%);
  }
  :global(.email-container-img) {
    height: 22px;
    width: 22px;
    cursor: pointer;
  }
  #invite-team .dropdown-item:first-child {
    color: red !important;
    font-weight: bold;
  }
</style>
