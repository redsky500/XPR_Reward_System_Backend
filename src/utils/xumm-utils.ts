import { XummSdk } from 'xumm-sdk';
import { XummGetPayloadResponse, XummJsonTransaction, XummPostPayloadBodyJson } from 'xumm-sdk/dist/src/types';

const xumm = new XummSdk();

/**
 * Create xumm payload and wait for user's interaction and return the result
 * @param {Object} data - Payload data and user token
 * @param {Function} func - Callback function called when the user signs the request
 * @returns {Object} - Returns an object with status and data properties
 *                    status can be "success", "signed", "failed", or "rejected"
 *                    data can be a string or the response type
 */
export const requestXummTransaction = async (data: XummPostPayloadBodyJson | XummJsonTransaction, func?: () => Promise<any>) => {
  const {meta: {resolved, signed, cancelled}, response}  = await requestTransaction(data);
  
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

    const saveResult = func && await func();
    
    if(!(saveResult?.walletAddress)) {
      return {
        status: "failed",
        data: "Could not save in db.",
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

export const requestTransaction = async (data: XummPostPayloadBodyJson | XummJsonTransaction) => {
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
  })
  const result = await xumm.payload.get((payload as any).uuid) as XummGetPayloadResponse;
  return result;
}

export const requestSignTransaction = async (user_token?: string) => {
  const pong = await xumm?.ping();
  const data = {
    custom_meta: {
      instruction: "Sign request from " + pong?.application.name + " to claim reward.",
    },
    txjson: {
      TransactionType: "SignIn",
    },
    user_token,
  } as XummPostPayloadBodyJson;
  const result = requestTransaction(data);
  return result;
}

export const requestVerifyUserToken = async (userToken: string): Promise<boolean> => {
  const tokenResult = await xumm.verifyUserToken(userToken);

  return tokenResult.active;
}

export const validateAccount = async (account: string, user_token: string): Promise<boolean> => {
  const signResult = await requestSignTransaction(user_token);

  return account === signResult.response.signer;
}
