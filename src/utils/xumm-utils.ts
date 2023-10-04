import { XummSdk } from 'xumm-sdk';
import { XummGetPayloadResponse, XummJsonTransaction, XummPostPayloadBodyJson } from 'xumm-sdk/dist/src/types';

const xumm = new XummSdk();

export const requestTransactionAndGetResolve = async (data: XummPostPayloadBodyJson | XummJsonTransaction) => {
  const payload = await xumm.payload.createAndSubscribe(data, eventMessage => {
    if (Object.keys(eventMessage.data).indexOf('opened') > -1) {
      // Update the UI? The payload was opened.
    }
    if (Object.keys(eventMessage.data).indexOf('signed') > -1) {
      // The `signed` property is present, true (signed) / false (rejected)
      return eventMessage;
    }
  })
  .then(({ resolved }) => {
    return resolved;
  });
  const result = await xumm.payload.get((payload as any).uuid) as XummGetPayloadResponse;
  return result;
}

/**
 * Read xumm payload response and and return the result
 * @param {Object} payloadResponse - Response data
 * @param {Function} func - Callback function called when the user signs the request
 * @returns {Object} - Returns an object with status and data properties
 *                    status can be "success", "signed", "failed", or "rejected"
 *                    data can be a string or the response type
 */
export const readPayloadResponse = async (payloadResponse: XummGetPayloadResponse, func?: () => Promise<any>) => {
  const { meta: { resolved, signed }, response }  = payloadResponse;
  if(resolved) {
    if(!signed) {
      return {
        status: "rejected",
        data: {
          response,
        },
      };
    }
    if(response.dispatched_result !== "tesSUCCESS") {
      return {
        status: "signed",
        data: {
          response,
        },
      };
    }
    try {
      func && await func();
    } catch (error) {
      return {
        status: "failed",
        data: "Cannot save to DB.",
      };
    }
    return {
      status: "success",
      data: {
        response,
      },
    };
  }
  else {
    return {
      status: "failed",
      data: "The request expired.",
    };
  }
}

/**
 * Read xumm payload response and and return the result for wallet connection
 * @param {Object} payloadResponse - Response data
 * @param {Function} func - Callback function called when the user signs the request
 * @returns {Object} - Returns an object with status and data properties
 *                    status can be "success", "signed", "failed", or "rejected"
 *                    data can be a string or the response type
 */
export const readPayloadResponseForConnect = async (payloadResponse: XummGetPayloadResponse) => {
  const { meta: { resolved, signed }, response, application }  = payloadResponse;
  if(resolved) {
    if(!signed) {
      return {
        status: "rejected",
        data: {
          response,
        },
      };
    }
    if(response.dispatched_result !== "tesSUCCESS") {
      return {
        status: "signed",
        data: {
          account: response.account,
          user_token: application.issued_user_token,
        },
      };
    }
    
    return {
      status: "success",
      data: {
        response,
      },
    };
  }
  else {
    return {
      status: "failed",
      data: "The request expired.",
    };
  }
}

export const requestTransactionAndGetMessage = async (data: XummPostPayloadBodyJson | XummJsonTransaction) => {
  const payload = await xumm.payload.create(data);
  return payload;
}

export const subscribeTransaction = async (uuid: string) => {
  await xumm.payload.subscribe(uuid, eventMessage => {
    if (Object.keys(eventMessage.data).indexOf('opened') > -1) {
      // Update the UI? The payload was opened.
    }
    if (Object.keys(eventMessage.data).indexOf('signed') > -1) {
      // The `signed` property is present, true (signed) / false (rejected)
      return eventMessage;
    }
  })
  .then(({ resolved }) => {
    return resolved;
  });

  const result = await xumm.payload.get(uuid) as XummGetPayloadResponse;

  return result;
}

export const requestVerifyUserToken = async (userToken: string): Promise<boolean> => {
  const tokenResult = await xumm.verifyUserToken(userToken);
  return tokenResult.active;
}

export const validateAccount = async (account: string, user_token: string): Promise<boolean> => {
  const pong = await xumm?.ping();
  const payload = {
    custom_meta: {
      instruction: "Sign request from " + pong?.application.name + " to claim reward.",
    },
    txjson: {
      TransactionType: "SignIn",
    },
    user_token,
  } as XummPostPayloadBodyJson;
  const result = await requestTransactionAndGetResolve(payload);

  return account === result.response.signer;
}

export const createOffer = async (data: XummPostPayloadBodyJson | XummJsonTransaction) => {
  return await requestTransactionAndGetMessage(data);
}