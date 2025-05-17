import aiosqlite
import logging

logger = logging.getLogger(__name__)

async def init_telegram_db():
    """Инициализация SQLite базы"""
    async with aiosqlite.connect("telegram_users.db") as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS telegram_users (
                unique_id TEXT PRIMARY KEY,
                chat_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL
            )
        """)
        await db.commit()
        logger.info("Telegram users database initialized")

async def save_telegram_user(unique_id: str, chat_id: int, user_id: int):
    """Сохранение Telegram пользователя"""
    async with aiosqlite.connect("telegram_users.db") as db:
        await db.execute(
            "INSERT OR REPLACE INTO telegram_users (unique_id, chat_id, user_id) VALUES (?, ?, ?)",
            (unique_id, chat_id, user_id)
        )
        await db.commit()
        logger.debug(f"Saved Telegram user: unique_id={unique_id}, chat_id={chat_id}, user_id={user_id}")

async def get_chat_id_by_unique_id(unique_id: str) -> int | None:
    """Получение chat_id по unique_id"""
    async with aiosqlite.connect("telegram_users.db") as db:
        cursor = await db.execute("SELECT chat_id FROM telegram_users WHERE unique_id = ?", (unique_id,))
        result = await cursor.fetchone()
        return result[0] if result else None