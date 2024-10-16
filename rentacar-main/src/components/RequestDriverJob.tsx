import React, { useState } from "react";
import axios from "axios";
import Header from "./header";
import Footer from "./Footer";

const RequestDriverJob: React.FC = () => {
    const [formData, setFormData] = useState({
        driversNeeded: "",
        budget: "",
        daysRequired: "",
        contactNumber: "",
        description: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/requestedDriverJobs`, formData);
            console.log("Job requested successfully:", response.data);
            alert("Driver job requested successfully!");
        } catch (error) {
            console.error("Error requesting driver job:", error);
            alert("An error occurred. Please try again.");
        }
    };

    return (
        <div>
            <Header />
            <div className="px-4 py-12 md:px-12 min-h-screen md:py-24 bg-gray-100">
                <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Request a Driver Job</h2>
                <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="driversNeeded" className="block text-gray-700 font-semibold mb-2">
                                Number of Drivers Needed
                            </label>
                            <input
                                type="number"
                                id="driversNeeded"
                                name="driversNeeded"
                                value={formData.driversNeeded}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="budget" className="block text-gray-700 font-semibold mb-2">
                                Budget
                            </label>
                            <input
                                type="number"
                                id="budget"
                                name="budget"
                                value={formData.budget}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="daysRequired" className="block text-gray-700 font-semibold mb-2">
                                Required Days
                            </label>
                            <input
                                type="number"
                                id="daysRequired"
                                name="daysRequired"
                                value={formData.daysRequired}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="contactNumber" className="block text-gray-700 font-semibold mb-2">
                                Contact Number
                            </label>
                            <input
                                type="text"
                                id="contactNumber"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="description" className="block text-gray-700 font-semibold mb-2">
                                Job Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                                rows={5}
                                required
                            ></textarea>
                        </div>

                        <div className="text-center">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
                            >
                                Submit Request
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Footer/>
        </div>
    );
};

export default RequestDriverJob;
