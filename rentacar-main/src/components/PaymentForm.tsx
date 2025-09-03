import React, { useEffect, useState } from "react";
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import Header from "./header";
import Footer from "./Footer";

interface PaymentFormProps {
    reservationId: string;
    remainingToPay: number;
    onPaymentSuccess: () => void;
    carMake: string;
    carModel: string;
    carId: string;
}

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

const PaymentForm: React.FC<PaymentFormProps> = ({
                                                     reservationId,
                                                     remainingToPay,
                                                     onPaymentSuccess,
                                                     carMake,
                                                     carModel,
                                                     carId
                                                 }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [email, setEmail] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [car, setCar] = useState<Car | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/cars/${carId}`
                );
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

        if (!email) {
            setErrorMessage("Please provide an email address.");
            setIsProcessing(false);
            return;
        }

        try {
            const paymentIntentResponse = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/reservations/${reservationId}/pay`,
                {
                    amount: Math.round(remainingToPay * 100),
                }
            );

            const { client_secret } = paymentIntentResponse.data;

            const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
                payment_method: {
                    card: cardNumberElement,
                    billing_details: { email },
                },
            });

            if (error) {
                setErrorMessage(error.message || "Payment failed. Please check your card details.");
                return;
            }

            if (paymentIntent?.status === "succeeded") {
                try {
                    await axios.put(
                        `${process.env.REACT_APP_API_URL}/api/reservations/${reservationId}`,
                        { currentPaid: remainingToPay }
                    );
                    onPaymentSuccess();
                } catch (error) {
                    setErrorMessage("Payment successful but failed to update reservation. Please contact support.");
                    console.error("Error updating reservation:", error);
                }
            }
        } catch (error) {
            setErrorMessage("Payment processing failed. Please try again.");
            console.error("Error processing payment:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900">
            <Header />
            <div className="max-w-4xl mx-auto p-4">
                <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                        <div className="space-y-6">
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <h2 className="text-xl font-bold text-white mb-4">Payment Details</h2>
                                <div className="relative h-64 mb-4">
                                    {car?.images?.length ? (
                                        <>
                                            <img
                                                src={`${process.env.REACT_APP_API_URL}${car.images[currentImageIndex]}`}
                                                alt={`${carMake} ${carModel}`}
                                                className="w-full h-full object-cover rounded-lg"
                                            />
                                            {car.images.length > 1 && (
                                                <>
                                                    <div className="absolute inset-0 flex items-center justify-between p-2">
                                                        <button
                                                            onClick={previousImage}
                                                            className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                                                        >
                                                            ←
                                                        </button>
                                                        <button
                                                            onClick={nextImage}
                                                            className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                                                        >
                                                            →
                                                        </button>
                                                    </div>
                                                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                                                        {car.images.map((_, index) => (
                                                            <button
                                                                key={index}
                                                                onClick={() => setCurrentImageIndex(index)}
                                                                className={`w-2 h-2 rounded-full ${
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
                                        <div className="w-full h-full bg-gray-600 rounded-lg flex items-center justify-center">
                                            <span className="text-gray-400">No image available</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-white space-y-2">
                                    <h3 className="text-lg font-semibold">{`${carMake} ${carModel}`}</h3>
                                    <div className="text-2xl font-bold">
                                        Amount to Pay: £{remainingToPay.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
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
                                {isProcessing ? 'Processing...' : `Pay £${remainingToPay.toFixed(2)}`}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PaymentForm;