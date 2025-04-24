
import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { Gift, CakeSlice } from 'lucide-react';
import { useWindowSize } from '@/hooks/use-window-size';
import { useToast } from '@/hooks/use-toast';

const BirthdayAnimation = () => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [showAnimation, setShowAnimation] = useState(true);
  const { width, height } = useWindowSize();
  const { toast } = useToast();

  useEffect(() => {
    const today = new Date();
    const isBirthday = today.getDate() === 10 && today.getMonth() === 4; // May is 4 (0-based)

    if (isBirthday) {
      // Show birthday toast
      toast({
        title: "🎉 Happy Birthday!",
        description: "Wishing you a fantastic day filled with joy and success! 🎂",
        duration: 5000,
      });

      // Stop confetti and animation after 5 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
        setShowAnimation(false);
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      // If not birthday, don't show animation at all
      setShowConfetti(false);
      setShowAnimation(false);
    }
  }, [toast]);

  // If not showing animation, return null
  if (!showAnimation) return null;

  return (
    <>
      {showConfetti && <Confetti width={width} height={height} recycle={true} numberOfPieces={200} />}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce">
        <div className="flex items-center gap-4">
          <Gift className="h-12 w-12 text-primary animate-pulse" />
          <CakeSlice className="h-12 w-12 text-primary animate-pulse" />
        </div>
      </div>
    </>
  );
};

export default BirthdayAnimation;
