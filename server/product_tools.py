import httpx
import traceback # Import traceback for detailed error logs
from typing import Dict
from livekit.agents.llm import function_tool
from livekit.agents import RunContext

BASE_URL = "http://localhost:5555" # Ensure this matches your backend server's URL

@function_tool(
    raw_schema={
        "name": "get_all_products",
        "description": "Buyer tool: Fetch all available products for sale from all shops.",
        "parameters": {
            "type": "object",
            "properties": {},
            "required": [],
            "additionalProperties": False
        }
    }
)
async def get_all_products(context: RunContext, raw_arguments: dict) -> list[dict]:
    # This function typically doesn't require a token for public access
    print(f"DEBUG TOOL: get_all_products - No auth token required for this public route.")
    try:
        response = httpx.get(f"{BASE_URL}/api/products")
        response.raise_for_status()
        return response.json()
    except Exception as e:
        # --- DEBUG PRINTS ---
        print("\n--- ERROR IN GET_ALL_PRODUCTS TOOL ---")
        print(f"Error type: {type(e)}")
        print(f"Error message: {e}")
        if isinstance(e, httpx.HTTPStatusError):
            print(f"HTTP Status Code: {e.response.status_code}")
            print(f"HTTP Response Body: {e.response.text}")
        print("Full traceback for tool error:")
        traceback.print_exc()
        print("--- END ERROR IN GET_ALL_PRODUCTS TOOL ---\n")
        # --- END DEBUG PRINTS ---
        return [{"error": f"Failed to fetch products from backend: {str(e)}"}]


@function_tool(
    raw_schema={
        "name": "get_global_inventory",
        "description": "Shopkeeper tool: Get the main list of products available for stocking in.",
        "parameters": {
            "type": "object",
            "properties": {},
            "required": [],
            "additionalProperties": False
        }
    }
)
async def get_global_inventory(context: RunContext, raw_arguments: dict) -> list[dict]:
    token = context.userdata.get("userAuthToken")
    # ADD THIS PRINT TO VERIFY THE TOKEN IS RECEIVED BY THE TOOL
    print(f"DEBUG TOOL: get_global_inventory - Retrieved token from context.userdata: {'*****' if token else 'None'}")

    if not token:
        # This is the error message the agent might be verbalizing
        return [{"error": "Authentication token missing from agent's context for get_global_inventory."}]

    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = httpx.get(f"{BASE_URL}/api/inventory/global", headers=headers)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        # --- DEBUG PRINTS ---
        print("\n--- ERROR IN GET_GLOBAL_INVENTORY TOOL ---")
        print(f"Error type: {type(e)}")
        print(f"Error message: {e}")
        if isinstance(e, httpx.HTTPStatusError):
            print(f"HTTP Status Code: {e.response.status_code}")
            print(f"HTTP Response Body: {e.response.text}")
        print("Full traceback for tool error:")
        traceback.print_exc()
        print("--- END ERROR IN GET_GLOBAL_INVENTORY TOOL ---\n")
        # --- END DEBUG PRINTS ---
        return [{"error": f"Failed to fetch global inventory from backend: {str(e)}"}]


# --- NEW TOOL FOR SUPERADMIN TO GET ALL GLOBAL PRODUCTS ---
@function_tool(
    raw_schema={
        "name": "get_global_products_admin",
        "description": "Superadmin tool: Fetch all products from the global inventory, typically for administrative overview.",
        "parameters": {
            "type": "object",
            "properties": {},
            "required": [],
            "additionalProperties": False
        }
    }
)
async def get_global_products_admin(context: RunContext, raw_arguments: dict) -> list[dict]:
    token = context.userdata.get("userAuthToken")
    print(f"DEBUG TOOL: get_global_products_admin - Retrieved token from context.userdata: {'*****' if token else 'None'}")

    if not token:
        return [{"error": "Authentication token missing from agent's context for get_global_products_admin. Superadmin access required."}]

    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = httpx.get(f"{BASE_URL}/api/admin/products", headers=headers) # Calls the /admin/products route
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print("\n--- ERROR IN GET_GLOBAL_PRODUCTS_ADMIN TOOL ---")
        print(f"Error type: {type(e)}")
        print(f"Error message: {e}")
        if isinstance(e, httpx.HTTPStatusError):
            print(f"HTTP Status Code: {e.response.status_code}")
            print(f"HTTP Response Body: {e.response.text}")
        print("Full traceback for tool error:")
        traceback.print_exc()
        print("--- END ERROR IN GET_GLOBAL_PRODUCTS_ADMIN TOOL ---\n")
        return [{"error": f"Failed to fetch global products for admin: {str(e)}"}]
# --- END NEW TOOL ---


@function_tool(
    raw_schema={
        "name": "stock_in_product",
        "description": "Shopkeeper tool: Add a product to your shop.",
        "parameters": {
            "type": "object",
            "properties": {
                "product_id": {"type": "integer"},
                "quantity": {"type": "integer"}
            },
            "required": ["product_id", "quantity"],
            "additionalProperties": False
        }
    }
)
async def stock_in_product(context: RunContext, raw_arguments: dict) -> dict:
    token = context.userdata.get("userAuthToken")
    # ADD THIS PRINT TO VERIFY THE TOKEN IS RECEIVED BY THE TOOL
    print(f"DEBUG TOOL: stock_in_product - Retrieved token from context.userdata: {'*****' if token else 'None'}")

    if not token:
        return {"error": "Authentication token missing from agent's context for stock_in_product."}

    try:
        product_id = raw_arguments["product_id"]
        quantity = raw_arguments["quantity"]
        headers = {"Authorization": f"Bearer {token}"}
        response = httpx.post(f"{BASE_URL}/api/inventory/stock-in", json={"product_id": product_id, "quantity": quantity}, headers=headers)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        # --- DEBUG PRINTS ---
        print("\n--- ERROR IN STOCK_IN_PRODUCT TOOL ---")
        print(f"Error type: {type(e)}")
        print(f"Error message: {e}")
        if isinstance(e, httpx.HTTPStatusError):
            print(f"HTTP Status Code: {e.response.status_code}")
            print(f"HTTP Response Body: {e.response.text}")
        print("Full traceback for tool error:")
        traceback.print_exc()
        print("--- END ERROR IN STOCK_IN_PRODUCT TOOL ---\n")
        # --- END DEBUG PRINTS ---
        return {"error": f"Stock-in failed: {str(e)}"}


