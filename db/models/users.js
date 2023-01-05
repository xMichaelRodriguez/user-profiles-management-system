/* eslint-disable @typescript-eslint/no-unused-vars */
'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(_models) {
      // define association here
    }
  }
  Users.init(
    {
      username: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      isRegisteredWithGoogle: DataTypes.BOOLEAN,
      active: DataTypes.BOOLEAN,
      activationToken: DataTypes.BOOLEAN,
      reserPasswordToken: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Users',
    },
  );
  return Users;
};
