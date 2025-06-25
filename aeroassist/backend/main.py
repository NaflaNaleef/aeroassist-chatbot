from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = FastAPI(
    title="AeroAssist API",
    description="AI-powered airline assistant backend",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "https://aeroassist-chatbot-frontend.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info("AeroAssist API starting up...")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("AeroAssist API shutting down...")

@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Welcome to AeroAssist API",
        "status": "running",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "service": "AeroAssist Backend"
    }

@app.get("/test")
async def test_endpoint():
    """Test endpoint to verify backend functionality."""
    return {
        "test": "success",
        "message": "Backend is working correctly",
        "endpoints": ["/", "/health", "/test", "/docs", "/redoc"]
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    logger.info(f"Starting server on port {port}")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )