import { Request, Response, NextFunction } from "express";
import { searchUsersService } from "../services/search.service";

export const searchController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = req.query.query as string;

    if (!query) {
      res.status(400).json({ success: false, message: "Missing query parameter." });
      return;
    }

    const results = await searchUsersService(query);

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};
