import os
from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

DATABASE_URL = os.getenv("database_url")

if not DATABASE_URL:
    raise ValueError("database_url not found in .env file")

url = make_url(DATABASE_URL)
if url.get_backend_name() == "postgresql" and url.get_driver_name() == "postgresql":
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

engine = create_engine(
    DATABASE_URL,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
    connect_args={"options": "-c timezone=utc"}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency that provides a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
