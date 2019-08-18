const bootstrap = require('./bootstrap-migrate');
let pos = 0;

class DbStore {
  async load(fn = () => {}) {
    try {
      const db = await bootstrap();
      const data = await db
        .collection('migrations')
        .aggregate([
          {
            $group: {
              _id: null,
              migrations: {
                $addToSet: {
                  title: '$title',
                  description: '$description',
                  timestamp: '$timestamp',
                  down: '$down',
                },
              },
            },
          },
        ])
        .toArray();

      if (!data.length) {
        fn(null, {});
        return Promise.resolve({});
      }

      const store = { migrations: data[0].migrations, lastRun: '' };

      if (
        !Object.prototype.hasOwnProperty.call(store, 'lastRun') ||
        !Object.prototype.hasOwnProperty.call(store, 'migrations')
      ) {
        return fn(new Error('Invalid store file'));
      }

      fn(null, store);
      return Promise.resolve(store);
    } catch (e) {
      fn(e);
      return Promise.reject(e);
    }
  }

  async remove(query) {
    const db = await bootstrap();
    const collection = db.collection('migrations');
    return collection.removeOne(query);
  }

  async save(set, fn) {
    try {
      const db = await bootstrap();
      const collection = db.collection('migrations');


      await collection.deleteMany();
      const objectsToInsert = [];
      set.migrations.forEach(mutations => {
        if (!mutations.timestamp) return;
        objectsToInsert.push({
          ...mutations,
          down: mutations.down.toString(),
          lastRun: set.lastRun,
        });
      });
      const result = await collection.insertMany(objectsToInsert);
      return fn(null, result);
    } catch (e) {
      fn(e);
    }
  }
}

module.exports = DbStore;
