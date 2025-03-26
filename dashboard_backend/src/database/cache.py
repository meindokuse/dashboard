from redis.asyncio import Redis


async def get_redis() -> Redis:
    redis_client = Redis(host='localhost', port=6379, db=0, decode_responses=True)
    yield redis_client
    await redis_client.close()