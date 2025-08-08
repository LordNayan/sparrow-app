import posthog from "posthog-js";
import constants from "@app/constants/constants";
let isInitialized = false;
export const initPostHog = () => {
  if (!isInitialized) {
    posthog.init(constants.POSTHOG_CONNECTION_API_KEY, {
      api_host: constants.POSTHOG_API_URL,

      person_profiles: "always",
    });

    isInitialized = true;
    return true;
  }
  return false;
};
export const captureEvent = (
  eventName: string,
  properties?: Record<string, any>,
) => {
  if (!isInitialized) {
    console.warn("PostHog not initialized before capturing event");
    initPostHog();
  }
  posthog.capture(eventName, properties);
};

export const identifyUser = (userId: string, email?: string): void => {
  if (!posthog) {
    console.error("PostHog is not initialized");
    return;
  }

  // Always include email as a property, even if userId is the email
  posthog.identify(userId, {
    email: email || userId,
  });
};
export const posthogClient = posthog;
