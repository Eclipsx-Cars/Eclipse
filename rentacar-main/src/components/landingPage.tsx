import React from 'react';
import About from './about';
import Cars from './Cars';
import ReviewCarousel from './review';
import Header from "./header";


const LandingPage = () => {
    return (
        <div>
            <Header />
            <div className="bg-cover bg-center h-screen grid place-items-center"
                style={{ backgroundImage: `url(${require('../assets/BackgroundLogoBest.jpg')})` }}>
                <div className="relative min-h-screen flex items-end justify-center">
                    <h1
                        className="absolute text-center text-6xl text-white whitespace-nowrap"
                        style={{ textShadow: '1px 1px 0 #000', bottom: '10rem' }}
                    >
                        Luxury Car Rentals
                    </h1>
                </div>
            </div>
            <About />
            <ReviewCarousel />
            <Cars />
        </div>
    );
};

export default LandingPage;
