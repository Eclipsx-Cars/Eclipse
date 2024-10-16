import axios from "axios";
import React, { useState, useEffect } from "react";
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
    price: string;  // Assuming price is a string. If it's a number, change type accordingly.
    CarForReason: string;
    imageUrl: string;
}

const CarDetails = () => {
    const { carId } = useParams<{ carId: string }>();
    const [car, setCar] = useState<Car | null>(null);
    const [updateCalendar, setUpdateCalendar] = useState(false);

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

    // Determine price per hour or per 6 hours based on CarForReason
    const pricePerHour = car.CarForReason === "chauffeur"
        ? (Number(car.price) / 6).toFixed(2) // Dividing price by 6 hours for chauffeur
        : car.price; // Regular price per hour

    return (
        <div>
            <Header />
            <div className="bg-gray-100 rounded-lg overflow-hidden justify-center shadow-lg mt-10 my-8 md:mx-0 md:my-0 ">
                <div className="relative">
                    <img
                        src={`${process.env.REACT_APP_API_URL}${car.imageUrl}`}
                        alt={`${car.make} ${car.model}`}
                        className="h-auto w-full object-cover max-h-screen max-h-3/4"
                    />
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
            <div className="flex flex-col md:flex-row bg-gray-900">
                <div className="flex-grow md:mr-4">
                    <Reservation
                        carId={carId || ""}
                        pricePerDay={Number(car.price)} // Assuming this is used elsewhere as total price for day reservation
                        onReservationSuccess={handleReservationSuccess}
                        carMake={car.make}
                        carModel={car.model}
                        carForReason={car.CarForReason}
                    />
                </div>
                <div className="flex-grow md:ml-4">
                    <Calendar carId={carId || ""} updateCalendar={updateCalendar} />
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CarDetails;
