import glob from 'glob';
const modelPaths = glob.sync('dist/**/*.entity.js');

const models = modelPaths.map(async (modelPath) => {
  const model = await import(modelPath);
  return {
    model: model.name,
    path: modelPath,
  };
});

module.exports = {
  development: {
    models,
    storage: 'db.development.sqlite',
    username: 'postgres',
    password: null,
    database: 'database_development',
    host: '127.0.0.1',
    dialect: 'postgres',
    migrationStorage: 'sequelize',
    migrationStorageTableName: 'seeds',
  },
  test: {
    models,
    username: 'postgres',
    password: null,
    database: 'database_test',
    host: '127.0.0.1',
    dialect: 'postgres',
  },
  production: {
    models,
    username: 'postgres',
    password: null,
    database: 'database_production',
    host: '127.0.0.1',
    dialect: 'postgres',
  },
};
