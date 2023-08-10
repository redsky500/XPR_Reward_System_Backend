import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { isMobile } from "react-device-detect";
import * as AIicon from "react-icons/ai";
import { motion } from "framer-motion";

export default function NftHeader() {
    const router = useRouter();
    const [open, setOpen] = useState(false);



    return (
     

        <nav className="fixed w-full z-20 top-0 left-0 border-b border-gray-200 dark:border-gray-600">
            <div className="max-w-screen-2xl flex flex-wrap items-center justify-between m-auto p-4">
                <Link href="/" className="flex items-end">
                    <img src="img/logo.png" className="h-12 mr-3" alt="Flowbite Logo" />
                </Link>
                <div className="flex md:order-2">
                    <button type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-7 text-[18px] py-3 text-center mr-3 md:mr-0">Sign In</button>
                    <button data-collapse-toggle="navbar-sticky" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-sticky" aria-expanded="false" onClick={() => setOpen(true)}>
                        <span className="sr-only">Open main menu</span>
                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15" />
                        </svg>
                    </button>
                </div>
                <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-sticky">
                    <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg md:flex-row md:space-x-8 md:mt-0 md:border-0 dark:border-gray-700">
                        <li>
                            <Link href="#" className={`block py-2 pl-3 pr-4 text-white rounded md:bg-transparent  md:p-0 uppercase ${router.pathname === '/other1' ? 'md:text-blue-700 md:dark:text-blue-500' : '' }`} aria-current="page">Token Reward</Link>
                        </li>
                        <li>
                            <Link href="/nft" className={`block py-2 pl-3 pr-4 text-white  rounded md:p-0 uppercase ${router.pathname === '/nft' ? 'md:text-blue-700 md:dark:text-blue-500' : '' }`}>NFT Faucet</Link>
                        </li>
                        <li>
                            <Link href="#" className={`block py-2 pl-3 pr-4 text-white rounded md:p-0 uppercase ${router.pathname === '/other' ? 'md:text-blue-700 md:dark:text-blue-500' : '' }`}>Society NFT Faucet</Link>
                        </li>

                    </ul>
                </div>
                {open && (
                    <motion.section
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ ease: "easeInOut", duration: 0.2, delay: 0.1 }}
                    >
                        <div className="fixed top-0 right-0 left-20 bg-gray-800 opacity-[100%] h-[100%]">
                            <div
                                className="w-full flex justify-end p-7 cursor-pointer"
                                onClick={() => setOpen(false)}
                            >
                                <AIicon.AiOutlineClose
                                    color="white"
                                    fontWeight={800}
                                    size={20}
                                />
                            </div>
                            <div className="w-full p-10 flex justify-center">
                                <div className="w-full text-center">
                                    <Link href="/">
                                        <div
                                            className={`text-[1.5rem] hover:text-white duration-300 transition-all cursor-pointer list-none ${router.pathname === "/"
                                                    ? "text-blue"
                                                    : "text-white"
                                                }`}
                                            onClick={() => setOpen(false)}
                                        >
                                            Token Reward
                                        </div>
                                    </Link>
                                    <Link href="/nft">
                                        <div
                                            className={`text-[1.5rem] hover:text-white duration-300 transition-all cursor-pointer list-none ${router.pathname === "/nft"
                                                    ? "text-blue"
                                                    : "text-white"
                                                }`}
                                            onClick={() => setOpen(false)}
                                        >
                                            NFT Faucet
                                        </div>
                                    </Link>
                                    <Link href={"/society-nft"}>
                                        <div
                                            className={`text-[1.5rem] hover:text-white duration-300 transition-all cursor-pointer list-none ${router.pathname === "/society-nft"
                                                    ? "text-blue"
                                                    : "text-white"
                                                }`}
                                            onClick={() => setOpen(false)}
                                        >
                                            Society NFT Faucet
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.section>
                )}
            </div>
        </nav>

    );
}
