"""AeroAssist Backend - Complete consolidated FastAPI application."""

import logging
import uuid
import os
from datetime import datetime
from typing import List, Optional, Dict, Any
from contextlib import asynccontextmanager
import json

from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine, text, Column, String, DateTime, Text, Integer, func, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.exc import OperationalError
from pydantic import BaseModel
from jose import JWTError, jwt
from supabase import create_client, Client
import openai
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# CONFIGURATION
# ============================================================================

# OpenAI Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Database Configuration - Use Supabase PostgreSQL
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    # Construct from Supabase URL if not provided
    supabase_url = SUPABASE_URL
    if supabase_url:
        # Extract project ref from URL
        project_ref = supabase_url.split('//')[1].split('.')[0]
        # Use the service role key as password for direct database access
        if SUPABASE_SERVICE_ROLE_KEY:
            # Use the correct Supabase connection format
            DATABASE_URL = f"postgresql://postgres:{SUPABASE_SERVICE_ROLE_KEY}@db.{project_ref}.supabase.co:5432/postgres"
        else:
            logger.warning("SUPABASE_SERVICE_ROLE_KEY not set - cannot construct DATABASE_URL")
            DATABASE_URL = None

# Server Configuration
PORT = int(os.getenv("PORT", 8000))

# CORS Configuration
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://aeroassist-chatbot-frontend.onrender.com"
]

# ============================================================================
# OPENAI CLIENT INITIALIZATION
# ============================================================================

# Initialize OpenAI client
openai_client = None
try:
    from openai import OpenAI
    if OPENAI_API_KEY:
        openai_client = OpenAI(api_key=OPENAI_API_KEY)
        logger.info("OpenAI client initialized successfully")
    else:
        logger.warning("OPENAI_API_KEY not set - OpenAI client not initialized")
except Exception as e:
    logger.error(f"Failed to initialize OpenAI client: {e}")
    openai_client = None

# ============================================================================
# DATABASE MODELS
# ============================================================================

Base = declarative_base()

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())
    
    # Relationship
    messages = relationship("ChatMessage", back_populates="session")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("chat_sessions.id"), nullable=False, index=True)
    role = Column(String, nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    
    # Relationship
    session = relationship("ChatSession", back_populates="messages")

# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class ChatMessageRequest(BaseModel):
    role: str
    content: str
    timestamp: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessageRequest]] = []
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    timestamp: str
    session_id: str
    tokens_used: int

class User(BaseModel):
    id: str
    email: str
    role: str = "user"

# ============================================================================
# DATABASE SETUP
# ============================================================================

# Create engine with error handling
engine = None
SessionLocal = None

try:
    if DATABASE_URL:
        logger.info("Attempting to connect to database...")
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            pool_recycle=300,
            echo=False  # Set to True for SQL debugging
        )
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        
        # Test connection and create tables
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            logger.info("Database connection test successful")
            
            # Create tables
            Base.metadata.create_all(bind=engine)
            logger.info("Database tables created/verified successfully")
    else:
        logger.warning("DATABASE_URL not configured - running without database")
        
except Exception as e:
    logger.error(f"Database connection failed: {e}")
    logger.warning("Running without database - chat will work but messages won't be stored")
    engine = None
    SessionLocal = None

def get_db():
    """Database session dependency."""
    if SessionLocal is None:
        # Return a mock database session that does nothing
        class MockDB:
            def add(self, obj): pass
            def commit(self): pass
            def rollback(self): pass
            def close(self): pass
            def query(self, model): 
                class MockQuery:
                    def filter(self, *args): return self
                    def first(self): return None
                    def all(self): return []
                    def count(self): return 0
                    def order_by(self, *args): return self
                return MockQuery()
        return MockDB()
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ============================================================================
# AUTHENTICATION
# ============================================================================

# Initialize Supabase client with error handling
supabase: Client = None

# Debug environment variables
logger.info(f"SUPABASE_URL configured: {'Yes' if SUPABASE_URL else 'No'}")
logger.info(f"SUPABASE_SERVICE_ROLE_KEY configured: {'Yes' if SUPABASE_SERVICE_ROLE_KEY else 'No'}")
if SUPABASE_URL:
    logger.info(f"SUPABASE_URL: {SUPABASE_URL[:20]}...")
if SUPABASE_SERVICE_ROLE_KEY:
    logger.info(f"SUPABASE_SERVICE_ROLE_KEY: {SUPABASE_SERVICE_ROLE_KEY[:20]}...")

try:
    if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        logger.info("Supabase client initialized successfully")
    else:
        logger.warning("Supabase credentials not configured - authentication will fail")
        logger.warning("Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables")
