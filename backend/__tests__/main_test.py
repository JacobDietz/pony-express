import pytest
from starlette.testclient import TestClient
from backend.main import app
from sqlmodel import Session, SQLModel, StaticPool, create_engine
from backend.database.schema import *
from backend.dependencies import get_session


@pytest.fixture
def session():
    # Session fixture
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture
def client(session):
    # Client fixture 
    def _get_session_override():
        return session

    app.dependency_overrides[get_session] = _get_session_override
    yield TestClient(app)
    app.dependency_overrides.clear()



# Testing each route 
def test_accounts(client, session):
       session.add_all([
        DBAccount(id=1, username="steve", email="test@gmail.com", hashed_password="1"),
        DBAccount(id=2, username="mark", email="test2@gmail.com", hashed_password="2")
    ])
       response = client.get("/accounts")
       assert response.json() == {
            "metadata": {"count": 2}, 
            "accounts": [
                {"id": 1, "username": "steve"},
                {"id": 2, "username": "mark"}
        ]
    }
       
def test_account_by_id(client, session):
        # Entity not found error 
        not_found_response = client.get("/accounts/1")
        assert not_found_response.json() == {
                "error": "entity_not_found",
                "message": "Unable to find account with id=1"
     }

        session.add_all([
        DBAccount(id=100, username="steve", email="test@gmail.com", hashed_password="1"),
        DBAccount(id=2, username="mark", email="test2@gmail.com", hashed_password="2")
    ])
        response = client.get("/accounts/100")
        assert response.json() == { "id": 100, "username": "steve"} 


def test_chat(client, session):
       session.add_all([
        DBChat(id=1, name="testName", owner_id=5),
        DBChat(id=2, name="testName2", owner_id=5),
        DBChat(id=3, name="testName3", owner_id=1)
    ])
       response = client.get("/chats")
       assert response.json() == {
       "metadata": {
            "count": 3
        },
        "chats":[
          {"id": 1, "name": "testName", "owner_id": 5},
          {"id": 2, "name": "testName2", "owner_id": 5}, 
          {"id": 3, "name": "testName3", "owner_id": 1}
        ]
       }

def test_chat_by_id(client, session):
     # Entity not found error 
     response = client.get("/chats/1")
     assert response.json() == {
                "error": "entity_not_found",
                "message": "Unable to find chat with id=1"
     }

     session.add(DBChat(id=1, name="testname", owner_id=5))
     new_response = client.get("/chats/1")

    # Regular route test
     assert new_response.json() == {
          "id": 1, "name": "testname", "owner_id":5
     }


# Entity not found error
def test_get_message_from_chat_id(client, session):
    session.add_all([DBMessage(text="hello world", account_id=1, chat_id=3)]) 
    response = client.get("/chats/100/messages")
    assert response.json() == {
         'error': 'entity_not_found',
         'message': 'Unable to find chat with id=100',
     }
    

def test_get_accounts_from_id(client, session):

    # Entity not found error
    not_found_response = client.get("/chats/1")
    assert not_found_response.json() == {
                "error": "entity_not_found",
                "message": "Unable to find chat with id=1"
     }
    session.add_all([DBAccount(id=1, username="john", email="john@gmail.com", hashed_password="1"), 
                     DBAccount(id=2, username="jane", email="jane@gmail.com", hashed_password="2"), 
                     DBAccount(id=3, username="eric", email="ericn@gmail.com", hashed_password="3")])
    session.add(DBChatMembership(account_id=1, chat_id=3))

    response = client.get("/chats/3/accounts")

    # Regular route test
    assert response.json() == { "metadata": {"count": 1}, "accounts": 
                                  [{"id": 1, "username": "john"}]
     }
     
     
       



       
       








