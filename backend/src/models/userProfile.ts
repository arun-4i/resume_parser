import { DataTypes, Model, Optional } from "sequelize";
import { DatabaseConnection } from "@config/database";
import { User } from "./user";

interface UserProfileAttributes {
  id: number;
  userId: number;
  avatar: string | null;
  bio: string | null;
  phone: string | null;
  dateOfBirth: Date | null;
  address: string | null;
  preferences: object | null;
  socialLinks: object | null;
  isPublic: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserProfileCreationAttributes
  extends Optional<
    UserProfileAttributes,
    | "id"
    | "avatar"
    | "bio"
    | "phone"
    | "dateOfBirth"
    | "address"
    | "preferences"
    | "socialLinks"
    | "isPublic"
  > {}

class UserProfile
  extends Model<UserProfileAttributes, UserProfileCreationAttributes>
  implements UserProfileAttributes
{
  public id!: number;
  public userId!: number;
  public avatar!: string | null;
  public bio!: string | null;
  public phone!: string | null;
  public dateOfBirth!: Date | null;
  public address!: string | null;
  public preferences!: object | null;
  public socialLinks!: object | null;
  public isPublic!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserProfile.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    preferences: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    socialLinks: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize: DatabaseConnection.getInstance(),
    tableName: "user_profiles",
    timestamps: true,
  }
);

export { UserProfile, UserProfileAttributes, UserProfileCreationAttributes };
