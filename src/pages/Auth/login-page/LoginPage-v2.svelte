<script lang="ts">
  import Header from "$lib/components/header/Header.svelte";
  import LoginLoader from "$lib/components/Transition/LoginLoader.svelte";
  import { open } from "@tauri-apps/plugin-shell";
  import Button from "$lib/components/buttons/Button.svelte";

  let isLoadingPage: boolean;

  const handleSignIn = async () => {
    await open("http://localhost:1421/login");
    isLoadingPage = true;
  };
</script>

<Header />

<div
  class="container d-flex flex-column align-items-center justify-content-center"
>
  <p
    class="container-header text-whiteColor mt-5 ms-2 me-2 mb-4"
    style="font-size:40px;width:408px; height:48px;font-weight:500;"
  >
    Welcome to Sparrow!
  </p>
  <Button
    title={"Login"}
    textStyleProp={"font-size: var(--base-size)"}
    buttonClassProp={"btn btn-primary text-whiteColor border-0 position-absolute top-50 w-25"}
    loader={false}
    onClick={handleSignIn}
  />
</div>

{#if isLoadingPage}
  <LoginLoader onClick={handleSignIn} {isLoadingPage} />
{/if}

<style>
</style>