@function_tool(
    raw_schema={
        "name": "get_my_inventory",
        "description": "Shopkeeper tool: Get all products in your inventory.",
        "parameters": {
            "type": "object",
            "properties": {},
            "required": [],
            "additionalProperties": False
        }
    }
)
async def get_my_inventory(context: RunContext, raw_arguments: dict) -> list[dict]:
    token = context.userdata.get("userAuthToken")
    # ADD THIS PRINT TO VERIFY THE TOKEN IS RECEIVED BY THE TOOL
    print(f"DEBUG TOOL: get_my_inventory - Retrieved token from context.userdata: {'*****' if token else 'None'}")

    if not token:
        return [{"error": "Authentication token missing from agent's context for get_my_inventory."}]

    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = httpx.get(f"{BASE_URL}/api/inventory", headers=headers)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        # --- DEBUG PRINTS ---
        print("\n--- ERROR IN GET_MY_INVENTORY TOOL ---")
        print(f"Error type: {type(e)}")
        print(f"Error message: {e}")
        if isinstance(e, httpx.HTTPStatusError):
            print(f"HTTP Status Code: {e.response.status_code}")
            print(f"HTTP Response Body: {e.response.text}")
        print("Full traceback for tool error:")
        traceback.print_exc()
        print("--- END ERROR IN GET_MY_INVENTORY TOOL ---\n")
        # --- END DEBUG PRINTS ---
        return [{"error": f"Failed to fetch inventory from backend: {str(e)}"}]


@function_tool(
    raw_schema={
        "name": "update_shop_product",
        "description": "Shopkeeper tool: Update a product in your inventory.",
        "parameters": {
            "type": "object",
            "properties": {
                "product_id": {"type": "integer"},
                "price": {"type": "number"},
                "quantity": {"type": "integer"}
            },
            "required": ["product_id"],
            "additionalProperties": False
        }
    }
)
async def update_shop_product(context: RunContext, raw_arguments: dict) -> dict:
    token = context.userdata.get("userAuthToken")
    # ADD THIS PRINT TO VERIFY THE TOKEN IS RECEIVED BY THE TOOL
    print(f"DEBUG TOOL: update_shop_product - Retrieved token from context.userdata: {'*****' if token else 'None'}")

    if not token:
        return {"error": "Authentication token missing from agent's context for update_shop_product."}

    try:
        product_id = raw_arguments["product_id"]
        update_fields = {k: v for k, v in raw_arguments.items() if k in ["price", "quantity"]}
        if not update_fields:
            return {"error": "No update fields provided."}

        headers = {"Authorization": f"Bearer {token}"}
        response = httpx.put(f"{BASE_URL}/api/products/{product_id}", json=update_fields, headers=headers)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        # --- DEBUG PRINTS ---
        print("\n--- ERROR IN UPDATE_SHOP_PRODUCT TOOL ---")
        print(f"Error type: {type(e)}")
        print(f"Error message: {e}")
        if isinstance(e, httpx.HTTPStatusError):
            print(f"HTTP Status Code: {e.response.status_code}")
            print(f"HTTP Response Body: {e.response.text}")
        print("Full traceback for tool error:")
        traceback.print_exc()
        print("--- END ERROR IN UPDATE_SHOP_PRODUCT TOOL ---\n")
        # --- END DEBUG PRINTS ---
        return {"error": f"Update failed: {str(e)}"}


@function_tool(
    raw_schema={
        "name": "delete_shop_product",
        "description": "Shopkeeper tool: Remove a product from your inventory.",
        "parameters": {
            "type": "object",
            "properties": {
                "product_id": {"type": "integer"}
            },
            "required": ["product_id"],
            "additionalProperties": False
        }
    }
)
async def delete_shop_product(context: RunContext, raw_arguments: dict) -> dict:
    token = context.userdata.get("userAuthToken")
    # ADD THIS PRINT TO VERIFY THE TOKEN IS RECEIVED BY THE TOOL
    print(f"DEBUG TOOL: delete_shop_product - Retrieved token from context.userdata: {'*****' if token else 'None'}")

    if not token:
        return {"error": "Authentication token missing from agent's context for delete_shop_product."}

    try:
        product_id = raw_arguments["product_id"]
        headers = {"Authorization": f"Bearer {token}"}
        response = httpx.delete(f"{BASE_URL}/api/products/{product_id}", headers=headers)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        # --- DEBUG PRINTS ---
        print("\n--- ERROR IN DELETE_SHOP_PRODUCT TOOL ---")
        print(f"Error type: {type(e)}")
        print(f"Error message: {e}")
        if isinstance(e, httpx.HTTPStatusError):
            print(f"HTTP Status Code: {e.response.status_code}")
            print(f"HTTP Response Body: {e.response.text}")
        print("Full traceback for tool error:")
        traceback.print_exc()
        print("--- END ERROR IN DELETE_SHOP_PRODUCT TOOL ---\n")
        # --- END DEBUG PRINTS ---
        return {"error": f"Delete failed: {str(e)}"}
