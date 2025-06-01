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
from src.api.alerts import router as alert_router
from src.api.transaction import router as transaction_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8000",
        "http://90.156.155.73",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["POST", "OPTIONS", "GET", "PUT", "DELETE"],
    allow_headers=["*"],
    expose_headers=["*"]
)


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
app.include_router(alert_router)
app.include_router(transaction_router)
