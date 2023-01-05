/* eslint-disable @typescript-eslint/no-unused-vars */
'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class files extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(_models) {
      // define association here
    }
  }
  files.init(
    {
      userId: DataTypes.STRING,
      public_id: DataTypes.STRING,
      secure_url: DataTypes.STRING,
      title: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'files',
    },
  );
  return files;
};
