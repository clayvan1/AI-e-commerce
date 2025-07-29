# navigation_tools.py
import asyncio
import json
from livekit.agents.llm import function_tool
from livekit.agents import RunContext

# This reference must be set by your agent runner (agent.py)
_current_agent_room_participant = None

def set_agent_room_participant(participant_ref):
    global _current_agent_room_participant
    _current_agent_room_participant = participant_ref
    print("[Navigation Tools] Agent room participant reference set.")

async def _send_navigation_data_channel_message(event_name: str, path: str = None, extra_payload: dict = None) -> bool:
    if not _current_agent_room_participant:
        print("[Navigation Tools ERROR] Agent room participant is not set.")
        return False

    payload = {"event": event_name}
    if path:
        payload["path"] = path
    if extra_payload:
        payload.update(extra_payload)

    try:
        data_message = json.dumps(payload).encode('utf-8')
        await _current_agent_room_participant.publish_data(
            payload=data_message,
            topic="navigation_command"
        )
        print(f"[Navigation Tools] Sent LiveKit data message: {payload}")
        return True
    except Exception as e:
        print(f"[Navigation Tools ERROR] {type(e).__name__}: {e}")
        return False


# === Navigation Tools ===

@function_tool(
    raw_schema={
        "name": "Maps_to_home",
        "description": "Navigates the user to the home page.",
        "parameters": {"type": "object", "properties": {}, "required": []}
    }
)
async def navigate_to_home(context: RunContext, raw_arguments: dict) -> str:
    success = await _send_navigation_data_channel_message("go_home")
    return "Navigated to the home page." if success else "Failed to navigate to home."


@function_tool(
    raw_schema={
        "name": "Maps_to_checkout",
        "description": "Navigates the user to the checkout page.",
        "parameters": {"type": "object", "properties": {}, "required": []}
    }
)
async def navigate_to_checkout(context: RunContext, raw_arguments: dict) -> str:
    success = await _send_navigation_data_channel_message("go_checkout")
    return "Navigated to the checkout page." if success else "Failed to navigate to checkout."


@function_tool(
    raw_schema={
        "name": "Maps_to_cart",
        "description": "Navigates the user to the cart page.",
        "parameters": {"type": "object", "properties": {}, "required": []}
    }
)
async def navigate_to_cart(context: RunContext, raw_arguments: dict) -> str:
    success = await _send_navigation_data_channel_message("go_cart")
    return "Navigated to the cart page." if success else "Failed to navigate to cart."


@function_tool(
    raw_schema={
        "name": "Maps_to_agent_page",
        "description": "Navigates the user to the agent page.",
        "parameters": {"type": "object", "properties": {}, "required": []}
    }
)
async def navigate_to_agent_page(context: RunContext, raw_arguments: dict) -> str:
    success = await _send_navigation_data_channel_message("go_agent")
    return "Navigated to the agent page." if success else "Failed to navigate to agent page."


@function_tool(
    raw_schema={
        "name": "Maps_to_new_arrivals",
        "description": "Navigates to the new arrivals page.",
        "parameters": {"type": "object", "properties": {}, "required": []}
    }
)
async def navigate_to_new_arrivals(context: RunContext, raw_arguments: dict) -> str:
    success = await _send_navigation_data_channel_message("go_new_arrivals")
    return "Navigated to new arrivals." if success else "Failed to navigate to new arrivals."


@function_tool(
    raw_schema={
        "name": "Maps_to_offers",
        "description": "Navigates to the offers page.",
        "parameters": {"type": "object", "properties": {}, "required": []}
    }
)
async def navigate_to_offers(context: RunContext, raw_arguments: dict) -> str:
    success = await _send_navigation_data_channel_message("go_offers")
    return "Navigated to offers." if success else "Failed to navigate to offers."


@function_tool(
    raw_schema={
        "name": "Maps_to_trending_products",
        "description": "Navigates to the trending products page.",
        "parameters": {"type": "object", "properties": {}, "required": []}
    }
)
async def navigate_to_trending_products(context: RunContext, raw_arguments: dict) -> str:
    success = await _send_navigation_data_channel_message("go_trending")
    return "Navigated to trending products." if success else "Failed to navigate to trending products."


@function_tool(
    raw_schema={
        "name": "Maps_to_path",
        "description": "Navigates to a specific path like /products/86.",
        "parameters": {
            "type": "object",
            "properties": {
                "path": {
                    "type": "string",
                    "description": "Exact path to navigate to (e.g. '/products/86')"
                }
            },
            "required": ["path"]
        }
    }
)
async def navigate_to_path(context: RunContext, raw_arguments: dict) -> str:
    path = raw_arguments.get("path")
    if not path:
        return "Error: Missing 'path' parameter."
    success = await _send_navigation_data_channel_message("navigate", path=path)
    return f"Navigated to {path}." if success else f"Failed to navigate to {path}."


# === NEW TOOL: Add Product to Cart ===

@function_tool(
    raw_schema={
        "name": "Add_to_cart_tool",
        "description": "Sends a product object to the frontend to add it to the cart and show the cart overlay.",
        "parameters": {
            "type": "object",
            "properties": {
                "product": {
                    "type": "object",
                    "description": "Product object to add to cart",
                    "properties": {
                        "id": {"type": "integer", "description": "Product ID"},
                        "title": {"type": "string", "description": "Product title"},
                        "price": {"type": "number", "description": "Product price in KES"},
                        "image": {"type": "string", "description": "Image URL of the product"}
                    },
                    "required": ["id", "title", "price", "image"]
                }
            },
            "required": ["product"]
        }
    }
)
async def send_add_to_cart_event(context: RunContext, raw_arguments: dict) -> str:
    product = raw_arguments.get("product")
    if not product:
        return "Error: 'product' object is required."

    success = await _send_navigation_data_channel_message("add_to_cart", extra_payload={"product": product})
    return f"Product added to cart: {product.get('title')}" if success else "Failed to send add to cart event."
