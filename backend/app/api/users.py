from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.database import get_db
from app.models.user import User

router = APIRouter(prefix="/users", tags=["users"])

# --- PYDANTIC SCHEMA ---
# This guarantees FastAPI knows exactly what data to expect from React
class UserCreate(BaseModel):
    email: str
    password: str
    name: str = "" # Default to empty string in case your DB doesn't require a name

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # 1. Find the user by email
    user = db.query(User).filter(User.email == form_data.username).first()
    
    # 2. FIX: Check user.hashed_password instead of user.password!
    if not user or user.hashed_password != form_data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Incorrect email or password"
        )
    
    # 3. Success!
    return {"access_token": "nexus_access_token_demo", "token_type": "bearer"}


@router.post("/register")
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # 1. Check if email exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    try:
        # 2. Try to save the user
        new_user = User(
            email=user_data.email,
            hashed_password=user_data.password,
            # If you get an error here, check if your User model actually has a 'name' column!
            name=user_data.name 
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return {"message": "User created successfully"}
    
    except Exception as e:
        # 3. If it crashes, print the EXACT error to the terminal and don't crash the server
        db.rollback()
        print(f"\n[CRITICAL DB ERROR]: {e}\n")
        raise HTTPException(status_code=500, detail="Failed to save user to the database.")