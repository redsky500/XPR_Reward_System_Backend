import { IssuedCurrency } from "xrpl";

export const OPUL_REWARD_MAX_PERCENT = 10;

export const POOL_AMOUNT = 2e3;

export const XRPL_CURRENCY_LIST: {
  symbol: string;
  currency: IssuedCurrency;
}[] = [
  {
    symbol: "Opulence",
    currency: {
      currency: "4F70756C656E6365000000000000000000000000",
      issuer: "rs5wxrBTSErywDDfPs5NY4Zorrca5QMGVd",
    },
  },
  {
    symbol: "CaRRots",
    currency: {
      currency: "436152526F747300000000000000000000000000",
      issuer: "rafgLy8LPU3mqMGCRbkJcaGWuDwoUCAuwQ",
    },
  },
  {
    symbol: "SwissTech",
    currency: {
      currency: "5377697373546563680000000000000000000000",
      issuer: "raq7pGaYrLZRa88v6Py9V5oWMYEqPYr8Tz",
    },
  },
  {
    symbol: "TPR",
    currency: {
      currency: "TPR",
      issuer: "rht98AstPWmLPQMrwd9YDrcDoTjw9Tiu4B",
    },
  },
  {
    symbol: "SOLO",
    currency: {
      currency: "534F4C4F00000000000000000000000000000000",
      issuer: "rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz",
    },
  },
  {
    symbol: "CSC",
    currency: {
      currency: "CSC",
      issuer: "rCSCManTZ8ME9EoLrSHHYKW8PPwWMgkwr",
    },
  },
  {
    symbol: "CORE",
    currency: {
      currency: "434F524500000000000000000000000000000000",
      issuer: "rcoreNywaoz2ZCQ8Lg2EbSLnGuRBmun6D",
    },
  },
];