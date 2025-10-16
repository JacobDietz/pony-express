"""PonyExpress backend API application.

Args:
    app (FastAPI): The FastAPI application
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from backend.dependencies import create_db_tables
import backend.dependencies as db
# Routers to include 
from backend.error_responses import DeleteErrorAccountChatOnwer, ExpiredAccessToken, InvalidAccessToken, TokenNotProvidedError
from backend.routers import accounts, auth, chats, requests

from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_tables()
    yield

app = FastAPI(
    title="<Pony Express backend API application>",
    summary="<your API summary>",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174","http://localhost:5173", "https://pony-express-jacobdietz-production.up.railway.app"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


app.include_router(accounts.router)
app.include_router(chats.router)
app.include_router(auth.router)
app.include_router(requests.router)


@app.exception_handler(ExpiredAccessToken)
def handled_expired_token(request: Request, exception: ExpiredAccessToken):
    return exception.response()

@app.exception_handler(TokenNotProvidedError)
def handled_expired_token(request: Request, exception: TokenNotProvidedError):
    return exception.response()

@app.exception_handler(InvalidAccessToken)
def handled_expired_token(request: Request, exception: InvalidAccessToken):
    return exception.response()

@app.exception_handler(DeleteErrorAccountChatOnwer)
def handled_expired_token(request: Request, exception: DeleteErrorAccountChatOnwer):
    return exception.response()






