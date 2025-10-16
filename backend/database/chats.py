from sqlmodel import select 
from backend.database.schema import DBChat
from pydantic import BaseModel
from typing import Optional
from backend.dependencies import DBSession

class UpdateChatRequest(BaseModel):
      chat_name: Optional[str] = None
      owner_id: Optional[int] = None

class CreateChatRequest(BaseModel):
      name: str
      owner_id: int

def get_chats(session: DBSession) -> list[DBChat]:
     """
        Retrieves all the chats in the database
     """
     stmt = select(DBChat)
     results = list(session.exec(stmt))
     return results

def get_chat_by_id(session: DBSession, chat_id: int) -> DBChat:
       """
        Retrieves chat associated with given chat_id
       """
       chat = session.get(DBChat, chat_id)
       return chat

def add_chat(session: DBSession, chat: DBChat) -> DBChat:
      """
      Adds given chat to database
      """
      session.add(chat)
      session.commit()
      session.refresh(chat)
      return chat

def unique_chat_name(session: DBSession, name: str) -> bool:
      """
      Checks database to determine whether given name exists for other chats
      """
      stmt = select(DBChat).where(DBChat.name == name)
      result = session.exec(stmt).first()
      return result is None

def get_same_chat_name(session: DBSession, name:str ) -> DBChat:
      """
      Retrives the chat corresponding to given name from database
      """
      stmt = select(DBChat).where(DBChat.name == name)
      result = session.exec(stmt).first()
      return result


def update_chat(session: DBSession, chat_id: int, update: UpdateChatRequest) -> DBChat:
      """
      Updates the fields of the chat correspondng to given chat_id with the new fields in update
      """
      # Identify which fields need to be updated
      has_new_chat_name = update.chat_name
      has_new_owner_id = update.owner_id
      original_chat = get_chat_by_id(session=session, chat_id=chat_id)
      
      if has_new_chat_name is not None:
            original_chat.name = update.chat_name
      if has_new_owner_id is not None:
            original_chat.owner_id = update.owner_id

      session.flush()
      session.commit() 
      session.refresh(original_chat)

      return original_chat

def delete_chat(session: DBSession, chat_id: int) -> None:
      """ 
      Deletes specifed chat from database and therefore deletes the chat messages within the chat as well as the chat memberships 
      Automatically deleted due to ondelete="CASCADE"
      NOTE: Assumes chat exists
      """
      chat_to_delete = get_chat_by_id(session=session, chat_id=chat_id)
      session.delete(chat_to_delete)
      session.commit()







