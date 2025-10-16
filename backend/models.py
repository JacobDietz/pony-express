from pydantic import BaseModel
from datetime import datetime

class Account(BaseModel):
    id: int | None
    username: str 

class Chat(BaseModel):
    id: int | None
    name: str
    owner_id: int

class Message(BaseModel):
    id: int | None
    text: str
    account_id: int 
    chat_id: int 
    created_at: datetime | None

class ChatMembership(BaseModel):
    account_id: int 
    chat_id: int 


class JoinChatRequest(BaseModel):
    sender_id: int
    chat_id: int


