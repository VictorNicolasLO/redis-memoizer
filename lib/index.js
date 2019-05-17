const redis = require('redis');
const myRedisAsync = require('./my-redis-async');
class RedisMemo {
  constructor(redisConnection) {
    this.redisClient = redis.createClient(redisConnection);
    this.redisClientAsync = myRedisAsync(this.redisClient);
  }

  memo(fn, options = {}) {
    const { duration, name, createId } = options;
    return async (...args) => {
      const id = JSON.stringify(createId.apply(this, args));
      const completeId = `${name}-${id}`;
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
      const id = JSON.stringify(createId.apply(this, args));

      const completeId = `${name}-${id}`;
      console.log(completeId);
      this.redisClient.del(completeId);
      return await fn.apply(this, args);
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
      if (!options.name) options.name = key;
      if (options.type === 'memo') {
        newObj[key] = this.memo(fn, options);
        return;
      }
      if (options.type === 'forget') {
        newObj[key] = this.forget(fn, options);
      }
    });
    return newObj;
  }
}

module.exports = { RedisMemo };
