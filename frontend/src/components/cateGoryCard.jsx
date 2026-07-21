import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const cardEntranceVariants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 140,
      damping: 18,
    },
  },
};

const CateGoryCard = ({ data }) => {
  const ref = useRef(null);

  // Detect card scroll position
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Swiggy style image slide/parallax
  const imageY = useTransform(scrollYProgress, [0, 1], [20, -20]);

  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.08, 1]);

  return (
    <motion.div
      ref={ref}
      variants={cardEntranceVariants}
      whileHover={{
        scale: 1.04,
        y: -6,
      }}
      whileTap={{ scale: 0.97 }}
      className="w-[130px] h-[130px] sm:w-[160px] sm:h-[160px] md:w-[170px] md:h-[170px] rounded-[26px] border border-orange-100/70 bg-white overflow-hidden relative group/card cursor-pointer flex-shrink-0 shadow-[0_10px_30px_-15px_rgba(255,77,45,0.08)] hover:shadow-[0_28px_55px_-14px_rgba(255,77,45,0.22)] transition-all duration-500"
    >
      {/* Image */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.img
          src={data?.image}
          alt={data?.category}
          style={{
            y: imageY,
            scale: imageScale,
          }}
          className="w-full h-[115%] object-cover will-change-transform"
          transition={{
            type: "spring",
            stiffness: 120,
          }}
        />

        {/* Premium overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent opacity-60 group-hover/card:opacity-30 transition-all duration-500" />
      </div>

      {/* Floating label */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="absolute bottom-3 left-3 right-3"
      >
        <div className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl px-3 py-2.5 shadow-[0_10px_25px_rgba(0,0,0,0.08)] group-hover/card:bg-white transition-all duration-300">
          <p className="text-[11px] sm:text-xs font-black tracking-wide text-center text-gray-900 group-hover/card:text-[#ff4d2d] transition-colors duration-300 truncate">
            {data?.category}
          </p>
        </div>
      </motion.div>

      {/* Shine effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-[120%] h-full w-[70%] rotate-12 bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover/card:left-[140%] transition-all duration-1000" />
      </div>
    </motion.div>
  );
};

export default CateGoryCard;
