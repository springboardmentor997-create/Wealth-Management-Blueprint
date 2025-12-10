from passlib.context import CryptContext

# Define the hashing scheme used for passwords.
# 'bcrypt' is the highly recommended default due to its resistance to attacks.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# =================================================================
# 1. Password Hashing Utility
# =================================================================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain-text password against a hashed password.

    Args:
        plain_password: The password submitted by the user (e.g., from the login form).
        hashed_password: The password stored in the database.

    Returns:
        True if the plain password matches the hashed password, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hashes a plain-text password for secure storage in the database.

    Args:
        password: The plain-text password from the registration form.

    Returns:
        The securely hashed password string.
    """
    return pwd_context.hash(password)
