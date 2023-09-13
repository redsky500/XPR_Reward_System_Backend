import { requestVerifyUserToken } from "../../utils/xumm-utils";

export const validateUser = async (walletAddress: string, user_token: string) => {
  if (!walletAddress) {
    return {
      status: "failed",
      data: "Please provide a account address!"
    };
    }
  
  if (!user_token) {
    return {
      status: "failed",
      data: "Please connect wallet first!"
    };
  }

  if (!(await requestVerifyUserToken(user_token))) {
    return {
      status: "failed",
      data: "Invalid user token!"
    };
  }
  return {
    status: "success",
    data: "Valid user"
  };
}
