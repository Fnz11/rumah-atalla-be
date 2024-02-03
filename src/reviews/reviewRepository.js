const Review = require("../../models/reviewModel");

const getAllReviews = async () => {
  return await Review.find({});
};

const getReviewById = async (reviewId) => {
  return await Review.findById(reviewId);
};

const createReview = async (reviewData) => {
  return await Review.create(reviewData);
};

const updateReview = async (reviewId, newData) => {
  return await Review.findByIdAndUpdate(reviewId, newData, { new: true });
};

const deleteReview = async (reviewId) => {
  return await Review.findByIdAndDelete(reviewId);
};

module.exports = {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
};
