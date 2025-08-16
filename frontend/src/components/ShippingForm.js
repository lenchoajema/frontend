import React, { useState } from "react";

const ShippingForm = ({ onDetailsSubmit }) => {
  const [details, setDetails] = useState({
    address: "",
    city: "",
    zipCode: "",
    country: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDetails({ ...details, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onDetailsSubmit(details);
  };

  return (
    <form onSubmit={handleSubmit} className="shipping-form">
      <h2>Shipping Details</h2>
      <input
        type="text"
        name="address"
        value={details.address}
        onChange={handleChange}
        placeholder="Address"
        required
      />
      <input
        type="text"
        name="city"
        value={details.city}
        onChange={handleChange}
        placeholder="City"
        required
      />
      <input
        type="text"
        name="zipCode"
        value={details.zipCode}
        onChange={handleChange}
        placeholder="Zip Code"
        required
      />
      <input
        type="text"
        name="country"
        value={details.country}
        onChange={handleChange}
        placeholder="Country"
        required
      />
      <button type="submit">Save Shipping Details</button>
    </form>
  );
};

export default ShippingForm;
