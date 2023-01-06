import { Transaction } from 'sequelize';

export class SequelizeMock {
  transaction = (
    callback: (transaction: Transaction) => Promise<void>,
  ): Promise<void> => {
    return callback({} as Transaction);
  };
}
