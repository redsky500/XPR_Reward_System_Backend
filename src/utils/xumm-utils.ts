import { Transaction } from 'xrpl';
import { XummSdk } from 'xumm-sdk';
import { XummGetPayloadResponse, XummJsonTransaction, XummPostPayloadBodyJson } from 'xumm-sdk/dist/src/types';

const xumm = new XummSdk();

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