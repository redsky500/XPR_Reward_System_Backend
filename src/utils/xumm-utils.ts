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
const requestXummTransaction = async (data: XummPostPayloadBodyJson | XummJsonTransaction, func?: () => Promise<void>) => {
  
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
  const {meta: {resolved, signed, cancelled}, response}  = await xumm.payload.get((payload as any).uuid) as XummGetPayloadResponse;
  
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

    func && await func();
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

export default requestXummTransaction;