import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Reservation from './Reservation';
import Calendar from './Calendar';
import Footer from './Footer';
import Header from "./header";

interface Car {
    id: string;
    make: string;
    model: string;
    year: number;
    description: string;
    price: string;
    CarForReason: string;
    images: string[]; // Changed from imageUrl to images array
}

const CarDetails = () => {
    const { carId } = useParams<{ carId: string }>();
    const [car, setCar] = useState<Car | null>(null);
    const [updateCalendar, setUpdateCalendar] = useState(false);
    const [isMultiDay, setIsMultiDay] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const reservationRef = useRef<any>(null);

    useEffect(() => {
        const fetchCar = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/cars/${carId}`);
                setCar(response.data);
            } catch (error) {
                console.error(`Error fetching car with ID ${carId}:`, error);
            }
        };

        fetchCar();
    }, [carId]);

    if (!car) return <p>Loading...</p>;

    const handleReservationSuccess = () => {
        setUpdateCalendar(prevState => !prevState);
    };

    const handleCalendarDateSelect = (start: string, end: string) => {
        if (reservationRef.current) {
            reservationRef.current.handleDateSelection(start, end);
        }
    };

    const handleMultiDayChange = (isMultiDay: boolean) => {
        setIsMultiDay(isMultiDay);
    };

    const nextImage = () => {
        if (car.images && car.images.length > 0) {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % car.images.length);
        }
    };

    const previousImage = () => {
        if (car.images && car.images.length > 0) {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === 0 ? car.images.length - 1 : prevIndex - 1
            );
        }
    };

    const pricePerHour = car.CarForReason === "chauffeur"
        ? (Number(car.price) / 6).toFixed(2)
        : car.price;

    return (
        <div>
            <Header />
            <div className="bg-gray-100 rounded-lg overflow-hidden justify-center shadow-lg mt-10 my-8 md:mx-0 md:my-0">
                <div className="relative">
                    {car.images && car.images.length > 0 ? (
                        <>
                            <img
                                src={`${process.env.REACT_APP_API_URL}${car.images[currentImageIndex]}`}
                                alt={`${car.make} ${car.model}`}
                                className="h-auto w-full object-cover max-h-screen max-h-3/4"
                            />
                            {car.images.length > 1 && (
                                <div className="absolute inset-0 flex items-center justify-between p-4">
                                    <button
                                        onClick={previousImage}
                                        className="bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-all"
                                    >
                                        ←
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-all"
                                    >
                                        →
                                    </button>
                                </div>
                            )}
                            {car.images.length > 1 && (
                                <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-2">
                                    {car.images.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`w-3 h-3 rounded-full ${
                                                index === currentImageIndex
                                                    ? 'bg-white'
                                                    : 'bg-gray-400'
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="h-64 flex items-center justify-center bg-gray-200">
                            No images available
                        </div>
                    )}
                    <h1 className="absolute bottom-0 left-0 right-0 text-2xl lg:text-6xl font-bold px-4 py-2 bg-gray-900 text-center text-white opacity-90">
                        {`${car.make} ${car.model}`}
                    </h1>
                </div>
                <div className="p-4 flex flex-col text-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">£{pricePerHour} / {car.CarForReason === "chauffeur" ? "6 Hours" : "Hour"}</h2>
                        <p>{car.description}</p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col md:flex-row bg-gray-900 p-4 gap-4">
                <div className="flex-1">
                    <Reservation
                        ref={reservationRef}
                        carId={carId || ""}
                        pricePerDay={Number(car.price)}
                        onReservationSuccess={handleReservationSuccess}
                        carMake={car.make}
                        carModel={car.model}
                        carForReason={car.CarForReason}
                        onCalendarDateSelect={handleMultiDayChange}
                    />
                </div>
                <div className="flex-1">
                    <Calendar
                        carId={carId || ""}
                        updateCalendar={updateCalendar}
                        isMultiDay={isMultiDay}
                        onDateSelect={handleCalendarDateSelect}
                    />
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CarDetails;