except Exception as e:
    logger.error(f"Failed to initialize Supabase client: {e}")
    supabase = None

# Security
security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Verify JWT token and return user information."""
    try:
        token = credentials.credentials
        
        # Debug logging
        logger.info(f"Received token length: {len(token) if token else 0}")
        logger.info(f"Token starts with: {token[:20] if token else 'None'}...")
        
        if not supabase:
            logger.error("Supabase client not initialized")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Authentication service not available"
            )
        
        # Get user directly from Supabase (more reliable)
        try:
            logger.info("Attempting to verify token with Supabase...")
            user_response = supabase.auth.get_user(token)
            user_data = user_response.user
            
            if not user_data:
                logger.error("Supabase returned no user data")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid user credentials"
                )
            
            logger.info(f"Successfully verified user: {user_data.email}")
            return User(
                id=user_data.id,
                email=user_data.email,
                role=getattr(user_data, 'role', 'user')
            )
            
        except Exception as e:
            logger.error(f"Supabase user verification failed: {str(e)}")
            logger.error(f"Error type: {type(e).__name__}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user credentials"
            )
            
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        logger.error(f"Error type: {type(e).__name__}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# ============================================================================
# SESSION MANAGEMENT
# ============================================================================

def get_or_create_session(user_id: str, session_id: Optional[str], db: Session) -> str:
    """Get existing session or create new one."""
    # If database is not available, generate a simple session ID
    if SessionLocal is None:
        if session_id:
            return session_id
        else:
            return str(uuid.uuid4())
    
    if session_id:
        # Check if session exists and belongs to user
        session = db.query(ChatSession).filter(
            ChatSession.id == session_id,
            ChatSession.user_id == user_id
        ).first()
        if session:
            # Update last activity
            session.updated_at = datetime.now()
            db.commit()
            return session_id
    
    # Create new session
    new_session = ChatSession(user_id=user_id)
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session.id

# ============================================================================
# AI PROCESSING
# ============================================================================

def process_with_openai(messages: List[Dict[str, str]], user_message: str) -> Dict[str, Any]:
    """Process message with OpenAI and return response with token usage."""
    try:
        # Simple system prompt
        system_prompt = "You are AeroAssist, a helpful airline assistant. Help users with flight information, bookings, and travel questions."

        # Build conversation context
        conversation_messages = [{"role": "system", "content": system_prompt}]
        conversation_messages.extend(messages)
        conversation_messages.append({"role": "user", "content": user_message})
        
        logger.info(f"Processing chat request with {len(conversation_messages)} messages in context")
        
        # Use the Responses API
        if not openai_client:
            raise Exception("OpenAI client not initialized")
            
        response = openai_client.responses.create(
            model="gpt-4o-mini",
            input=conversation_messages,
            instructions="You are AeroAssist, a helpful airline assistant. Help users with flight information, bookings, and travel questions.",
            temperature=0.7,
        )
        
        # Extract the response text
        final_text = ""
        if hasattr(response, 'output_text') and response.output_text:
            final_text = response.output_text
        else:
            for output in response.output:
                if output.type == "message":
                    for content in output.content:
                        if content.type == "output_text":
                            final_text += content.text
        
        logger.info("Successfully used Responses API")
        return {
            'reply': final_text.strip(),
            'tokens_used': getattr(response.usage, 'total_tokens', 0) if hasattr(response, 'usage') else 0
        }
        
    except Exception as e:
        logger.error(f"OpenAI processing error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI processing error: {str(e)}")

# ============================================================================
# ROUTES
# ============================================================================

router = APIRouter()

@router.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Welcome to AeroAssist API",
        "status": "running",
        "version": "2.0.0",
        "docs_url": "/docs"
    }

@router.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "service": "AeroAssist Backend",
        "timestamp": datetime.now().isoformat()
    }

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    user: User = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Simple chat endpoint with authentication and session management."""
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message is required.")

    try:
        # 1. Session Management
        session_id = get_or_create_session(user.id, request.session_id, db)
        logger.info(f"Session created/retrieved: {session_id}")
        
        # 2. Get existing conversation from session
        conversation = []
        if SessionLocal is not None:
            try:
                messages = db.query(ChatMessage).filter(
                    ChatMessage.session_id == session_id
                ).order_by(ChatMessage.id).all()
                
                for msg in messages:
                    conversation.append({
                        "role": msg.role,
                        "content": msg.content
                    })
                logger.info(f"Loaded existing conversation with {len(conversation)} messages")
            except Exception as e:
                logger.warning(f"Failed to load conversation from session: {e}")
        
        # 3. Save user message to database
        if SessionLocal is not None:
            user_message = ChatMessage(
                session_id=session_id,
                role="user",
                content=request.message
            )
            db.add(user_message)
            db.commit()
            logger.info(f"User message saved to database")
        
        # 4. AI Processing (use conversation history for context)
        conversation_for_ai = []
        if request.conversation_history:
            for msg in request.conversation_history:
                conversation_for_ai.append({
                    "role": msg.role,
                    "content": msg.content
                })
        
        ai_response = process_with_openai(conversation_for_ai, request.message)
        logger.info(f"AI response generated successfully")
        
        # 5. Save AI response to database
        if SessionLocal is not None:
            ai_message = ChatMessage(
                session_id=session_id,
                role="assistant",
                content=ai_response['reply']
            )
            db.add(ai_message)
            db.commit()
            logger.info(f"AI response saved to database")
        else:
            logger.info(f"Chat processed successfully - User: {user.id}, Session: {session_id} (no database)")
        
        return ChatResponse(
            reply=ai_response['reply'],
            timestamp=datetime.now().isoformat(),
            session_id=str(session_id),
            tokens_used=ai_response['tokens_used']
        )
        
    except Exception as e:
        if SessionLocal is not None:
            try:
                db.rollback()
            except:
                pass
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat processing error: {str(e)}")

