import httpx
import traceback # Added for detailed error logging
from typing import List, Dict
from livekit.agents.llm import function_tool
from livekit.agents import RunContext

BASE_URL = "http://localhost:5555" # Ensure this matches your backend server's URL

@function_tool(
    raw_schema={
        "name": "create_order",
        "description": "Buyer tool: Place a new order with shipping details and item list.",
        "parameters": {
            "type": "object",
            "properties": {
                "items": {
                    "type": "array",
                    "description": "List of items to order",
                    "items": {
                        "type": "object",
                        "properties": {
                            "product_id": {"type": "string"},
                            "quantity": {"type": "integer"}
                        },
                        "required": ["product_id", "quantity"]
                    }
                },
                "full_name": {"type": "string"},
                "address_line": {"type": "string"},
                "city": {"type": "string"},
                "postal_code": {"type": "string"},
                "country": {"type": "string"}
            },
            "required": ["items", "full_name", "address_line", "city", "postal_code", "country"]
        }
    }
)
async def create_order(context: RunContext, raw_arguments: dict) -> dict: # Added raw_arguments
    token = context.userdata.get("userAuthToken")
    if not token:
        return {"error": "Missing auth token."}

    # Extract arguments from raw_arguments as per your schema
    items = raw_arguments["items"]
    full_name = raw_arguments["full_name"]
    address_line = raw_arguments["address_line"]
    city = raw_arguments["city"]
    postal_code = raw_arguments["postal_code"]
    country = raw_arguments["country"]

    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "items": items,
        "full_name": full_name,
        "address_line": address_line,
        "city": city,
        "postal_code": postal_code,
        "country": country
    }
    try:
        response = httpx.post(f"{BASE_URL}/api/orders", json=data, headers=headers)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        # --- DEBUG PRINTS ---
        print("\n--- ERROR IN CREATE_ORDER TOOL ---")
        print(f"Error type: {type(e)}")
        print(f"Error message: {e}")
        print("Full traceback for tool error:")
        traceback.print_exc()
        print("--- END ERROR IN CREATE_ORDER TOOL ---\n")
        # --- END DEBUG PRINTS ---
        return {"error": f"Order failed: {str(e)}"}


@function_tool(
    raw_schema={
        "name": "get_orders",
        "description": "View order history for buyer/shopkeeper.",
        "parameters": {
            "type": "object",
            "properties": {}, # Empty properties means no specific arguments are expected from LLM
            "required": []
        }
    }
)
async def get_orders(context: RunContext, raw_arguments: dict) -> list[dict]: # Added raw_arguments
    token = context.userdata.get("userAuthToken")
    if not token:
        return [{"error": "Missing auth token."}]
    headers = {"Authorization": f"Bearer {token}"}
    try:
        response = httpx.get(f"{BASE_URL}/api/orders", headers=headers)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        # --- DEBUG PRINTS ---
        print("\n--- ERROR IN GET_ORDERS TOOL ---")
        print(f"Error type: {type(e)}")
        print(f"Error message: {e}")
        print("Full traceback for tool error:")
        traceback.print_exc()
        print("--- END ERROR IN GET_ORDERS TOOL ---\n")
        # --- END DEBUG PRINTS ---
        return [{"error": f"Failed to get orders: {str(e)}"}]


@function_tool(
    raw_schema={
        "name": "update_order_status",
        "description": "Shopkeeper tool: Update order status to 'shipped' or 'delivered'.",
        "parameters": {
            "type": "object",
            "properties": {
                "order_id": {
                    "type": "integer",
                    "description": "ID of the order to update"
                },
                "status": {
                    "type": "string",
                    "description": "New status of the order",
                    "enum": ["shipped", "delivered"]
                }
            },
            "required": ["order_id", "status"]
        }
    }
)
async def update_order_status(context: RunContext, raw_arguments: dict) -> dict: # Added raw_arguments
    token = context.userdata.get("userAuthToken")
    if not token:
        return {"error": "Missing auth token."}

    # Extract arguments from raw_arguments
    order_id = raw_arguments["order_id"]
    status = raw_arguments["status"]

    headers = {"Authorization": f"Bearer {token}"}
    try:
        response = httpx.put(
            f"{BASE_URL}/orders/{order_id}/status",
            json={"status": status},
            headers=headers
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        # --- DEBUG PRINTS ---
        print("\n--- ERROR IN UPDATE_ORDER_STATUS TOOL ---")
        print(f"Error type: {type(e)}")
        print(f"Error message: {e}")
        print("Full traceback for tool error:")
        traceback.print_exc()
        print("--- END ERROR IN UPDATE_ORDER_STATUS TOOL ---\n")
        # --- END DEBUG PRINTS ---
        return {"error": f"Update failed: {str(e)}"}
