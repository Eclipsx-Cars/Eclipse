import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import '../css/Button.css';

const LandingPage = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // Initial check for mobile view

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        // Add event listener to handle window resizing
        window.addEventListener('resize', handleResize);

        // Cleanup event listener on component unmount
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="overflow-hidden">
            {/* Set the container to take exactly the height of the viewport */}
            <div
                className="bg-cover bg-center min-h-screen w-full flex flex-col justify-center items-center"
                style={{
                    backgroundImage: isMobile
                        ? `url(${require('../assets/BackgroundLogoMoblie.jpg')})`
                        : 'none'
                }}
            >
                {/* Render video for non-mobile views */}
                {!isMobile && (
                    <video
                        autoPlay
                        loop
                        muted
                        className="absolute inset-0 w-full h-full object-cover"
                    >
                        <source src={require('../assets/backgroundVisual.mp4')} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                )}

                {/* Heading "Luxury Car Rentals" */}
                <div className="relative mt-20 sm:mt-80 text-center px-4 w-full z-10">
                    <h1
                        className="text-4xl sm:text-6xl text-white whitespace-nowrap"
                        style={{ textShadow: '1px 1px 0 #000', marginBottom: '1rem' }}
                    >
                        Luxury Car Rentals
                    </h1>

                    {/* Buttons aligned below the heading */}
                    <div className="flex flex-wrap justify-center space-x-2 sm:space-x-4">
                        <Link to="/About">
                            <button className="luxury-button">About</button>
                        </Link>
                        <Link to="/reviews">
                            <button className="luxury-button">Reviews</button>
                        </Link>
                        <Link to="/Cars">
                            <button className="luxury-button">Cars</button>
                        </Link>
                        <Link to="/Signin">
                            <button className="luxury-button">Sign in</button>
                        </Link>
                        <Link to="/Register">
                            <button className="luxury-button">Register</button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
