import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import { AuthContext } from "../context/authContext";
import Footer from "./Footer";
import Header from "./header";

interface UserData {
    first_name?: string;
    last_name?: string;
    email?: string;
    phonenumber?: string;
}

interface Reservation {
    carId: string;
    carMake: string;
    carModel: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    remainingToPay: number;
    id: string;
}

const Profile = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const { userId } = useContext(AuthContext);
    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const navigate = useNavigate(); // To navigate to Payment page

    // Fetch user data
    const fetchUserData = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setUserData(data);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    // Fetch user reservations
    const fetchReservations = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/reservations/user/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setReservations(data);
            }
        } catch (error) {
            console.error("Error fetching reservations:", error);
        }
    };

    const updateUserData = async (updatedData: UserData) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedData),
            });

            if (response.ok) {
                setUserData(updatedData);
                setShowUpdateForm(false); // Close the form after successful update
            }
        } catch (error) {
            console.error("Error updating user data:", error);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchUserData();
            fetchReservations();
        }
    }, [userId]);

    return (
        <div>
            <Header />
            <div className="mt-20 flex justify-center min-h-screen">
                {userData ? (
                    <div>
                        <h2 className="mb-4">
                            User: {userData?.first_name} {userData?.last_name}
                        </h2>
                        <h2 className="mb-4">Email: {userData?.email}</h2>
                        <h2 className="mb-4">Phone: {userData?.phonenumber}</h2>

                        {/* Update User Data Button */}
                        <button
                            className="focus:outline-none text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-4"
                            onClick={() => setShowUpdateForm(!showUpdateForm)}
                        >
                            {showUpdateForm ? "Cancel" : "Update User Data"}
                        </button>

                        {/* Update User Form */}
                        {showUpdateForm && (
                            <form
                                className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const updatedData = {
                                        first_name: (e.target as any).first_name.value,
                                        last_name: (e.target as any).last_name.value,
                                        email: (e.target as any).email.value,
                                        phonenumber: (e.target as any).phonenumber.value,
                                    };
                                    // Call update user data function
                                    updateUserData(updatedData);
                                }}
                            >
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">First Name</label>
                                    <input
                                        name="first_name"
                                        defaultValue={userData.first_name}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        type="text"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Last Name</label>
                                    <input
                                        name="last_name"
                                        defaultValue={userData.last_name}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        type="text"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                                    <input
                                        name="email"
                                        defaultValue={userData.email}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        type="email"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Phone Number</label>
                                    <input
                                        name="phonenumber"
                                        defaultValue={userData.phonenumber}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        type="tel"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <button
                                        type="submit"
                                        className="focus:outline-none text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5"
                                    >
                                        Update
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Render reservations */}
                        {reservations.map((reservation, index) => (
                            <div key={index} className="my-4">
                                <p>Car Make: {reservation.carMake}</p>
                                <p>Car Model: {reservation.carModel}</p>
                                <p>Remaining to Pay: ${reservation.remainingToPay}</p>

                                {/* Payment button to navigate to PaymentFormPage */}
                                {reservation.remainingToPay > 0 && (
                                    <button
                                        onClick={() =>
                                            navigate("/Payment", {
                                                state: {
                                                    reservationId: reservation.id,
                                                    remainingToPay: reservation.remainingToPay,
                                                    carMake: reservation.carMake,
                                                    carModel: reservation.carModel,
                                                    carId: reservation.carId
                                                },
                                            })
                                        }
                                        className="focus:outline-none text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5"
                                    >
                                        Pay Remaining Amount
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Loading user data...</p>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default Profile;
