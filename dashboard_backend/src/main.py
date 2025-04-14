from fastapi import FastAPI
from src.api.user import router as user_router
from src.api.rate import router as rate_router
from src.api.currencies import router as currency_router
app = FastAPI()

app.include_router(user_router)
app.include_router(rate_router)
app.include_router(currency_router)




