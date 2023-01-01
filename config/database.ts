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
    dialect: 'sqlite',
    storage: './db.development.sqlite',
    models: models,
  },
};
