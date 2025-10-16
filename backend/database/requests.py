import select
from backend.database.chats import get_chat_by_id
from backend.error_responses import JoinChatRequestDuplicate, AlreadyChatMemberError, NonexistenChatError
from backend.database.schema import DBChatMembership, DBJoinChatRequest
from backend.dependencies import DBSession


def create_request(session: DBSession, sender_id: int, chat_id: int):
    """
    Adds DBJoinChatRequest to database while checking if a request is already sent or user already member of chat
    """
    request = DBJoinChatRequest(sender_id=sender_id, chat_id=chat_id)
    session.add(request)
    session.commit()
    session.refresh(request)

    if(get_chat_by_id(session=session, chat_id=chat_id) is not None):
        raise NonexistenChatError(chat_id=chat_id)
    # Check if request has already been sent
    if(_request_exists(session=session, sender_id=sender_id, chat_id=chat_id) is not None):
        raise JoinChatRequestDuplicate(sender_id=sender_id, chat_id=chat_id)
    # Check if user is already a chat member
    if(_chat_membership_exists(session=session, sender_id=sender_id, chat_id=chat_id) is not None):
        raise AlreadyChatMemberError(sender_id=sender_id, chat_id=chat_id)


def _request_exists(session: DBSession, sender_id: int, chat_id: int) -> bool:
    """ 
    Checks for whether request in database already exists
    """
    stmt = select(DBJoinChatRequest).where(
        DBJoinChatRequest.sender_id == sender_id, 
        DBJoinChatRequest.sender_id == chat_id
        )
    result = session.exec(stmt).first()
    return result is not None 


def _chat_membership_exists(session: DBSession, sender_id: int, chat_id: int) -> bool:
    """
    Checks if account is a member of chat
    """
    stmt = select(DBChatMembership).where(
        DBChatMembership.account_id == sender_id, 
        DBChatMembership.chat_id == chat_id
    )
    result = session.exec(stmt).first()
    return result is not None 




