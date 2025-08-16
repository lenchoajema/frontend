const express = require('express');
const { authenticateUser, authorizeRoles } = require('../../middleware/authMiddleware');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { createProduct, updateProduct, deleteProduct, getProducts, getProduct } = require('../../controllers/productController');



const router = express.Router();

// Seller routes: Create, update, and delete products
router.post(
    '/',
    authenticateUser,
    authorizeRoles('seller'),
    upload.array('pictures', 5), // Allow uploading up to 5 pictures
    createProduct
);

router.put(
    '/:id',
    authenticateUser,
    authorizeRoles('seller'),
    upload.array('pictures', 5), // Allow uploading new pictures during update
    updateProduct
);

router.delete(
    '/:id',
    authenticateUser,
    authorizeRoles('seller'),
    deleteProduct
);

// Seller-specific route: Get all products by seller
router.get('/seller', authenticateUser, authorizeRoles('seller'), (req, res) => {
    const sellerId = req.user.id; // Assuming req.user contains the authenticated user's information
    getProducts(req, res, { seller: sellerId });
});

// Seller-specific route: Get a single product by ID, ensuring it belongs to the seller
router.get('/seller/:id', authenticateUser, authorizeRoles('seller'), (req, res) => {
    const sellerId = req.user.id;
    const productId = req.params.id;
    getProduct(req, res, { seller: sellerId, _id: productId });
});

// Seller-specific route: Update a product, ensuring it belongs to the seller
router.put(
    '/seller/:id',
    authenticateUser,
    authorizeRoles('seller'),
    upload.array('pictures', 5), // Allow uploading new pictures during update
    (req, res) => {
        const sellerId = req.user.id;
        const productId = req.params.id;
        updateProduct(req, res, { seller: sellerId, _id: productId });
    }
);

// Seller-specific route: Delete a product, ensuring it belongs to the seller
router.delete('/seller/:id', authenticateUser, authorizeRoles('seller'), (req, res) => {
    const sellerId = req.user.id;
    const productId = req.params.id;
    deleteProduct(req, res, { seller: sellerId, _id: productId });
});

module.exports = router;