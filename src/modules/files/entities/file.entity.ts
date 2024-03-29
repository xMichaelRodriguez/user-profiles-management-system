import { DataTypes } from 'sequelize';
import {
  Table,
  BelongsTo,
  Column,
  Model,
  ForeignKey,
  IsUUID,
  PrimaryKey,
} from 'sequelize-typescript';
import User from 'src/modules/auth/entities/auth.entity';

@Table
export default class FileEntity extends Model {
  @IsUUID(4)
  @PrimaryKey
  @Column({
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  })
  id: string;

  @ForeignKey(() => User)
  @Column({
    field: 'user_id',
  })
  userId: string;

  @Column({ field: 'public_id ' })
  public_id: string;

  @Column({ field: 'secure_url' })
  secure_url: string;

  @Column
  title: string;

  @BelongsTo(() => User)
  user: User;
}
