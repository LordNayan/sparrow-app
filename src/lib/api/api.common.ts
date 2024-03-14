/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { type Method } from "axios";
import type { RequestData } from "../utils/dto/requestdata";
import { getUserToken, getRefToken } from "$lib/utils/token";
import { refreshToken } from "$lib/services/auth.service";
import constants from "$lib/utils/constants";
import { setAuthJwt } from "$lib/utils/jwt";
import { isLoading } from "$lib/store/auth.store";
import { ErrorMessages } from "$lib/utils/enums/enums";
import { invoke } from "@tauri-apps/api/core";
import { HeaderDashboardViewModel } from "$lib/components/header/header-dashboard/HeaderDashboard.ViewModel";
import MixpanelEvent from "$lib/utils/mixpanel/MixpanelEvent";
import { Events } from "$lib/utils/enums/mixpanel-events.enum";
import type { MakeRequestResponse } from "$lib/utils/interfaces/common.interface";
import { AzureKeyCredential, OpenAIClient } from "@azure/openai";
const apiTimeOut = constants.API_SEND_TIMEOUT;

const error = (
  error: string,
  data?: any,
  tabId: string = "",
): MakeRequestResponse => {
  return {
    status: "error",
    isSuccessful: false,
    message: error,
    data,
    tabId,
  };
};

const success = (data: any, tabId: string): MakeRequestResponse => {
  return {
    status: "success",
    isSuccessful: true,
    message: "",
    data,
    tabId,
  };
};

const getAuthHeaders = () => {
  return {
    Authorization: `Bearer ${getUserToken()}`,
  };
};

const getMultipartAuthHeaders = () => {
  return {
    "Content-Type": "multipart/form-data",
    Authorization: `Bearer ${getUserToken()}`,
  };
};

// const getHeaders = () => {
//   return {
//     "Content-type": "application/json",
//     Authorization: `Bearer ${getUserToken()}`,
//   };
// };

const getRefHeaders = () => {
  return {
    Authorization: `Bearer ${getRefToken()}`,
  };
};

export const regenerateAuthToken = async (
  method: Method,
  url: string,
  requestData?: RequestData,
) => {
  const response = await refreshToken();
  if (response.isSuccessful) {
    setAuthJwt(constants.AUTH_TOKEN, response.data.data.newAccessToken.token);
    setAuthJwt(constants.REF_TOKEN, response.data.data.newRefreshToken.token);
    if (requestData && requestData.headers) {
      requestData.headers = getAuthHeaders();
    }
    return await makeRequest(method, url, requestData);
  } else {
    throw "error refresh token: " + response.message;
  }
};

const makeRequest = async (
  method: Method,
  url: string,
  requestData?: RequestData,
) => {
  isLoading.set(true);
  try {
    const response = await axios({
      method: method,
      url: url,
      data: requestData?.body,
      headers: requestData?.headers,
    });

    if (response.status === 201 || response.status === 200) {
      return success(response.data, "");
    } else {
      return error(response.data.message);
    }
  } catch (e) {
    if (
      e.response?.data?.statusCode === 401 &&
      e.response?.data?.message === ErrorMessages.ExpiredToken
    ) {
      return await regenerateAuthToken(method, url, requestData);
    } else if (
      e.response?.data?.statusCode === 401 &&
      e.response.data.message === ErrorMessages.Unauthorized
    ) {
      const _viewModel = new HeaderDashboardViewModel();
      await _viewModel.clientLogout();
      return error("unauthorized");
    }
    if (e.message) {
      return error(e.response.data.message);
    } else if (e.response.data) {
      return error(e.response.data.message);
    }
    return error(e);
  } finally {
    isLoading.set(false);
  }
};

function timeout(timeout: number) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      rej("Timeout");
    }, timeout);
  });
}

export async function callOpenAI(request: string) {
  try {
    const client = new OpenAIClient(
      "https://sparrow6014458908.openai.azure.com/",
      new AzureKeyCredential(""),
    );
    // const responseStreamGpt3 = await client.streamChatCompletions(
    //   "gpt-35-turbo-instruct",
    //   [
    //     `Give me selectable suggestions on improving the below api endpoint.
    //   API - /user/details?authorization=jsdnbjlbn1io3bjlqe3bnlfbn3io3jkl2nkljn3kl?api_key=husdvghjd675678`,
    //   ],
    // );

    const responseStreamGpt4 = await client.streamChatCompletions("gpt-4", [
      {
        role: "user",
        content: `Given a REST API in custome strigified JSON format, parse it and suggest improvements in the form of 5 concise bullet points suitable for a dropdown menu. Focus on aspects such as efficiency, security, scalability, and user experience. Provide actionable suggestions that can be implemented directly by selecting from the dropdown menu. Remember to only provide suggestions that can be directly made to the api like changing request body type, making the url path according to REST standards or shifting something from query to header or header to body or vice versa. The tool that will use this AI prompt is a simple API testing tool that supports query params, headers, path params and json body. Just follow REST standards when suggesting. 

        Give response in a html based format that can be shown in a div. Remember that I am streaming the response so data might not contain a complete point but you have to make sure to give line breaks at proper place such that points are seperated properly. Also put a empty line between each point. No need to start with the keyword html. Put important things inside some kind of highlight and keep the points concise.

        Highlight IMPORTANT HEADINGS and then start the content. Make sure to give proper line breaks between headings.
        API - ${request}`,
        name: "Nayan",
      },
    ]);
    const readableStream = responseStreamGpt4.getReader();
    console.log("HERE", readableStream);
    // Process the response stream (call this in your main script)
    await processStream(readableStream);
  } catch (e) {
    console.log(e);
  }
}

async function processStream(reader: any) {
  let result = await reader.read();
  let currentText = "";
  while (!result.done) {
    if (result.value && result.value.choices && result.value.choices.length) {
      const newText = result.value.choices[0].delta.content;
      for (let i = 0; i < newText.length; i++) {
        currentText += newText[i];

        if (currentText.startsWith("^\\d.")) {
          currentText = "\n" + currentText;
        }
        document.getElementById("ai-text")!.innerHTML = currentText;
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
    }
    result = await reader.read();
  }
}

const makeHttpRequest = async (
  url: string,
  method: string,
  headers: string,
  body: string,
  request: string,
  tabId: string,
) => {
  callOpenAI();
  console.table({ url, method, headers, body, request });
  let response;
  MixpanelEvent(Events.SEND_API_REQUEST, { method: method });
  url = url.trim().replace(/ /g, "%20");
  return Promise.race([
    timeout(apiTimeOut),
    invoke("make_http_request", {
      url,
      method,
      headers,
      body,
      request,
      tabId,
    }),
  ])
    .then(async (data: string) => {
      try {
        response = JSON.parse(data);
        const tabId = response.tabId;
        response = JSON.parse(response.body);
        return success(response, tabId);
      } catch (e) {
        return error("error");
      }
    })
    .catch(() => {
      return error("error");
    });
};

export {
  makeRequest,
  getAuthHeaders,
  getRefHeaders,
  makeHttpRequest,
  getMultipartAuthHeaders,
  // getHeaders,
};
