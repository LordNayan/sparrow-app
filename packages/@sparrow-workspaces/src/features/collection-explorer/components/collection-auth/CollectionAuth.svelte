<script lang="ts">
  import { CollectionAuthTypeBaseEnum } from "@sparrow/common/types/workspace/collection-base";
  import { ApiKey, BasicAuth, BearerToken, NoAuth } from "./sub-auth";
  import { WithSelect } from "@sparrow/workspaces/hoc";
  import { captureEvent } from "@app/utils/posthog/posthogConfig";
  export let auth;
  export let environmentVariables;
  export let requestStateAuth;
  export let onUpdateRequestAuth;
  export let onUpdateRequestState;
  export let onUpdateEnvironment;

  const handleCollectionAuthEvent = ({
    eventName,
    collectionAuthNavigation,
  }: {
    eventName: string;
    collectionAuthNavigation: string;
  }) => {
    captureEvent(eventName, {
      component: "CollectionAuth",
      button_text: collectionAuthNavigation,
      destination: collectionAuthNavigation,
    });
  };
</script>

<div class="d-flex flex-column w-100 h-100">
  <div class="pb-2" style="font-size: 12px; font-weight:500;">
    <div class="">
      <span class="d-flex">
        <p class="mb-0">
          <WithSelect
            id={"hash999"}
            data={[
              {
                name: "No Auth",
                id: CollectionAuthTypeBaseEnum.NO_AUTH,
              },
              {
                name: "API Key",
                id: CollectionAuthTypeBaseEnum.API_KEY,
              },
              {
                name: "Bearer Token",
                id: CollectionAuthTypeBaseEnum.BEARER_TOKEN,
              },
              {
                name: "Basic Auth",
                id: CollectionAuthTypeBaseEnum.BASIC_AUTH,
              },
            ]}
            zIndex={499}
            titleId={requestStateAuth}
            onclick={(id = "") => {
              onUpdateRequestState({ collectionAuthNavigation: id });

              handleCollectionAuthEvent({
                eventName: "collection_auth_set",
                collectionAuthNavigation: id,
              });
            }}
            disabled={false}
          />
        </p>
      </span>
    </div>
  </div>
  <p
    class="text-fs-12 fw-normal mb-4"
    style="color: var(--text-ds-neutral-400); max-width:500px;"
  >
    This authorization will be set for every request in this collection and can
    be modified within the specified request.
  </p>
  <section class="w-100" style="flex:1; overflow:auto;">
    {#if requestStateAuth === CollectionAuthTypeBaseEnum.NO_AUTH}
      <NoAuth />
    {:else if requestStateAuth === CollectionAuthTypeBaseEnum.API_KEY}
      <ApiKey
        apiData={auth.apiKey}
        callback={onUpdateRequestAuth}
        {environmentVariables}
        {onUpdateEnvironment}
      />
    {:else if requestStateAuth === CollectionAuthTypeBaseEnum.BEARER_TOKEN}
      <BearerToken
        bearerToken={auth.bearerToken}
        callback={onUpdateRequestAuth}
        {environmentVariables}
        {onUpdateEnvironment}
      />
    {:else if requestStateAuth === CollectionAuthTypeBaseEnum.BASIC_AUTH}
      <BasicAuth
        basicAuth={auth.basicAuth}
        callback={onUpdateRequestAuth}
        {environmentVariables}
        {onUpdateEnvironment}
      />
    {/if}
  </section>
</div>

<style>
  button:hover {
    border-bottom: 2px solid red; /* Replace 'yourColor' with the desired color */
  }

  /* Add a border bottom when the button is pressed (active) */
  button:active {
    border-bottom: 2px solid red; /* Replace 'yourColor' with the desired color */
  }
</style>
