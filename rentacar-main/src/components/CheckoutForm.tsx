import React, { useContext, useEffect, useState } from "react";
import {
    CardNumberElement,
    CardExpiryElement,
    CardCvcElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import '../css/CheckoutPage.css';
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
    imageUrl: string;
}

interface CheckoutFormProps {
    depositAmount: number;
    totalPrice: number;
    carId: string;
    carMake: string;
    carModel: string;
    startDate: string;  // Assuming startDate is a string (e.g., '2024-10-16')
    endDate: string;    // Assuming endDate is a string (e.g., '2024-10-17')
    startTime?: string; // Optional start time
    endTime?: string;   // Optional end time
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
                                                       depositAmount,
                                                       totalPrice,
                                                       carId,
                                                       carMake,
                                                       carModel,
                                                       startDate,
                                                       endDate,
                                                       startTime, // Receive startTime as a prop
                                                       endTime    // Receive endTime as a prop
                                                   }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { userId } = useContext(AuthContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [car, setCar] = useState<Car | null>(null);
    const [country, setCountry] = useState("GB"); // Set a default value for country
    const [postalCode, setPostalCode] = useState("");
    const [errorMessage, setErrorMessage] = useState('');

    const countryList = [
        { code: 'GB', name: 'United Kingdom' },
        { code: 'US', name: 'United States' },
        { code: 'CA', name: 'Canada' },
        { code: 'AU', name: 'Australia' },
        { code: 'FR', name: 'France' },
    ];

    const depositAmountFixed = Math.round(depositAmount * 100) / 100; // Rounded deposit amount
    const remainingToPay = Math.round((totalPrice - depositAmount) * 100) / 100; // Adjusted remaining to pay

    useEffect(() => {
        const fetchCar = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/cars/${carId}`
                );
                setCar(response.data);
            } catch (error) {
                console.error(`Error fetching car with ID ${carId}:`, error);
            }
        };

        fetchCar();
    }, [carId]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!stripe || !elements) {
            setErrorMessage("Stripe.js has not loaded yet.");
            return;
        }

        const cardNumberElement = elements.getElement(CardNumberElement);
        if (!cardNumberElement) {
            console.error("Card Elements not found");
            return;
        }

        // Ensure the country field is set before processing
        if (!country) {
            setErrorMessage("Please select a country.");
            return;
        }

        try {
            const paymentIntentResponse = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/reservations/create-payment-intent`,
                { amount: depositAmountFixed * 100, currency: "gbp" } // Amount in pence
            );

            const { client_secret } = paymentIntentResponse.data;

            const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
                payment_method: {
                    card: cardNumberElement,
                    billing_details: {
                        email: email,
                        address: { postal_code: postalCode, country: country }, // Ensure country is passed
                    },
                },
            });

            if (error) {
                console.error("Payment failed:", error);
                setErrorMessage("Payment failed. Please check your card details.");
                return;
            }

            if (paymentIntent && paymentIntent.status === "succeeded") {
                try {
                    // Prepare reservation data
                    const reservationData: any = {
                        user: userId,
                        carId,
                        carMake,
                        carModel,
                        startDate,
                        endDate,
                        totalPrice,
                        currentPaid: depositAmountFixed, // Set currentPaid to the deposit amount
                        remainingToPay, // Calculate remainingToPay based on totalPrice - currentPaid
                    };

                    // If startTime and endTime are present, adjust the reservation data
                    if (startTime && endTime) {
                        reservationData.startTime = startTime;
                        reservationData.endTime = endTime;

                        // Set endDate to be the same as startDate
                        reservationData.endDate = startDate;
                    }

                    await axios.post(
                        `${process.env.REACT_APP_API_URL}/api/reservations`,
                        reservationData
                    );
                    window.alert("Reservation has been made. You can see all your reservations on your profile page.");
                    navigate("/");
                } catch (error) {
                    console.error("Error creating reservation:", error);
                    setErrorMessage("An error occurred during reservation creation.");
                }
            }
        } catch (error) {
            console.error(error);
            setErrorMessage("An error occurred during payment processing.");
        }
    };

    return (
        <div className="checkout-container">
            <div className="checkout-form">
                <div className="product-details">
                    <div className="product-name">{`${car?.make} ${carModel}`}</div>
                    <img src={`${process.env.REACT_APP_API_URL}${car?.imageUrl || ''}`} alt="Product"
                         className="product-image" />
                    <div className="product-price">£{depositAmountFixed}</div>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="checkout-form">
                <h3>REVIEW ORDER</h3>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <select
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required
                    >
                        {countryList.map((country) => (
                            <option key={country.code} value={country.code}>
                                {country.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="postalCode">Postal Code</label>
                    <input
                        type="text"
                        id="postalCode"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="cardNumberElement">Card Number</label>
                    <CardNumberElement id="cardNumberElement" />
                </div>
                <div className="form-group">
                    <label htmlFor="expiryElement">Expiry Date</label>
                    <CardExpiryElement id="expiryElement" />
                </div>
                <div className="form-group">
                    <label htmlFor="CVCElement">CVC</label>
                    <CardCvcElement id="CVCElement" />
                </div>
                <button
                    type="submit"
                    className="btn btn-primary checkout-button"
                    disabled={!stripe || !elements}
                >
                    Pay {depositAmountFixed} GBP
                </button>
            </form>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
    );
};

export default CheckoutForm;
