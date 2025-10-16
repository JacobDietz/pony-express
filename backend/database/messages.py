from backend.database.schema import DBMessage, DBChat
from sqlmodel import select
from pydantic import BaseModel
from backend.database import accounts as accounts_db
from backend.dependencies import DBSession

class MessageRequest(BaseModel):
    text: str  
    account_id: int 

class UpdateMessageRequest(BaseModel):
     text: str

def get_messages(session: DBSession, chat_id: int) -> list[DBMessage]:
     """
     Retrieves all messages inside of a chat given chat_id
     """
     stmt = select(DBMessage).where(DBMessage.chat_id == chat_id)
     results = list(session.exec(stmt))
     return results

def create_message(session: DBSession, message: DBMessage) -> DBMessage:
     """
     Adds given message to database
     """
     session.add(message)
     session.commit()


def get_message_by_id(session: DBSession, message_id: int) -> DBMessage:
     """
     Retunrs message corresponding with given message_id
     """
     stmt = select(DBMessage).where(DBMessage.id == message_id)
     results = session.exec(stmt).first()
     return results


def message_in_chat(session: DBSession, message_id: int, chat: DBChat) -> bool:
     """
     Returns true if message corresponding with given id is a part of the given chat
     NOTE: This assumes that the chat exists
     """
     stmt = select(DBMessage).where(
          DBMessage.id == message_id,
          DBMessage.chat_id == chat.id
          )
     result = session.exec(stmt).first()
     return result is not None 

def update_message(session: DBSession, message: DBMessage, update: UpdateMessageRequest) -> DBMessage:
    """
    Updates the text of given message based on given request model.
    """
    message.text = update.text
    session.commit()
    return message

def delete_message(session: DBSession, message: DBMessage) -> None:
     """
     Deletes given message from database
     """
     mesage_to_delete = get_message_by_id(session=session, message_id=message.id)
     session.delete(mesage_to_delete)
     session.commit()

def nullify_account_messages(session: DBSession, account_id: int) -> None:
     """
     Nullifies each message associated with given account id
     """
     messages = accounts_db.get_all_messages(session=session, account_id=account_id)
     for message in messages:
          message.account = None
     session.commit()
     




