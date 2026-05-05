const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const {
  createVehicle,
  getAllVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle,
  updateVehicleStatus,
  addVehicleImages,
  removeVehicleImage
} = require('../controllers/vehicleController');

// Vehicle routes with multer middleware for image uploads
router.route('/')
  .get(getAllVehicles)
  .post(upload.array('images', 10), createVehicle);  // Allow up to 10 images

router.route('/:id')
  .get(getVehicle)
  .put(upload.array('images', 10), updateVehicle)
  .delete(deleteVehicle);

router.patch('/status/:id', updateVehicleStatus);

// Image management routes
router.post('/:id/images', upload.array('images', 10), addVehicleImages);
router.delete('/images/:id/:imageIndex', removeVehicleImage);

module.exports = router;