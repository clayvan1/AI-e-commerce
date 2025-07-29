import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Room, ConnectionState, RoomEvent } from 'livekit-client';

// Create the context with a default null value
const LiveKitContext = createContext(null);

/**
 * LiveKitProvider component to manage the LiveKit Room instance and its connection state.
 * It provides the room instance, a setter for it, and the connection status to its children.
 */
export const LiveKitProvider = ({ children }) => {
  // State to hold the LiveKit Room instance.
  // This will be null initially, and then set to a Room object when connected.
  const [room, setRoom] = useState(null);

  // State to track the LiveKit connection status.
  const [isConnected, setIsConnected] = useState(false);

  /**
   * Memoized callback to allow external components (like Agent.jsx) to set the Room instance.
   * This is crucial for passing the newly created Room object into the context's state.
   */
  const setLiveKitRoom = useCallback((newRoomInstance) => {
    setRoom(newRoomInstance);
  }, []); // No dependencies, so it's stable across renders

  /**
   * useEffect to manage the lifecycle of the LiveKit Room instance within the context.
   * It attaches listeners for connection state changes and ensures proper cleanup.
   */
  useEffect(() => {
    // If there's no room instance, ensure disconnected state and return.
    if (!room) {
      setIsConnected(false);
      return;
    }

    // Handler for when the room's connection state changes.
    const handleConnectionStateChange = (state) => {
      const currentIsConnected = state === ConnectionState.Connected;
      setIsConnected(currentIsConnected);
      console.log(`LiveKitContext: Connection state changed to: ${state}. Is Connected: ${currentIsConnected}`);

      // If the room disconnects, clear the room instance from state.
      if (state === ConnectionState.Disconnected) {
        console.log("LiveKitContext: Room disconnected (via ConnectionStateChanged), clearing room state.");
        setRoom(null); // This will trigger the cleanup function below
      }
    };

    // Handler for the explicit 'disconnected' event.
    const handleDisconnected = () => {
      console.log("LiveKitContext: Room 'disconnected' event received.");
      setIsConnected(false);
      setRoom(null); // Ensure room is nullified if this event fires
    };

    // Attach event listeners to the LiveKit Room instance.
    room.on(RoomEvent.ConnectionStateChanged, handleConnectionStateChange);
    room.on(RoomEvent.Disconnected, handleDisconnected);

    // Cleanup function: runs when the component unmounts or 'room' dependency changes.
    return () => {
      if (room) { // Check if room exists before attempting to disconnect or remove listeners
        // Only disconnect if the room is not already disconnected.
        if (room.state !== ConnectionState.Disconnected) {
          console.log("LiveKitContext: Disconnecting room during cleanup (effect dependency changed or unmount).");
          room.disconnect();
        }
        // Remove all listeners to prevent memory leaks.
        room.off(RoomEvent.ConnectionStateChanged, handleConnectionStateChange);
        room.off(RoomEvent.Disconnected, handleDisconnected);
        room.removeAllListeners(); // Good practice to remove all custom listeners too
      }
    };
  }, [room]); // This effect re-runs whenever the 'room' object itself changes (e.g., from null to a Room instance)

  // The value provided by the context.
  const value = {
    room,           // The current LiveKit Room instance (null or Room object)
    setLiveKitRoom, // Function to update the room instance
    isConnected,    // Boolean indicating if the room is currently connected
  };

  return (
    <LiveKitContext.Provider value={value}>
      {children}
    </LiveKitContext.Provider>
  );
};

/**
 * Custom hook to consume the LiveKitContext.
 * Provides easy access to the room, setLiveKitRoom, and isConnected state.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useLiveKit = () => {
  const context = useContext(LiveKitContext);
  if (context === null) {
    throw new Error('useLiveKit must be used within a LiveKitProvider');
  }
  return context;
};
