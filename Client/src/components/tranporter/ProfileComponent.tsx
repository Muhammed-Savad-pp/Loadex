import { useEffect, useState } from 'react'
import { Star, Truck, MessageSquare, Users, UserPlus, Calendar, Building2, Send } from 'lucide-react'
import { followShipper, getShipperData, unfollowShipper, postReview } from '../../services/transporter/transporterApi'


interface profileProps {
  shipperId: string
}

interface IUserData {
  _id: string;
  shipperName: string;
  companyName: string;
  profileImage: string;
  followers: string[];
  followings: string[];
}   

interface Review {
  _id: number;
  from: {
    id: {
      _id: string;
      transporterName: string;
      profileImage: string;
    };
    role: string
  }
  to: {
    id: string;
    role: string;
  };
  rating: number;
  review: string;
  createdAt: Date
}


function ProfileComponent({ shipperId }: profileProps) {


  console.log('shipperiD', shipperId);

  const [shipperData, setShipperData] = useState<IUserData>();
  const [isFollow, setIsFollow] = useState<boolean>();
  const [tripsCount, setTripsCount] = useState<number>();
  const [loadsCount, setLoadCount] = useState<number>()
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  const [newReview, setNewReview] = useState<string>("");
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [alreadySubmitedReview, setAlreadySubmitedReview] = useState<boolean>();

  useEffect(() => {
    const fetchShipperProfile = async () => {
      try {

        const response: any = await getShipperData(shipperId);
        setShipperData(response.shipperData as IUserData);
        setIsFollow(response.isFollow);
        setTripsCount(response.tripsCount);
        setLoadCount(response.loadsCount);
        setReviews(response.reviews);
        setAverageRating(response.averageRating);
        setAlreadySubmitedReview(response.isReview);

      } catch (error) {
        console.log(error);
      }
    }

    fetchShipperProfile()

  }, [])


  const handleFollow = async (shipperId: string) => {
    try {

      const response: any = await followShipper(shipperId);
      if (response.success) {
        setShipperData(response.shipperData);
        setIsFollow(response.isFollow)
      }

    } catch (error) {
      console.error(error)
    }
  }

  const handleUnfollow = async (shipperId: string) => {
    try {

      const response: any = await unfollowShipper(shipperId);
      if (response.success) {
        setShipperData(response.shipperData)
        setIsFollow(response.isFollow);
      }

    } catch (error) {
      console.error(error)
    }
  }

  const handleSubmitReview = async () => {
    if (newReview.trim() === "" || userRating === 0) {
      return;
    }

    try {

      const response: any = await postReview(shipperId, userRating, newReview);
      if (response.success) {
        setReviews([response.reviewData, ...reviews]);
        setNewReview("");
        setUserRating(0);
        setShowReviewForm(false);
      }

    } catch (error) {
      console.error("Error posting review:", error);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header with avatar and basic info */}
      <div className="bg-gray-100 p-6 flex items-center space-x-4">
        <img
          src={shipperData?.profileImage}
          alt="Profile"
          className="w-20 h-20 rounded-full border-4 border-white shadow-sm"
        />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{shipperData?.shipperName}</h1>
          <div className="flex items-center text-gray-600 mt-1">
            <Building2 size={16} className="mr-1" />
            <span className="text-sm">{shipperData?.companyName}</span>
          </div>
          <div className="flex items-center mt-1">
            <Star size={16} className="text-yellow-500 mr-1" />
            <span className="text-gray-800 font-medium">{averageRating}</span>
            <span className="text-gray-500 text-sm ml-1">({reviews.length} reviews)</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 border-b border-gray-200">
        <div className="p-4 border-r border-gray-200 text-center">
          <div className="flex flex-col items-center">
            <Truck size={20} className="text-blue-500 mb-1" />
            <div className="text-lg font-bold text-gray-800">{loadsCount}</div>
            <div className="text-xs text-gray-500">Loads</div>
          </div>
        </div>
        <div className="p-4 border-r border-gray-200 text-center">
          <div className="flex flex-col items-center">
            <MessageSquare size={20} className="text-green-500 mb-1" />
            <div className="text-lg font-bold text-gray-800">{tripsCount}</div>
            <div className="text-xs text-gray-500">Trips</div>
          </div>
        </div>
        <div className="p-4 text-center">
          <div className="flex flex-col items-center">
            <Star size={20} className="text-yellow-500 mb-1" />
            <div className="text-lg font-bold text-gray-800">{averageRating}</div>
            <div className="text-xs text-gray-500">Rating</div>
          </div>
        </div>
      </div>

      {/* Followers info */}
      <div className="grid grid-cols-2 p-4">
        <div className="flex items-center justify-center border-r border-gray-200">
          <Users size={18} className="text-gray-500 mr-2" />
          <div>
            <div className="text-lg font-bold text-gray-800">{shipperData?.followers.length}</div>
            <div className="text-xs text-gray-500">Followers</div>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <UserPlus size={18} className="text-gray-500 mr-2" />
          <div>
            <div className="text-lg font-bold text-gray-800">{shipperData?.followings.length}</div>
            <div className="text-xs text-gray-500">Following</div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 flex space-x-2">
        {
          isFollow ?
            <button onClick={() => handleUnfollow(shipperData?._id ?? '')}
              className='bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-2 rounded-lg flex-1 cursor-pointer'>
              UnFollow
            </button>
            :
            <button onClick={() => handleFollow(shipperData?._id ?? '')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg flex-1 cursor-pointer" >
              Follow
            </button>
        }

        <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg flex-1" >
          Message
        </button>
      </div>

      {
        !alreadySubmitedReview && (
          <div className="border-t border-gray-200 p-4">
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center"
            >
              <Star size={18} className="mr-2" />
              {showReviewForm ? "Cancel Review" : "Write a Review"}
            </button>
          </div>

        )
      }

      {showReviewForm && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Write Your Review</h3>
          <div className="flex items-center mb-3">
            <span className="text-sm text-gray-600 mr-2">Your Rating:</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={24}
                  className={`cursor-pointer ${(hoverRating || userRating) >= star
                    ? "text-yellow-500"
                    : "text-gray-300"
                    }`}
                  fill={(hoverRating || userRating) >= star ? "currentColor" : "none"}
                  onClick={() => setUserRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                />
              ))}
            </div>
          </div>

          {/* Comment Textarea */}
          <textarea
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            placeholder="Share your experience with this transporter..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
          />

          {/* Submit Button */}
          <button
            onClick={handleSubmitReview}
            disabled={newReview.trim() === "" || userRating === 0}
            className={`mt-3 flex items-center justify-center w-full py-2 px-4 rounded-lg ${newReview.trim() === "" || userRating === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
          >
            <Send size={18} className="mr-2" />
            Submit Review
          </button>
        </div>
      )}

      {/* Reviews section */}
      <div className="border-t border-gray-200 p-4">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Reviews ({reviews.length})</h2>

        {reviews.map(review => (
          <div key={review._id} className="mb-4 pb-4 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
            <div className="flex items-start">
              <img src={review.from.id.profileImage} alt={review.from.id.transporterName} className="w-10 h-10 rounded-full mr-3" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">{review.from.id.transporterName}</h3>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar size={14} className="mr-1" />
                    {new Date(review.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center mt-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < review.rating ? "text-yellow-500" : "text-gray-300"}
                      fill={i < review.rating ? "currentColor" : "none"}
                    />
                  ))}
                </div>

                <p className="text-sm text-gray-600">{review.review}</p>
              </div>
            </div>
          </div>
        ))}

        {
          reviews.length > 3 && (
            <button className="w-full mt-2 text-blue-500 text-sm font-medium py-2 border border-blue-500 rounded-lg hover:bg-blue-50">
              View all reviews
            </button>
          )
        }

      </div>
    </div>
  )
}

export default ProfileComponent