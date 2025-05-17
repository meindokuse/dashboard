from src.main import app
from fastapi import Request

@app.middleware("http")
async def cookie_middleware(request: Request, call_next):
    response = await call_next(request)

    """Заголовки для CORS"""
    origin = request.headers.get('origin')
    if origin in ["http://localhost:5173", "http://26.93.200.148:5173"]:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"

    return response