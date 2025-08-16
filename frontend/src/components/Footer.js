import React from 'react';
//import './Footer.css'; // Make sure to create a corresponding CSS file for styling

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <p>&copy; {new Date().getFullYear()} LenCenter. All rights reserved. Do one thing every day that scares you. Well done is better than well said. </p>
                <ul className="footer-columns">
                    <li><a href="/about">About Us</a></li>
                    <li><a href="/contact">Contact</a></li>
                    <li><a href="/privacy">Privacy Policy</a></li>
                    <li><a href="/terms">Terms of Service</a></li>
                </ul>
            </div>
        </footer>
    );
};

export default Footer;