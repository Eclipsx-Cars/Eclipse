import React, { useContext, useEffect, useState } from "react";
import {
    CardNumberElement,
    CardExpiryElement,
    CardCvcElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { AuthContext } from "../context/authContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface Car {
    id: string;
    make: string;
    model: string;
    year: number;
    description: string;
    price: string;
    CarForReason: string;
    images: string[];
}

interface CheckoutFormProps {
    depositAmount: number;
    totalPrice: number;
    carId: string;
    carMake: string;
    carModel: string;
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
                                                       depositAmount,
                                                       totalPrice,
                                                       carId,
                                                       carMake,
                                                       carModel,
                                                       startDate,
                                                       endDate,
                                                       startTime,
                                                       endTime
                                                   }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { userId } = useContext(AuthContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [car, setCar] = useState<Car | null>(null);
    const [country, setCountry] = useState("GB");
    const [postalCode, setPostalCode] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const depositAmountFixed = Math.round(depositAmount * 100) / 100;

    const countryList = [
        { code: 'GB', name: 'United Kingdom' },
        { code: 'US', name: 'United States' },
        { code: 'CA', name: 'Canada' },
        { code: 'AU', name: 'Australia' },
        { code: 'FR', name: 'France' },
        { code: 'DE', name: 'Germany' },
        { code: 'IT', name: 'Italy' },
        { code: 'ES', name: 'Spain' },
        { code: 'NL', name: 'Netherlands' },
        { code: 'IE', name: 'Ireland' }
    ];

    const cardStyle = {
        style: {
            base: {
                color: '#ffffff',
                fontFamily: 'Arial, sans-serif',
                fontSize: '16px',
                '::placeholder': {
                    color: '#aab7c4',
                },
            },
            invalid: {
                color: '#fa755a',
                iconColor: '#fa755a',
            },
        },
    };

    useEffect(() => {
        const fetchCar = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/cars/${carId}`);
                setCar(response.data);
            } catch (error) {
                console.error(`Error fetching car with ID ${carId}:`, error);
                setErrorMessage("Error loading car details");
            }
        };

        fetchCar();
    }, [carId]);

    const nextImage = () => {
        if (car?.images?.length) {
            setCurrentImageIndex((prev) => (prev + 1) % car.images.length);
        }
    };

    const previousImage = () => {
        if (car?.images?.length) {
            setCurrentImageIndex((prev) =>
                prev === 0 ? car.images.length - 1 : prev - 1
            );
        }
    };

    const getCurrentImage = () => {
        return car?.images?.[currentImageIndex] ?? null;
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage("");
        setIsProcessing(true);

        if (!stripe || !elements) {
            setErrorMessage("Payment system is not ready yet.");
            setIsProcessing(false);
            return;
        }

        const cardNumberElement = elements.getElement(CardNumberElement);
        if (!cardNumberElement) {
            setErrorMessage("Card information is missing.");
            setIsProcessing(false);
            return;
        }

        if (!email || !country || !postalCode) {
            setErrorMessage("Please fill in all required fields.");
            setIsProcessing(false);
            return;
        }

        try {
            const paymentIntentResponse = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/reservations/create-payment-intent`,
                { amount: depositAmountFixed * 100, currency: "gbp" }
            );

            const { client_secret } = paymentIntentResponse.data;

            const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
                payment_method: {
                    card: cardNumberElement,
                    billing_details: {
                        email,
                        address: { postal_code: postalCode, country }
                    },
                },
            });

            if (error) {
                setErrorMessage(error.message || "Payment failed");
                setIsProcessing(false);
                return;
            }

            if (paymentIntent?.status === "succeeded") {
                try {
                    const reservationData = {
                        user: userId,
                        carId,
                        carMake,
                        carModel,
                        startDate,
                        endDate: startTime && endTime ? startDate : endDate,
                        startTime,
                        endTime,
                        totalPrice,
                        currentPaid: depositAmountFixed,
                        remainingToPay: totalPrice - depositAmountFixed
                    };

                    await axios.post(
                        `${process.env.REACT_APP_API_URL}/api/reservations`,
                        reservationData
                    );

                    navigate("/reservation-confirmation", {
                        state: {
                            success: true,
                            amount: depositAmountFixed,
                            carDetails: `${carMake} ${carModel}`,
                            reservationDetails: reservationData
                        }
                    });
                } catch (error) {
                    setErrorMessage("Reservation failed. Please contact support.");
                    console.error("Reservation error:", error);
                }
            }
        } catch (error) {
            setErrorMessage("Payment processing failed. Please try again.");
            console.error("Payment error:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 bg-gray-800 rounded-lg shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-gray-700 p-4 rounded-lg">
                        <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>
                        {car && (
                            <div className="relative">
                                {car.images && car.images.length > 0 ? (
                                    <>
                                        <img
                                            src={`${process.env.REACT_APP_API_URL}${getCurrentImage()}`}
                                            alt={`${carMake} ${carModel}`}
                                            className="w-full h-64 object-cover rounded-lg"
                                        />
                                        {car.images.length > 1 && (
                                            <>
                                                <div className="absolute inset-0 flex items-center justify-between">
                                                    <button
                                                        onClick={previousImage}
                                                        className="bg-black bg-opacity-50 text-white rounded-full p-2 mx-2 hover:bg-opacity-75"
                                                    >
                                                        ←
                                                    </button>
                                                    <button
                                                        onClick={nextImage}
                                                        className="bg-black bg-opacity-50 text-white rounded-full p-2 mx-2 hover:bg-opacity-75"
                                                    >
                                                        →
                                                    </button>
                                                </div>
                                                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                                                    {car.images.map((_, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => setCurrentImageIndex(index)}
                                                            className={`w-2 h-2 rounded-full transition-colors ${
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
                                    <div className="w-full h-48 bg-gray-600 flex items-center justify-center rounded-lg">
                                        <span className="text-gray-400">No image available</span>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="space-y-2 text-white mt-4">
                            <p className="text-lg font-semibold">{`${carMake} ${carModel}`}</p>
                            <div className="flex justify-between">
                                <span>Total Price:</span>
                                <span>£{totalPrice}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Deposit Amount:</span>
                                <span>£{depositAmountFixed}</span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                                <span>Remaining to Pay:</span>
                                <span>£{(totalPrice - depositAmountFixed).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <h2 className="text-xl font-bold text-white">Payment Details</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Country
                                </label>
                                <select
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2"
                                    required
                                >
                                    {countryList.map((country) => (
                                        <option key={country.code} value={country.code}>
                                            {country.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Postal Code
                                </label>
                                <input
                                    type="text"
                                    value={postalCode}
                                    onChange={(e) => setPostalCode(e.target.value)}
                                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-md p-2"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Card Number
                                </label>
                                <div className="bg-gray-700 border border-gray-600 rounded-md p-2">
                                    <CardNumberElement options={cardStyle} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Expiry Date
                                    </label>
                                    <div className="bg-gray-700 border border-gray-600 rounded-md p-2">
                                        <CardExpiryElement options={cardStyle} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        CVC
                                    </label>
                                    <div className="bg-gray-700 border border-gray-600 rounded-md p-2">
                                        <CardCvcElement options={cardStyle} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="bg-red-500 text-white p-3 rounded-md">
                            {errorMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={!stripe || !elements || isProcessing}
                        className={`w-full bg-blue-600 text-white py-3 px-4 rounded-md font-semibold
                            ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}
                            transition-colors duration-200`}
                    >
                        {isProcessing ? 'Processing...' : `Pay £${depositAmountFixed}`}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CheckoutForm;