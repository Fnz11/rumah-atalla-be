const {
  findAllReviews,
  findReviewById,
  insertReview,
  changeReview,
  deleteReviewById,
} = require("./reviewServices");

const getAllReviews = async (req, res) => {
  try {
    const reviews = await findAllReviews();
    return res.status(200).json(reviews);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getReviewById = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await findReviewById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    return res.status(200).json(review);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const createReview = async (req, res) => {
  try {
    const reviewData = req.body;
    const newReview = await insertReview(reviewData);
    return res.status(201).json(newReview);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const newData = req.body;
    const updatedReview = await changeReview(reviewId, newData);
    if (!updatedReview) {
      return res.status(404).json({ message: "Review not found" });
    }
    return res.status(200).json(updatedReview);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const deletedReview = await deleteReviewById(reviewId);
    if (!deletedReview) {
      return res.status(404).json({ message: "Review not found" });
    }
    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
};
