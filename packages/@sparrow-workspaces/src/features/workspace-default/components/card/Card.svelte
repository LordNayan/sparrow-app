<script lang="ts">
  import { PlusIcon } from "@sparrow/library/icons";

  export let icon;
  export let label: string;
  export let iconColor: string;
  export let iconSize: string;
  export let onClick: () => void;

  let isProcessing = false;
  const handleClick = async () => {
    if (isProcessing) return;
    isProcessing = true;
    try {
      await onClick();
    } catch (error) {
      console.error("Error in onClick handler:", error);
    } finally {
      isProcessing = false;
    }
  };
</script>

<div class="card" on:click={handleClick}>
  <div class="card-content">
    {#if icon}
      <svelte:component
        this={icon}
        color={iconColor}
        height={iconSize}
        width={iconSize}
      />
    {/if}
  </div>
  <div class="card-footer">
    <span><PlusIcon color="var(--white-color)" /></span>
    <span class="text-fs-14" style="font-weight: 400;">
      {label}
    </span>
  </div>
</div>

<style>
  .card {
    height: 120px;
    width: 155px;
    border: 0.5px solid var(--border-tertiary-400);
    border: none;
    background-color: var(--bg-ds-surface-800);
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
  }

  .card-content {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 79px;
  }

  .card-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 41px;
    border: none;
    color: var(--text-secondary-110);
    background-color: var(--text-tertiary-400);
    padding: 10px;
    font-size: 14px;
  }
</style>
