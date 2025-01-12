const express = require('express');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');
const { getSellerProducts } = require("../controllers/productController");
const upload = require("../middleware/multerConfig");

const {
  createProduct,
  updateProduct,
  getProduct,
  getProducts,
  deleteProduct,
} = require('../controllers/productController');


const router = express.Router();

// Public route: Get all products
router.get('/', getProducts);

// Public route: Get a single product by ID
router.get('/:id', getProduct);
// Seller-specific route: Get paginated products by seller seller/product/Unhandled request: GET /api/seller/products?page=1
router.get('/seller/product', authenticateUser, authorizeRoles('seller'), getSellerProducts);

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
router.delete('/:id', authenticateUser, authorizeRoles('seller'), deleteProduct);

// Seller-specific route: Get all products by seller
/*router.get('/seller', authenticateUser, authorizeRoles('seller'), (req, res) => {
  const sellerId = req.user.id; // Assuming req.user contains the authenticated user's information
  getProducts(req, res, { seller: sellerId });
});*/

// Seller-specific route: Get a single product by ID, ensuring it belongs to the seller seller/product/
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
const Product = require('../models/productModel'); // Import your Product model

// GET /api/products/search?query=your_search_term
router.get('/search', async (req, res) => {
    const { query } = req.query; // Get the search term from query parameters

    try {
        // Perform a case-insensitive search
        const products = await Product.find({
            name: { $regex: query, $options: 'i' } // Search by product name
        });

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error });
    }
});
router.get('/search', async (req, res) => {
  const { query, category, minPrice, maxPrice, rating } = req.query;

  const filter = {};

  // Add search query
  if (query) {
      filter.name = { $regex: query, $options: 'i' };
  }

  // Add category filter
  if (category) {
      filter.category = category;
  }

  // Add price range filter
  if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  // Add rating filter
  if (rating) {
      filter.rating = { $gte: parseFloat(rating) }; // Minimum rating
  }

  try {
      const products = await Product.find(filter);
      res.json(products);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching products', error });
  }
});



module.exports = router;
