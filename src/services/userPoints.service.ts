import { getActiveUserPoints, updateUserPointAmount } from "../repositories/userPoints.repositori";
import AppError from "../errors/AppError";

export const consumeUserPoints = async (userId: number, pointsToUse: number): Promise<void> => {
    const activePoints = await getActiveUserPoints(userId);
  
    const totalAvailable = activePoints.reduce((sum, p) => sum + p.amount, 0);
    if (pointsToUse > totalAvailable) {
      throw new AppError("Not enough points", 400);
    }
  
    let remaining = pointsToUse;
  
    for (const point of activePoints) {
      if (remaining <= 0) break;
  
      if (point.amount >= remaining) {
        await updateUserPointAmount(point.id, point.amount - remaining);
        remaining = 0;
      } else {
        await updateUserPointAmount(point.id, 0);
        remaining -= point.amount;
      }
    }
  };