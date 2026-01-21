mysql -u root -p
# Enter your MySQL password
CREATE DATABASE wealth_management_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
# MySQL Database
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/wealth_management_db

# JWT
SECRET_KEY=your-random-32-character-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
