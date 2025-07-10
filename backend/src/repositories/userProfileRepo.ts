import {
  UserProfile,
  UserProfileCreationAttributes,
} from "@models/userProfile";
import { User } from "@models/user";
import { AppError } from "@utils/error";

class UserProfileRepo {
  async create(
    profileData: UserProfileCreationAttributes
  ): Promise<UserProfile> {
    const user = await User.findByPk(profileData.userId);
    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }
    return UserProfile.create(profileData);
  }

  async findById(profileId: number): Promise<UserProfile | null> {
    return UserProfile.findByPk(profileId);
  }

  async findByUserId(userId: number): Promise<UserProfile[]> {
    return UserProfile.findAll({ where: { userId } });
  }

  async update(
    profileId: number,
    profileData: Partial<UserProfileCreationAttributes>
  ): Promise<[number, UserProfile[]]> {
    const result = await UserProfile.update(profileData, {
      where: { id: profileId },
      returning: true,
    });
    return result;
  }

  async delete(profileId: number): Promise<number> {
    return UserProfile.destroy({ where: { id: profileId } });
  }
}

export const userProfileRepo = new UserProfileRepo();
