export function useLoyaltyStreak(visitCount: number, target = 5) {
  const completedCycles = Math.floor(visitCount / target);
  const progress = visitCount % target;

  return {
    completedCycles,
    progress,
    remaining: target - progress,
    target,
    isRewardReady: progress === 0 && visitCount > 0
  };
}
