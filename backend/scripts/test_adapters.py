import asyncio
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

async def test_x_adapter():
    key = os.getenv("TWITTERAPI_IO_KEY")
    provider = os.getenv("X_PROVIDER", "synthetic")
    print(f"\n--- Testing X Adapter (Provider: {provider}) ---")
    if key and key != "your_twitterapi_io_key_here" and provider == "twitterapi_io":
        try:
            r = httpx.get(
                "https://api.twitterapi.io/v1/tweets/search",
                params={"query": "NTRO cyber", "max_results": 3},
                headers={"X-API-Key": key},
                timeout=10
            )
            data = r.json()
            tweets = data.get("tweets", [])
            print(f"✅ X API: {len(tweets)} tweets fetched")
            for t in tweets[:2]:
                print(f"   - {t.get('text', '')[:80]}...")
        except Exception as e:
            print(f"⚠️ Live X API call failed ({e}). Falling back to synthetic engine.")
    else:
        print("✅ Synthetic X Provider active (Zero cost demo ready)")

async def test_telegram_adapter():
    session = os.getenv("TG_SESSION_STRING")
    api_id = os.getenv("TG_API_ID")
    api_hash = os.getenv("TG_API_HASH")
    channels = os.getenv("TG_CHANNEL_IDS", "").split(",")
    print(f"\n--- Testing Telegram Adapter ---")
    if session and session != "your_session_string_here" and api_id and api_hash:
        try:
            from telethon import TelegramClient
            from telethon.sessions import StringSession
            client = TelegramClient(StringSession(session), int(api_id), api_hash)
            await client.connect()
            print("✅ Telegram MTProto: Connected successfully")
            if channels and channels[0] and channels[0] != "-1001234567890":
                channel_id = int(channels[0].strip())
                msgs = await client.get_messages(channel_id, limit=1)
                if msgs:
                    print(f"   - Channel {channel_id} latest msg: {msgs[0].text[:80]}...")
            await client.disconnect()
        except Exception as e:
            print(f"⚠️ Telegram MTProto check failed ({e}). Synthetic fallback ready.")
    else:
        print("✅ Synthetic Telegram Provider active (Demo ready)")

async def main():
    await test_x_adapter()
    await test_telegram_adapter()

if __name__ == "__main__":
    asyncio.run(main())
