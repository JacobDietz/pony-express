from backend.database.accounts import get_by_account_username
from backend.database.schema import DBAccount
from backend.dependencies import DBSession
from sqlmodel import select
from backend.security import hash_password, verify_password

def username_exists(session: DBSession, username: str) -> bool:
      """
      Returns true if DBAccount with given username exists
      """
      stmt = select(DBAccount).where(
           DBAccount.username == username)
      result = session.exec(stmt).first()
      return result is not None 


def email_exists(session: DBSession, email: str) -> bool:
      """
      Returns true if DBAccount with given email exists
      """
      stmt = select(DBAccount).where(
           DBAccount.email == email)
      result = session.exec(stmt).first()
      return result is not None 


def verify_user(session: DBSession, username: str, password: str,) -> bool:
     """
     Verifies that given account associated with given username is exists and passwords match
     """
     account = get_by_account_username(session=session, username=username)
     return account != None and verify_password(password=password, hashed_password=account.hashed_password)


def create_account(session: DBSession, username: str, email: str, password: str) -> DBAccount:
    """
    Adds the new registered account to the database
    """
    new_acc = DBAccount(username=username, email=email, hashed_password=hash_password(password))
    session.add(new_acc)
    session.commit()
    return new_acc

