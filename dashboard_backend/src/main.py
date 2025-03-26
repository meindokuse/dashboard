from fastapi import FastAPI
from src.api.user import router as user_router

app = FastAPI()

app.include_router(user_router)