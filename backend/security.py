from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    safe_password = password[:72]
    return pwd_context.hash(safe_password)

def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password[:72], hashed)
