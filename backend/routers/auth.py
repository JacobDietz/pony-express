
from typing import Annotated
from fastapi import APIRouter, Depends, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from fastapi import Response
from backend.database.schema import DBAccount
from backend.dependencies import DBSession
from backend.security import generate_token, get_cookie_key, extract_user, remove_token
from backend.database.auth import create_account, email_exists, username_exists, verify_user

from dotenv import load_dotenv
import os

load_dotenv("secrets.env")  # loads all env variables from the file

SECURE_COOKIE = os.getenv("SECURE_COOKIE", "false").lower() == "true"


router = APIRouter(prefix="/auth", tags=["auth"])

class Registration(BaseModel):
	username: str
	email: str 
	password: str 
      
class RegisteredAccount(BaseModel):
      id: int | None
      username: str
      email: str

class ResponseToken(BaseModel):
      access_token: str
      token_type: str = "bearer"


@router.post("/registration", status_code=201, response_model=RegisteredAccount)
def register(session: DBSession, registration: Annotated[Registration, Form()]) -> RegisteredAccount:
      """
      Registers a new account in the database with their hashed_password
      Error responses
      username matches existing account -> 422 Unprocessable Entity
      email matches existing account -> 422 Unprocessable Entity

      Successful response -> 201 (Created)
      Body is an account JSON object with three keys: id, username, and email
      """
      # Can't register account if identical usernames or email exists
      if username_exists(session=session, username=registration.username):
            return JSONResponse(
                  status_code=422,
                  content={
                        "error": "duplicate_entity_value",
                        "message": f"Duplicate value: account with username={registration.username} already exists"
                        })
      if email_exists(session=session, email=registration.email):
            return JSONResponse(
                  status_code=422,
                  content={
                        "error": "duplicate_entity_value",
                        "message": f"Duplicate value: account with email={registration.email} already exists"
                        })
      # Successful response
      new_acc = create_account(
            session,
            registration.username,
            registration.email,
            registration.password,
            )
      
      return RegisteredAccount(id=new_acc.id, username=registration.username, email=registration.email)



@router.post("/token", status_code=200, response_model=ResponseToken)
def token(session: DBSession, 
          username: str = Form(),
          password: str = Form()) -> ResponseToken:
      """
      Generates and returns the JWT for DBAccount associated with given username
      Error: (401) 
            Username doesn't correspond to an account in the database OR password doesn' match the account's hashed password
      Success: (200)
            Json Object with token and token_type value
      """
      
      # Success
      if verify_user(session=session, username=username, password=password):
            token = generate_token(session=session, username=username)
            return ResponseToken(access_token=token)
      else:
            return JSONResponse(
                  status_code=401,
                  content={
                        "error": "invalid_credentials",
                               "message": "Authentication failed: invalid username or password"
                        })


@router.post("/web/login", status_code=204, response_model=None)
def store_web_token(session: DBSession, 
                    response: Response,
                    username: str = Form(),
                    password: str = Form(), 
                    ) -> None:

      """
      Stores the access token (JWT) for the requesting account as a cookie
      Error: (401) 
            Username doesn't correspond to an account in the database OR password doesn' match the account's hashed password
      Success: 
            204 No Content
      """
      if verify_user(session=session, username=username, password=password):
            response.set_cookie(get_cookie_key(), generate_token(session=session, username=username), httponly=SECURE_COOKIE)

      else:
            return JSONResponse(
                  status_code=401,
                  content={
                        "error": "invalid_credentials",
                               "message": "Authentication failed: invalid username or password"
                        })



@router.post("/web/logout", status_code=204, response_model=None)
def logout(session: DBSession, response: Response, current_user: DBAccount = Depends(extract_user)) -> None:
      """
      A logged-in account is logged out
      Errors: 
            An access token is not provided -> 403
            Access token is expired -> 403
            Access token is invalid -> 403
      """
      remove_token(session=session, response=response)


