import React from 'react';
import { useLocation } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from "./CheckoutForm";

const stripePublicKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;

if (!stripePublicKey) {
    throw new Error('Stripe publishable key is not defined');
}

const stripePromise = loadStripe(stripePublicKey)

const CheckoutPage = () => {
    const location = useLocation();
    const { depositAmount, totalPrice, carId, carMake, carModel, startDate, endDate, startTime, endTime } = location.state || { depositAmount: 0 };

    return (
        <Elements stripe={stripePromise}>
            <CheckoutForm
                depositAmount={depositAmount}
                totalPrice={totalPrice}
                carId={carId}
                carMake={carMake}
                carModel={carModel}
                startDate={startDate}
                endDate={endDate}
                startTime={startTime}
                endTime={endTime}
            />
        </Elements>
    );
};

export default CheckoutPage;
