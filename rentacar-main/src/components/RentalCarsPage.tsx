import React, { useState, useEffect, FormEvent, useContext } from "react";
import { AuthContext } from "../context/authContext";
import axios from "axios";
import Sidebar from "./Sidebar";
import Header from "./header";
import AddCarForm from "./AddCarForm";
import CarTable from "./CarTable";
import Footer from './Footer';
import "../css/FooterFitsPage.css";
import UpdateCarForm from "./UpdateCarForm";

interface Car {
    id: string;
    make: string;
    model: string;
    year: number;
    description: string;
    price: string;
    images: string[];
    CarForReason: string;
}

interface FormErrors {
    make?: string;
    model?: string;
    year?: string;
    price?: string;
    description?: string;
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
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [formErrors, setFormErrors] = useState<FormErrors>({});

    const { isAdmin } = useContext(AuthContext);

    // Normalize reason to match select options exactly
    const normalizeReason = (reason?: string) => {
        if (!reason) return "";
        const r = String(reason).toLowerCase();
        if (r === "chauffeur") return "Chauffeur";
        if (r === "musicvideo" || r === "music video") return "MusicVideo";
        return reason;
    };

    // Autofill form fields whenever a car is selected or changes
    useEffect(() => {
        if (!selectedCar) return;
        setMake(selectedCar.make ?? "");
        setModel(selectedCar.model ?? "");
        setYear(String(selectedCar.year ?? ""));
        setDescription(selectedCar.description ?? "");
        setPrice(String(selectedCar.price ?? ""));
        setCarForReason(normalizeReason(selectedCar.CarForReason) ?? "");
    }, [selectedCar]);

    const validateForm = (): boolean => {
        const errors: FormErrors = {};
        let isValid = true;

        if (!make) {
            errors.make = "Make is required";
            isValid = false;
        }
        if (!model) {
            errors.model = "Model is required";
            isValid = false;
        }
        if (!year || isNaN(Number(year)) || Number(year) < 1900 || Number(year) > new Date().getFullYear() + 1) {
            errors.year = "Please enter a valid year";
            isValid = false;
        }
        if (!price || isNaN(Number(price)) || Number(price) <= 0) {
            errors.price = "Please enter a valid price";
            isValid = false;
        }
        if (!description) {
            errors.description = "Description is required";
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const fetchCars = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/cars`);
            setCars(response.data);
        } catch (error) {
            setError("Failed to fetch cars");
            console.error("Error fetching cars:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCars();
        return () => {
            imagePreviewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedImages(files);

        const newPreviewUrls = files.map(file => URL.createObjectURL(file));
        setImagePreviewUrls(prevUrls => {
            prevUrls.forEach(url => URL.revokeObjectURL(url));
            return newPreviewUrls;
        });
    };

    const updateCar = async (car: Car) => {
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('make', make);
            formData.append('model', model);
            formData.append('year', year);
            formData.append('description', description);
            formData.append('price', price);
            formData.append('CarForReason', CarForReason);

            selectedImages.forEach(image => {
                formData.append('images', image);
            });

            await axios.put(`${process.env.REACT_APP_API_URL}/api/cars/${car.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSuccessMessage("Car updated successfully");
            await fetchCars();
            resetCarForm();
        } catch (error) {
            setError("Failed to update car");
            console.error("Error updating car:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteCar = async (carId: string) => {
        if (!window.confirm("Are you sure you want to delete this car?")) return;

        setIsLoading(true);
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/cars/${carId}`);
            setSuccessMessage("Car deleted successfully");
            await fetchCars();
        } catch (error) {
            setError("Failed to delete car");
            console.error("Error deleting car:", error);
        } finally {
            setIsLoading(false);
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
        setSelectedImages([]);
        setImagePreviewUrls(prevUrls => {
            prevUrls.forEach(url => URL.revokeObjectURL(url));
            return [];
        });
        setFormErrors({});
    };

    const handleCarAdded = () => {
        setShowAddCarForm(false);
        fetchCars();
    };

    const handleUpdateCar = async (e: FormEvent) => {
        e.preventDefault();
        if (selectedCar) {
            await updateCar(selectedCar);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900">
            {isAdmin ? (
                <div className="flex">
                    <Sidebar onToggle={setIsSidebarCollapsed} />
                    <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                        <Header sidebarCollapsed={isSidebarCollapsed} />

                        <main className="p-6 overflow-x-auto">
                            <div className="max-w-full">
                                <h1 className="text-4xl font-bold text-white mb-8 text-center">
                                    Car Management
                                </h1>

                                {error && (
                                    <div className="mb-4 bg-red-500 text-white p-4 rounded-md">
                                        {error}
                                    </div>
                                )}
                                {successMessage && (
                                    <div className="mb-4 bg-green-500 text-white p-4 rounded-md">
                                        {successMessage}
                                    </div>
                                )}

                                <div className="mb-8">
                                    <button
                                        onClick={() => setShowAddCarForm(!showAddCarForm)}
                                        className={`px-6 py-2 rounded-md ${
                                            showAddCarForm ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                                        } text-white font-semibold`}
                                        disabled={isLoading}
                                    >
                                        {showAddCarForm ? 'Cancel' : 'Add New Car'}
                                    </button>

                                    {showAddCarForm && (
                                        <div className="mt-4">
                                            <AddCarForm onCarAdded={handleCarAdded} />
                                        </div>
                                    )}
                                </div>

                                {isLoading ? (
                                    <div className="flex justify-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <CarTable
                                            cars={cars}
                                            selectCar={setSelectedCar}
                                            deleteCar={deleteCar}
                                        />
                                    </div>
                                )}

                                {selectedCar && (
                                    <div className="mt-8">
                                        <h2 className="text-2xl font-bold text-white mb-4 text-center">
                                            Update Selected Car
                                        </h2>
                                        <UpdateCarForm
                                            make={make}
                                            model={model}
                                            year={year}
                                            description={description}
                                            price={price}
                                            CarForReason={CarForReason}
                                            onMakeChange={setMake}
                                            onModelChange={setModel}
                                            onYearChange={setYear}
                                            onDescriptionChange={setDescription}
                                            onPriceChange={setPrice}
                                            onCarForReasonChange={setCarForReason}
                                            onUpdateCar={handleUpdateCar}
                                            onCancel={resetCarForm}
                                            onImagesChange={(files) => setSelectedImages(Array.from(files))}
                                            currentImages={selectedCar.images}
                                        />
                                        <div className="mt-4 text-gray-300 text-sm text-center">
                                            <p>Tip: If some fields appear blank, ensure the selected car has those properties and that the values are strings or number-like. This page coerces values to strings when a car is selected.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </main>
                        <Footer />
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-screen">
                    <h1 className="text-4xl font-bold text-white">
                        You are not authorized to view this page.
                    </h1>
                </div>
            )}
        </div>
    );
};

export default RentalCarsPage;