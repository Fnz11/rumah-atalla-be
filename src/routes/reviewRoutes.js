const express = require("express");
const router = express.Router();
const {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
} = require("../reviews/reviewControllers");
const { authenticateToken } = require('../middleware/requireAuth');


// GET ALL Reviews
router.get("/", getAllReviews);

// GET Review by ID
router.get("/:reviewId", getReviewById);

// CREATE Review
router.post("/", createReview);

// UPDATE Review
router.patch("/:reviewId", updateReview);

// DELETE Review
router.delete("/:reviewId", authenticateToken, deleteReview);

module.exports = router;
