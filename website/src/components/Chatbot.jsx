import React, { useState } from "react";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";


const ChatBot_Thinkstack = () => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleChat = () => setIsOpen(!isOpen);

    return (
        <div className="relative">
            {/* Floating Button */}
            <button
                onClick={toggleChat}
                className="fixed bottom-8 right-5 w-12 h-12 bg-[#00786F] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-50 cursor-pointer"
            >
                <IoChatbubbleEllipsesOutline size={25} />
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-23 right-5 h-[70vh] bg-white rounded-xl shadow-lg flex flex-col overflow-hidden animate-slideUp z-50 max-w-full">
                    {/* Header */}
                    {/* <div className="bg-[#307146] text-white p-3 flex justify-between items-center">
                        <span className="font-semibold">Harivillu</span>
                        <button
                            onClick={toggleChat}
                            className="text-lg font-bold hover:text-gray-200"
                        >
                            <RxCross2 />
                        </button>
                    </div> */}
                    <div className="flex-1">
                        <iframe
                            src="https://app.thinkstack.ai/bot/index.html?chatbot_id=68b045bfa1849b85bca72da1&type=inline"
                            frameborder="0"
                            width="100%"
                            height="100%"
                            // style={{minHeight: "500px"}}
                            >
                        </iframe>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBot_Thinkstack;
