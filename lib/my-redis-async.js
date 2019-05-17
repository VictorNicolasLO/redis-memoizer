module.exports = (redisClient) => {
  return {
    getAsync: (key) =>
      new Promise((resolve, reject) => {
        redisClient.get(key, function(err, reply) {
          if (!err) resolve(reply);
          else reject(err);
        });
      }),
  };
};
