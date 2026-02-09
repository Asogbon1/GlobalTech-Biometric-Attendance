import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type User } from "@shared/schema";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProfileMatchAnimationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allUsers: User[];
  matchedUser: User | null;
  action: "SIGN_IN" | "SIGN_OUT";
}

export function ProfileMatchAnimation({ 
  open, 
  onOpenChange, 
  allUsers, 
  matchedUser,
  action 
}: ProfileMatchAnimationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isIterating, setIsIterating] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!open) {
      // Reset state when modal closes
      setCurrentIndex(0);
      setIsIterating(true);
      setShowSuccess(false);
      return;
    }

    if (!matchedUser || allUsers.length === 0) return;

    // Iterate through profiles with increasing speed
    let interval: NodeJS.Timeout;
    let iterations = 0;
    const maxIterations = 15; // Number of profile flips before settling
    const baseDelay = 150; // Starting delay in ms

    const iterate = () => {
      iterations++;
      
      if (iterations >= maxIterations) {
        // Find the matched user and show it
        const matchedIndex = allUsers.findIndex(u => u.id === matchedUser.id);
        if (matchedIndex !== -1) {
          setCurrentIndex(matchedIndex);
        }
        setIsIterating(false);
        
        // Show success state after a brief pause
        setTimeout(() => {
          setShowSuccess(true);
          
          // Auto-close after showing success
          setTimeout(() => {
            onOpenChange(false);
          }, 2500);
        }, 300);
        
        clearInterval(interval);
        return;
      }

      // Pick a random user to show (excluding the matched one initially for suspense)
      let nextIndex;
      if (iterations < maxIterations - 3) {
        // Don't show the matched user yet
        const availableIndices = allUsers
          .map((_, idx) => idx)
          .filter(idx => allUsers[idx].id !== matchedUser.id);
        nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      } else {
        // In the last few iterations, occasionally show the matched user
        nextIndex = Math.floor(Math.random() * allUsers.length);
      }
      
      setCurrentIndex(nextIndex || 0);

      // Increase delay (slow down) as we approach the end
      const speedMultiplier = 1 + (iterations / maxIterations) * 2;
      clearInterval(interval);
      interval = setInterval(iterate, baseDelay * speedMultiplier);
    };

    interval = setInterval(iterate, baseDelay);

    return () => clearInterval(interval);
  }, [open, allUsers, matchedUser, onOpenChange]);

  const currentUser = allUsers[currentIndex];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        {!showSuccess ? (
          <motion.div
            key="iterating"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-6"
          >
            <motion.div
              className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-4 border-primary/30"
              animate={isIterating ? {
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0],
              } : {}}
              transition={{ duration: 0.5, repeat: isIterating ? Infinity : 0 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentUser?.id || 'empty'}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.15 }}
                  className="text-4xl font-bold text-primary"
                >
                  {currentUser?.fullName.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            <div className="space-y-2">
              <AnimatePresence mode="wait">
                <motion.h2
                  key={currentUser?.fullName || 'searching'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="text-2xl font-bold"
                >
                  {isIterating ? currentUser?.fullName : matchedUser?.fullName}
                </motion.h2>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentUser?.category || 'searching'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Badge variant="outline" className="capitalize">
                    {currentUser?.category || 'Searching...'}
                  </Badge>
                </motion.div>
              </AnimatePresence>
            </div>

            <motion.p
              className="text-sm text-muted-foreground"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {isIterating ? "Matching fingerprint..." : "Match found!"}
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center space-y-6"
          >
            <motion.div
              className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center border-4 border-green-500/50 relative overflow-hidden"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 z-10 relative">
                {matchedUser?.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              
              {/* Success checkmark overlay */}
              <motion.div
                className="absolute inset-0 bg-green-500/10 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <CheckCircle2 className="w-16 h-16 text-green-500 absolute" />
              </motion.div>
            </motion.div>

            <div className="space-y-2">
              <motion.h2
                className="text-2xl font-bold text-green-600 dark:text-green-400"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {action === "SIGN_IN" ? "Welcome" : "Goodbye"}, {matchedUser?.fullName}!
              </motion.h2>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Badge 
                  variant="outline" 
                  className="capitalize border-green-500/50 text-green-600 dark:text-green-400"
                >
                  {matchedUser?.category}
                </Badge>
              </motion.div>
            </div>

            <motion.p
              className="text-sm font-medium text-green-600 dark:text-green-400"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {action === "SIGN_IN" ? "Signed In" : "Signed Out"} Successfully
            </motion.p>
            <motion.p
              className="text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {new Date().toLocaleTimeString()}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
