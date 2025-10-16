"""Dependencies for the backend API.

Args:
    engine (sqlachemy.engine.Engine): The database engine
"""

from sqlmodel import Session, SQLModel, create_engine
from fastapi import Depends
from typing import Annotated

from backend.database.schema import *
import os


if os.getenv("RENDER") == "true":
    _db_url = os.environ["DATABASE_URL"]
    engine = create_engine(_db_url, echo=True)
else:
    _db_filename = "backend/database/development.db"
    _db_url = f"sqlite:///{_db_filename}"
    engine = create_engine(_db_url, echo=True, connect_args={"check_same_thread": False})



def create_db_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

# Create the type alias for our session
DBSession = Annotated[Session, Depends(get_session)]
