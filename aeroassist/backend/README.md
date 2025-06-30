# AeroAssist Backend v2.0

A clean, simple AI-powered airline assistant backend with authentication and session management.

## 🚀 Features

### ✅ Authentication
- **JWT Token Verification** - Secure user authentication
- **Supabase Integration** - User management and verification

### ✅ Session Management
- **Session Creation** - Automatic session creation for new conversations
- **Session Continuity** - Resume existing conversations

### ✅ Database Storage
- **SQLAlchemy ORM** - Robust database operations
- **Message Storage** - Store all chat messages
- **Session Tracking** - Track conversation sessions

### ✅ AI Processing
- **OpenAI Integration** - GPT-4 powered responses
- **Simple System Prompt** - Focused airline assistance
- **Token Tracking** - Monitor API usage
- **Context Management** - Maintain conversation context

## 📋 API Endpoints

### Authentication Required Endpoints

#### `POST /chat`
Main chat endpoint:
- **Authentication** - JWT token required
- **Session Management** - Creates/continues sessions
- **AI Processing** - OpenAI integration
- **Database Storage** - Saves messages

**Request:**
```json
{
  "message": "I need to book a flight to New York",
  "conversation_history": [],
  "session_id": "optional-existing-session-id"
}
```

**Response:**
```json
{
  "reply": "I'd be happy to help you book a flight to New York...",
  "timestamp": "2024-01-15T10:30:00Z",
  "session_id": "session-uuid",
  "tokens_used": 150
}
```

#### `GET /sessions/{user_id}`
Get all chat sessions for a user:
- **Authentication** - JWT token required
- **User Validation** - Only own sessions accessible
- **Session List** - Returns all sessions

### Public Endpoints

#### `GET /`
API information and status

#### `GET /health`
Health check endpoint

## 🛠️ Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Environment Variables
Create a `.env` file with:
```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# JWT Configuration
JWT_SECRET_KEY=your_jwt_secret_key_here

# Database Configuration
DATABASE_URL=sqlite:///./aeroassist.db

# Server Configuration
PORT=8000
```

### 3. Database Setup
The application automatically creates tables on startup.

### 4. Start the Server
```bash
python main.py
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Supabase Integration** - Enterprise-grade user management
- **Input Validation** - Pydantic model validation
- **Error Handling** - Comprehensive error management
- **Database Security** - SQL injection protection

## 📈 Monitoring

- **Health Checks** - `/health` endpoint
- **Logging** - Comprehensive application logging
- **Error Tracking** - Detailed error logging
- **Performance Monitoring** - Token usage and response times

## 🚀 Deployment

The backend is ready for production deployment with:
- **Docker Support** - Containerized deployment
- **Environment Configuration** - Flexible configuration
- **Database Migration** - Alembic support

## 📝 API Documentation

Visit `/docs` for interactive API documentation (Swagger UI)
Visit `/redoc` for alternative API documentation

```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn main:app --reload --port 8000

# API will be available at: http://localhost:8000
# API docs at: http://localhost:8000/docs