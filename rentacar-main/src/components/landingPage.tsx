import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import '../css/Button.css'

const LandingPage = () => {
    return (
        <div className="overflow-hidden">
            {/*<Header />*/}
            {/* Set the container to take exactly the height of the viewport */}
            <div className="bg-cover bg-center min-h-screen w-full flex flex-col justify-center items-center"
                 style={{ backgroundImage: `url(${require('../assets/BackgroundLogoBest.jpg')})` }}>

                {/* Heading "Luxury Car Rentals" */}
                <div className="mt-20 sm:mt-80 text-center px-4 w-full">
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