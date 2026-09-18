#!/usr/bin/env python3
"""
create_session.py — Generate Telegram MTProto session string for SIH 2026

Run ONCE after setting TG_API_ID and TG_API_HASH in backend/.env
Output: Session string → copy to TG_SESSION_STRING in .env
"""

import asyncio
import os
import sys
from pathlib import Path

# Add backend to path for config loading
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

try:
    from telethon import TelegramClient
    from telethon.sessions import StringSession
except ImportError:
    print("❌ telethon not installed. Run: pip install telethon python-dotenv")
    sys.exit(1)

try:
    from dotenv import load_dotenv
    load_dotenv(backend_dir / ".env")
except ImportError:
    print("❌ python-dotenv not installed. Run: pip install python-dotenv")
    sys.exit(1)


async def main():
    api_id = os.getenv("TG_API_ID")
    api_hash = os.getenv("TG_API_HASH")
    
    if not api_id or not api_hash:
        print("❌ TG_API_ID and TG_API_HASH must be set in backend/.env")
        print("   Edit backend/.env and add:")
        print("   TG_API_ID=12345678")
        print("   TG_API_HASH=your_api_hash_from_my_telegram_org")
        sys.exit(1)
    
    if api_id == "12345678" or api_hash == "your_api_hash_here":
        print("❌ Please replace placeholder values in backend/.env with real credentials")
        print("   Get them from: https://my.telegram.org/apps")
        sys.exit(1)
    
    print(f"🔐 Creating session for API ID: {api_id}")
    print("📱 You'll receive a login code in your Telegram app")
    print("🔢 Enter the code when prompted")
    print()
    
    client = TelegramClient(StringSession(), int(api_id), api_hash)
    
    try:
        await client.start()
        session_string = client.session.save()
        
        print("\n" + "=" * 70)
        print("✅ SESSION STRING GENERATED — COPY THIS TO backend/.env")
        print("=" * 70)
        print(f"TG_SESSION_STRING={session_string}")
        print("=" * 70)
        print()
        print("📝 Next steps:")
        print("   1. Copy the ENTIRE string above (including TG_SESSION_STRING=)")
        print("   2. Edit backend/.env")
        print("   3. Replace: TG_SESSION_STRING=your_session_string_here")
        print("   4. Save the file")
        print()
        
        # Also show user info
        me = await client.get_me()
        print(f"👤 Logged in as: {me.first_name} {me.last_name or ''} (@{me.username or 'no username'})")
        print(f"🆔 User ID: {me.id}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
    finally:
        await client.disconnect()


if __name__ == "__main__":
    asyncio.run(main())