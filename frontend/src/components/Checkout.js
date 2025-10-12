import React, { useMemo, useState } from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { createOrder, captureOrder } from '../utils/api';

const Checkout = ({ total }) => {
    const [error, setError] = useState(null);
    const normalizedTotal = useMemo(() => {
        const num = Number(total || 0);
        return Number.isFinite(num) ? Math.max(0, num) : 0;
    }, [total]);
    const reRenderAmount = useMemo(() => normalizedTotal.toFixed(2), [normalizedTotal]);

    const handleCreateOrder = async () => {
        setError(null);
        try {
            if (!normalizedTotal) {
                throw new Error('Nothing to pay yet.');
            }
            const { id } = await createOrder(normalizedTotal);
            return id;
        } catch (err) {
            if (err?.response?.status === 401) {
                setError('Please sign in to continue with payment.');
                window.location.href = '/login?next=/checkout';
            }
            setError(err?.response?.data?.message || err.message || 'Unable to create order');
            throw err;
        }
    };

    const handleApprove = async (data) => {
        try {
            const result = await captureOrder(data.orderID);
            console.info('Payment captured', result);
            alert('Payment successful!');
        } catch (err) {
            console.error('Error capturing order:', err);
            if (err?.response?.status === 401) {
                setError('Session expired. Please sign in again.');
                window.location.href = '/login?next=/checkout';
                return;
            }
            setError(err?.response?.data?.message || err.message || 'Failed to capture order');
        }
    };

    return (
        <div>
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}
            <PayPalButtons
                style={{ layout: 'vertical' }}
                disabled={!normalizedTotal}
                forceReRender={[reRenderAmount]}
                createOrder={handleCreateOrder}
                onApprove={handleApprove}
                onError={(err) => {
                    console.error('PayPal button error:', err);
                    setError(err?.message || 'Payment failed. Please try again.');
                }}
            />
        </div>
    );
};

export default Checkout;
