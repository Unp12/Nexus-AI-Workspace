from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# We use a local SQLite file for Phase 1. 
# For production (Render), we will change this string to a PostgreSQL URL.

SQLALCHEMY_DATABASE_URL = "sqlite:///./nexus_v3.db"

# The "engine" is the actual connection to the database.
# 'check_same_thread': False is specifically required for SQLite in FastAPI.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Each time a user makes an API request, we open a temporary "Session" to talk to the DB.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# All of our database tables will inherit from this Base class.
class Base(DeclarativeBase):
    pass


# Dependency Injection: Opens a database session for a request, and safely closes it after.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()