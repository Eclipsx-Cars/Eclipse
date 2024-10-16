import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EditReservationForm from './EditReservationForm'; // Import your edit form component

interface Reservation {
    id: string;
    user: {
        name: string;
    };
    carMake: string;
    carModel: string;
    startDate: string; // Use string type for simplicity; consider Date type if needed
    endDate: string;
    startTime?: string; // Optional
    endTime?: string;   // Optional
    totalPrice: number;
    remainingToPay: number;
    currentPaid: number;
}

interface ReservationListProps {
    reservations: Reservation[]; // Accept reservations prop
}

const ReservationList: React.FC<ReservationListProps> = ({ reservations }) => {
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null); // State for editing
    const [error, setError] = useState<string | null>(null);

    // Handle deleting reservation
    const deleteReservation = async (id: string, carMake: string, carModel: string) => {
        if (window.confirm(`Are you sure you want to delete the reservation for ${carMake} ${carModel}?`)) {
            try {
                await axios.delete(`/api/reservations/${id}`);
                // Optionally, you might want to handle state changes in the parent component
            } catch (err) {
                setError('Failed to delete reservation');
            }
        }
    };

    // Handle opening the edit modal
    const editReservation = (reservation: Reservation) => {
        setEditingReservation(reservation);
    };

    // Handle closing the edit modal
    const closeEditModal = () => {
        setEditingReservation(null);
    };

    // Check for any errors
    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-5">Reservations</h2>
            {reservations.length === 0 ? (
                <p>No reservations found.</p>
            ) : (
                reservations.map((reservation, index) => (
                    <div key={reservation.id} className="border-b border-r border-gray-600 p-5">
                        <h3 className="text-xl font-bold mb-2">Reservation {index + 1}</h3>
                        <p className="mb-2">Car Make: {reservation.carMake}</p>
                        <p className="mb-2">Car Model: {reservation.carModel}</p>
                        <p className="mb-2">
                            Start Date: {new Date(reservation.startDate).toISOString().slice(0, 10)}
                            {reservation.startTime ? ` at ${reservation.startTime}` : ''}
                        </p>
                        <p className="mb-2">
                            End Date: {new Date(reservation.endDate).toISOString().slice(0, 10)}
                            {reservation.endTime ? ` at ${reservation.endTime}` : ''}
                        </p>
                        <p className="mb-2">Total Price: {`${reservation.totalPrice.toFixed(2)}€`}</p>
                        <p className="mb-2">Remaining to Pay: {`${reservation.remainingToPay.toFixed(2)}€`}</p>
                        <p className={`mb-2 ${reservation.remainingToPay === 0 ? 'text-green-500' : 'text-red-500'}`}>
                            Status: {reservation.remainingToPay === 0 ? 'Paid' : 'Unpaid'}
                        </p>
                        <div className="flex flex-row justify-end">
                            <button
                                className="focus:outline-none text-white bg-yellow-500 hover:bg-yellow-600 focus:ring-4 focus:ring-yellow-300 focus:ring-opacity-50 px-4 py-1 rounded mr-2"
                                onClick={() => editReservation(reservation)} // Call editReservation function
                            >
                                Edit
                            </button>
                            <button
                                className="focus:outline-none text-white bg-red-500 hover:bg-red-600 focus:ring-4 focus:ring-red-300 focus:ring-opacity-50 px-4 py-1 rounded"
                                onClick={() => deleteReservation(reservation.id, reservation.carMake, reservation.carModel)}>Cancel
                            </button>
                        </div>
                    </div>
                ))
            )}
            {editingReservation && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
                        <EditReservationForm
                            reservation={editingReservation}
                            closeEditModal={closeEditModal} // Pass closeEditModal function to child component
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReservationList;
