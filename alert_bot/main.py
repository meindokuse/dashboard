import asyncio
import json
import logging
import os
from datetime import datetime

import aiohttp
from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, Message, CallbackQuery
from aiohttp import web
from dotenv import load_dotenv
import aiosqlite

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Загрузка .env
load_dotenv()

# Конфигурация
BOT_TOKEN = '7089214458:AAFZE4128RN0Pj2Sp2DG60B4bWesT2x_KRM'
WEBHOOK_SECRET = os.getenv("WEBHOOK_SECRET")
BACKEND_API = os.getenv("BACKEND_API", "http://localhost:8080")

# Инициализация бота
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

# Состояния FSM
class SubscriptionForm(StatesGroup):
    unique_id = State()

# Инициализация SQLite
async def init_telegram_db():
    async with aiosqlite.connect("telegram_users.db") as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS telegram_users (
                unique_id TEXT PRIMARY KEY,
                chat_id INTEGER NOT NULL
            )
        """)
        await db.commit()
        logger.info("Telegram users database initialized")

async def save_telegram_user(unique_id: str, chat_id: int):
    async with aiosqlite.connect("telegram_users.db") as db:
        await db.execute(
            "INSERT OR REPLACE INTO telegram_users (unique_id, chat_id) VALUES (?, ?)",
            (unique_id, chat_id)
        )
        await db.commit()
        logger.debug(f"Saved Telegram user: unique_id={unique_id}, chat_id={chat_id}")

async def get_chat_id_by_unique_id(unique_id: str) -> int | None:
    async with aiosqlite.connect("telegram_users.db") as db:
        cursor = await db.execute("SELECT chat_id FROM telegram_users WHERE unique_id = ?", (unique_id,))
        result = await cursor.fetchone()
        return result[0] if result else None

# Обработчики бота
@dp.message(CommandStart())
async def cmd_start(message: Message, state: FSMContext):
    await state.clear()
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="Подписаться на уведомления", callback_data="subscribe")]
    ])
    await message.answer(
        "Добро пожаловать! Хотите получать уведомления о курсах валют? Нажмите 'Подписаться'.",
        reply_markup=keyboard
    )

@dp.callback_query(lambda c: c.data == "subscribe")
async def start_subscription(callback: CallbackQuery, state: FSMContext):
    msg = await callback.message.answer("Введите ваш уникальный код (6 символов) из личного кабинета:")
    await state.set_state(SubscriptionForm.unique_id)
    await state.update_data(message_id=msg.message_id)
    await callback.message.delete()
    await callback.answer()

@dp.message(SubscriptionForm.unique_id)
async def process_unique_id(message: Message, state: FSMContext):
    unique_id = message.text.strip()
    if len(unique_id) != 6:
        await message.answer("Код должен состоять из 6 символов. Попробуйте снова.")
        await message.delete()
        return

    data = await state.get_data()
    chat_id = message.from_user.id

    # Проверяем unique_id через API
    async with aiohttp.ClientSession() as session:
        async with session.post(
            f"{BACKEND_API}/user/verify_id?unique_id={unique_id}",
        ) as response:
            if response.status == 200:
                await save_telegram_user(unique_id, chat_id)
                await bot.edit_message_text(
                    "Спасибо! Вы подписаны на уведомления.",
                    chat_id=message.chat.id,
                    message_id=data["message_id"]
                )
            else:
                await bot.edit_message_text(
                    "Неверный код. Проверьте код в личном кабинете.",
                    chat_id=message.chat.id,
                    message_id=data["message_id"]
                )

    await state.clear()
    await message.delete()

# Вебхук для отправки сообщений
async def handle_message(request):
    try:
        if request.headers.get("X-Webhook-Secret") != WEBHOOK_SECRET:
            return web.json_response({"status": "error", "message": "Invalid secret token"}, status=403)

        data = await request.json()
        unique_id = data.get("unique_id")
        text = data.get("text")

        if not unique_id or not text:
            return web.json_response({"status": "error", "message": "Missing unique_id or text"}, status=400)

        chat_id = await get_chat_id_by_unique_id(unique_id)
        if chat_id:
            formatted_text = (
                f"💱 {text} ₽"
            )
            await bot.send_message(chat_id, formatted_text, parse_mode="Markdown")
            return web.json_response({"status": "success"})
        else:
            return web.json_response({"status": "error", "message": "No chat_id for unique_id"}, status=404)

    except Exception as e:
        logger.error(f"Error handling message: {e}")
        return web.json_response({"status": "error", "message": str(e)}, status=500)

# Настройка aiohttp-сервера
async def start_aiohttp_server():
    app = web.Application()
    app.router.add_post('/send_message', handle_message)
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, 'localhost', 8000)
    await site.start()
    logger.info("Aiohttp server started at http://localhost:8000")

# Запуск
async def main():
    await init_telegram_db()
    aiohttp_task = asyncio.create_task(start_aiohttp_server())
    aiogram_task = asyncio.create_task(dp.start_polling(bot, skip_updates=True))
    await asyncio.gather(aiohttp_task, aiogram_task)

if __name__ == "__main__":
    asyncio.run(main())