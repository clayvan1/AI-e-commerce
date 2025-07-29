// AgentFloatingOrb.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Room, RoomEvent, Track, ConnectionState, createLocalAudioTrack } from 'livekit-client';
import Orb from '../pages/Dashboard/Orb';
import AgentNavigationHandler from './Agentnav';
import { GiArtificialHive } from 'react-icons/gi';
import './agent.css';

const AgentFloatingOrb = () => {
    const [livekitToken, setLivekitToken] = useState(null);
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [agentSpeaking, setAgentSpeaking] = useState(false);
    const [autoplayBlocked, setAutoplayBlocked] = useState(false);
    const [userMicEnabled, setUserMicEnabled] = useState(false);
    const [showOrb, setShowOrb] = useState(false);
    const [status, setStatus] = useState('');

    const audioRef = useRef(null);
    const roomRef = useRef(null);

    const livekitUrl = import.meta.env.VITE_REACT_APP_LIVEKIT_URL;
    const backendUrl = import.meta.env.VITE_REACT_APP_BACKEND_URL || 'http://localhost:5555';

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const storedToken = localStorage.getItem('token');

    const startAgent = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${backendUrl}/api/agent/start`, {
                username: storedUser.username,
                role: storedUser.role,
                room: 'shopping-agent-room',
                metadata: JSON.stringify({ ...storedUser, userAuthToken: storedToken })
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${storedToken}`
                }
            });

            if (response.data.livekit_token) {
                setLivekitToken(response.data.livekit_token);
            }
        } catch (err) {
            console.error(err);
            setStatus('Failed to start agent.');
        } finally {
            setLoading(false);
        }
    };

    const tryPlayAudio = useCallback(async () => {
        try {
            await audioRef.current?.play();
            setAutoplayBlocked(false);
        } catch (e) {
            setAutoplayBlocked(true);
        }
    }, []);

    useEffect(() => {
        if (!livekitToken) return;

        const connect = async () => {
            const room = new Room();
            roomRef.current = room;

            room
                .on(RoomEvent.TrackSubscribed, (track, pub, participant) => {
                    if (track.kind === Track.Kind.Audio && participant.identity.startsWith('agent-')) {
                        track.attach(audioRef.current);
                        tryPlayAudio();
                    }
                })
                .on(RoomEvent.ConnectionStateChanged, (state) => {
                    setConnected(state === ConnectionState.Connected);
                })
                .on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
                    setAgentSpeaking(
                        speakers.some(s => s.identity.startsWith('agent-') && s.isSpeaking)
                    );
                });

            try {
                await room.connect(livekitUrl, livekitToken);
                const micTrack = await createLocalAudioTrack();
                await room.localParticipant.publishTrack(micTrack);
                setUserMicEnabled(true);
            } catch (err) {
                console.error('LiveKit connection error:', err);
            }
        };

        connect();

        return () => {
            roomRef.current?.disconnect();
            roomRef.current?.removeAllListeners();
        };
    }, [livekitToken, tryPlayAudio]);

    const disconnectAgent = () => {
        roomRef.current?.disconnect();
        roomRef.current?.removeAllListeners();
        setLivekitToken(null);
        setConnected(false);
        setAgentSpeaking(false);
        setUserMicEnabled(false);
        setAutoplayBlocked(false);
        setStatus('');
    };

    const handleClick = async () => {
        if (connected) {
            disconnectAgent();
            setShowOrb(false);
        } else {
            setShowOrb(true);
            if (!livekitToken) {
                await startAgent();
            }
        }
    };

    return (
        <div className="agent-floating-container" onClick={handleClick}>
            <AgentNavigationHandler room={roomRef.current} />
            {showOrb && (
                <div className="agent-panel">
                    {connected ? (
                        agentSpeaking ? <span>🗣️ Agent is speaking...</span> : <span>🤖 Listening...</span>
                    ) : (
                        <span>🔄 Connecting...</span>
                    )}
                </div>
            )}
            <div className="agent-orb-button">
                {showOrb && connected ? (
                    <Orb
                        hoverIntensity={0.5}
                        rotateOnHover={false}
                        hue={0}
                        forceHoverState={agentSpeaking}
                        style={{ width: '45px', height: '45px' }}
                    />
                ) : (
                    <GiArtificialHive className="floating-icon" />
                )}
            </div>
            <audio ref={audioRef} autoPlay style={{ display: 'none' }} />
        </div>
    );
};

export default AgentFloatingOrb;
