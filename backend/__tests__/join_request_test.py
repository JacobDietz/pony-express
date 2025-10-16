import pytest
from starlette.testclient import TestClient

from sqlmodel import Session, SQLModel, StaticPool, create_engine
from backend.main import app
from backend.database.schema import *
from backend.dependencies import get_session

"""
Note: These are authenticated tests -> users must be logged in 
"""


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




# testing /requests/create/{chat_id}
    # Valid requests
def test_send_request_success(client: TestClient):
    pass

    # Invalid requests
def test_send_request_user_not_logged_in(client: TestClient):
    
    #initial_user = {"username": "juniper", "email": "juniper@email.com", "password": "password4"}
    #second_user = {"username": "apple", "email": "apple@email.com", "password": "password4"}
    chat_id = 1
    resp = client.post(f"/requests/create/{chat_id}").json()
    assert resp.status_code == 403
    

     
    
def test_request_already_sent(client: TestClient):
    pass

def test_user_already_chat_member(client: TestClient):
    pass






