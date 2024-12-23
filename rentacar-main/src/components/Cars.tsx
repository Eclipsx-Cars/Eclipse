import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from './Footer';
import Header from "./header";

interface Car {
    id: string;
    make: string;
    model: string;
    year: number;
    description: string;
    price: string;
    imageUrl: string;
    CarForReason: string; // Added CarForReason to the Car interface
}

const Cars = () => {
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState<boolean>(true); // New state for loading

    const fetchCars = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/cars`);
            setCars(response.data);
        } catch (error) {
            console.error("Error fetching cars:", error);
        } finally {
            setLoading(false); // Set loading to false after data fetch
        }
    };

    useEffect(() => {
        fetchCars();
    }, []);

    const musicVideoCars = cars.filter(car => car.CarForReason === "MusicVideo");
    const chauffeurCars = cars.filter(car => car.CarForReason === "Chauffeur");

    return (
        <div>
            <div className="px-4 py-12 md:px-12 min-h-screen md:py-24 bg-gray-100">
                <Header />
                {loading ? ( // Show spinner if loading
                    <div className="flex justify-center items-center min-h-screen">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                    </div>
                ) : ( // Show car listings when loading is complete
                    <>
                        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Cars</h2>
                        <div className="max-w-6xl mx-auto">

                            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Music Video Cars</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-12">
                                {musicVideoCars.map((car) => (
                                    <Link key={car.id} to={`/cars/${car.id}`} className="block hover:shadow-lg transition duration-300">
                                        <div className="relative">
                                            <img src={`${process.env.REACT_APP_API_URL}${car.imageUrl}`} alt={car.make} className="object-cover w-full h-64 rounded-t-lg" />
                                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900 bg-opacity-60 rounded-b-lg">
                                                <h3 className="text-white text-xl font-bold">{car.make}</h3>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Chauffeur Cars</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {chauffeurCars.map((car) => (
                                    <Link key={car.id} to={`/cars/${car.id}`} className="block hover:shadow-lg transition duration-300">
                                        <div className="relative">
                                            <img src={`${process.env.REACT_APP_API_URL}${car.imageUrl}`} alt={car.make} className="object-cover w-full h-64 rounded-t-lg" />
                                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900 bg-opacity-60 rounded-b-lg">
                                                <h3 className="text-white text-xl font-bold">{car.make}</h3>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                        </div>
                    </>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default Cars;