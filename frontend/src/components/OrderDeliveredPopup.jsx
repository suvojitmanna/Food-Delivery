import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiX, 
  FiCheckCircle, 
  FiClock, 
  FiHeart, 
  FiMessageSquare 
} from "react-icons/fi";
import { FaStar } from "react-icons/fa";

const OrderDeliveredPopup = ({ 
  isOpen, 
  onClose, 
  deliveryBoy, 
  shopName,
  deliveryTime = new Date()
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [comment, setComment] = useState("");
  const [selectedTip, setSelectedTip] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setSelectedTags([]);
      setComment("");
      setSelectedTip(0);
      setIsSuccess(false);
    }
  }, [isOpen]);

  const positiveTags = ["Polite Partner", "Fast Delivery", "Safe Packaging", "Followed Instructions"];
  const negativeTags = ["Late Delivery", "Damaged Package", "Unprofessional", "Missing Items"];
  
  // Dynamically change tags based on the rating
  const currentTags = rating >= 4 ? positiveTags : negativeTags;

  const tipOptions = [10, 20, 50];

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    await new Promise((resolve) => setTimeout(resolve, 1200));
    
    console.log("Submission Data:", {
      rating,
      tags: selectedTags,
      tip: selectedTip,
      comment,
      partnerId: deliveryBoy?._id
    });

    setIsSubmitting(false);
    setIsSuccess(true);
    
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const formattedTime = new Date(deliveryTime).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Blur Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isSubmitting ? onClose : undefined}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 && !isSubmitting) onClose();
            }}
            className="fixed bottom-0 left-0 w-full bg-white rounded-t-[2rem] z-[101] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
          >
            {/* Drag Handle */}
            <div className="w-full flex justify-center pt-3 pb-1 bg-white absolute top-0 z-20 rounded-t-[2rem]">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
            </div>

            {/* Header / Success Graphic */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 pt-10 pb-6 px-6 flex flex-col items-center justify-center relative shadow-sm">
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="absolute top-5 right-5 w-8 h-8 bg-black/10 rounded-full flex items-center justify-center text-white hover:bg-black/20 transition-colors disabled:opacity-50"
              >
                <FiX size={18} />
              </button>
              
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-3 relative"
              >
                <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-30" />
                <FiCheckCircle size={36} className="text-emerald-500 relative z-10" />
              </motion.div>
              
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">Delivered Successfully</h2>
              
              <div className="flex items-center gap-2 mt-2 bg-black/10 px-3 py-1 rounded-full text-white/90 text-xs sm:text-sm font-medium backdrop-blur-md border border-white/20">
                <FiClock size={14} />
                <span>Dropped off at {formattedTime}</span>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 sm:p-6 flex-1 overflow-y-auto no-scrollbar pb-24">
              
              {/* Partner Info Card */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center gap-4 mb-6 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden shrink-0">
                  {deliveryBoy?.profilePic ? (
                    <img src={deliveryBoy.profilePic} alt="Partner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-lg">
                      {deliveryBoy?.fullName?.charAt(0) || "D"}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Delivery Partner</p>
                  <h3 className="font-bold text-slate-800 text-base capitalize truncate">
                    {deliveryBoy?.fullName || "Your Rider"}
                  </h3>
                </div>
              </div>

              {/* Rating Stars */}
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  How was your delivery experience?
                </h3>
                <div className="flex justify-center gap-2 sm:gap-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => {
                        setRating(star);
                        setSelectedTags([]); 
                      }}
                      className="cursor-pointer"
                    >
                      <FaStar
                        size={38}
                        className={`transition-colors duration-200 ${
                          star <= (hoverRating || rating)
                            ? "text-yellow-400 drop-shadow-md"
                            : "text-slate-200"
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Conditional Feedback Section */}
              <AnimatePresence>
                {rating > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6 border-t border-slate-100 pt-6"
                  >
                    {/* Tags */}
                    <div>
                      <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        {rating >= 4 ? "What went well?" : "What went wrong?"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {currentTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => handleTagToggle(tag)}
                            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                              selectedTags.includes(tag)
                                ? rating >= 4 
                                  ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm"
                                  : "bg-red-50 border-red-500 text-red-700 shadow-sm"
                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Detailed Comment Input */}
                    <div>
                      <div className="relative">
                        <FiMessageSquare className="absolute top-3 left-3 text-slate-400" />
                        <textarea
                          placeholder="Leave specific feedback (optional)"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-700 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-none h-20"
                        />
                      </div>
                    </div>

                    {/* Tipping Section (Only if rating is good) */}
                    {rating >= 4 && (
                      <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-100">
                        <div className="flex items-center gap-2 mb-3">
                          <FiHeart className="text-orange-500" />
                          <p className="text-sm font-bold text-slate-800">Say thanks with a tip</p>
                        </div>
                        <p className="text-xs text-slate-500 mb-3">
                          100% of the tip goes directly to the partner.
                        </p>
                        <div className="flex gap-2 sm:gap-3">
                          {tipOptions.map((amount) => (
                            <button
                              key={amount}
                              onClick={() => setSelectedTip(selectedTip === amount ? 0 : amount)}
                              className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all border ${
                                selectedTip === amount
                                  ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-200"
                                  : "bg-white border-orange-200 text-orange-600 hover:bg-orange-50"
                              }`}
                            >
                              ₹{amount}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sticky Bottom Footer */}
            <div className="absolute bottom-0 left-0 w-full p-4 sm:p-5 bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
              {isSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full py-3.5 rounded-xl bg-green-500 text-white font-bold text-base flex items-center justify-center gap-2"
                >
                  <FiCheckCircle size={20} />
                  Feedback Submitted!
                </motion.div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-6 py-3.5 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    Skip
                  </button>
                  <motion.button
                    whileTap={rating > 0 && !isSubmitting ? { scale: 0.97 } : {}}
                    onClick={handleSubmit}
                    disabled={rating === 0 || isSubmitting}
                    className={`flex-1 py-3.5 rounded-xl font-bold text-base sm:text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${
                      rating > 0
                        ? "bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/30"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Feedback"
                    )}
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OrderDeliveredPopup;