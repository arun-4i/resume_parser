import { Request, Response, NextFunction } from "express";
import { userProfileService } from "@services/userProfileService";
import {
  createUserProfileSchema,
  updateUserProfileSchema,
} from "@validators/userProfileValidator";
import { logger } from "@utils/logger";
import { asyncHandler } from "@utils/error";

class UserProfileController {
  public createProfile = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createUserProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.flatten() });
      return;
    }
    const profile = await userProfileService.createProfile(parsed.data);
    res.status(201).json({ success: true, data: profile });
  });

  public getProfileById = asyncHandler(async (req: Request, res: Response) => {
    const profileId = parseInt(req.params.id, 10);
    const profile = await userProfileService.getProfileById(profileId);
    res.json({ success: true, data: profile });
  });

  public getProfilesByUserId = asyncHandler(
    async (req: Request, res: Response) => {
      const userId = parseInt(req.params.userId, 10);
      const profiles = await userProfileService.getProfilesByUserId(userId);
      res.json({ success: true, data: profiles });
    }
  );

  public updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const profileId = parseInt(req.params.id, 10);
    const parsed = updateUserProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: parsed.error.flatten() });
      return;
    }
    const profile = await userProfileService.updateProfile(
      profileId,
      parsed.data
    );
    res.json({ success: true, data: profile });
  });

  public deleteProfile = asyncHandler(async (req: Request, res: Response) => {
    const profileId = parseInt(req.params.id, 10);
    await userProfileService.deleteProfile(profileId);
    res.status(204).send();
  });
}

export const userProfileController = new UserProfileController();
