from typing import Annotated
from fastapi import APIRouter, Depends, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from backend.database.auth import email_exists, username_exists
from backend.models import Account
from backend.database.schema import DBAccount
from backend.database import accounts as accounts_db
from backend.dependencies import DBSession
from backend.routers.auth import RegisteredAccount
from backend.security import extract_user, hash_password, update_account_details, verify_password
from backend.database.accounts import delete_account, update_password

class UpdateAccountDetails(BaseModel):
      username: str | None = None
      email: str | None = None

class UpdatePassword(BaseModel):
     old_password: str
     new_password: str

class AccountResponse(BaseModel):
     id: int
     username: str
     email: str

router = APIRouter(prefix="/accounts", tags=["Accounts"])

@router.get("/", response_model=dict[str, dict[str, int] | list[Account]])
def get_accounts(session: DBSession) -> dict[str, dict[str, int] | list[DBAccount]]:
    '''
    Returns JSON object of all accounts
    '''
    accounts: list[DBAccount] = accounts_db.get_all(session)
    count: int = len(accounts)
    return {
        "metadata": {
            "count": count
        },
        "accounts": accounts
    }


@router.get("/me", status_code=200)
def get_account_data(session: DBSession, current_user: DBAccount = Depends(extract_user)) -> RegisteredAccount:
      """
      Authenticated route
      Returns data of account (id, username, email)
        Errors: 
            An access token is not provided -> 403
            Access token is expired -> 403
            Access token is invalid -> 403
      """
      return RegisteredAccount(**(accounts_db.get_by_account_id(session=session, account_id=current_user.id).model_dump()))


@router.put("/me", status_code=200)
def update_account(session: DBSession, update_details: UpdateAccountDetails, current_user: DBAccount = Depends(extract_user)):
     """
     Authenticated route
     Returns data of account (id, username, email)
     Errors: 
        An access token is not provided -> 403
        Access token is expired -> 403
        Access token is invalid -> 403
        Username matches the username of a different existing account -> 422 
        Email matches the email of a different existing account -> 422
    Success: 
        username and/or email values update -> 200
    """
     # Error checking for matching username/email of existing account 
     if update_details.username is not None:
        if username_exists(session=session, username=update_details.username):
            return JSONResponse(
                status_code=422,
                content={
                    "error": "duplicate_entity_value",
                    "message": f"Duplicate value: account with username={update_details.username} already exists"
                    })
     if update_details.email is not None:
        if email_exists(session=session, email=update_details.email):
            return JSONResponse(
                status_code=422,
                content={
                    "error": "duplicate_entity_value",
                    "message": f"Duplicate value: account with email={update_details.email} already exists"
                    })
        
     # Successful response
     update_account = update_account_details(session=session, new_username=update_details.username, new_email=update_details.email, account=current_user)
     return AccountResponse(**update_account.model_dump())


@router.put("/me/password", status_code=204)
def router_update_password(session: DBSession, password_details: Annotated[UpdatePassword, Form()], 
                    current_user: DBAccount = Depends(extract_user)) -> None:
     """
     Authenticated route
     Updates passwword of authenticated account
     Errors: 
        An access token is not provided -> 403
        Access token is expired -> 403
        Access token is invalid -> 403
        Old password does not match the account's hashed password
    Success: 
        Password is updated -> 204
     """
     # Verify old password matches accounts hashed_password
     if verify_password(password=password_details.old_password, hashed_password=current_user.hashed_password):
          # Success
        update_password(session=session, account=current_user, hashed_password=hash_password(password_details.new_password))
     else:
          return JSONResponse(
                status_code=401,
                content={
                    "error": "invalid_credentials",
                    "message": "Authentication failed: invalid username or password"
                    }) 
          

@router.delete("/me", status_code=204)
def router_delete_account(session: DBSession, current_user: DBAccount = Depends(extract_user)) -> None:
     """
     Authenticated route
     Updates passwword of authenticated account
     Errors: 
        An access token is not provided -> 403
        Access token is expired -> 403
        Access token is invalid -> 403
        Authenticated account is the owner of any chats -> 422
    Success: 
        Account deleted -> 204
     """
     delete_account(session=session, account=current_user)
          
          

@router.get("/{account_id}", response_model=Account)
def account_id(session: DBSession, account_id: int) -> DBAccount:
    '''
    Returns JSON object of account corrosponding with given id 
    '''
    data = accounts_db.get_by_account_id(session, account_id)
    if not data: 
           return JSONResponse(
            status_code=404,
            content={
                "error": "entity_not_found",
                "message": f"Unable to find account with id={account_id}"
            }
        )
    return data






