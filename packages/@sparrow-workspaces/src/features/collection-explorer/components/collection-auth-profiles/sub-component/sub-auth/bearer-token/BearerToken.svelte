<script lang="ts">
  import { AuthInputTheme } from "@sparrow/workspaces/utils";
  import { CodeMirrorInput } from "@sparrow/workspaces/components";

  export let bearerToken: string;
  export let callback;
  export let environmentVariables;
  export let onUpdateEnvironment;

  const theme = new AuthInputTheme().build();
  const handleInput = () => {
    callback({ bearerToken: bearerToken });
  };
</script>

<div class="d-flex flex-column w-100 pt-2 pe-1">
  <div style="font-size: 12px; font-weight:500">
    <p class="mb-2 text-secondary-100">Token</p>
    <div
      class="position-relative auth-input-container auth-profile-bearer-token"
    >
      <CodeMirrorInput
        bind:value={bearerToken}
        onUpdateInput={() => {
          handleInput();
        }}
        placeholder={"Token"}
        {theme}
        {environmentVariables}
        {onUpdateEnvironment}
      />
    </div>
  </div>
</div>

<style>
  .auth-input-container {
    max-width: 615px;
  }

  :global(.auth-profile-bearer-token .cm-content) {
    background-color: var(--bg-ds-surface-400) !important;
  }
</style>
