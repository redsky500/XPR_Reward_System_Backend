import { Request, Response } from "express";
import prisma from "../../prisma/prisma-client";
import { TokenReward } from "@prisma/client";

export const tokenLogin = async (req: Request, res: Response) => {
  try {
    const { walletAddress, type, tokenAmount } = req.body;
    if (!walletAddress || !type) {
      throw new Error("Please provide all the data!");
    }
    const getData = await getDatabase(type, walletAddress);
    if (getData) {
      res.json({ message: "User already registered" });
    }
    await prisma.tokenReward.create({
      data: {
        walletAddress: walletAddress,
        tokenAmount: tokenAmount,
      },
    });
    res.json({ message: "User added successfull" });
  } catch {
    res.json("Having issues");
  }
};

export const XRPLogin = async (req: Request, res: Response) => {
  try {
    const { walletAddress, type, tokenAmount } = req.body;
    if (!walletAddress || !type) {
      throw new Error("Please provide all the data!");
    }
    const getData = await getDatabase(type, walletAddress);
    if (getData) {
      res.json({ message: "User already registered" });
    }
    await prisma.xRPReward.create({
      data: {
        walletAddress: walletAddress,
        tokenAmount: tokenAmount,
      },
    });
    res.json({ message: "User added successfully" });
  } catch {
    res.json("Having issues");
  }
};

export const OPLLogin = async (req: Request, res: Response) => {
  try {
    const { walletAddress, type, tokenAmount } = req.body;
    if (!walletAddress || !type) {
      throw new Error("Please provide all the data!");
    }
    const getData = await getDatabase(type, walletAddress);
    if (getData) {
      res.json({ message: "User already registered" });
    }
    await prisma.oPLReward.create({
      data: {
        walletAddress: walletAddress,
        tokenAmount: tokenAmount,
      },
    });
    res.json({ message: "User added successfully" });
  } catch {
    res.json("Having issues");
  }
};

export const societyLogin = async (req: Request, res: Response) => {
  try {
    const { walletAddress, type, tokenAmount } = req.body;
    if (!walletAddress || !type) {
      throw new Error("Please provide all the data!");
    }
    const getData = await getDatabase(type, walletAddress);
    if (getData) {
      res.json({ message: "User already registered" });
    }
    await prisma.societyReward.create({
      data: {
        walletAddress: walletAddress,
        tokenAmount: tokenAmount,
      },
    });
    res.json({ message: "User added successfully" });
  } catch {
    res.json("Having issues");
  }
};

const getDatabase = async (type: string, walletAddress: string) => {
  let data: TokenReward | null | undefined;
  switch (type) {
    case "token":
      data = await getTokenData(walletAddress);
      break;
    case "xrp":
      data = await getXRPtData(walletAddress);
      break;
    case "opl":
      data = await getOPLData(walletAddress);
      break;
    case "society":
      data = await getSocietyData(walletAddress);
      break;
  }
  return data;
};

const getTokenData = async (walletAddress: string) => {
  try {
    const tokenData = await prisma.tokenReward.findFirst({
      where: {
        walletAddress: walletAddress,
      },
    });
    return tokenData;
  } catch {
    console.error("something went wrong!");
  }
};

const getXRPtData = async (walletAddress: string) => {
  try {
    const xrpData = await prisma.xRPReward.findFirst({
      where: {
        walletAddress: walletAddress,
      },
    });
    return xrpData;
  } catch {
    console.error("something went wrong!");
  }
};

const getOPLData = async (walletAddress: string) => {
  try {
    const oplReward = await prisma.oPLReward.findFirst({
      where: {
        walletAddress: walletAddress,
      },
    });
    return oplReward;
  } catch {
    console.error("something went wrong!");
  }
};

const getSocietyData = async (walletAddress: string) => {
  try {
    const society = await prisma.societyReward.findFirst({
      where: {
        walletAddress: walletAddress,
      },
    });
    return society;
  } catch {
    console.error("something went wrong!");
  }
};
