<script lang="ts">
  import { SearchIcon2 } from "@sparrow/library/icons";
  import { CrossIcon2 } from "@sparrow/library/icons";

  import { createEventDispatcher, onMount } from "svelte";

  export let placeholder = "Search";
  export let id = "";
  export let variant: "primary" | "secondary" | "primary-gradient" = "primary";
  export let size: "small" | "medium" | "large" = "small";
  export let customWidth = "";
  export let value = "";
  let color = "";
  let iconSize = "16px";

  let searchStyleProp = "";
  let searchTextProp = "";
  let searchClassProp = "";
  let imgStyleProp = "";
  let enterPressed = false;

  const dispatch = createEventDispatcher();

  switch (variant) {
    case "primary":
      searchClassProp = "custom-surface700";
      break;
    case "secondary":
      searchClassProp = "custom-surface900";
      break;
    case "primary-gradient":
      searchClassProp = "primary-gradient-custom-surface700";
      break;
    default:
      searchClassProp = "custom-surface700";
      break;
  }

  switch (size) {
    case "small":
      iconSize = "12px";
      imgStyleProp = "height:20px; width:20px;";
      searchTextProp =
        "text-ds-font-size-12 text-ds-line-height-150 text-ds-font-weight-regular";
      searchStyleProp = `width: ${customWidth.length > 0 ? `${customWidth}` : "100%"}; height: 28px; min-height: 28px; max-height: 28px;  gap: 8px; border-radius: 4px;`;
      break;
    case "medium":
      iconSize = "12px";
      imgStyleProp = "height:20px; width:20px;";
      searchTextProp =
        "text-ds-font-size-14 text-ds-line-height-143 text-ds-font-weight-medium";
      searchStyleProp = `width: ${customWidth.length > 0 ? `${customWidth}` : "100%"}; height: 36px; min-height: 36px; max-height: 36px;   border-radius: 6px;`;
      break;
    case "large":
      iconSize = "12px";
      imgStyleProp = "height:20px; width:20px;";
      searchTextProp =
        "font-weight: 400; font-size: 14px; line-height: 20.02px;";
      searchStyleProp = `width: ${customWidth.length > 0 ? `${customWidth}` : "100%"}; height: 40px; min-height: 40px; max-height: 40px;   border-radius: 6px;`;
      break;
    default:
      iconSize = "12px";
      imgStyleProp = "height:20px; width:20px;";
      searchTextProp =
        "text-ds-font-size-12 text-ds-line-height-150 text-ds-font-weight-regular";
      searchStyleProp = `width: ${customWidth.length > 0 ? `${customWidth}` : "100%"}; height: 28px; min-height: 28px; max-height: 28px;   gap: 8px; border-radius: 4px;`;
      break;
  }

  $: {
    if (value.length <= 0) {
      enterPressed = false;
    }
  }

  const onKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      const inputField = document.getElementById(id) as HTMLInputElement;
      inputField.blur();
    }
    if (event.key === "Enter" && value.length > 0) {
      enterPressed = true;
    }
    if (event.key !== "Enter" && value.length > 0) {
      enterPressed = false;
    }
  };

  const handleClick = () => {
    if (value.length > 0) {
      enterPressed = true;
    }
  };

  const clearSearch = () => {
    value = "";
    enterPressed = false;
    dispatch("input", value);
  };

  const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    value = target.value;
    dispatch("input", target.value);
  };

  onMount(() => {
    window.addEventListener("click", handleClick);
  });
</script>

<div
  class="d-flex align-items-center justify-content-start w-100 position-relative"
  style={`${searchClassProp} gap:10px`}
