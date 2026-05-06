from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.db.database import Base

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"))
    # 'role' will be either 'user' or 'model'
    role = Column(String, nullable=False) 
    content = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())