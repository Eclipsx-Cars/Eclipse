import React from 'react';
import { FaInstagram, FaTiktok, FaEnvelope } from "react-icons/fa";

const Footer = () => {
    return (
        <div className=''>
            <footer className="h-fit shadow dark:bg-black">
                <div className="w-full mx-auto container p-6 flex flex-col items-center justify-center mt-auto">
                    <ul className="flex flex-wrap justify-center items-center mb-4 text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
                        <li className='mx-4'>
                            <a
                                href="https://github.com/tommimaki/rentacar"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mx-4"
                            >
                                <FaInstagram className="text-4xl text-white" />
                            </a>
                        </li>
                        <li className='mx-4'>
                            <a
                                href="https://www.linkedin.com/in/tommi-maki/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mx-4"
                            >
                                <FaTiktok className="text-4xl text-white" />
                            </a>
                        </li>
                        <li>

                        </li>
                        <li className='mx-4'>
                            <a
                                href="https://tommimaki.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mx-4"
                            >
                                <FaEnvelope className="text-4xl text-white" />
                            </a>
                        </li>
                    </ul>
                </div>
            </footer >
        </div >
    );
};

export default Footer;
