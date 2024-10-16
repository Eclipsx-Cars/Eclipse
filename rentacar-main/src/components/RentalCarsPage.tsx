import React, { useState, useEffect, FormEvent, useContext } from "react";
import { AuthContext } from "../context/authContext";
import axios from "axios";
import Sidebar from "./Sidebar";
import Header from "./header";
import AddCarForm from "./AddCarForm";
import CarTable from "./CarTable";
import Footer from './Footer';
import "../css/FooterFitsPage.css";

export interface Car {
    id: string;
    make: string;
    model: string;
    year: number;
    description: string;
    price: string;
    imageUrl: string;
    CarForReason: string;
}

const RentalCarsPage: React.FC = () => {
    const [cars, setCars] = useState<Car[]>([]);
    const [make, setMake] = useState("");
    const [model, setModel] = useState("");
    const [year, setYear] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [CarForReason, setCarForReason] = useState("");
    const [selectedCar, setSelectedCar] = useState<Car | null>(null);
    const [showAddCarForm, setShowAddCarForm] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const { isAdmin } = useContext(AuthContext);  // Check if the user is an admin

    // Fetch cars data from the API
    const fetchCars = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/cars`);
            setCars(response.data);
        } catch (error) {
            console.error("Error fetching cars:", error);
        }
    };

    useEffect(() => {
        fetchCars();
    }, []);

    // Update car details
    const updateCar = async (car: Car) => {
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/api/cars/${car.id}`, {
                make,
                model,
                year,
                description,
                price,
                CarForReason,
            });
            await fetchCars();
        } catch (error) {
            console.error("Error updating car:", error);
        }
    };

    // Delete a car
    const deleteCar = async (carId: string) => {
        if (window.confirm(`Are you sure you want to delete the car?`)) {
            try {
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/cars/${carId}`);
                await fetchCars();
            } catch (error) {
                console.error("Error deleting car:", error);
            }
        }
    };

    // Select a car for update
    const selectCar = (car: Car) => {
        setSelectedCar(car);
        setMake(car.make);
        setModel(car.model);
        setYear(car.year.toString());
        setDescription(car.description);
        setPrice(car.price);
        setCarForReason(car.CarForReason);
    };

    const handleUpdateCar = async (e: FormEvent) => {
        e.preventDefault();
        if (selectedCar) {
            await updateCar({
                ...selectedCar,
                make,
                model,
                year: parseInt(year),
                description,
                price,
                CarForReason,
            });
            resetCarForm();
        }
    };

    const resetCarForm = () => {
        setSelectedCar(null);
        setMake("");
        setModel("");
        setYear("");
        setDescription("");
        setPrice("");
        setCarForReason("");
    };

    const handleCarAdded = () => {
        setShowAddCarForm(false);
        fetchCars();
    };

    const handleCancel = () => {
        resetCarForm();
    };

    const handleSidebarToggle = (collapsed: boolean) => {
        setIsSidebarCollapsed(collapsed);
    };

    return (
        <div style={{ marginTop: '30px' }} className="flex-container min-h-screen flex flex-col">
            {isAdmin ? (
                <div>
                    <Sidebar onToggle={handleSidebarToggle} />
                    <div className="min-h-screen bg-gray-800 text-white SizeScreen">
                        <Header sidebarCollapsed={isSidebarCollapsed} />
                        <main className="flex-grow bg-gray-800 text-white p-4 flex-box">
                            <h1 className="text-4xl font-bold py-8 text-center">Admin Panel</h1>

                            <div className="flex justify-center">
                                {showAddCarForm && <AddCarForm onCarAdded={handleCarAdded} />}
                            </div>

                            <div>
                                <div className="flex flex-col mb-4">
                                    <h2 className="text-2xl font-bold text-center">Rental Cars</h2>
                                    <button
                                        className="bg-blue-500 w-40 hover:bg-blue-700 text-white font-bold py-2 self-center px-4 rounded focus:outline-none focus:shadow-outline"
                                        onClick={() => setShowAddCarForm(!showAddCarForm)}
                                    >
                                        {showAddCarForm ? "Cancel" : "Add a new Car"}
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <CarTable cars={cars} selectCar={selectCar} deleteCar={deleteCar} />
                                </div>
                            </div>

                            {selectedCar && (
                                <div className="p-4 bg-gray-700 rounded-lg">
                                    <h2 className="text-xl font-bold text-center mb-4">Update Car</h2>
                                    <form onSubmit={handleUpdateCar} className="space-y-4">
                                        <div>
                                            <label className="block text-white">Make:</label>
                                            <input
                                                type="text"
                                                value={make}
                                                onChange={(e) => setMake(e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-600 rounded-lg focus:outline-none focus:shadow-outline text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-white">Model:</label>
                                            <input
                                                type="text"
                                                value={model}
                                                onChange={(e) => setModel(e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-600 rounded-lg focus:outline-none focus:shadow-outline text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-white">Year:</label>
                                            <input
                                                type="text"
                                                value={year}
                                                onChange={(e) => setYear(e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-600 rounded-lg focus:outline-none focus:shadow-outline text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-white">Description:</label>
                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-600 rounded-lg focus:outline-none focus:shadow-outline text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-white">Price:</label>
                                            <input
                                                type="text"
                                                value={price}
                                                onChange={(e) => setPrice(e.target.value)}
                                                className="w-full px-3 py-2 bg-gray-600 rounded-lg focus:outline-none focus:shadow-outline text-white"
                                            />
                                        </div>
                                        <div>
                                            <select value={CarForReason}
                                                    onChange={(e) => setCarForReason(e.target.value)}>
                                                <option value="" disabled>Set reason for the car</option>
                                                <option value="MusicVideo">Music Video</option>
                                                <option value="Chauffeur">Chauffeur</option>
                                            </select>
                                        </div>
                                        <div className="flex justify-center space-x-4">
                                            <button
                                                type="submit"
                                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                            >
                                                Update Car
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCancel}
                                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </main>
                        <Footer />
                    </div>
                </div>
            ) : (
                <h1 className="text-4xl font-bold py-8 text-center">You are not authorized to view this page.</h1>
            )}
        </div>
    );
};

export default RentalCarsPage;
