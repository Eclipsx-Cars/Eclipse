import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useLocation } from 'react-router-dom';
import PaymentForm from './PaymentForm'; // Adjust based on file structure

const stripePublicKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
const stripePromise = loadStripe(stripePublicKey!);

const PaymentFormPage: React.FC = () => {
    const location = useLocation();
    const { reservationId, remainingToPay, carMake, carModel, carId} = location.state;

    const handlePaymentSuccess = () => {
        console.log('Payment succeeded!');
    };

    return (
        <div>
            <Elements stripe={stripePromise}>
                <PaymentForm
                    reservationId={reservationId}
                    remainingToPay={remainingToPay}
                    onPaymentSuccess={handlePaymentSuccess}
                    carMake={carMake}
                    carModel={carModel}
                    carId={carId}
                />
            </Elements>
        </div>
    );
};

export default PaymentFormPage;
