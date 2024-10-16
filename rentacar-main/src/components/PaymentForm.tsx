import React, {useEffect, useState} from "react";
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import '../css/CheckoutPage.css';
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
    imageUrl: string;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ reservationId, remainingToPay, onPaymentSuccess, carMake, carModel, carId }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [email, setEmail] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [car, setCar] = useState<Car | null>(null);

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

    const handleSubmit = async (event: { preventDefault: () => void }) => {
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

        try {
            // Create the payment intent
            const paymentIntentResponse = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/reservations/${reservationId}/pay`,
                {
                    amount: remainingToPay * 100, // Amount in cents for this transaction
                }
            );

            const { client_secret } = paymentIntentResponse.data;

            // Confirm the card payment
            const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
                payment_method: {
                    card: cardNumberElement,
                    billing_details: {
                        email: email,
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
                    // Send only the amount being paid for this transaction
                    await axios.put(
                        `${process.env.REACT_APP_API_URL}/api/reservations/${reservationId}`,
                        {
                            currentPaid: remainingToPay, // Only send the amount paid in this transaction
                        }
                    );

                    onPaymentSuccess();
                } catch (error) {
                    console.error("Error updating reservation:", error);
                    setErrorMessage("Error updating reservation. Please try again.");
                }
            }
        } catch (error) {
            console.error("Error processing payment:", error);
            setErrorMessage("Error processing payment. Please try again.");
        }
    };

    return (
        <>
            <Header />
            <div className="fit-content">
                <div className="checkout-container">
                    <div className="checkout-form">
                        <div className="product-details">
                            <div className="product-name">{`${carMake} ${carModel}`}</div>
                            <img src={`${process.env.REACT_APP_API_URL}${car?.imageUrl || ''}`} alt="Product"
                                 className="product-image"/>
                            <div className="product-price">To Pay Today: £{remainingToPay}</div>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit}
                          className="checkout-form"> {/* Use the same form class as CheckoutForm */}
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
                            <label htmlFor="cardNumberElement">Card Number</label>
                            <CardNumberElement id="cardNumberElement"/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="expiryElement">Expiry Date</label>
                            <CardExpiryElement id="expiryElement"/>
                        </div>
                        <div className="form-group">
                            <label htmlFor="CVCElement">CVC</label>
                            <CardCvcElement id="CVCElement"/>
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary checkout-button"
                            disabled={!stripe || !elements}
                        >
                            Pay £{(remainingToPay).toFixed(2)} {/* Display the amount in GBP */}
                        </button>
                    </form>
                    {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Display error messages */}
                </div>
            </div>
        </>
    );
};

export default PaymentForm;
