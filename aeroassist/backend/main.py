from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = FastAPI(
    title="AeroAssist API",
    description="AI-powered airline assistant backend",
    version="1.0.0"
)

# Configure CORS - we'll update this after deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        # Add your production frontend URL here after deployment
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Welcome to AeroAssist API",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AeroAssist Backend"
    }

@app.get("/test")
async def test_endpoint():
    return {
        "test": "success",
        "message": "Backend is working correctly",
        "endpoints": ["/", "/health", "/test", "/docs"]
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )