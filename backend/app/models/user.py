from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String) 
    hashed_password = Column(String) 

    # This connects the user to the AI agents they create
    agents = relationship("Agent", back_populates="owner")