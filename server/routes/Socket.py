# routes/Socket.py
from flask import request, current_app
from flask_restful import Resource # Import Resource from flask_restful

class SocketEventEmitResource(Resource):
    """
    A Flask-RESTful Resource to receive HTTP POST requests
    and then emit Socket.IO events to connected clients.
    This resource will be registered under '/api/emit-socket-event'.
    """
    def post(self):
        """
        Handles POST requests to /api/emit-socket-event.
        Expects JSON payload with 'event' (string) and optional 'data' (object).
        """
        data = request.get_json()

        # Basic validation for the 'event' name
        event_name = data.get('event')
        if not event_name:
            # Flask-RESTful automatically converts dict to JSON response
            return {"error": "Event name is required"}, 400

        event_data = data.get('data') # This 'data' will contain the 'path' for navigation events

        # Access the socketio instance stored in the Flask app context
        socketio_instance = current_app.socketio
        
        # Log the received request for debugging
        print(f"[Backend Socket Emitter] Received request to emit: '{event_name}' with data: {event_data}")
        
        # Emit the Socket.IO event to all connected clients
        # For navigation, event_data will be an object like { "path": "/products/Mercedes" }
        socketio_instance.emit(event_name, event_data) 

        # Return a success response
        return {"message": f"Event '{event_name}' emitted successfully"}, 200