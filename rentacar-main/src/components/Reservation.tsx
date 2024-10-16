import React, { useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/authContext';
import { useNavigate } from 'react-router-dom'; // To redirect on "continue"

interface ReservationProps {
    carId: string;
    carMake: string;
    carModel: string;
    pricePerDay: number;
    carForReason: string; // New prop to get the reason for the car
    onReservationSuccess: () => void;
}

function Reservation({ carId, pricePerDay, onReservationSuccess, carMake, carModel, carForReason }: ReservationProps) {
    const { userId } = useContext(AuthContext);
    const [isMultiDay, setIsMultiDay] = useState(true); // State for radio button selection
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [startTime, setStartTime] = useState(''); // New state for start time
    const [endTime, setEndTime] = useState(''); // New state for end time
    const [totalPrice, setTotalPrice] = useState('0.00'); // Initialize to '0.00'
    const [reservations, setReservations] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false); // State for modal
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/reservations/car/${carId}`);
                if (response.status === 200) {
                    setReservations(response.data);
                } else {
                    console.error('Error fetching reservations:', response.data);
                }
            } catch (error) {
                console.error('Error fetching reservations:', error);
            }
        };
        fetchReservations();
    }, [carId]);

    const hasConflictingReservation = () => {
        const newStart = isMultiDay
            ? new Date(`${startDate}T00:00:00`) // Start of the day for multi-day reservations
            : new Date(`${startDate}T${startTime}`); // Specific time for single-day

        const newEnd = isMultiDay
            ? new Date(`${endDate}T23:59:59`) // End of the last day for multi-day
            : new Date(`${startDate}T${endTime}`); // Specific time for single-day

        return reservations.some((reservation: any) => {
            const existingStart = new Date(reservation.startDate);
            const existingEnd = new Date(reservation.endDate);

            return (newStart >= existingStart && newStart < existingEnd) ||
                (newEnd > existingStart && newEnd <= existingEnd) ||
                (newStart <= existingStart && newEnd >= existingEnd);
        });
    };

    // Memoize the calculateTotalPrice function using useCallback
    const calculateTotalPrice = useCallback(() => {
        if (isMultiDay) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const days = (end.getTime() - start.getTime()) / (1000 * 3600 * 24) + 1; // Add one to include the end day
            return (days * pricePerDay).toFixed(2); // Return total price rounded to 2 decimal places
        } else {
            const start = new Date(`${startDate}T${startTime}`);
            const end = new Date(`${startDate}T${endTime}`);
            const hours = (end.getTime() - start.getTime()) / (1000 * 3600);

            if (carForReason === "MusicVideo" && hours < 2) {
                setErrorMessage("Minimum booking time for Music Video is 2 hours."); // Set error message
                return '0.00'; // Error: minimum 2 hours for MusicVideo
            }
            if (carForReason === "Chauffeur" && hours < 6) {
                setErrorMessage("Minimum booking time for Chauffeur is 6 hours."); // Set error message
                return '0.00'; // Error: minimum 6 hours for Chauffeur
            }
            // Adjust pricing based on car type and round to 2 decimal places
            return (hours * (carForReason === "Chauffeur" ? pricePerDay / 6 : pricePerDay)).toFixed(2);
        }
    }, [isMultiDay, startDate, endDate, startTime, endTime, pricePerDay, carForReason]);

    useEffect(() => {
        setTotalPrice(calculateTotalPrice());
    }, [startDate, endDate, startTime, endTime, calculateTotalPrice]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!userId) {
            setErrorMessage('You must be logged in to rent a car.');
            return;
        }
        if (hasConflictingReservation()) {
            alert('The selected dates are already booked. Please choose different dates.');
            return;
        }

        // Validate totalPrice to prevent modal from opening if conditions aren't met
        const calculatedPrice = calculateTotalPrice();
        if (parseFloat(calculatedPrice) <= 0) {
            return; // Prevent modal from opening if validation fails
        }

        setIsModalOpen(true);
    };

    const handleCancelModal = () => {
        setIsModalOpen(false); // Close the modal
    };

    const handleContinue = () => {
        const depositAmount = (parseFloat(totalPrice) * 0.3).toFixed(2);
        navigate('/Checkout', { state: { depositAmount, totalPrice, carId, carMake, carModel, startDate, endDate, startTime, endTime } });
        onReservationSuccess(); // Call the success callback
    };

    const depositAmount = (parseFloat(totalPrice) * 0.3).toFixed(2);

    return (
        <div>
            {errorMessage && (
                <div className="bg-red-500 text-white p-3 rounded-md mb-4">
                    {errorMessage}
                </div>
            )}
            <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-lg">
                <h2 className="text-2xl text-white font-bold mb-4">Create Reservation</h2>
                <p className="text-xl text-white font-bold mb-4">All reservations cancelled within 48 hours of the start date will be charged the full amount.</p>

                {/* Radio Buttons for Multi-day or Single-day Reservation */}
                <div className="flex mb-4">
                    <div className="mr-4">
                        <label className="text-white font-bold">
                            <input
                                type="radio"
                                checked={isMultiDay}
                                onChange={() => setIsMultiDay(true)}
                            />
                            Multi-day
                        </label>
                    </div>
                    <div>
                        <label className="text-white font-bold">
                            <input
                                type="radio"
                                checked={!isMultiDay}
                                onChange={() => setIsMultiDay(false)}
                            />
                            Single-day
                        </label>
                    </div>
                </div>

                {isMultiDay ? (
                    <>
                        <div className="flex flex-col mb-4">
                            <label htmlFor="start-date" className="text-white font-bold mb-2">
                                Start Date:
                            </label>
                            <input
                                type="date"
                                id="start-date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                min={new Date().toISOString().slice(0, 10)}
                                className="bg-gray-800 rounded-lg py-2 px-3 text-white"
                            />
                        </div>
                        <div className="flex flex-col mb-4">
                            <label htmlFor="end-date" className="text-white font-bold mb-2">
                                End Date:
                            </label>
                            <input
                                type="date"
                                id="end-date"
                                min={startDate}
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-gray-800 rounded-lg py-2 px-3 text-white"
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex flex-col mb-4">
                            <label htmlFor="date" className="text-white font-bold mb-2">
                                Date:
                            </label>
                            <input
                                type="date"
                                id="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                min={new Date().toISOString().slice(0, 10)}
                                className="bg-gray-800 rounded-lg py-2 px-3 text-white"
                            />
                        </div>
                        <div className="flex flex-col mb-4">
                            <label htmlFor="start-time" className="text-white font-bold mb-2">
                                Start Time:
                            </label>
                            <input
                                type="time"
                                id="start-time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="bg-gray-800 rounded-lg py-2 px-3 text-white"
                            />
                        </div>
                        <div className="flex flex-col mb-4">
                            <label htmlFor="end-time" className="text-white font-bold mb-2">
                                End Time:
                            </label>
                            <input
                                type="time"
                                id="end-time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="bg-gray-800 rounded-lg py-2 px-3 text-white"
                            />
                        </div>
                    </>
                )}

                <div className="flex flex-col mb-4">
                    <h3 className="text-white font-bold">Total Price: {totalPrice} €</h3>
                </div>
                <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                    Create Reservation
                </button>
            </form>

            {/* Modal Implementation */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-2xl font-bold mb-4">Reservation Summary</h2>
                        <p className="mb-4">
                            Cancellations within 48 hours of the start date will incur the full payment of {totalPrice} €.
                        </p>
                        <p className="mb-4">
                            A deposit of 30% ({depositAmount} €) is required to complete the reservation.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button onClick={handleCancelModal} className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded">
                                Cancel
                            </button>
                            <button onClick={handleContinue} className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded">
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Reservation;
