import pytest
from starlette.testclient import TestClient
from backend import security

from backend.main import app
from sqlmodel import Session, SQLModel, StaticPool, create_engine
from backend.database.schema import *
from backend.dependencies import get_session
from backend.routers.accounts import UpdateAccountDetails


    
def hash_password_stub(password: str) -> str:
    return password

def verify_password_stub(password: str, hashed_password: str) -> bool:
    return hash_password_stub(password) == hashed_password
    

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
    
    pytest.MonkeyPatch().setattr("backend.security.hash_password", hash_password_stub)
    pytest.MonkeyPatch().setattr("backend.security.verify_password", verify_password_stub)


    app.dependency_overrides[get_session] = _get_session_override
    yield TestClient(app)
    app.dependency_overrides.clear()

# Tests
 # 1. POST /auth/registration
def test_register_account_success(client: TestClient):
    initial_user = {"username": "juniper", "email": "juniper@email.com", "password": "password4"}
    intial_resp = client.post("/auth/registration", data=initial_user) 
    assert intial_resp.status_code == 201 # created
    assert intial_resp.json()["username"] == initial_user["username"]
    assert intial_resp.json()["email"] == initial_user["email"]

    
def test_register_account_errors(client: TestClient):
    initial_user = {"username": "juniper", "email": "juniper@email.com", "password": "password4"}
    client.post("/auth/registration", data=initial_user) 
    identical_username = {"username": initial_user["username"], "email": "myemail@gmail.com", "password": "thispassword"}
    username_resp = client.post("/auth/registration", data=identical_username) 
    assert username_resp.status_code == 422 # Unprocessable Entity

    assert username_resp.json() == {"error": "duplicate_entity_value", 
                                "message": f"Duplicate value: account with username={identical_username["username"]} already exists"}
    
    identical_email = {"username": "wizards", "email": initial_user["email"], "password": "mypassword"}
    email_resp = client.post("/auth/registration", data=identical_email) 
    assert email_resp.status_code == 422 # Unprocessable Entity
    assert email_resp.json() == {"error": "duplicate_entity_value", 
                             "message": f"Duplicate value: account with email={identical_email["email"]} already exists"}
    
    
# 2. POST /auth/token  
def test_access_toke_errors(client: TestClient):
    initial_user = {"username": "juniper", "email": "juniper@email.com", "password": "password4"}

    # No account in DB with username -> error
    response = client.post("/auth/token", data=initial_user)
    assert response.status_code == 401 # user hasn't been registered
    assert response.json() == {"error": "invalid_credentials",
                               "message": "Authentication failed: invalid username or password"}
    
    # invalid password
    client.post("/auth/registration", data=initial_user) 
    invalid_password_ = {"username": "juniper", "email": "juniper@email.com", "password": "incorrect"}
    response = client.post("/auth/token", data=invalid_password_)
    assert response.status_code == 401 
    assert response.json() == {"error": "invalid_credentials",
                               "message": "Authentication failed: invalid username or password"}
    

def test_access_token_success(client: TestClient):
                
    initial_user = {"username": "juniper", "email": "juniper@email.com", "password": "password4"}
      # register account and check token 
    client.post("/auth/registration", data=initial_user) 
    token_response = client.post("/auth/token", data=initial_user)
    assert token_response.status_code == 200
    token = token_response.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/accounts/me", headers=headers)
    assert response.status_code == 200
    assert response.json()["username"] == initial_user["username"]
    assert response.json()["email"] == initial_user["email"]


# 3 POST /auth/web/login
def test_store_JWT_as_cookie_error(client: TestClient):
    initial_user = {"username": "juniper", "email": "juniper@email.com", "password": "password4"}

    # No account in DB with username -> error
    response = client.post("/auth/web/login", data=initial_user)
    assert response.status_code == 401 
    assert response.json() == {"error": "invalid_credentials",
                               "message": "Authentication failed: invalid username or password"}
    

    # invalid password
    client.post("/auth/registration", data=initial_user) 
    invalid_password_ = {"username": "juniper", "email": "juniper@email.com", "password": "incorrect"}
    response = client.post("/auth/web/login", data=invalid_password_)
    assert response.status_code == 401 
    assert response.json() == {"error": "invalid_credentials",
                               "message": "Authentication failed: invalid username or password"}
    

