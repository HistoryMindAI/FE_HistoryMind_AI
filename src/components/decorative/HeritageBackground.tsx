import { motion } from 'framer-motion';
import trongDong from '@/assets/trong-dong.png';
import chimHacRight from '@/assets/chim-hac.png';
import chimHacLeft from '@/assets/chim-hac-left.png';

export function HeritageBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Trống đồng - centered, rotating */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.img
          src={trongDong}
          alt="Trống đồng Đông Sơn"
          className="w-[380px] h-[380px] md:w-[480px] md:h-[480px] object-contain [filter:drop-shadow(0_0_20px_rgba(180,140,60,0.3))] dark:opacity-[0.45] dark:[filter:brightness(2.5)_sepia(1)_saturate(4)_hue-rotate(0deg)_drop-shadow(0_0_50px_rgba(255,200,50,0.8))_drop-shadow(0_0_80px_rgba(255,180,50,0.5))]"
          style={{ opacity: 0.18 }}
          animate={{ 
            rotate: 360 
          }}
          transition={{ 
            rotate: { duration: 120, repeat: Infinity, ease: 'linear' }
          }}
        />
      </div>

      {/* Chim hạc 1 - bay từ trái sang phải (trên) */}
      <motion.img
        src={chimHacRight}
        alt="Chim hạc"
        className="absolute w-24 h-auto md:w-28 [filter:drop-shadow(0_0_8px_rgba(180,140,60,0.4))] dark:[filter:brightness(2.5)_sepia(1)_saturate(4)_hue-rotate(0deg)_drop-shadow(0_0_15px_rgba(255,200,50,0.9))_drop-shadow(0_0_30px_rgba(255,180,50,0.6))]"
        style={{ left: '-15%', top: '10%' }}
        animate={{ 
          x: ['0vw', '130vw'],
          y: ['0vh', '8vh', '2vh', '0vh'],
          scale: [1, 1, 1, 1],
          opacity: [0, 0.7, 0.7, 0],
        }}
        transition={{ 
          duration: 28,
          repeat: Infinity,
          ease: 'linear',
          times: [0, 0.15, 0.85, 1],
        }}
      />

      {/* Chim hạc 2 - bay từ phải sang trái (giữa) */}
      <motion.img
        src={chimHacLeft}
        alt="Chim hạc"
        className="absolute w-24 h-auto md:w-28 [filter:drop-shadow(0_0_8px_rgba(180,140,60,0.4))] dark:[filter:brightness(2.5)_sepia(1)_saturate(4)_hue-rotate(0deg)_drop-shadow(0_0_15px_rgba(255,200,50,0.9))_drop-shadow(0_0_30px_rgba(255,180,50,0.6))]"
        style={{ right: '-15%', top: '42%' }}
        animate={{ 
          x: ['0vw', '-130vw'],
          y: ['0vh', '-5vh', '4vh', '0vh'],
          scale: [1, 1, 1, 1],
          opacity: [0, 0.68, 0.68, 0],
        }}
        transition={{ 
          duration: 32,
          repeat: Infinity,
          ease: 'linear',
          delay: 3,
          times: [0, 0.15, 0.85, 1],
        }}
      />

      {/* Chim hạc 3 - bay từ trái sang phải (dưới) */}
      <motion.img
        src={chimHacRight}
        alt="Chim hạc"
        className="absolute w-24 h-auto md:w-28 [filter:drop-shadow(0_0_8px_rgba(180,140,60,0.4))] dark:[filter:brightness(2.5)_sepia(1)_saturate(4)_hue-rotate(0deg)_drop-shadow(0_0_15px_rgba(255,200,50,0.9))_drop-shadow(0_0_30px_rgba(255,180,50,0.6))]"
        style={{ left: '-12%', top: '70%' }}
        animate={{ 
          x: ['0vw', '125vw'],
          y: ['0vh', '-6vh', '3vh', '0vh'],
          scale: [1, 1, 1, 1],
          opacity: [0, 0.65, 0.65, 0],
        }}
        transition={{ 
          duration: 35,
          repeat: Infinity,
          ease: 'linear',
          delay: 8,
          times: [0, 0.15, 0.85, 1],
        }}
      />

      {/* Chim hạc 4 - bay từ phải sang trái (trên) */}
      <motion.img
        src={chimHacLeft}
        alt="Chim hạc"
        className="absolute w-24 h-auto md:w-28 [filter:drop-shadow(0_0_8px_rgba(180,140,60,0.4))] dark:[filter:brightness(2.5)_sepia(1)_saturate(4)_hue-rotate(0deg)_drop-shadow(0_0_15px_rgba(255,200,50,0.9))_drop-shadow(0_0_30px_rgba(255,180,50,0.6))]"
        style={{ right: '-12%', top: '18%' }}
        animate={{ 
          x: ['0vw', '-125vw'],
          y: ['0vh', '6vh', '2vh', '0vh'],
          scale: [1, 1, 1, 1],
          opacity: [0, 0.7, 0.7, 0],
        }}
        transition={{ 
          duration: 30,
          repeat: Infinity,
          ease: 'linear',
          delay: 12,
          times: [0, 0.15, 0.85, 1],
        }}
      />

      {/* Chim hạc 5 - bay từ trái sang phải (giữa trên) */}
      <motion.img
        src={chimHacRight}
        alt="Chim hạc"
        className="absolute w-24 h-auto md:w-28 [filter:drop-shadow(0_0_8px_rgba(180,140,60,0.4))] dark:[filter:brightness(2.5)_sepia(1)_saturate(4)_hue-rotate(0deg)_drop-shadow(0_0_15px_rgba(255,200,50,0.9))_drop-shadow(0_0_30px_rgba(255,180,50,0.6))]"
        style={{ left: '-14%', top: '32%' }}
        animate={{ 
          x: ['0vw', '128vw'],
          y: ['0vh', '-4vh', '5vh', '0vh'],
          scale: [1, 1, 1, 1],
          opacity: [0, 0.72, 0.72, 0],
        }}
        transition={{ 
          duration: 33,
          repeat: Infinity,
          ease: 'linear',
          delay: 6,
          times: [0, 0.15, 0.85, 1],
        }}
      />

      {/* Chim hạc 6 - bay từ phải sang trái (dưới) */}
      <motion.img
        src={chimHacLeft}
        alt="Chim hạc"
        className="absolute w-24 h-auto md:w-28 [filter:drop-shadow(0_0_8px_rgba(180,140,60,0.4))] dark:[filter:brightness(2.5)_sepia(1)_saturate(4)_hue-rotate(0deg)_drop-shadow(0_0_15px_rgba(255,200,50,0.9))_drop-shadow(0_0_30px_rgba(255,180,50,0.6))]"
        style={{ right: '-12%', top: '60%' }}
        animate={{ 
          x: ['0vw', '-125vw'],
          y: ['0vh', '-5vh', '4vh', '0vh'],
          scale: [1, 1, 1, 1],
          opacity: [0, 0.68, 0.68, 0],
        }}
        transition={{ 
          duration: 29,
          repeat: Infinity,
          ease: 'linear',
          delay: 16,
          times: [0, 0.15, 0.85, 1],
        }}
      />

      {/* Chim hạc 7 - bay từ trái sang phải (cao) */}
      <motion.img
        src={chimHacRight}
        alt="Chim hạc"
        className="absolute w-24 h-auto md:w-28 [filter:drop-shadow(0_0_8px_rgba(180,140,60,0.4))] dark:[filter:brightness(2.5)_sepia(1)_saturate(4)_hue-rotate(0deg)_drop-shadow(0_0_15px_rgba(255,200,50,0.9))_drop-shadow(0_0_30px_rgba(255,180,50,0.6))]"
        style={{ left: '-10%', top: '5%' }}
        animate={{ 
          x: ['0vw', '120vw'],
          y: ['0vh', '5vh', '1vh', '0vh'],
          scale: [1, 1, 1, 1],
          opacity: [0, 0.65, 0.65, 0],
        }}
        transition={{ 
          duration: 26,
          repeat: Infinity,
          ease: 'linear',
          delay: 18,
          times: [0, 0.15, 0.85, 1],
        }}
      />

      {/* Chim hạc 8 - bay từ phải sang trái (thấp) */}
      <motion.img
        src={chimHacLeft}
        alt="Chim hạc"
        className="absolute w-24 h-auto md:w-28 [filter:drop-shadow(0_0_8px_rgba(180,140,60,0.4))] dark:[filter:brightness(2.5)_sepia(1)_saturate(4)_hue-rotate(0deg)_drop-shadow(0_0_15px_rgba(255,200,50,0.9))_drop-shadow(0_0_30px_rgba(255,180,50,0.6))]"
        style={{ right: '-10%', top: '80%' }}
        animate={{ 
          x: ['0vw', '-120vw'],
          y: ['0vh', '-4vh', '2vh', '0vh'],
          scale: [1, 1, 1, 1],
          opacity: [0, 0.7, 0.7, 0],
        }}
        transition={{ 
          duration: 34,
          repeat: Infinity,
          ease: 'linear',
          delay: 5,
          times: [0, 0.15, 0.85, 1],
        }}
      />

      {/* Chim hạc 9 - bay từ trái sang phải (giữa dưới) */}
      <motion.img
        src={chimHacRight}
        alt="Chim hạc"
        className="absolute w-24 h-auto md:w-28 [filter:drop-shadow(0_0_8px_rgba(180,140,60,0.4))] dark:[filter:brightness(2.5)_sepia(1)_saturate(4)_hue-rotate(0deg)_drop-shadow(0_0_15px_rgba(255,200,50,0.9))_drop-shadow(0_0_30px_rgba(255,180,50,0.6))]"
        style={{ left: '-14%', top: '52%' }}
        animate={{ 
          x: ['0vw', '128vw'],
          y: ['0vh', '-6vh', '4vh', '0vh'],
          scale: [1, 1, 1, 1],
          opacity: [0, 0.68, 0.68, 0],
        }}
        transition={{ 
          duration: 31,
          repeat: Infinity,
          ease: 'linear',
          delay: 10,
          times: [0, 0.15, 0.85, 1],
        }}
      />

      {/* Chim hạc 10 - bay từ phải sang trái (giữa cao) */}
      <motion.img
        src={chimHacLeft}
        alt="Chim hạc"
        className="absolute w-24 h-auto md:w-28 [filter:drop-shadow(0_0_8px_rgba(180,140,60,0.4))] dark:[filter:brightness(2.5)_sepia(1)_saturate(4)_hue-rotate(0deg)_drop-shadow(0_0_15px_rgba(255,200,50,0.9))_drop-shadow(0_0_30px_rgba(255,180,50,0.6))]"
        style={{ right: '-14%', top: '28%' }}
        animate={{ 
          x: ['0vw', '-128vw'],
          y: ['0vh', '5vh', '-3vh', '0vh'],
          scale: [1, 1, 1, 1],
          opacity: [0, 0.72, 0.72, 0],
        }}
        transition={{ 
          duration: 27,
          repeat: Infinity,
          ease: 'linear',
          delay: 14,
          times: [0, 0.15, 0.85, 1],
        }}
      />

      {/* Chim hạc 11 - bay từ trái sang phải (thấp nhất) */}
      <motion.img
        src={chimHacRight}
        alt="Chim hạc"
        className="absolute w-24 h-auto md:w-28 [filter:drop-shadow(0_0_8px_rgba(180,140,60,0.4))] dark:[filter:brightness(2.5)_sepia(1)_saturate(4)_hue-rotate(0deg)_drop-shadow(0_0_15px_rgba(255,200,50,0.9))_drop-shadow(0_0_30px_rgba(255,180,50,0.6))]"
        style={{ left: '-12%', top: '88%' }}
        animate={{ 
          x: ['0vw', '124vw'],
          y: ['0vh', '-5vh', '2vh', '0vh'],
          scale: [1, 1, 1, 1],
          opacity: [0, 0.65, 0.65, 0],
        }}
        transition={{ 
          duration: 36,
          repeat: Infinity,
          ease: 'linear',
          delay: 22,
          times: [0, 0.15, 0.85, 1],
        }}
      />

      {/* Chim hạc 12 - bay từ phải sang trái (cao nhất) */}
      <motion.img
        src={chimHacLeft}
        alt="Chim hạc"
        className="absolute w-24 h-auto md:w-28 [filter:drop-shadow(0_0_8px_rgba(180,140,60,0.4))] dark:[filter:brightness(2.5)_sepia(1)_saturate(4)_hue-rotate(0deg)_drop-shadow(0_0_15px_rgba(255,200,50,0.9))_drop-shadow(0_0_30px_rgba(255,180,50,0.6))]"
        style={{ right: '-10%', top: '2%' }}
        animate={{ 
          x: ['0vw', '-122vw'],
          y: ['0vh', '4vh', '1vh', '0vh'],
          scale: [1, 1, 1, 1],
          opacity: [0, 0.7, 0.7, 0],
        }}
        transition={{ 
          duration: 25,
          repeat: Infinity,
          ease: 'linear',
          delay: 20,
          times: [0, 0.15, 0.85, 1],
        }}
      />
    </div>
  );
}
