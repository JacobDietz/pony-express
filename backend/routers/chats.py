from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from backend.database.schema import DBChat, DBAccount, DBChatMembership, DBMessage
from backend.models import Chat
from backend.models import Account
from backend.models import Message
from backend.database import chats as chats_db
from backend.database.chats import UpdateChatRequest, get_same_chat_name, unique_chat_name
from backend.database.chats import CreateChatRequest
from backend.database import messages as messages_db
from backend.database.messages import MessageRequest, UpdateMessageRequest
from backend.database import accounts as accounts_db
from backend.database.accounts import AccountRequest
from backend.database import chatmembership as chatmembership_db
from backend.dependencies import DBSession
from backend.security import extract_user

router = APIRouter(prefix="/chats", tags=["Chats"])

@router.get("/", response_model=dict[str, dict[str, int] | list[Chat]])
def chats(session: DBSession) -> dict[str, dict[str, int] | list[DBChat]]:
      """
      Returns JSON object of all chats as well as the count
      """
      chats: list[DBChat] = chats_db.get_chats(session)
      count: int = len(chats)
    
      return {"metadata": {
           "count": count},
           "chats": chats}


@router.get("/{chat_id}", response_model=Chat)
def chat_id(session: DBSession, chat_id: int) -> DBChat:
    """
    Returns JSON object of the chat corrosponding with given id
    """
    chat: DBChat = chats_db.get_chat_by_id(session, chat_id)
    if not chat: 
        return JSONResponse(
            status_code=404,
            content={
                "error": "entity_not_found",
                "message": f"Unable to find chat with id={chat_id}"
            }
        )
    return chat


@router.get("/{chat_id}/messages", response_model=dict[str, dict[str, int] | list[Message]])
def chat_messages(session: DBSession, chat_id: int) -> dict[str, dict[str, int] | list[DBMessage]]:
    '''
    Returns messages associated with chat given chat_id
    '''
    messages: list[DBMessage] = messages_db.get_messages(session, chat_id)
    count: int = len(messages)
    if not messages: 
         return JSONResponse(
            status_code=404,
            content={
                "error": "entity_not_found",
                "message": f"Unable to find chat with id={chat_id}"
            }
        )
    return {
         "metadata": { 
              "count": count
         },
         "messages": messages
    }

@router.get("/{chat_id}/accounts", response_model=dict[str, dict[str, int] | list[Account]])
def account_of_chat_id(session: DBSession, chat_id: int) -> dict[str, dict[str, int] | list[DBAccount]]:
    '''
    Returns
      JSON object of all accounts associated with a chat given its chat_id
    '''
    accounts: list[DBAccount] = accounts_db.get_chat_accounts(session, chat_id)
    count: int = len(accounts)
    if not accounts: 
        return JSONResponse(
            status_code=404,
            content={
                "error": "entity_not_found",
                "message": f"Unable to find chat with id={chat_id}"
            }
        )
    return {
         "metadata": { 
              "count": count
         },
         "accounts": accounts
    }


@router.post("/", response_model=Chat, status_code=201)
def create_chat(session: DBSession, chat_model: CreateChatRequest, account_owner: DBAccount = Depends(extract_user)) -> DBChat:
    '''
    Authenticated route
    Adds a new chat to database given that the owner_id corresponds to an existing account. 
    '''
    if account_owner is None:
         # Account doesn't exist with given id 
         return JSONResponse(
              status_code=404,
              content={
                   "error": "entity_not_found",
                   "message": f"Unable to find account with id={chat_model.owner_id}"
                   })
    
    # chat_name must not be taken by an existing chat
    if not chats_db.unique_chat_name(session=session, name=chat_model.name):
         # chat_name is not unqiue
         return JSONResponse(
              status_code=422,
              content={
                   "error": "duplicate_entity_value",
                   "message": f"Duplicate value: chat with name={chat_model.name} already exists"
                   })
    
    # request owner_id must match the authenticated account's id
    if chat_model.owner_id != account_owner.id:
         return JSONResponse(
              status_code=403,
              content={
                   "error": "access_denied",
                   "message":"Cannot create chat on behalf of different account"})
         
    
     # Successful outcome, add chat and chat membership to database
    new_chat = DBChat(owner_id=chat_model.owner_id, owner=account_owner, name=chat_model.name)
    chats_db.add_chat(session=session, chat=new_chat)

    membership = DBChatMembership(account_id=chat_model.owner_id, chat_id=new_chat.id)
    chatmembership_db.create_membership(session=session, membership=membership) 
    return new_chat