def test_store_JWT_as_cookie_success(client: TestClient):
    initial_user = {"username": "juniper", "email": "juniper@email.com", "password": "password4"}

    # Register user
    client.post("/auth/registration", data=initial_user) 
    response = client.post("/auth/web/login", data=initial_user)
    assert response.status_code == 204
    

# 4 POST /auth/web/logout
def test_logout_errors_expired_and_nonexistent(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(security, "DURATION", -600)    
    # Register user
    initial_user = {"username": "juniper", "email": "juniper@email.com", "password": "password4"}
    client.post("/auth/registration", data=initial_user) 

    # Token not provided i.e never logged in 
    response = client.post("/auth/web/logout", data=initial_user) 
    assert response.status_code == 403
    assert response.json() == {"error": "authentication_required",
                               "message": "Not authenticated"}
    # login
    client.post("/auth/web/login", data=initial_user) 

    # Expired token 
    response = client.post("/auth/web/logout", data=initial_user) 
    assert response.status_code == 403
    assert response.json() == {"error": "expired_access_token",
                               "message": "Authentication failed: expired access token"}
    
    
def test_invalid_token(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    initial_user = {"username": "juniper", "email": "juniper@email.com", "password": "password4"}
    client.post("/auth/registration", data=initial_user) 
    client.post("/auth/web/login", data=initial_user) 

    client.cookies.set("pony_express_token", "invalid_token_value")

    response = client.post("/auth/web/logout", data=initial_user) 
    assert response.status_code == 403
    assert response.json() == {"error": "invalid_access_token",
                               "message": "Authentication failed: invalid access token"}
    

def test_logout_success(client: TestClient):
    initial_user = {"username": "juniper", "email": "juniper@email.com", "password": "password4"}
    client.post("/auth/registration", data=initial_user) 
    client.post("/auth/web/login", data=initial_user) 
    response = client.post("/auth/web/logout", data=initial_user) 
    assert response.status_code == 204
    assert "pony_express_token" not in client.cookies


# 5 GET /accounts/me
def test_accounts_data_authenticated_route_error(client: TestClient, monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setattr(security, "DURATION", -600)  
    initial_user = {"username": "juniper", "email": "juniper@email.com", "password": "password4"}
    client.post("/auth/registration", data=initial_user) 

    # Token not provided i.e never logged in 
    response = client.get("/accounts/me") 
    assert response.status_code == 403
    assert response.json() == {"error": "authentication_required",
                               "message": "Not authenticated"}

     # login
    client.post("/auth/web/login", data=initial_user) 
    # Expired token 
    response = client.get("/accounts/me") 
    assert response.status_code == 403
    assert response.json() == {"error": "expired_access_token",
                               "message": "Authentication failed: expired access token"}

def test_accounts_data_authenticated_route_success(client: TestClient):
    initial_user = {"username": "juniper", "email": "juniper@email.com", "password": "password4"}
    client.post("/auth/registration", data=initial_user) 
    client.post("/auth/web/login", data=initial_user) 

    response = client.get("/accounts/me") 
    assert response.status_code == 200

    assert response.json()["username"] == initial_user["username"]
    assert response.json()["email"] == initial_user["email"]


# 6 PUT /accounts/me
def test_update_account_errors(client: TestClient):
    initial_user = {"username": "juniper", "email": "juniper@email.com", "password": "password4"}
    client.post("/auth/registration", data=initial_user) 
    client.post("/auth/web/login", data=initial_user) 

    # username already exists
    same_username = {"username": "juniper", "email": "thisEmail@email.com", "password": "testPassword"}
    response = client.put("/accounts/me", json=same_username)
    assert response.status_code == 422 
    assert response.json() == {"error": "duplicate_entity_value",
                               "message": f"Duplicate value: account with username={same_username["username"]} already exists"}

    # email already exists 
    same_email = {"username": "myTestUsername", "email": "juniper@email.com", "password": "password4"}
    response = client.put("/accounts/me", json=same_email)
    assert response.status_code == 422 
    assert response.json() == {"error": "duplicate_entity_value",
                               "message": f"Duplicate value: account with email={same_email["email"]} already exists"}


def test_update_account_success(client: TestClient):
    initial_user = {"username": "juniper", "email": "juniper@email.com", "password": "password4"}
    client.post("/auth/registration", data=initial_user) 
    client.post("/auth/web/login", data=initial_user) 

    # Both values None
    empty_request = UpdateAccountDetails()
    response = client.put("/accounts/me", json=empty_request.model_dump())
    assert response.status_code == 200
    assert response.json()["username"] == initial_user["username"]
    assert response.json()["email"] == initial_user["email"]

    # None email new username
    updated_username = {"username": "newUser"}
    response = client.put("/accounts/me", json=updated_username)
    assert response.status_code == 200
    assert response.json()["username"] == updated_username["username"]
    assert response.json()["email"] == initial_user["email"]

    # None username new email (The username is updated previously so should remain newUser)
    updated_email = {"email": "newEmail"}
    response = client.put("/accounts/me", json=updated_email)
    assert response.status_code == 200
    assert response.json()["email"] == updated_email["email"]


# 7 PUT /accounts/me/password
def test_update_password_error(client: TestClient):
    initial_user = {"username": "juniper", "email": "juniper@email.com", "password": "password4"}
    client.post("/auth/registration", data=initial_user) 
    client.post("/auth/web/login", data=initial_user) 

    # Invalid password
    invalid_password_object = {"old_password": "invalid", 
                               "new_password": "new_password"}
    password_response = client.put("/accounts/me/password", data=invalid_password_object)
    assert password_response.status_code == 401
    assert password_response.json() == {"error": "invalid_credentials",
                               "message": "Authentication failed: invalid username or password"}
    

def test_update_password_success(client: TestClient):
    initial_user = {"username": "juniper", "email": "juniper@email.com", "password": "password4"}
    client.post("/auth/registration", data=initial_user) 
    client.post("/auth/web/login", data=initial_user) 

    valid_password_object = {"old_password": initial_user["password"], 
                               "new_password": "new_password"}
    response = client.put("/accounts/me/password", data=valid_password_object)
    assert response.status_code == 204

    # Login with new password 
    updated_login = {"username": "juniper", "password": "new_password"}
    new_resp = client.post("/auth/web/login", data=updated_login)
    assert new_resp.status_code == 204



# 8 DELETE /accounts/me
def test_delete_account_error(client: TestClient):
      initial_user = {"username": "juniper", "email": "juniper@email.com", "password": "password4"}
      client.post("/auth/registration", data=initial_user) 
      client.post("/auth/web/login", data=initial_user)

      account = client.get("/accounts/me").json()
      # Create chat 
      client.post("/chats", json={"name": "testName", "owner_id": account["id"]})
      response = client.delete("/accounts/me")
      assert response.status_code == 422
      assert response.json() == {"error":"chat_owner_removal",
                                 "message": "Unable to remove the owner of a chat"}
      
def test_delete_account_success(client: TestClient):
    initial_user = {"username": "juniper", "email": "juniper@email.com", "password": "password4"}
    client.post("/auth/registration", data=initial_user) 
    client.post("/auth/web/login", data=initial_user)

    response = client.delete("/accounts/me", )
    assert response.status_code == 204


# Updated routes
# 1 POST /chats
def test_create_chat_errors(client: TestClient):
    initial_user = {"username": "juniper", "email": "juniper@email.com", "password": "password4"}
    client.post("/auth/registration", data=initial_user) 
    client.post("/auth/web/login", data=initial_user)

    # Invalid request owner id for chat owner id
    response = client.post("/chats", json={"name": "test", 
                                "owner_id": 999})
    assert response.status_code == 403
    assert response.json() == {"error": "access_denied",
                    "message": "Cannot create chat on behalf of different account"
                    }
    

def test_create_chat_success(client: TestClient):
    initial_user = {"username": "juniper", "email": "juniper@email.com", "password": "password4"}
    client.post("/auth/registration", data=initial_user) 
    client.post("/auth/web/login", data=initial_user)


    # Invalid request owner id for chat owner id
    response = client.post("/chats", json={"name": "test", 
                                "owner_id": 1})
    assert response.status_code == 201
    assert response.json()["name"] == "test"







    
    

    

    


    



    

    



    
    

    

    


    



    

    