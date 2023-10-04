import axios from "axios";

const backendUrl = process.env.BACKEND_API_URL;

export interface ICollection {
  name: string;
  issuer: string;
  taxon: number;
  thumbnail: string;
  royalty: number;
  description?: string;
  random?: boolean;
  floorPrice?: any; //Amount
  itemsCount?: number;
  links?: { [index: string]: string };
  verified?: boolean;
  featured?: boolean;
  notAnnounced?: boolean;
}

export interface NFTXrplService {
  NFTokenID: string;
  Issuer: string;
  Owner: string;
  Taxon: number;
  Sequence: number;
  TransferFee: number;
  Flags: number;
  URI: string;
}

/**
 * Fetch art society NFT collections from marketplate backend api
 * URL is https://opx-marketplace.onrender.com/api/collection/societyCollections
 * 
 * @returns {ICollection[]} - Returns an object with status and data properties
 */
export const fetchNFTListForSociety = async () => {
  try {
    const res = await axios.get(
      `${backendUrl}api/collection/societyCollections`
    );
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

/**
 * Fetch art  NFTs from marketplate backend api
 * URL is https://opx-marketplace.onrender.com/api/society/utilityNFTs
 * 
 * @returns {NFTXrplService[]} - Returns an object with status and data properties
 */
export const fetchUtilityNFTs = async () => {
  try {
    const res = await axios.get(
      `${backendUrl}api/society/utilityNFTs`
    );
    return res.data;
  } catch (error) {
    console.error(error);
  }
};

/**
 * Fetch art  NFTs from marketplate backend api
 * URL is https://opx-marketplace.onrender.com/api/society/societyNFTs
 * 
 * @returns {NFTXrplService[]} - Returns an object with status and data properties
 */
export const fetchSocietyNFTs = async () => {
  try {
    const res = await axios.get(
      `${backendUrl}api/society/societyNFTs`
    );
    return res.data;
  } catch (error) {
    console.error(error);
  }
};