@router.put("/{chat_id}", response_model=Chat,status_code=200)
def update_chat(session: DBSession, chat_id: int, chat_request: UpdateChatRequest) -> DBChat:
    """
    Edits the chat corresponding with given chat_id based on the two optional keys in the request body. 
    Only updates the fields included in the request. 
    Returns a 200 status code on success, 404 if chat not found, 422 if chat name is already taken or owner_id doesn't correspond 
    with an account/if owner isn't a member of  the chat 
    """
    # If updated chat name matches the name for a different chat ids
    if not unique_chat_name(session=session, name=chat_request.chat_name):
         same_name_chat = get_same_chat_name(session=session, name=chat_request.chat_name)
         if same_name_chat.id == chat_request.id:
             return JSONResponse(
                status_code=422,
                content={
                    "error": "duplicate_entity_value"
            }) 
          
    # Successful response -> update chat object
    updated_chat = chats_db.update_chat(session=session, chat_id=chat_id, update=chat_request)
    return updated_chat

    
@router.delete("/{chat_id}", response_model=None, status_code=204)
def delete_chat_by_id(session: DBSession, chat_id: int) -> None:
    """
    Deletes specified chat from database therefore deleting the chat messages within the chat as well as the chat memberships 
    (due to ondelete=CASCADE)
    """
    chat = chats_db.get_chat_by_id(session=session, chat_id=chat_id)

    # Validate whether chat_id corresponds with chat in the database
    if chat == None:
         return JSONResponse(
            status_code=404,
            content={
                "error": "entity_not_found",
                "message": f"Unable to find chat with id={chat_id}"
         })
    
    # Delete chat (therefore deleting the Messages and ChatMembership)
    chats_db.delete_chat(session=session, chat_id=chat_id)


@router.post("/{chat_id}/messages", response_model=Message, status_code=201)
def post_message(session: DBSession, chat_id: int, message_request: MessageRequest, 
                  owner_account: DBAccount = Depends(extract_user)) -> DBMessage:
    """
    Authenticated route
    Creates a new message in the database belonging to the specified chat
    Errors: 
        An access token is not provided -> 403
        Access token is expired -> 403
        Access token is invalid -> 403

        Chat_id does not correspond to a chat in the database -> 404
        account_id does not correspond to an account in the database OR 
        account_id corresponds to an account that is not a member of the chat -> 422

        Request account_id does not match the authenticated account's id -> 403

    Success: 
        Create mesage object and added to database -> 201
    """
    chat = chats_db.get_chat_by_id(session=session, chat_id=chat_id)
    print()
    print()
    print()
    print(owner_account, "=================oner account id");
    print()
    print()

    # Validate whether chat_id corresponds with chat in the database
    if chat == None:
         return JSONResponse(
              status_code=404,
              content={
                   "error": "entity_not_found",
                   "message": f"Unable to find chat with id={chat_id}"
                   })
    
    # Check if account_id corresponds to account in database OR account_id corresponds to an account that is not a member of the chat 
    # owner_account = accounts_db.get_by_account_id(session, message_request.account_id)
    if owner_account == None or not chatmembership_db.is_account_chat_member(session=session, account_id=message_request.account_id, chat=chat):
         return JSONResponse(
                status_code=422,
                content={
                    "error": "chat_membership_required",
                    "message": f"Account with id={message_request.account_id} must be a member of chat with id={chat_id}"
            })
    
    # Request account_id does not match the authenticated account's id -> 403
    if message_request.account_id != owner_account.id:
         print()
         print()
         print()
         print(owner_account, "=================oner account id");
         print()
         print()
         return JSONResponse(
                status_code=403,
                content={
                    "error": "access_denied",
                    "message": "Cannot create message on behalf of different account"
            })

    # Successful response -> create message object and add to database
    message = DBMessage(text=message_request.text, account_id=message_request.account_id, chat_id=chat_id)
    messages_db.create_message(session=session, message=message)
    return message


@router.put("/{chat_id}/messages/{message_id}", response_model=Message, status_code=200)
def update_message_text(session: DBSession, chat_id: int, message_id: int, message_request: UpdateMessageRequest) -> DBMessage:
    """
    Updates text of message corresponding with given message_id
    Error responses: 
        No chat corresponding with chat_id exists. -> 404 "entity_not_found"
        message_id doesn't correspond to a message within database OR message_id corresponds to a message belonging to a different chat -> 404 response body: error, message
    Successful responses: 
        200 status code (OK)
        Message JSON object 
    """
    chat = chats_db.get_chat_by_id(session=session, chat_id=chat_id)

    # Validate whether chat_id corresponds with chat in the database
    if chat == None:
         return JSONResponse(
            status_code=404,
            content={
                "error": "entity_not_found",
                "message": f"Unable to find chat with id={chat_id}"
         })
    
    # Check if message_id corresponds to a message in database OR message_id corresponds to a message that belongs to a different chat
    message = messages_db.get_message_by_id(session=session, message_id=message_id)
    if message == None or not messages_db.message_in_chat(session=session, message_id=message_id, chat=chat):
         return JSONResponse(
                status_code=404,
                content={
                    "error": "entity_not_found",
                    "message": f"Unable to find message with id={message_id}"
            })    

    # Successful response -> update the text of the message 
    msg = messages_db.update_message(session=session, message=message, update=message_request)
    return msg

