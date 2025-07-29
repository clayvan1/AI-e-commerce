from flask import Blueprint, request
from flask_restful import Api, Resource
from dotenv import load_dotenv
import os
import jwt
from datetime import datetime, timedelta, timezone
import json
import asyncio
import nest_asyncio

# Apply nest_asyncio fix for Flask running event loop
nest_asyncio.apply()

from flask_cors import CORS
from livekit.api import AccessToken, VideoGrants
from livekit import api
from livekit.api.agent_dispatch_service import CreateAgentDispatchRequest

from routes.user import token_required

# Load env variables
load_dotenv()
LIVEKIT_URL = os.getenv("LIVEKIT_URL")
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")

if not all([LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET]):
    raise EnvironmentError("LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET must be set.")

# Flask Blueprint and API setup
agent_bp = Blueprint("agent_bp", __name__)
CORS(agent_bp, resources={r"/api/*": {"origins": "*"}})
api_rest = Api(agent_bp)

# Token generator
def generate_livekit_token(identity: str, name: str, room: str, metadata_string: str = None):
    token = AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET) \
        .with_identity(identity) \
        .with_name(name) \
        .with_grants(VideoGrants(
            room_join=True,
            room=room,
            can_publish=True,
            can_subscribe=True,
            can_publish_data=True
        ))

    if metadata_string:
        token = token.with_metadata(metadata_string)

    print("\n--- DEBUGGING LIVEKIT TOKEN GENERATION ---")
    print(f"Identity: {identity}, Name: {name}, Room: {room}, Metadata: {metadata_string}")
    print("--- END DEBUGGING ---\n")

    return token.to_jwt()

# Agent dispatcher route
class AgentStartResource(Resource):
    @token_required
    def post(self):
        try:
            user = request.current_user
            user_identity = getattr(user, 'identity', str(user.id))
            user_role = getattr(user, 'role', None)
            username = getattr(user, 'username', f"user_{user.id}")

            data = request.get_json()
            room_name = data.get("room")
            client_metadata_string = data.get("metadata")

            if not user_identity or not user_role:
                return {"error": "User info missing."}, 400
            if not room_name:
                return {"error": "Missing 'room' in request body"}, 400

            async def _dispatch_agent():
                async with api.LiveKitAPI(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET) as client:
                    print(f"[Agent Dispatch] → User '{user_identity}' ({user_role}) joining room '{room_name}'")
                    return await client.agent_dispatch.create_dispatch(
                        CreateAgentDispatchRequest(
                            agent_name="assistant-agent",
                            room=room_name
                        )
                    )

            # Use existing event loop with nest_asyncio
            loop = asyncio.get_event_loop()
            dispatch_result = loop.run_until_complete(_dispatch_agent())

            livekit_token = generate_livekit_token(
                identity=user_identity,
                name=username,
                room=room_name,
                metadata_string=client_metadata_string
            )

            return {
                "message": "Agent dispatched successfully.",
                "livekit_token": livekit_token,
                "dispatch_id": getattr(dispatch_result, "id", None),
                "agent_name": getattr(dispatch_result, "agent_name", None),
                "room": getattr(dispatch_result, "room", None)
            }, 200

        except Exception as e:
            import traceback
            traceback.print_exc()
            return {"error": f"Failed to dispatch agent: {str(e)}"}, 500

# Register route
api_rest.add_resource(AgentStartResource, "/start")
