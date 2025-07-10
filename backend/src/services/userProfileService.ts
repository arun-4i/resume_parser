import {
  UserProfile,
  UserProfileCreationAttributes,
} from "@models/userProfile";

import { AppError } from "@utils/error";
import { userProfileRepo } from "repositories/userProfileRepo";

class UserProfileService {
  async createProfile(
    profileData: UserProfileCreationAttributes
  ): Promise<UserProfile> {
    return userProfileRepo.create(profileData);
  }

  async getProfileById(profileId: number): Promise<UserProfile> {
    const profile = await userProfileRepo.findById(profileId);
    if (!profile) {
      throw new AppError("Profile not found", 404, "USER_PROFILE_NOT_FOUND");
    }
    return profile;
  }

  async getProfilesByUserId(userId: number): Promise<UserProfile[]> {
    return userProfileRepo.findByUserId(userId);
  }

  async updateProfile(
    profileId: number,
    profileData: Partial<UserProfileCreationAttributes>
  ): Promise<UserProfile> {
    const [affectedCount, updatedProfiles] = await userProfileRepo.update(
      profileId,
      profileData
    );
    if (affectedCount === 0) {
      throw new AppError("Profile not found", 404, "USER_PROFILE_NOT_FOUND");
    }
    return updatedProfiles[0];
  }

  async deleteProfile(profileId: number): Promise<void> {
    const affectedCount = await userProfileRepo.delete(profileId);
    if (affectedCount === 0) {
      throw new AppError("Profile not found", 404, "USER_PROFILE_NOT_FOUND");
    }
  }
}

export const userProfileService = new UserProfileService();
