import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL, {
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
  commandTimeout: 30000,
});

redis.on("ready", () => {
  console.log("redis ready");
});

redis.on("error", (error) => {
  console.error(`Redis connection error: ${error.message}`);
});

export const waitForRedisReady = (timeoutMs = 30000) => {
  if (redis.status === "ready") {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    let timer;
    const handleReady = () => {
      clearTimeout(timer);
      resolve();
    };
    const handleTimeout = () => {
      redis.removeListener("ready", handleReady);
      reject(new Error(`Redis was not ready within ${timeoutMs}ms`));
    };

    timer = setTimeout(handleTimeout, timeoutMs);
    redis.once("ready", handleReady);
  });
};

export default redis;
