import React, { useEffect } from 'react';
import { createOrder, captureOrder } from '../utils/api';
// NOTE: createOrder / captureOrder currently point to /payments/* endpoints.
// Ensure backend exposes POST /api/payments/create-order and /api/payments/capture-order/:id
// or adjust helper paths in utils/api.js accordingly.

const Checkout = ({ total }) => {
    useEffect(() => {
        window.paypal.Buttons({
            createOrder: async () => {
                const { id } = await createOrder(total);
                return id;
            },
            onApprove: async (data) => {
                const result = await captureOrder(data.orderID);
                alert('Payment Successful!');
                console.log(result);
            },
            onError: (err) => {
                console.error('Error with payment:', err);
                alert('Payment failed. Please try again.');
            },
        }).render('#paypal-button-container');
    }, [total]);

    return <div id="paypal-button-container"></div>;
};

export default Checkout;
