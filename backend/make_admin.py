# make_admin.py
from sqlalchemy import create_engine, text

# 👇 REPLACE THIS WITH YOUR EXACT DATABASE URL
# (It's the same URL inside your .env file or database.py)
DATABASE_URL = "postgresql://postgres:wealthplanner@localhost/wealth_management"

def promote_to_admin(email):
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            # 1. Check if user exists
            result = conn.execute(text("SELECT id, role FROM users WHERE email = :email"), {"email": email})
            user = result.fetchone()
            
            if not user:
                print(f"❌ User with email '{email}' not found!")
                return

            print(f"🧐 Current Role: {user.role}")

            # 2. Update to Admin
            conn.execute(text("UPDATE users SET role = 'admin' WHERE email = :email"), {"email": email})
            conn.commit()
            
            print(f"✅ SUCCESS! User '{email}' is now an ADMIN.")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    # 👇 TYPE THE EMAIL YOU WANT TO BE ADMIN HERE
    target_email = input("Enter the email to make Admin: ")
    promote_to_admin(target_email)