import React from 'react';
import Header from "./header";

const About = () => {
    return (
        <div className=" px-4 py-12 md:px-12 md:py-24 bg-gray-100">
            <Header />
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">About</h2>
            <div className="max-w-5xl mx-auto text-lg text-gray-700">
                <p className="mb-6">
                    Welcome to Eclipsx,  the ultimate destination for luxury vehicle hire. We specialize in providing an exclusive fleet of high-end cars from top brands like Rolls-Royce, Bentley, and Mercedes-Benz.
                </p>
                <p className="mb-6">
                    Our luxury car rental service offers personalized attention, competitive rates, and flexible rental options for a seamless experience. Perfect for business travel, special events, or personal indulgence, our vehicles ensure you drive in ultimate style and comfort. Choose Eclipsx for your luxury car hire needs and experience unmatched sophistication.
                </p>
                <p className="mb-6">
                    Book your luxury vehicle today and elevate your travel experience.
                </p>
            </div>
        </div>
    );
};

export default About;

