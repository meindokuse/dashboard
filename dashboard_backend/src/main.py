from fastapi import FastAPI
from starlette.requests import Request
from starlette.responses import JSONResponse

from src.api.user import router as user_router
from src.api.rate import router as rate_router
from src.api.currencies import router as currency_router
from src.api.portfolio import router as portfolio_router
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request
from fastapi import Response
app = FastAPI()



app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",       # Локальный фронт у тестировщика
        "http://26.93.200.148:5173",  # Фронт в Radmin VPN (если нужно)
    ],
    allow_credentials=True,
    allow_methods=["POST", "OPTIONS","GET"],
    allow_headers=["Content-Type"],
    expose_headers=["*"]
)

# Явный обработчик для OPTIONS
@app.options("/user/login")
async def handle_options():
    return Response(
        content='{"message":"Preflight OK"}',
    )
@app.options("/user/profile")
async def handle_options():
    return Response(
        content='{"message":"Preflight OK"}',
    )
app.include_router(user_router)
app.include_router(rate_router)
app.include_router(currency_router)
app.include_router(portfolio_router)




