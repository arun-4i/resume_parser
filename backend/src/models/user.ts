// src/models/User.ts
import { DataTypes, Model, Optional } from "sequelize";
import { DatabaseConnection } from "@config/database";
import bcrypt from "bcrypt";
import { config } from "@config/env";
import { UserProfile } from "./userProfile";

interface UserAttributes {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes
  extends Optional<UserAttributes, "id" | "isActive"> {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public email!: string;
  public password!: string;
  public firstName!: string;
  public lastName!: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize: DatabaseConnection.getInstance(),
    tableName: "users",
    timestamps: true,
    hooks: {
      beforeCreate: async (user: User) => {
        user.password = await bcrypt.hash(user.password, config.BCRYPT_ROUNDS);
      },
      beforeUpdate: async (user: User) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(
            user.password,
            config.BCRYPT_ROUNDS
          );
        }
      },
    },
  }
);

User.hasMany(UserProfile, {
  sourceKey: "id",
  foreignKey: "userId",
  as: "profiles",
});

UserProfile.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

export { User, UserAttributes, UserCreationAttributes };