>
  <div
    class={`d-flex align-items-center justify-content-start position-relative ${customWidth.length <= 0 ? "w-100" : ""} `}
  >
    <div
      class="position-absolute d-flex align-items-center"
      style={`height: 20px; width: 20px; left: 10px; pointer-events: none; ${imgStyleProp}`}
    >
      <SearchIcon2
        width={"12px"}
        height={"12px"}
        color={"var(--bg-ds-neutral-300)"}
      />
    </div>
    <input
      {id}
      type="text"
      class={`${searchClassProp} ${searchTextProp} ${value ? "has-text" : ""} ${enterPressed ? "entered" : ""}`}
      style={` ${searchStyleProp}  color:white; outline:none; ::placeholder { color: var(--text-ds-neutral-300);};`}
      {value}
      {placeholder}
      on:input={handleInput}
      on:keydown={onKeyPress}
    />
    {#if value !== ""}
      <div
        class="position-absolute d-flex align-items-center"
        style={`height: 20px; width: 20px; right: 10px; cursor: pointer; ${imgStyleProp} `}
        on:click={clearSearch}
      >
        <svelte:component
          this={CrossIcon2}
          width={"20px"}
          height={"20px"}
          color={"var(--text-ds-neutral-100)"}
        />
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  input {
    width: 100%;
    padding-left: 30px;
    padding-right: 30px;
    min-width: 0;
    flex: 1;
  }

  // intial surface 700
  .custom-surface700 {
    background-color: var(--bg-ds-surface-400);
    border: none;
    caret-color: var(--border-ds-primary-300);
  }
  // when focused without text
  .custom-surface700:focus {
    background-color: var(--bg-ds-surface-300);
    outline: none;
    border: 2px solid var(--border-ds-primary-300);
  }
  // during typing
  .custom-surface700.has-text {
    border: 1px solid var(--border-ds-primary-300);
  }
  // when it have text but not foucsed
  .custom-surface700.has-text:not(:focus) {
    border: none;
  }
  // when it have text  and focused
  .custom-surface700.entered:focus {
    border: 2px solid var(--border-ds-primary-300);
  }
  // when it have text and not focused
  .custom-surface700:not(:focus):hover {
    border: 1px solid var(--border-ds-neutral-300);
  }
  .primary-gradient-custom-surface700 {
    background-color: var(--bg-ds-surface-400);
    border: 2px solid transparent; /* Transparent border for gradient effect */
    background-image: linear-gradient(
        var(--bg-ds-surface-400),
        var(--bg-ds-surface-400)
      ),
      linear-gradient(90deg, #11adf0, #316cf6, #6147ff); 
    background-origin: border-box;
    background-clip: padding-box, border-box;
    caret-color: var(--border-ds-primary-300);
  }
  // when focused without text
  .primary-gradient-custom-surface700:focus {
    background-color: var(--bg-ds-surface-300);
    outline: none;
    border: 2px solid var(--border-ds-primary-300);
  }
  // during typing
  .primary-gradient-custom-surface700.has-text {
    border: 1px solid var(--border-ds-primary-300);
  }
  // when it have text but not foucsed
  .primary-gradient-custom-surface700.has-text:not(:focus) {
    border: none;
  }
  // when it have text  and focused
  .primary-gradient-custom-surface700.entered:focus {
    border: 2px solid var(--border-ds-primary-300);
  }
  // when it have text and not focused
  .primary-gradient-custom-surface700:not(:focus):hover {
    border: 1px solid var(--border-ds-neutral-300);
  }

  .custom-surface900 {
    background-color: var(--bg-ds-surface-600);
    border: none;
    caret-color: var(--border-ds-primary-300);
  }

  .custom-surface900:focus {
    background-color: var(--bg-ds-surface-300);
    outline: none;
    border: 2px solid var(--border-ds-primary-300);
  }

  .custom-surface900.has-text {
    background-color: var(--bg-ds-surface-600);
    border: 1px solid var(--border-ds-primary-300);
  }

  .custom-surface900.has-text:not(:focus) {
    border: none;
  }

  .custom-surface900.entered {
    background-color: var(--bg-ds-surface-600);
    border: none;
  }

  .custom-surface900.entered:focus {
    background-color: var(--bg-ds-surface-600);
    border: 2px solid var(--border-ds-primary-300);
  }

  .custom-surface900.entered:hover {
    background-color: var(--bg-ds-surface-500);
    border: 1px solid var(--border-ds-neutral-300);
  }

  .custom-surface900:not(:focus):hover {
    background-color: var(--bg-ds-surface-500);
    border: 1px solid var(--border-ds-neutral-300);
  }
</style>
