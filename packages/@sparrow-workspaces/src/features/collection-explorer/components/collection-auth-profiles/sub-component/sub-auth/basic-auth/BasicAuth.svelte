<script lang="ts">
  import type { BasicAuth } from "@sparrow/common/interfaces/request.interface";
  import { CodeMirrorInput } from "@sparrow/workspaces/components";
  import { AuthInputTheme } from "@sparrow/workspaces/utils";

  export let callback;
  export let basicAuth: BasicAuth;
  export let environmentVariables;
  export let onUpdateEnvironment;

  const theme = new AuthInputTheme().build();
  const handleInput = () => {
    callback({ basicAuth: basicAuth });
  };
</script>

<div class="w-100 ps-1 pt-2 pe-1">
  <div class="mb-3" style="font-size: 12px; font-weight:500">
    <p class="mb-2 text-secondary-100">Username</p>
    <div class="position-relative" style="padding-bottom: 40px;">
      <div
        class="position-absolute top-0 auth-input-container auth-profile-basic-auth"
      >
        <CodeMirrorInput
          bind:value={basicAuth.username}
          onUpdateInput={() => {
            handleInput();
          }}
          placeholder={"Username"}
          {theme}
          {environmentVariables}
          {onUpdateEnvironment}
        />
      </div>
    </div>
  </div>

  <div class="mb-3" style="font-size: 12px; font-weight:500">
    <p class="mb-2 text-secondary-100">Password</p>
    <div class="position-relative" style="padding-bottom: 40px;">
      <div
        class="position-absolute top-0 auth-input-container auth-profile-basic-auth"
      >
        <CodeMirrorInput
          bind:value={basicAuth.password}
          onUpdateInput={() => {
            handleInput();
          }}
          placeholder={"Password"}
          {theme}
          {environmentVariables}
          {onUpdateEnvironment}
        />
      </div>
    </div>
  </div>
</div>

<style>
  .auth-input-container {
    max-width: 615px;
    width: 100%;
  }

  :global(.auth-profile-basic-auth .cm-content) {
    background-color: var(--bg-ds-surface-400) !important;
  }
</style>
