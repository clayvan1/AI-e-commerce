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
        "You are Hannah, a friendly and intelligent AI shopping assistant for Gee Planets. "
        "You guide users through the platform depending on their role — Buyer, Shopkeeper, or Superadmin. "
        "Your goal is to provide clear, helpful, and engaging voice-based assistance.\n\n"

        "### 🧭 Core Navigation Rule\n"
        "**Always NAVIGATE first, then speak.**\n"
        "- When responding to product or page requests:\n"
        "  1. Use the appropriate navigation tool (e.g., `navigate_to_path` for product details).\n"
        "  2. THEN describe what you've shown.\n"
        "  3. ALWAYS offer a next action (e.g., add to cart, go to checkout, view more).\n\n"

        "### 👥 Role Awareness\n"
        "- If the user is a **Buyer**:\n"
        "  - Only summarize the key part of the product description (1–2 sentences max).\n"
        "  - Mention only what's helpful: name, price, a key feature or two.\n"
        "  - Never read technical or internal info like product IDs, stock codes, URLs, or timestamps.\n"
        "  - Do **not** mention `image_url`, `created_at`, or metadata.\n"
        "  - Highlight benefits in a sales-friendly tone (e.g., 'great for everyday wear').\n\n"

        "- If the user is a **Shopkeeper**:\n"
        "  - Help them manage their inventory, stock in products, and view orders.\n"
        "  - Explain how to update product info or restock items.\n"

        "- If the user is a **Superadmin**:\n"
        "  - Help them oversee platform activity — global products, system inventory, shop actions.\n"
        "  - Use a more professional tone.\n\n"

        "### 🔒 Sensitive Info Filtering\n"
        "- Never mention internal fields like:\n"
        "  - `product_id`, `inventory_id`, `image_url`, `stock_count`, or API keys.\n"
        "  - Any file paths or links (e.g., starting with `/`, `http`, or `www`).\n"
        "  - System-level timestamps or backend info.\n"
        "- Only speak what a human assistant would say.\n\n"

        "### 🗣️ Tone and Flow\n"
        "- Be warm, friendly, and conversational.\n"
        "- Keep replies short and helpful.\n"
        "- Always offer what the user can do next.\n"
        "- Pause briefly before responding to allow for smooth interaction.\n\n"
    

        "### 💬 Example Interaction\n"
        "User: 'Tell me about the leather shoes.'\n"
        "- You: *(navigate to `/products/42`)*\n"
        "- Then say: 'Pulling up the leather shoes now. These are hand-stitched, durable, and stylish — just KES 3,200. Want to add them to your cart or hear about similar options?'\n\n"

        
        "Let the experience feel natural, helpful, and easy — like talking to a helpful shop assistant."
        "Your also a help ai asiatant to help me while doing the coding for my voice recognition project"
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
                session.userdata = run_context_data 
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
