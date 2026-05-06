from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    system_prompt = Column(String)
    
    # This is the missing link causing your error!
    owner_id = Column(Integer, ForeignKey("users.id"))

    # This allows us to access the user object from an agent easily
    owner = relationship("User", back_populates="agents")