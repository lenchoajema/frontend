import React from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PayPalButton = ({ total, onSuccess, disabled }) => {
  const initialOptions = {
    "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID,
    currency: "USD",
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <div style={{ marginTop: "20px" }}>
        <h3>Pay with PayPal</h3>
        <PayPalButtons
          style={{ layout: "vertical" }}
          disabled={disabled}
          createOrder={(data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: total.toFixed(2), // Ensure total is a string
                  },
                },
              ],
            });
          }}
          onApprove={(data, actions) => {
            return actions.order.capture().then((details) => {
              const paymentDetails = {
                id: details.id,
                payer: details.payer.name.given_name,
                email: details.payer.email_address,
              };
              onSuccess(paymentDetails);
            });
          }}
          onError={(error) => {
            console.error("PayPal error:", error);
            alert("There was an error processing your payment.");
          }}
        />
      </div>
    </PayPalScriptProvider>
  );
};

export default PayPalButton;