@router.get("/sessions/{user_id}")
async def get_user_sessions(
    user_id: str,
    user: User = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Get all chat sessions for a user."""
    if user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # If database is not available, return empty sessions
    if SessionLocal is None:
        return {"sessions": []}
    
    try:
        sessions = db.query(ChatSession).filter(
            ChatSession.user_id == user_id
        ).order_by(ChatSession.updated_at.desc()).all()
        
        return {
            "sessions": [
                {
                    "id": session.id,
                    "created_at": session.created_at.isoformat(),
                    "updated_at": session.updated_at.isoformat(),
                    "message_count": db.query(ChatMessage).filter(
                        ChatMessage.session_id == session.id
                    ).count()
                }
                for session in sessions
            ]
        }
    except Exception as e:
        logger.error(f"Error fetching sessions: {e}")
        return {"sessions": []}

@router.get("/conversation/{session_id}")
async def get_conversation(
    session_id: str,
    user: User = Depends(verify_token),
    db: Session = Depends(get_db)
):
    """Get complete conversation for a session."""
    if SessionLocal is None:
        return {"conversation": []}
    
    try:
        session = db.query(ChatSession).filter(
            ChatSession.id == session_id,
            ChatSession.user_id == user.id
        ).first()
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        messages = db.query(ChatMessage).filter(
            ChatMessage.session_id == session_id
        ).order_by(ChatMessage.id).all()
        
        conversation = []
        for msg in messages:
            conversation.append({
                "role": msg.role,
                "content": msg.content,
                "timestamp": msg.id  # Using ID as timestamp since we don't have a timestamp column
            })
        
        return {"conversation": conversation}
        
    except Exception as e:
        logger.error(f"Error fetching conversation: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch conversation")

@router.get("/debug/auth")
async def debug_auth():
    """Debug endpoint to check authentication configuration."""
    return {
        "supabase_configured": supabase is not None,
        "supabase_url_configured": bool(SUPABASE_URL),
        "supabase_key_configured": bool(SUPABASE_SERVICE_ROLE_KEY),
        "openai_configured": bool(OPENAI_API_KEY),
        "database_configured": SessionLocal is not None,
        "timestamp": datetime.now().isoformat()
    }

@router.get("/debug/env")
async def debug_env():
    """Debug endpoint to check environment variables (without sensitive data)."""
    return {
        "supabase_url_length": len(SUPABASE_URL) if SUPABASE_URL else 0,
        "supabase_key_length": len(SUPABASE_SERVICE_ROLE_KEY) if SUPABASE_SERVICE_ROLE_KEY else 0,
        "openai_key_length": len(OPENAI_API_KEY) if OPENAI_API_KEY else 0,
        "database_url_configured": bool(DATABASE_URL),
        "timestamp": datetime.now().isoformat()
    }

# ============================================================================
# APPLICATION SETUP
# ============================================================================

@asynccontextmanager
async def lifespan(app):
    """Application lifespan manager."""
    logger.info("AeroAssist API starting up...")
    
    # Test database connection
    try:
        if engine:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Database connection successful")
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
    
    yield
    logger.info("AeroAssist API shutting down...")

# Create FastAPI app
app = FastAPI(
    title="AeroAssist API",
    description="AI-powered airline assistant backend",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router)

if __name__ == "__main__":
    logger.info(f"Starting AeroAssist API on port {PORT}")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=PORT,
        reload=True,
        log_level="info"
    )