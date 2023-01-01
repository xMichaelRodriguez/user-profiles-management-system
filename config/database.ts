const glob = require('glob');

const modelPaths = glob.sync('dist/**/*.entity.js');

const models = modelPaths.map((modelPath) => {
  const model = require(modelPath);
  return {
    model: model.name,
    path: modelPath,
  };
});

module.exports = {
  development: {
    dialect: 'sqlite',

    storage: './db.development.sqlite',

    models: models,
  },
};