@router.delete("/{chat_id}/messages/{message_id}", response_model=None, status_code=204)
def delete_message(session: DBSession, chat_id: int, message_id: int) -> None:
    """
    Deletes the message corresponding with given chat_id from the database.
    Error response: 
        chat_id doesn't correspond with chat in database -> 404
        message_id doen't correspond with a message in database OR corresponds to a message that belongs to a different chat -> 404
    Successful response: 
        No body -> 204 (N Content)
    """
    chat = chats_db.get_chat_by_id(session=session, chat_id=chat_id)

    # Validate whether chat_id corresponds with chat in the database
    if chat == None:
         return JSONResponse(
            status_code=404,
            content={
                "error": "entity_not_found",
                "message": f"Unable to find chat with id={chat_id}"
         })
    
    # Check if message_id corresponds to a message in database OR message_id corresponds to a message that belongs to a different chat
    message = messages_db.get_message_by_id(session=session, message_id=message_id)
    if message == None or not messages_db.message_in_chat(session=session, message_id=message_id, chat=chat):
         return JSONResponse(
                status_code=404,
                content={
                    "error": "entity_not_found",
                    "message": f"Unable to find message with id={message_id}"
            }) 

    # Successful response -> delete message 204 no content
    messages_db.delete_message(session=session, message=message)
       
@router.post("/{chat_id}/accounts", response_model=DBChatMembership)
def account_associated_with_chat(session: DBSession, chat_id: int, account_request: AccountRequest) -> DBChatMembership:
    """
    Joins chat  (creates ChatMembership) if account is not a member of chat given chat_id
    If already a member -> no change
    """
    chat = chats_db.get_chat_by_id(session=session, chat_id=chat_id)

    # Validate whether chat_id corresponds with chat in the database
    if chat == None:
          return JSONResponse(
            status_code=404,
            content={
                "error": "entity_not_found",
                "message": f"Unable to find chat with id={chat_id}"
         })

    # Check if account_id corresponds to an account in the database 
    account = accounts_db.get_by_account_id(session=session, account_id=account_request.account_id)
    if account == None:
        return JSONResponse(
                status_code=404,
                content={
                    "error": "entity_not_found",
                    "message": f"Unable to find account with id={account_request.account_id}"
            })
    
    # Successful response
        # 201 (OK) if account already a member of the chat 
    if chatmembership_db.is_account_chat_member(session=session, account_id=account_request.account_id, chat=chat):
         return JSONResponse(status_code=200, content={"message": "Account is a member of the chat"})
    else:
        # Add new chat membership -> 201 created
        chatmembership_db.add_chat_member(session=session, account=account, chat=chat)
        return JSONResponse(status_code=201, content={"chat_id": f"{chat_id}", 
                                                      "account_id": f"{account.id}"})


@router.delete("/{chat_id}/accounts/{account_id}", response_model=None, status_code=204)
def delete_membership(session: DBSession, chat_id: int, account_id: int):
    """
    Removes account from chat (deletes ChatMembership). Messages belonging to account become updated to NUll account_id
    """

    chat = chats_db.get_chat_by_id(session=session, chat_id=chat_id)

    # Validate whether chat_id corresponds with chat in the database
    if chat == None:
          return JSONResponse(
            status_code=404,
            content={
                "error": "entity_not_found",
                "message": f"Unable to find chat with id={chat_id}"
         })
    # Check if account_id corresponds to account in database OR account_id corresponds to an account that is not a member of the chat 
    account = accounts_db.get_by_account_id(session=session, account_id=account_id)
    if account == None or not chatmembership_db.is_account_chat_member(session=session, account_id=account_id, chat=chat):
         return JSONResponse(
                status_code=422,
                content={
                    "error": "chat_membership_required",
                    "message":  f"Account with id={account_id} must be a member of chat with id={chat_id}"
            })
    
    # Check if account_id correspponds to the owner of the chat 
    if accounts_db.is_account_chat_owner(session=session, account=account, chat=chat):
        return JSONResponse(
                status_code=422,
                content={
                    "error": "chat_owner_removal",
                    "message": "Unable to remove the owner of a chat"
            })
    
    # Successful response -> 204 (NO CONTENT). Nulllify each account_id associated with deleted account 
    messages_db.nullify_account_messages(session=session, account_id=account_id)
    chatmembership_db.delete_membership(session=session, chat_id=chat_id, account_id=account_id)
    
