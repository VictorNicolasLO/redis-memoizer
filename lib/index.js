const redis = require('redis');
const myRedisAsync = require('./my-redis-async');
class RedisMemo {
  constructor(redisConnection, microserviceName) {
    this.redisClient = redis.createClient(redisConnection);
    this.redisClientAsync = myRedisAsync(this.redisClient);
    this.microserviceName = microserviceName;
  }

  getRedisClient() {
    return this.redisClient;
  }

  memo(fn, options = {}) {
    const { duration, name, createId } = options;
    return async (...args) => {
      const id = createId ? JSON.stringify(createId.apply(this, args)) : '';
      const completeId = `${this.microserviceName}/${name}-${id}`;
      const redisResult = await this.redisClientAsync.getAsync(completeId);
      if (redisResult) return JSON.parse(redisResult);
      const functionResult = await fn.apply(this, args);
      if (duration)
        this.redisClient.set(
          completeId,
          JSON.stringify(functionResult),
          'EX',
          duration,
        );
      else this.redisClient.set(completeId, JSON.stringify(functionResult));
      return functionResult;
    };
  }

  forget(fn, options = {}) {
    const { name, createId } = options;
    return async (...args) => {
      const id = createId ? JSON.stringify(createId.apply(this, args)) : '*';
      const completeId = `${this.microserviceName}/${name}-${id}`;
      console.log(completeId);
      if (createId) this.redisClient.del(completeId);
      else
        this.redisClient.keys(completeId, (err, keys) => {
          keys.forEach((key, pos) => {
            this.redisClient.del(key);
          });
        });
      return await fn.apply(this, args);
    };
  }

  createObjectMemoizer(description) {
    return (obj) => {
      return this.fromObject(obj, description);
    };
  }

  fromObject(obj, description) {
    const newObj = {};
    Object.keys(obj).forEach((key) => {
      const fn = obj[key];
      const options = description[key];

      if (!options) {
        newObj[key] = fn;
        return;
      }
      if (options.length) {
        newObj[key] = fn;
        options.forEach((opt) => {
          if (!opt.name) opt.name = key;
          if (opt.action === 'memo') {
            newObj[key] = this.memo(newObj[key], opt);
            return;
          }
          if (opt.action === 'forget') {
            newObj[key] = this.forget(newObj[key], opt);
          }
        });
      } else {
        if (!options.name) options.name = key;
        if (options.action === 'memo') {
          newObj[key] = this.memo(fn, options);
          return;
        }
        if (options.action === 'forget') {
          newObj[key] = this.forget(fn, options);
        }
      }
    });
    return newObj;
  }
}

module.exports = { RedisMemo };
