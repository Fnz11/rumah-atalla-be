const {
    getAllReviews,
    getReviewById,
    createReview,
    updateReview,
    deleteReview,
  } = require("./reviewRepository");
  
  const findAllReviews = async () => {
    return await getAllReviews();
  };
  
  const findReviewById = async (reviewId) => {
    return await getReviewById(reviewId);
  };
  
  const insertReview = async (reviewData) => {
    return await createReview(reviewData);
  };
  
  const changeReview = async (reviewId, newData) => {
    return await updateReview(reviewId, newData);
  };
  
  const deleteReviewById = async (reviewId) => {
    return await deleteReview(reviewId);
  };
  
  module.exports = {
    findAllReviews,
    findReviewById,
    insertReview,
    changeReview,
    deleteReviewById,
  };
  