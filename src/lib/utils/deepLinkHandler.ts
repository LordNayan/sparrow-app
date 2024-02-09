import { handleLoginV2 } from "../../pages/Auth/login-page/login-page";
import { handleRegisterV2 } from "../../pages/Auth/register-page/register-page";

export const handleDeepLinkHandler = async (urls: string[]) => {
  if (urls.length) {
    const url = urls[0];
    if (url.indexOf("welcome") != -1) {
      handleRegisterV2(url);
    } else if (url.indexOf("refreshToken") != -1) {
      await handleLoginV2(urls[0]);
    }
  }
};
