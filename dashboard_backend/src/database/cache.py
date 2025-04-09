from redis import ConnectionPool
from redis.asyncio import Redis


redis_pool = ConnectionPool(host='localhost', port=6379, db=0, decode_responses=True)