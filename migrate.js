const migrate = require('migrate');

const stateStore = new (require('./db-migrate-store.js'))();
const bootstrap = require('./bootstrap-migrate');

const update = async () => {
  migrate.load({ stateStore }, async (err, set) => {
    const branchMigrations = set.migrations;
    const dbMigrations = (await stateStore.load()).migrations;

    let lastSuccessMigration = branchMigrations.length ? branchMigrations[branchMigrations.length - 1].title : null;
    for (let i = 0; i < branchMigrations.length; i++) {
      const branchMigration = branchMigrations[i];
      if (!branchMigration.timestamp) {
        lastSuccessMigration = i ? branchMigrations[i - 1].title : null;
        break;
      }
    }

    for (let i = 0; i < dbMigrations.length; i++) {
      const dbMigration = dbMigrations[i];
      if (dbMigration.title === lastSuccessMigration) {
        break;
      }
      await eval(`(${dbMigration.down})()`);
      await stateStore.remove({ title: dbMigration.title });
    }

    set.up(() => {
      console.log('success');
    });
  });
};

update();
