import { User, UserCreationAttributes } from "../models/user";
import { logger } from "../utils/logger";
import { UniqueConstraintError } from "sequelize";
import { UpdateUserInput } from "../validators/userValidator";

export class UserRepository {
  async createUser(userData: UserCreationAttributes): Promise<User> {
    try {
      const user = await User.create(userData);
      logger.info("db", "User created in DB", {
        userId: user.id,
        email: user.email,
      });
      return user;
    } catch (error: any) {
      logger.error("db", "Error creating user in DB", { error });
      if (error instanceof UniqueConstraintError) {
        throw new Error("USER_EMAIL_ALREADY_EXISTS");
      }
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return User.findOne({ where: { email } });
  }

  async getAllUsers(): Promise<User[]> {
    return User.findAll();
  }

  async updateUser(userId: number, updateData: UpdateUserInput): Promise<User> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("USER_NOT_FOUND");
      }

      await user.update(updateData);

      logger.info("db", "User updated in DB", {
        userId,
        updatedFields: Object.keys(updateData),
        timestamp: new Date().toISOString(),
      });

      return user;
    } catch (error: any) {
      logger.error("db", "Error updating user in DB", {
        userId,
        error: error.message,
      });
      throw error;
    }
  }
}
