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
    images: string[]; // Changed from string to string[]
    CarForReason: string;
}

const Cars = () => {
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [imageIndexes, setImageIndexes] = useState<{ [key: string]: number }>({});

    const fetchCars = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/cars`);
            setCars(response.data);
        } catch (error) {
            console.error("Error fetching cars:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCars();
    }, []);

    const nextImage = (carId: string, totalImages: number) => {
        setImageIndexes(prev => ({
            ...prev,
            [carId]: ((prev[carId] || 0) + 1) % totalImages
        }));
    };

    const previousImage = (carId: string, totalImages: number) => {
        setImageIndexes(prev => ({
            ...prev,
            [carId]: ((prev[carId] || 0) - 1 + totalImages) % totalImages
        }));
    };

    const musicVideoCars = cars.filter(car => car.CarForReason === "MusicVideo");
    const chauffeurCars = cars.filter(car => car.CarForReason === "Chauffeur");

    const CarCard = ({ car }: { car: Car }) => {
        const currentImageIndex = imageIndexes[car.id] || 0;

        return (
            <Link key={car.id} to={`/cars/${car.id}`} className="block hover:shadow-lg transition duration-300">
                <div className="relative group">
                    {car.images && car.images.length > 0 ? (
                        <>
                            <img
                                src={`${process.env.REACT_APP_API_URL}${car.images[currentImageIndex]}`}
                                alt={car.make}
                                className="object-cover w-full h-64 rounded-t-lg"
                            />
                            {car.images.length > 1 && (
                                <>
                                    <div className="absolute inset-0 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                previousImage(car.id, car.images.length);
                                            }}
                                            className="bg-black bg-opacity-50 text-white p-2 m-2 rounded-full hover:bg-opacity-75 transition-all"
                                        >
                                            ←
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                nextImage(car.id, car.images.length);
                                            }}
                                            className="bg-black bg-opacity-50 text-white p-2 m-2 rounded-full hover:bg-opacity-75 transition-all"
                                        >
                                            →
                                        </button>
                                    </div>
                                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                                        {car.images.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setImageIndexes(prev => ({
                                                        ...prev,
                                                        [car.id]: index
                                                    }));
                                                }}
                                                className={`w-2 h-2 rounded-full transition-all ${
                                                    index === currentImageIndex
                                                        ? 'bg-white'
                                                        : 'bg-gray-400'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-64 bg-gray-200 rounded-t-lg flex items-center justify-center">
                            <span className="text-gray-400">No image available</span>
                        </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900 bg-opacity-60 rounded-b-lg">
                        <h3 className="text-white text-xl font-bold">{car.make}</h3>
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <div>
            <div className="px-4 py-12 md:px-12 min-h-screen md:py-24 bg-gray-100">
                <Header />
                {loading ? (
                    <div className="flex justify-center items-center min-h-screen">
                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Cars</h2>
                        <div className="max-w-6xl mx-auto">
                            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Music Video Cars</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-12">
                                {musicVideoCars.map((car) => (
                                    <CarCard key={car.id} car={car} />
                                ))}
                            </div>

                            <h3 className="text-2xl font-semibold mb-4 text-gray-800">Chauffeur Cars</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {chauffeurCars.map((car) => (
                                    <CarCard key={car.id} car={car} />
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