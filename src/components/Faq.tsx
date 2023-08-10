import React, { useState } from 'react'
import * as AIicon from "react-icons/fa";


export default function Faq() {
    const [data, setData] = useState([{
        id: 1,
        question: 'What are the objectives of staykx?',
        ans: 'StaykX is a platform designed to facilitate the Soft-Stayking of XRP, STX and other XRPL tokens in various stayking pools. The primary objectives of StaykX are to enable users to easily earn daily rewards from their favourite XRPL token holdings, support the growth of the XRPL project ecosystem, and provide a secure, non-custodial and user-friendly environment for stayking.',
        isOpen: false
    }, {
        id: 2,
        question: 'What are the objectives of staykx?',
        ans: 'StaykX is a platform designed to facilitate the Soft-Stayking of XRP, STX and other XRPL tokens in various stayking pools. The primary objectives of StaykX are to enable users to easily earn daily rewards from their favourite XRPL token holdings, support the growth of the XRPL project ecosystem, and provide a secure, non-custodial and user-friendly environment for stayking.',
        isOpen: false
    }, {
        id: 3,
        question: 'What are the objectives of staykx?',
        ans: 'StaykX is a platform designed to facilitate the Soft-Stayking of XRP, STX and other XRPL tokens in various stayking pools. The primary objectives of StaykX are to enable users to easily earn daily rewards from their favourite XRPL token holdings, support the growth of the XRPL project ecosystem, and provide a secure, non-custodial and user-friendly environment for stayking.',
        isOpen: false
    }]
    )
    const open = (id: Number) => {       
        data[data.findIndex(el => el.id === id)].isOpen = true;
        console.log(data)
        setData(data)
    }
    return (
        <div className="grid grid-cols-1 mt-16">
            <div className="mx-auto w-[90%] ">
                <div className="accordion-container faq space-y-2.5">
                    {data.map((obj) => {
                        return (
                            
                                <div className="ac mt-0 bg-black border-none" key={obj.id}>
                                    <h2 className="ac-header">
                                        <button
                                            type="button"
                                            className="ac-trigger !p-5 relative !flex w-full items-center justify-between gap-2 !text-lg !font-nunito !font-semibold !text-dark after:!hidden">
                                            <span className="leading-[22px]">{obj.question}</span>
                                            <div className="leading-[22px]">
                                                {obj.isOpen ? <AIicon.FaMinus color="white" opacity={1} /> : <AIicon.FaPlus color="white" onClick={() => open(obj.id)} />}
                                            </div>
                                        </button>
                                    </h2>
                                    {
                                        obj.isOpen ? <div className="ac-panel">
                                            <p className="ac-text !p-[26px] !pt-[6px] !font-nunito !text-[15px] !font-normal !leading-[22px] !text-muted">{obj.ans}</p>
                                        </div> : ''
                                    }
                                </div>
                        
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
