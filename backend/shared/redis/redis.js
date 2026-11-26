import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL, {
  lazyConnect: true,
});

redis.on("connect", () => {
  console.log("redis connected")
})

redis.on("error", (error) => {
  console.error(`Redis connection error: ${error.message}`);
}); 

export default redis;
