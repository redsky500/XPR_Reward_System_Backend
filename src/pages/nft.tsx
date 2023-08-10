import Header from "@/components/Header";
import type { NextPage } from "next";


const Nft: NextPage = () => {
    const scrollToBottom = () => {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "smooth",
        });
    };

    return (
        <>
            <Header />
           <section></section>
        </>
    );
};

export default Nft;
