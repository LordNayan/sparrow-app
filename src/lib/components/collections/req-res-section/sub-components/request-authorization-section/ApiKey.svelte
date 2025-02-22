<script lang="ts">
  import Dropdown from "$lib/components/dropdown/Dropdown.svelte";
  import { AuthSection } from "$lib/utils/enums/authorization.enum";
  import { RequestAuthProperty } from "$lib/utils/enums/request.enum";
  import { EnvironmentHeper } from "$lib/utils/helpers/environment.helper";
  import type { ApiKey } from "$lib/utils/interfaces/request.interface";
  import EnvironmentPicker from "../environment-picker/EnvironmentPicker.svelte";
  export let apiData: ApiKey;
  export let callback;
  export let environmentVariables;

  const environmentHelper = new EnvironmentHeper();
  const handleAuthChange = () => {
    callback(apiData, RequestAuthProperty.API_KEY);
  };

  const handleDropdown = (
    tab: AuthSection.HEADER | AuthSection.QUERY_PARAMETER,
  ) => {
    apiData.addTo = tab;
    callback(apiData, RequestAuthProperty.API_KEY);
  };
  let trackParanthesis: unknown[] = [];
  let trackCursor: number;
  let tempText = "";
  let focusedInput;
  let environmentAxisY: number;
  let environmentAxisX: number;

  let filterData = [];
  $: {
    if (trackCursor) {
      if (trackParanthesis.length === 2)
        filterData = environmentHelper.filterEnvironments(
          environmentVariables,
          tempText,
          trackParanthesis,
          trackCursor,
        );
    }
    if (trackParanthesis) {
      if (trackParanthesis.length === 2 && trackCursor)
        filterData = environmentHelper.filterEnvironments(
          environmentVariables,
          tempText,
          trackParanthesis,
          trackCursor,
        );
    }
  }
</script>

<div class="d-flex flex-column w-100 ps-1 pt-4 pe-1">
  <div
    class="col-12 d-flex align-items-center justify-content-between text-requestBodyColor mb-3"
    style="font-size: 12px; font-weight:500"
  >
    <p class="col-2 mb-0">Auth Key</p>

    <div class="col-10 position-relative">
      <input
        type="text"
        style="outline: none;"
        id={"auth-key"}
        class="w-100 bg-backgroundColor border-0 h-75 p-2 ps-0"
        placeholder="Enter Auth Key"
        bind:value={apiData.authKey}
        on:input={() => {
          handleAuthChange();
          tempText = apiData.authKey;
          trackParanthesis = environmentHelper.balanceParanthesis(tempText);
        }}
        on:keyup={(e) => {
          trackCursor = e.target.selectionStart;
        }}
        on:blur={() => {
          setTimeout(() => {
            tempText = "";
            trackParanthesis = [];
            trackCursor = undefined;
            filterData = [];
          }, 300);
        }}
        on:focus={(e) => {
          tempText = apiData.authKey;
          focusedInput = "first";
          trackParanthesis = environmentHelper.balanceParanthesis(tempText);
          const elem = document.getElementById("auth-key");
          environmentAxisY = elem.getBoundingClientRect().top + 30;
          environmentAxisX = elem.getBoundingClientRect().left;
        }}
      />
      {#if focusedInput === "first" && trackParanthesis.length === 2 && filterData.length > 0}
        <EnvironmentPicker
          {environmentAxisX}
          {environmentAxisY}
          {filterData}
          inputText={apiData.authKey}
          {trackCursor}
          {trackParanthesis}
          updateText={(text) => {
            apiData.authKey = text;
          }}
          handleInputValue={() => {
            handleAuthChange();
            trackParanthesis = [];
            trackCursor = undefined;
            filterData = [];
          }}
        />
      {/if}
    </div>
  </div>
  <div
    class="col-12 d-flex align-items-center justify-content-between text-requestBodyColor mb-3"
    style="font-size: 12px; font-weight:500"
  >
    <p class="col-2 mb-0">Auth Value</p>
    <div class="col-10 position-relative">
      <input
        type="text"
        style="outline: none;"
        class="w-100 h-75 p-2 ps-0 border-0 bg-backgroundColor"
        id={"auth-value"}
        placeholder="Enter Auth Value"
        bind:value={apiData.authValue}
        on:input={() => {
          handleAuthChange();
          tempText = apiData.authValue;
          trackParanthesis = environmentHelper.balanceParanthesis(tempText);
        }}
        on:keyup={(e) => {
          trackCursor = e.target.selectionStart;
        }}
        on:blur={() => {
          setTimeout(() => {
            tempText = "";
            trackParanthesis = [];
            trackCursor = undefined;
            filterData = [];
          }, 300);
        }}
        on:focus={(e) => {
          tempText = apiData.authValue;
          focusedInput = "second";
          trackParanthesis = environmentHelper.balanceParanthesis(tempText);
          const elem = document.getElementById("auht-value");
          environmentAxisY = elem.getBoundingClientRect().top + 30;
          environmentAxisX = elem.getBoundingClientRect().left;
        }}
      />
      {#if focusedInput === "second" && trackParanthesis.length === 2 && filterData.length > 0}
        <EnvironmentPicker
          {environmentAxisX}
          {environmentAxisY}
          {filterData}
          inputText={apiData.authValue}
          {trackCursor}
          {trackParanthesis}
          updateText={(text) => {
            apiData.authValue = text;
          }}
          handleInputValue={() => {
            handleAuthChange();
            trackParanthesis = [];
            trackCursor = undefined;
            filterData = [];
          }}
        />
      {/if}
    </div>
  </div>
  <div
    class="col-12 d-flex justify-content-between text-requestBodyColor"
    style="font-size: 12px; font-weight:500"
  >
    <p class="col-2 mt-3 mb-0" style="margin-top: 0.8rem !important;">Add to</p>
    <div class="col-10 p-2 ps-0 position-relative">
      <button class="bg-backgroundColor border-0">
        <p class="">
          <Dropdown
           dropDownType={{type:"text",title:apiData.addTo}}
            data={[
              {
                name: "Header",
                id: AuthSection.HEADER,
                dynamicClasses:"text-whiteColor"
              },
              {
                name: "Query Parameter",
                id: AuthSection.QUERY_PARAMETER,
                dynamicClasses:"text-whiteColor"
              },
            ]}
            onclick={handleDropdown}
          />
        </p>
      </button>
    </div>
  </div>
</div>

<style>
  input::placeholder {
    color: var(--button-color);
    font-weight: 500;
  }
</style>
