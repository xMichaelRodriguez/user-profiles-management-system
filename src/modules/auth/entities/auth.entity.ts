import { Exclude } from 'class-transformer';
import { DataTypes } from 'sequelize';
import {
  Column,
  IsEmail,
  IsUUID,
  Model,
  NotEmpty,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';

@Table
export class User extends Model {
  @IsUUID(4)
  @PrimaryKey
  @Column({
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  })
  id: string;

  @Column({
    allowNull: false,
  })
  username: string;

  @IsEmail
  @Unique
  @NotEmpty
  @Column({
    allowNull: false,
  })
  email: string;

  @Exclude()
  @Column({ type: DataTypes.STRING, allowNull: true })
  password?: string;

  @Column({
    defaultValue: false,
    type: DataTypes.BOOLEAN,
    field: 'is_registered_with_google',
    allowNull: false,
  })
  isRegisteredWithGoogle: boolean;

  @Column({ type: DataTypes.BOOLEAN, defaultValue: false })
  active?: boolean;

  @IsUUID(4)
  @Exclude({ toPlainOnly: true })
  @Column({
    type: DataTypes.UUID,
    field: 'activation_token',
    unique: true,
  })
  activationToken: string;

  @IsUUID(4)
  @Exclude()
  @Column({
    type: DataTypes.UUID,
    unique: true,
    field: 'reset_password_token',
    allowNull: true,
  })
  resetPasswordToken: string;
}
