/* eslint-disable @typescript-eslint/no-explicit-any */
import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
import { registerUser } from "$lib/services/auth.service";
import { register_user } from "$lib/store/auth.store";
import { jwtDecode } from "$lib/utils/jwt";
import { notifications } from "$lib/utils/notifications";
import { checkValidation, registrationSchema } from "$lib/utils/validation";
import { navigate } from "svelte-navigator";
import { Events } from "$lib/utils/enums/mixpanel-events.enum";
import { sendUserDataToMixpanel } from "../login-page/login-page";

const handleRegister = async (response: any) => {
  register_user.set(response);
  if (response.isSuccessful) {
    const userDetails = jwtDecode(response.data?.data?.accessToken?.token);
    sendUserDataToMixpanel(userDetails);
    MixpanelEvent(Events.USER_SIGNUP, {
      Login_Method: "Email",
      Success: response.isSuccessful,
    });
    notifications.success("Registration successful!");
    navigate("/welcome");
  } else {
    notifications.error(response.message);
    throw "error registering user: " + response.message;
  }
};

export const handleRegisterV2 = async (url: string) => {
  const params = new URLSearchParams(url.split("?")[1]);
  const response = params.get("response");
  if (response) {
    const registrationResponse = JSON.parse(response);
    register_user.set(registrationResponse);
    const userDetails = jwtDecode(
      registrationResponse.data?.data?.accessToken?.token,
    );
    sendUserDataToMixpanel(userDetails);
    MixpanelEvent(Events.USER_SIGNUP, {
      Login_Method: "Email",
      Success: true,
    });
    notifications.success("Registration successful!");
    navigate("/welcome");
  }
};

export const handleRegisterValidation = async (userData) => {
  const { isError, errorObject } = await checkValidation(
    registrationSchema,
    userData,
  );
  if (isError) {
    return errorObject;
  }
  return handleRegister(userData);
};
