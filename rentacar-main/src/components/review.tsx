import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from 'axios';
import '../css/Review.css'
import Header from "./header";

interface Review {
  id?: string;
  name: string;
  content: string;
}

const ReviewCarousel: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState<Review>({ name: "", content: "" });

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/reviews`);
      setReviews(response.data);
    } catch (error) {
      console.error("There was an error loading the reviews!", error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewReview({ ...newReview, [name]: value });
  };

  const handleAddReview = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/reviews`, newReview);
      setReviews([...reviews, response.data.review]);
      setNewReview({ name: "", content: "" });
    } catch (error) {
      console.error("There was an error submitting the review!", error);
    }
  };

  const settings = {
    dots: true,
    infinite: reviews.length > 3,
    speed: 500,
    slidesToShow: Math.min(reviews.length, 3),
    slidesToScroll: 1,
    arrows: reviews.length > 3
  };

  return (
      <div>
        <Header />
        <div className='bg-gray-100 mt-20'>
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Reviews</h2>
          <div className="max-w-2xl mx-auto p-4 flex flex-col items-center justify-center min-h-screen">
            <Slider {...settings} className="w-full">
              {reviews.map((review, index) => (
                  <div key={index} className="p-4">
                    <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                      <p className="text-lg font-semibold mb-2">{review.name}</p>
                      <p className="text-gray-700">{review.content}</p>
                    </div>
                  </div>
              ))}
            </Slider>

            <div className="mt-8 w-full">
              <h2 className="text-2xl font-semibold mb-4 text-center">Add a Review</h2>
              <form onSubmit={handleAddReview} className="bg-white rounded-lg shadow-lg p-6">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                    Name
                  </label>
                  <input
                      type="text"
                      name="name"
                      id="name"
                      value={newReview.name}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
                    Review
                  </label>
                  <textarea
                      name="content"
                      id="content"
                      value={newReview.content}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                  ></textarea>
                </div>
                <div className="flex items-center justify-between">
                  <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Add Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
  );
};

export default ReviewCarousel;