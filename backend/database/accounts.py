from backend.database.schema import DBAccount
from backend.database.schema import DBChat
from backend.database.schema import DBChatMembership
from backend.database.schema import DBMessage
from sqlmodel import select
from pydantic import BaseModel
from backend.dependencies import DBSession
from backend.error_responses import DeleteErrorAccountChatOnwer


class AccountRequest(BaseModel):
    account_id: int 


def get_all(session: DBSession) -> list[DBAccount]:
    '''
    Uses current session to return all the DBAccounts in the database
    '''
    stmt = select(DBAccount)
    results = list(session.exec(stmt))
    return results


def get_by_account_id(session: DBSession, account_id: int) -> DBAccount:
    '''
    Uses current session to return account in database associated with given account id
    '''
    account = session.get(DBAccount, account_id)
    return account


def get_by_account_username(session: DBSession, username: str) -> DBAccount:
    '''
    Uses current session to return account in database associated with given username
    Assumes account exists
    '''
    stmt = select(DBAccount).where(DBAccount.username == username)
    result = session.exec(stmt).first()
    return result


def get_by_account_email(session: DBSession, email: str) -> DBAccount:
    '''
    Uses current session to return account in database associated with given username
    Assumes account exists
    '''
    stmt = select(DBAccount).where(DBAccount.email == email)
    result = session.exec(stmt).first()
    return result


def get_chat_accounts(session: DBSession, chat_id: int) -> list[DBAccount]:
    '''
    Uses current session to return all accounts within a chat membership 
    '''
    stmt = select(DBAccount).join(DBChatMembership).where(DBChatMembership.chat_id == chat_id)
    results = list(session.exec(stmt))
    return results


def is_account_chat_owner(session: DBSession, account: DBAccount, chat: DBChat) -> bool: 
    """
    Determines whether a given account is the owner of the given chat
    """
    stmt = select(DBAccount).where(account.id == chat.owner_id)
    result = session.exec(stmt).first()
    return result


def get_all_messages(session: DBSession, account_id: int) -> list[DBMessage]:
    """
    Returns all messages in databse corresponding with account_id
    """
    stmt = select(DBMessage).where(DBMessage.account_id == account_id)
    results = list(session.exec(stmt))
    return results


def delete_account(session: DBSession, account: DBAccount) -> None:
    """
    Deletes given account from database
    """
    stmt = select(DBAccount).where(DBChat.owner_id == account.id)
    owned_chats = session.exec(stmt).all()
    
    if owned_chats:
        raise DeleteErrorAccountChatOnwer()
    session.delete(account)
    session.commit()


def update_password(session: DBSession, account: DBAccount, hashed_password: str) -> None:
    """
    Updates password in database
    Called from authenticated route
    """
    account.hashed_password = hashed_password
    session.add(account)  
    session.commit()      
    session.refresh(account) 


def update_email(session: DBSession, account: DBAccount, email: str) -> None:
    """
    Updates email of given account 
    Called from authenticated route
    """
    account.email = email
    session.add(account)  
    session.commit()      
    session.refresh(account) 


def update_username(session: DBSession, account: DBAccount, username: str) -> None:
    """
    Updates email of given account 
    Called from authenticated route
    """
    account.username = username
    session.add(account)  
    session.commit()      
    session.refresh(account) 



        






