
from fastapi import Response
from fastapi.responses import JSONResponse
# Authentication Error Reponses 

    
class ExpiredAccessToken(Exception):
    """Raised when the JWT has expired."""
    def response(self) -> Response:
        EXPIRED_TOKEN_ERROR = {"error": "expired_access_token",
                               "message": "Authentication failed: expired access token"}
        return JSONResponse(
            status_code=403, 
            content=EXPIRED_TOKEN_ERROR
        )

class InvalidAccessToken(Exception):
    """Raised when the provided JWT is invalid."""
    def response(self) -> Response:
        INVALID_TOKEN_ERROR = {"error": "invalid_access_token",
                               "message": "Authentication failed: invalid access token"}
        return JSONResponse(
            status_code=403, 
            content=INVALID_TOKEN_ERROR
        )
    
class TokenNotProvidedError(Exception):
    """Raised when the JWT not provided"""
    def response(self) -> Response:
        TOKEN_NOT_PROVIDED_ERROR = {"error": "authentication_required",
                                    "message": "Not authenticated"}
        return JSONResponse(
            status_code=403, 
            content=TOKEN_NOT_PROVIDED_ERROR
        )
    
class DeleteErrorAccountChatOnwer(Exception):
     """Raised when account to be deleted is a chat owner"""
     def response(self) -> Response:
          return JSONResponse(
                status_code=422,
                content={
                    "error": "chat_owner_removal",
                    "message": "Unable to remove the owner of a chat"
                    }) 
     
class JoinChatRequestDuplicate(Exception):
    def __init__(self, sender_id: int, chat_id: int):
        self.status_code = 422
        self.error = "invalid_join_chat_request"
        self.message = f"Existing chat request from account={sender_id} to chat={chat_id}"


class AlreadyChatMemberError(Exception):
    def __init__(self, sender_id: int, chat_id: int):
        self.status_code = 422
        self.error = "invalid_join_chat_request"
        self.message = f"User with account={sender_id} already member of chat={chat_id}"


class NonexistenChatError(Exception):
    def __init__(self, chat_id: int):
        self.status_code = 404
        self.error = "chat_doesn't_exist"
        self.message = f"Unable to locate chat={chat_id}. It doesn't exist"




# class UsernameExists(Exception):
#     def __init__(self, chat_id: int):
#         self.status_code = 404
#         self.error = "chat_doesn't_exist"
#         self.message = f"Unable to locate chat={chat_id}. It doesn't exist"





# class FriendRequestNotFound(Exception):
#     def __init__(self, sender_id: int, recipient_id: int):
#         self.status_code = 404
#         self.error = "entity_not_found"
#         self.message = f"Unable to find friend request from account={sender_id} to account={recipient_id}"
