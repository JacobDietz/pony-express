from fastapi import APIRouter, Depends

from backend.database.schema import DBAccount, DBJoinChatRequest
from backend.dependencies import DBSession
from backend.models import ChatMembership, JoinChatRequest
from backend.security import extract_user

import backend.database.requests as requests_db

router = APIRouter(prefix="/requests", tags=["Requests"])


@router.post("/create/{chat_id}", response_model=JoinChatRequest, status_code=201)
def create_chat(session: DBSession, 
                chat_id: int, 
                authenticated_user: DBAccount = Depends(extract_user),
                ) -> DBJoinChatRequest:
    '''
        Authenticated route: creates a request to join chat based off of given chat_id
    '''

    return requests_db.create_request(session=session, sender_id=authenticated_user.id, chat_id=chat_id)




