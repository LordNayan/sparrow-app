<script lang="ts">
  /**
   * Components
   */
  import { LabelField, Textarea } from "@sparrow/library/forms";

  /**
   * Types
   */
  import type { ProfileForm } from "../../../../types";

  /**
   * Constants
   */
  import { DESCRIPTION_CONFIG } from "../../../../constants";

  /**
   * Exports
   */
  export let profileForm: ProfileForm;

  /**
   * Data
   */
  const TEXTAREA_ID: string = "team-description-area";
</script>

<div class="pb-2">
  <!-- 
    -- Textarea with Labels 
  -->
  <LabelField
    inputLabelId={TEXTAREA_ID}
    headerLabelText={DESCRIPTION_CONFIG.TITLE}
    supportLabelText={DESCRIPTION_CONFIG.DESCRIPTION}
    type="textarea"
    maxTextLength={DESCRIPTION_CONFIG.MAX_TEXT_SIZE}
    currentTextLength={profileForm?.description?.value?.length}
    helpLabel={true}
  >
    <Textarea
      id={TEXTAREA_ID}
      bind:value={profileForm.description.value}
      placeholder={DESCRIPTION_CONFIG.PLACEHOLDER}
      height={"77px"}
      defaultBorderColor="transparent"
      hoveredBorderColor="var(--border-ds-neutral-300)"
      focusedBorderColor={"var(--border-ds-primary-300)"}
      class="text-ds-font-size-14 bg-tertiary-300 text-ds-font-weight-medium px-2 py-2 border-radius-4"
      style="outline:none;"
      disabled={false}
      maxlength={DESCRIPTION_CONFIG.MAX_TEXT_SIZE}
      placeholderColor={"var(--text-secondary-200)"}
    />
  </LabelField>
</div>
