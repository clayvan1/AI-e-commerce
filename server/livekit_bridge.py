import os
import json
import asyncio
import eventlet
from livekit import rtc

# Global reference for the LiveKit Room
global_lk_room = None

async def _connect_and_listen_livekit(room_name: str, participant_identity: str):
    global global_lk_room

    if global_lk_room and global_lk_room.isconnected:
        print("[LiveKit Bridge] Already connected.")
        return

    LIVEKIT_URL = os.getenv("LIVEKIT_URL")
    LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
    LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")

    if not all([LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET]):
        print("[LiveKit Bridge Error] Missing env vars.")
        return

    from livekit.api import AccessToken, VideoGrants

    try:
        token = AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET) \
            .with_identity(participant_identity) \
            .with_name(participant_identity) \
            .with_grants(VideoGrants(
                room_join=True,
                room=room_name,
                can_publish=False,
                can_subscribe=True,
                can_publish_data=True,  # ✅ Allow this agent to publish data
            ))
        lk_token = token.to_jwt()
        print(f"[LiveKit Bridge] Token generated for {participant_identity}")
    except Exception as e:
        print(f"[LiveKit Bridge Error] Token generation failed: {e}")
        import traceback; traceback.print_exc()
        return

    global_lk_room = rtc.Room()

    @global_lk_room.on("connected")
    def on_connected():
        print(f"[LiveKit Bridge] Connected to {room_name}")

    @global_lk_room.on("disconnected")
    def on_disconnected():
        global global_lk_room
        print(f"[LiveKit Bridge] Disconnected from {room_name}")
        global_lk_room = None

    @global_lk_room.on("data_received")
    async def on_data_received(packet: rtc.DataPacket):
        try:
            data_str = packet.data.decode("utf-8")
            print(f"[LiveKit Bridge] Data from '{packet.participant.identity}' on topic '{packet.topic}': {data_str}")
            
            # Echo the packet to the whole room (including sender)
            await global_lk_room.local_participant.publish_data(
                data=data_str.encode("utf-8"),
                topic=packet.topic,
                reliable=True
            )

        except Exception as e:
            print(f"[LiveKit Bridge Error] Failed to handle data: {e}")
            import traceback; traceback.print_exc()

    try:
        print(f"[LiveKit Bridge] Connecting to LiveKit at {LIVEKIT_URL} in room {room_name}")
        await global_lk_room.connect(LIVEKIT_URL, lk_token, rtc.RoomOptions(
            auto_subscribe=True,
            dynacast=True,
        ))
        await asyncio.Event().wait()
    except Exception as e:
        print(f"[LiveKit Bridge Error] Connection failed: {e}")
        import traceback; traceback.print_exc()
    finally:
        if global_lk_room and global_lk_room.isconnected:
            print("[LiveKit Bridge] Disconnecting...")
            await global_lk_room.disconnect()
        global_lk_room = None


def _run_async_in_eventlet_background(coroutine, *args, **kwargs):
    print(f"[LiveKit Bridge Debug] Running coroutine '{coroutine.__name__}' in Eventlet background.")
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(coroutine(*args, **kwargs))
    except Exception as e:
        print(f"[LiveKit Bridge Error] Coroutine '{coroutine.__name__}' crashed: {e}")
        import traceback; traceback.print_exc()
    finally:
        if loop and not loop.is_running():
            loop.close()
        asyncio.set_event_loop(None)


def start_livekit_listener_background(room_name: str, participant_identity: str):
    print("[LiveKit Bridge] Waiting 3 minutes before starting listener...")

    def delayed_start():
        import time
        time.sleep(10)  # Wait 3 minutes
        print("[LiveKit Bridge] 3 minutes passed — starting LiveKit listener.")
        _run_async_in_eventlet_background(_connect_and_listen_livekit, room_name, participant_identity)

    eventlet.spawn_n(delayed_start)
