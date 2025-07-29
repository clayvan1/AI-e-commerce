# agent.py — LiveKit Assistant Agent for Gee Planets

from dotenv import load_dotenv
import json
import os
import asyncio
import traceback
from custom_turn_detector import CustomTurnDetector
from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import openai, deepgram, noise_cancellation, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

# Load environment variables
load_dotenv()

# --- Import Custom Business Logic Tools ---
from product_tools import (
    get_all_products,
    get_global_inventory,
    stock_in_product,
    get_my_inventory,
    update_shop_product,
    delete_shop_product,
    get_global_products_admin,
)

from ordertool import (
    create_order,
    get_orders,
    update_order_status,
)


from navigation_tools import (
    navigate_to_home,
    navigate_to_checkout,
    navigate_to_cart,
    navigate_to_agent_page,
    navigate_to_new_arrivals,
    navigate_to_offers,
    navigate_to_trending_products,
    navigate_to_path,
    send_add_to_cart_event,         # ✅ NEW TOOL
    set_agent_room_participant,
)

# Combine all tools into a single list for the agent
all_tools = [
    # Product Tools
    get_all_products, get_global_inventory, stock_in_product, get_my_inventory,
    update_shop_product, delete_shop_product, get_global_products_admin,

    # Order Tools
    create_order, get_orders, update_order_status,

    # Navigation Tools
    navigate_to_home, navigate_to_checkout, navigate_to_cart, navigate_to_agent_page,
    navigate_to_new_arrivals, navigate_to_offers, navigate_to_trending_products,
    navigate_to_path,

    # ✅ Add-to-Cart Tool
    send_add_to_cart_event,
]


# --- Agent Definition ---
class Assistant(Agent):
    def __init__(self):
        super().__init__(
            instructions=(
                "You are Hannah, an advanced AI shopping assistant for Gee Planets. "
                "Your goal is to guide users visually and conversationally depending on their role (Buyer, Shopkeeper, Superadmin). "
                "Always be friendly and concise.\n\n"

                "**Core Rule: NAVIGATE FIRST, THEN TALK.**\n"
                "When responding to product or page requests:\n"
                "1. Navigate using the appropriate tool (e.g., `Maps_to_path` for product details).\n"
                "2. THEN describe what you've shown.\n"
                "3. ALWAYS propose a next action (e.g., add to cart, go to checkout).\n\n"

                "**Example:**\n"
                "User: 'Tell me about the leather shoes.'\n"
                "- You: *(navigate to `/products/42`)*\n"
                "- Then say: 'Pulling up the leather shoes now. These are hand-stitched and available in 3 colors... Would you like to order them or see more like this?'"
            ),
            tools=all_tools,
        )


# --- Agent Job Entrypoint ---
async def entrypoint(ctx: agents.JobContext):
    agent_id = os.getenv('LIVEKIT_AGENT_ID', 'Agent')
    print(f"[{agent_id}] Job started for room: {ctx.room.name}")

    try:
        await ctx.connect()
        print(f"[{agent_id}] Connected to room: {ctx.room.name}")

        # ✅ Create agent session FAST
        session = AgentSession(
            stt=deepgram.STT(model="nova-3", language="multi"),
            llm=openai.LLM(model="gpt-4o-mini"),
            tts=openai.TTS(),
            vad=silero.VAD.load(),
            turn_detection=CustomTurnDetector(),

        )

        # ✅ Start session QUICKLY
        await session.start(
            room=ctx.room,
            agent=Assistant(),
            room_input_options=RoomInputOptions(
                noise_cancellation=noise_cancellation.BVC()
            ),
        )

        # ✅ After session start, then wait for participant and do slow stuff
        participant = await ctx.wait_for_participant()
        set_agent_room_participant(ctx.room.local_participant)

        # Parse metadata (slow)
        run_context_data = {}
        if participant.metadata:
            try:
                metadata = json.loads(participant.metadata)
                run_context_data = {
                    "role": metadata.get("role"),
                    "username": metadata.get("username"),
                    "userAuthToken": metadata.get("userAuthToken"),
                }
                print(f"[{agent_id}] Received context: {run_context_data}")
            except Exception as e:
                print(f"[{agent_id}] Failed to parse metadata: {e}")

        # Greet the user AFTER everything else
        username = run_context_data.get("username", "there")
        role = run_context_data.get("role", "guest")
        greeting = {
            "buyer": f"Hey {username}, welcome to Gee Planets! Looking for something special?",
            "shopkeeper": f"Hello {username}, ready to manage your inventory or view orders?",
            "superadmin": f"Welcome, Superadmin {username}. How can I assist with oversight today?",
        }.get(role.lower(), f"Hey {username}, welcome to Gee Planets! How can I help you today?")

        await asyncio.sleep(1)
        await session.say(greeting, allow_interruptions=False)

    except Exception as e:
        print(f"[{agent_id}] ERROR in entrypoint: {e}")
        traceback.print_exc()
    finally:
        print(f"[{agent_id}] Cleaning up for room: {ctx.room.name}")
        

# --- CLI Startup ---
if __name__ == "__main__":
    print("[Agent Worker] Launching agent worker...")
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))
