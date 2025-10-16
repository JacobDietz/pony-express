
from datetime import datetime, timezone
from fastapi import Depends, Response
from fastapi.security import APIKeyCookie, HTTPAuthorizationCredentials, HTTPBearer
import bcrypt
from dotenv import load_dotenv
import os
from jose import ExpiredSignatureError, jwt
from pydantic import BaseModel
from backend.database.accounts import get_by_account_id, get_by_account_username, update_email, update_username
from backend.database.schema import DBAccount
from backend.dependencies import DBSession
from backend.error_responses import ExpiredAccessToken, InvalidAccessToken, TokenNotProvidedError
import secrets


# Load environment variables from .env file
# load_dotenv("/Users/jacobdietz/Desktop/pony-express-JacobDietz/secrets.env")
load_dotenv("secrets.env")

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_OPTS = {"require_sub": True, "require_iss": True, "require_exp": True}
JWT_ALG = "HS256"
JWT_ISS = "http://127.0.0.1"
DURATION = 3600
JWT_COOKIE_KEY = "pony_express_token"

# Authentication schemes
# These are essentially used to transport the JWT
COOKIE_SCHEME = APIKeyCookie(name=JWT_COOKIE_KEY, auto_error=False)
BEARER_SCHEME = HTTPBearer(auto_error=False)

class JWT_Claims(BaseModel):
      sub: str
      iss: str 
      iat: int
      exp: int

def remove_token(session: DBSession, response: Response):
      response.delete_cookie(key=JWT_COOKIE_KEY)

def get_access_token(cookie_token: str | None = Depends(COOKIE_SCHEME), 
                     bearer_token: HTTPAuthorizationCredentials | None = Depends(BEARER_SCHEME)) -> str:
      """
      Returns either cookie or bearer token 
      Throws exception if none
      Used as a dependency for authentication schemes
      """
      if cookie_token is not None and not "":
            return cookie_token
      elif bearer_token is not None and not "":
            return bearer_token.credentials
      else:
            raise TokenNotProvidedError()


def extract_user(session: DBSession, token: str = Depends(get_access_token)) -> DBAccount:
      """
      Extracts user from given token
      Raises errors if token invlaid or expired
      Used as a dependency for authentication schemes
      """
      try:
            payload = jwt.decode(
                  token=token,
			key=JWT_SECRET_KEY,
			algorithms=[JWT_ALG],
			options=JWT_OPTS
                  )
            claims = JWT_Claims(**payload)
            return get_by_account_id(session, int(claims.sub))
      except ExpiredSignatureError:
            raise ExpiredAccessToken()
      except Exception:
            raise InvalidAccessToken()


def generate_token(session: DBSession, username: str) -> str:
      """
      Generates JWT token for given user
      Assumes user exists and is verified 
      """
      
      account: DBAccount = get_by_account_username(session, username)
      claims: JWT_Claims = _generate_token_claims(account=account)
      return jwt.encode(
		claims.model_dump(),
		key=JWT_SECRET_KEY,
		algorithm=JWT_ALG,
	)


def _generate_token_claims(account: DBAccount):
      """
      Constructs payload for a JWT 
      """
      iat = int(datetime.now(timezone.utc).timestamp())
      exp = iat + DURATION
      return JWT_Claims(
            sub=str(account.id),
            iss=JWT_ISS,
            iat=iat,
            exp=exp)

def verify_password(password: str, hashed_password: str) -> bool:
      """
      Verifies given hashed_password matches given password
      """
      return bcrypt.checkpw(
		password.encode("utf-8"),
		hashed_password.encode("utf-8"),
	)


def hash_password(password: str) -> str:
    '''
    Returns a string representation of hashed verison of given passwrod using bycrypt
    '''
    return bcrypt.hashpw(
          password.encode("utf-8"),
          bcrypt.gensalt(),
          ).decode("utf-8")


def get_cookie_key() -> str:
      """
      Getter for JWT_COOKIE_KEY
      """
      return JWT_COOKIE_KEY


def update_account_details(session: DBSession, new_username: str, new_email: str, account: DBAccount) -> DBAccount:
      """
      Updates (if given) the values of current user's username and email to given updated values
      """
      if new_username is not None:
            update_username(session=session, account=account, username=new_username)
            account.username = new_username
      if new_email is not None:
            update_email(session=session, account=account, email=new_email)
            account.email = new_email
      return account


      




