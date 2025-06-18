import React, { useState, useContext, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/authContext';
import { useNavigate } from 'react-router-dom';

interface ReservationProps {
    carId: string;
    carMake: string;
    carModel: string;
    pricePerDay: number;
    carForReason: string;
    onReservationSuccess: () => void;
    onCalendarDateSelect?: (isMultiDay: boolean) => void;
}

const Reservation = forwardRef(({
                                    carId,
                                    pricePerDay,
                                    onReservationSuccess,
                                    carMake,
                                    carModel,
                                    carForReason,
                                    onCalendarDateSelect
                                }: ReservationProps, ref) => {
    const { userId } = useContext(AuthContext);
    const [isMultiDay, setIsMultiDay] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [totalPrice, setTotalPrice] = useState('0.00');
    const [reservations, setReservations] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const [fieldErrors, setFieldErrors] = useState({
        startDate: false,
        endDate: false,
        startTime: false,
        endTime: false
    });

    useImperativeHandle(ref, () => ({
        handleDateSelection: (start: string, end: string) => {
            setStartDate(start);
            if (isMultiDay) {
                setEndDate(end);
            }
        }
    }));

    useEffect(() => {
        if (onCalendarDateSelect) {
            onCalendarDateSelect(isMultiDay);
        }
    }, [isMultiDay, onCalendarDateSelect]);

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/reservations/car/${carId}`);
                if (response.status === 200) {
                    setReservations(response.data);
                }
            } catch (error) {
                console.error('Error fetching reservations:', error);
            }
        };
        fetchReservations();
    }, [carId]);

    const hasConflictingReservation = () => {
        const newStart = isMultiDay
            ? new Date(`${startDate}T00:00:00`)
            : new Date(`${startDate}T${startTime}`);

        const newEnd = isMultiDay
            ? new Date(`${endDate}T23:59:59`)
            : new Date(`${startDate}T${endTime}`);

        return reservations.some((reservation: any) => {
            const existingStart = new Date(reservation.startDate);
            const existingEnd = new Date(reservation.endDate);

            return (newStart >= existingStart && newStart < existingEnd) ||
                (newEnd > existingStart && newEnd <= existingEnd) ||
                (newStart <= existingStart && newEnd >= existingEnd);
        });
    };

    const calculateTotalPrice = useCallback(() => {
        if (!startDate || (isMultiDay && !endDate) || (!isMultiDay && (!startTime || !endTime))) {
            return '0.00';
        }

        if (isMultiDay) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
            return (days * pricePerDay).toFixed(2);
        } else {
            const start = new Date(`${startDate}T${startTime}`);
            const end = new Date(`${startDate}T${endTime}`);
            const hours = (end.getTime() - start.getTime()) / (1000 * 3600);

            if (hours <= 0) {
                return '0.00';
            }

            if (carForReason === "MusicVideo" && hours < 2) {
                setErrorMessage("Minimum booking time for Music Video is 2 hours.");
                return '0.00';
            }
            if (carForReason === "Chauffeur" && hours < 6) {
                setErrorMessage("Minimum booking time for Chauffeur is 6 hours.");
                return '0.00';
            }

            return (hours * (carForReason === "Chauffeur" ? pricePerDay / 6 : pricePerDay)).toFixed(2);
        }
    }, [isMultiDay, startDate, endDate, startTime, endTime, pricePerDay, carForReason]);

    useEffect(() => {
        setTotalPrice(calculateTotalPrice());
    }, [startDate, endDate, startTime, endTime, calculateTotalPrice]);

    const validateForm = (): boolean => {
        const errors = {
            startDate: false,
            endDate: false,
            startTime: false,
            endTime: false
        };
        let isValid = true;

        setErrorMessage('');

        if (!userId) {
            setErrorMessage('You must be logged in to rent a car.');
            isValid = false;
        }

        if (!startDate) {
            errors.startDate = true;
            setErrorMessage('Please select a start date');
            isValid = false;
        }

        if (isMultiDay && !endDate) {
            errors.endDate = true;
            setErrorMessage('Please select an end date');
            isValid = false;
        }

        if (!isMultiDay) {
            if (!startTime) {
                errors.startTime = true;
                setErrorMessage('Please select a start time');
                isValid = false;
            }
            if (!endTime) {
                errors.endTime = true;
                setErrorMessage('Please select an end time');
                isValid = false;
            }

            if (startTime && endTime) {
                const start = new Date(`${startDate}T${startTime}`);
                const end = new Date(`${startDate}T${endTime}`);
                const hours = (end.getTime() - start.getTime()) / (1000 * 3600);

                if (hours <= 0) {
                    errors.startTime = true;
                    errors.endTime = true;
                    setErrorMessage("End time must be after start time");
                    isValid = false;
                }

                if (carForReason === "MusicVideo" && hours < 2) {
                    errors.startTime = true;
                    errors.endTime = true;
                    setErrorMessage("Minimum booking time for Music Video is 2 hours.");
                    isValid = false;
                }
                if (carForReason === "Chauffeur" && hours < 6) {
                    errors.startTime = true;
                    errors.endTime = true;
                    setErrorMessage("Minimum booking time for Chauffeur is 6 hours.");
                    isValid = false;
                }
            }
        }

        if (hasConflictingReservation()) {
            setErrorMessage('The selected dates are already booked. Please choose different dates.');
            errors.startDate = true;
            errors.endDate = true;
            isValid = false;
        }

        setFieldErrors(errors);

        if (!isValid) {
            setTimeout(() => {
                const errorElement = document.querySelector('.error-message');
                if (errorElement) {
                    errorElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }, 100);
        }

        return isValid;
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (validateForm()) {
            setIsModalOpen(true);
        }
    };

    const handleCancelModal = () => {
        setIsModalOpen(false);
    };

    const handleContinue = () => {
        const depositAmount = (parseFloat(totalPrice) * 0.3).toFixed(2);
        navigate('/Checkout', {
            state: {
                depositAmount,
                totalPrice,
                carId,
                carMake,
                carModel,
                startDate,
                endDate,
                startTime,
                endTime,
                isMultiDay
            }
        });
        onReservationSuccess();
    };

    return (
        <div>
            {errorMessage && (
                <div className="error-message bg-red-500 text-black font-semibold p-3 rounded-md mb-4">
                    {errorMessage}
                </div>
            )}
            <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-lg">
                <h2 className="text-2xl text-white font-bold mb-4">Create Reservation</h2>
                <p className="text-xl text-white font-bold mb-4">
                    All reservations cancelled within 48 hours of the start date will be charged the full amount.
                </p>

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
                                min={new Date().toISOString().split('T')[0]}
                                className={`bg-gray-800 rounded-lg py-2 px-3 text-white ${
                                    fieldErrors.startDate ? 'border-2 border-red-500' : ''
                                }`}
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
                                className={`bg-gray-800 rounded-lg py-2 px-3 text-white ${
                                    fieldErrors.endDate ? 'border-2 border-red-500' : ''
                                }`}
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
                                min={new Date().toISOString().split('T')[0]}
                                className={`bg-gray-800 rounded-lg py-2 px-3 text-white ${
                                    fieldErrors.startDate ? 'border-2 border-red-500' : ''
                                }`}
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
                                className={`bg-gray-800 rounded-lg py-2 px-3 text-white ${
                                    fieldErrors.startTime ? 'border-2 border-red-500' : ''
                                }`}
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
                                className={`bg-gray-800 rounded-lg py-2 px-3 text-white ${
                                    fieldErrors.endTime ? 'border-2 border-red-500' : ''
                                }`}
                            />
                        </div>
                    </>
                )}

                <div className="flex flex-col mb-4">
                    <h3 className="text-white font-bold">Total Price: £{totalPrice}</h3>
                </div>
                <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                >
                    Create Reservation
                </button>
            </form>

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-2xl font-bold mb-4">Reservation Summary</h2>
                        <p className="mb-4">
                            Cancellations within 48 hours of the start date will incur the full payment of £{totalPrice}.
                        </p>
                        <p className="mb-4">
                            A deposit of 30% (£{(parseFloat(totalPrice) * 0.3).toFixed(2)}) is required to complete the reservation.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={handleCancelModal}
                                className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleContinue}
                                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default Reservation;