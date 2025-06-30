import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text, inspect

load_dotenv()

# Get database URL
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
        project_ref = SUPABASE_URL.split('//')[1].split('.')[0]
        DATABASE_URL = f"postgresql://postgres:{SUPABASE_SERVICE_ROLE_KEY}@db.{project_ref}.supabase.co:5432/postgres"

if DATABASE_URL:
    try:
        engine = create_engine(DATABASE_URL)
        inspector = inspect(engine)
        
        print("=== Database Schema Check ===")
        
        # Check if tables exist
        tables = inspector.get_table_names()
        print(f"Available tables: {tables}")
        
        # Check chat_sessions table structure
        if 'chat_sessions' in tables:
            print("\n=== chat_sessions table structure ===")
            columns = inspector.get_columns('chat_sessions')
            for col in columns:
                print(f"  {col['name']}: {col['type']}")
        
        # Check chat_messages table structure
        if 'chat_messages' in tables:
            print("\n=== chat_messages table structure ===")
            columns = inspector.get_columns('chat_messages')
            for col in columns:
                print(f"  {col['name']}: {col['type']}")
        
        # Check if there are any data in the tables
        with engine.connect() as conn:
            # Check chat_sessions
            result = conn.execute(text("SELECT COUNT(*) FROM chat_sessions"))
            session_count = result.scalar()
            print(f"\nchat_sessions count: {session_count}")
            
            # Check chat_messages
            result = conn.execute(text("SELECT COUNT(*) FROM chat_messages"))
            message_count = result.scalar()
            print(f"chat_messages count: {message_count}")
            
            # Show recent messages
            if message_count > 0:
                result = conn.execute(text("SELECT * FROM chat_messages ORDER BY id DESC LIMIT 5"))
                print("\nRecent messages:")
                for row in result:
                    print(f"  {row}")
                    
    except Exception as e:
        print(f"Error: {e}")
else:
    print("No DATABASE_URL available") 