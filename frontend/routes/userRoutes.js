const express = require('express');
const { authenticateUser, authorizeRoles } = require('../middleware/authMiddleware');
const { changePassword, uploadProfilePicture, getProfile, updateProfile } = require("../controllers/userController");
const multer = require('multer');
//const upload = multer({ dest: 'uploads/' }); // Configure storage as needed

//configure Multer
const upload = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
      const allowedMimeTypes = ['image/jpeg', 'image/png'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'));
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  });
  


const router = express.Router();
// Route to fetch the user's profile
router.get("/profile", authenticateUser, getProfile);

// Route to update the user's profile
router.put("/profile", authenticateUser, updateProfile);
// Route to change the user's password
router.put("/change-password", authenticateUser, changePassword);

// Route to upload the user's profile picture
router.put(
    '/upload-profile-picture',
    authenticateUser,
    upload.single('profilePicture'),
    uploadProfilePicture
  );
  module.exports = router;
