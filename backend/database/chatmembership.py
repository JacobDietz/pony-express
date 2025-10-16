from backend.database.schema import DBChatMembership, DBChat, DBAccount
from sqlmodel import select
from backend.dependencies import DBSession


def create_membership(session: DBSession, membership: DBChatMembership):
      """
      Creates a new chat membership in database to record the new chat's owner as a member of the chat
      """
      session.add(membership)
      session.commit()
      session.refresh(membership)
      return membership

def is_account_chat_member(session: DBSession, account_id: int, chat: DBChat) -> bool:
      """
      Returns true if account corresponding with given id is a member of given chat
      NOTE: This assumes that the chat exists
      """
      stmt = select(DBChatMembership).where(
            DBChatMembership.account_id == account_id,
            DBChatMembership.chat_id == chat.id
            )
      result = session.exec(stmt).first()
      return result is not None 

def add_chat_member(session: DBSession, account: DBAccount, chat: DBChat) -> DBChatMembership:
      """
      Creates a membership with given account 
      """
      membership = DBChatMembership(account_id=account.id, chat_id=chat.id, account=account, chat=chat)
      session.add(membership)
      session.commit()
      return membership


def delete_membership(session: DBSession, chat_id: int, account_id: int) -> None:
      """
      Deletes membership associated with given account_id and chat_id
      NOTE: Assumes membership exists
      """
      stmt = select(DBChatMembership).where(DBChatMembership.account_id == account_id, DBChatMembership.chat_id == chat_id)
      result = session.exec(stmt).first()
      session.delete(result)
      session.commit()



