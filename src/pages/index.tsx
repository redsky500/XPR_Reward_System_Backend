import Faq from "@/components/Faq";
import Header from "@/components/Header";
import type { NextPage } from "next";

const Home: NextPage = () => {

    return (
        <>
            <Header />
            <section className="home-banner">
                <div className="w-full">
                    <div className="relative">
                        <div className="">


                            <img
                                src="img/hero-bg.png"
                                className="w-full justify-center flex items-center image-mask mt-20"
                            />
                        </div>
                    </div>
                    <div className="bg-0 mx-4 sm:mx-32 m-auto md:p-0 text-[20px] md:text-[18px]  xl:text-[20px] lg:absolute lg:w-[700px] top-[20%] left-[5%] xl:top-[23%] rounded-xl mt-16 lg:mt-4 text-center lg:top-[18%]">
                        <div className="text-white rounded-xl text-left p-4 sm:p-[44px]">
                            <br></br>
                            <b className="text-6xl py-12" style={{ fontFamily: 'Syne, sans-serif' }}>
                                Opulence Reward System on The XPRL Never Felt So Good.
                            </b>


                            <br />
                            <br />
                            <h6>
                                Opulence provides a non-custodial way for projects to reward their communities for holding XRPL tokens
                            </h6>


                        </div>

                    </div>
                </div>
            </section>
            <section>
                <p className="text-center"><b className=" text-[50px]"> Tokenomics </b></p>
                <div>
                </div>
            </section>
            <section>
                <Faq/>
            </section>
        </>
    );
};

export default Home;
