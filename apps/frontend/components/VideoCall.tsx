import React, { useEffect, useRef, useState } from 'react';
import { X, Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, UserCircle } from 'lucide-react';

interface VideoCallProps {
    isOpen: boolean;
    onClose: () => void;
    appointmentId: string;
    userId: string;
    role: "CLIENT" | "THERAPIST";
    peerName: string;
    peerImage?: string;
}

export function VideoCall({ isOpen, onClose, appointmentId, userId, role, peerName, peerImage }: VideoCallProps) {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [status, setStatus] = useState("Connecting...");

    const wsRef = useRef<WebSocket | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const iceCandidateQueue = useRef<RTCIceCandidateInit[]>([]);

    useEffect(() => {
        if (!isOpen) return;

        const initWebRTC = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                localStreamRef.current = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
                
                setStatus("Waiting for peer...");
                connectWebSocket();
            } catch (err) {
                console.error("Error accessing media devices.", err);
                setStatus("Error accessing camera/microphone");
            }
        };

        const connectWebSocket = () => {
            const ws = new WebSocket("ws://localhost:8081");
            wsRef.current = ws;

            ws.onopen = () => {
                ws.send(JSON.stringify({ type: "join", appointmentId, userId, role }));
            };

            ws.onmessage = async (event) => {
                const data = JSON.parse(event.data);
                
                if (data.type === "room-status") {
                    if (data.users.length > 0) {
                        setStatus("Peer is in room. Initiating connection...");
                        if (role === "THERAPIST") {
                            createOffer();
                        }
                    }
                } else if (data.type === "user-joined") {
                    setStatus("Peer joined. Initiating connection...");
                    if (role === "THERAPIST") {
                        createOffer();
                    }
                } else if (data.type === "offer") {
                    await handleOffer(data.payload);
                } else if (data.type === "answer") {
                    await handleAnswer(data.payload);
                } else if (data.type === "ice-candidate") {
                    await handleNewICECandidateMsg(data.payload);
                } else if (data.type === "user-left") {
                    setStatus("Peer disconnected");
                    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
                    
                    // Reset connection to be ready for reconnect
                    if (pcRef.current) {
                        pcRef.current.close();
                        pcRef.current = null;
                    }
                }
            };
        };

        initWebRTC();

        return () => {
            cleanup();
        };
    }, [isOpen]);

    const getPeerConnection = () => {
        if (pcRef.current) return pcRef.current;

        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        });

        pc.onicecandidate = (event) => {
            if (event.candidate && wsRef.current) {
                wsRef.current.send(JSON.stringify({
                    type: "ice-candidate",
                    appointmentId,
                    userId,
                    role,
                    payload: event.candidate
                }));
            }
        };

        pc.ontrack = (event) => {
            if (remoteVideoRef.current) {
                if (event.streams && event.streams[0]) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                } else {
                    if (!remoteVideoRef.current.srcObject) {
                        remoteVideoRef.current.srcObject = new MediaStream([event.track]);
                    } else {
                        (remoteVideoRef.current.srcObject as MediaStream).addTrack(event.track);
                    }
                }
                setStatus("Connected");
            }
        };

        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, localStreamRef.current!);
            });
        }

        pcRef.current = pc;
        return pc;
    };

    const createOffer = async () => {
        const pc = getPeerConnection();
        if (pc.signalingState !== "stable") return;

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        wsRef.current?.send(JSON.stringify({
            type: "offer",
            appointmentId,
            userId,
            role,
            payload: offer
        }));
    };

    const handleOffer = async (offer: RTCSessionDescriptionInit) => {
        const pc = getPeerConnection();
        if (pc.signalingState !== "stable") {
            // Ignore incoming offers if we aren't stable, to prevent glare
            return;
        }

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        
        // Process queued ICE candidates
        while (iceCandidateQueue.current.length > 0) {
            const candidate = iceCandidateQueue.current.shift();
            if (candidate) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) {
                    console.error("Error adding queued ice candidate", e);
                }
            }
        }
        
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        wsRef.current?.send(JSON.stringify({
            type: "answer",
            appointmentId,
            userId,
            role,
            payload: answer
        }));
    };

    const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
        if (pcRef.current && pcRef.current.signalingState === "have-local-offer") {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
            
            // Process queued ICE candidates
            while (iceCandidateQueue.current.length > 0) {
                const candidate = iceCandidateQueue.current.shift();
                if (candidate) {
                    try {
                        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                    } catch (e) {
                        console.error("Error adding queued ice candidate", e);
                    }
                }
            }
        }
    };

    const handleNewICECandidateMsg = async (incoming: RTCIceCandidateInit) => {
        if (pcRef.current) {
            if (pcRef.current.remoteDescription) {
                try {
                    await pcRef.current.addIceCandidate(new RTCIceCandidate(incoming));
                } catch (e) {
                    console.error("Error adding received ice candidate", e);
                }
            } else {
                // Queue candidate if remote description is not set yet
                iceCandidateQueue.current.push(incoming);
            }
        }
    };

    const cleanup = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (pcRef.current) {
            pcRef.current.close();
        }
        if (wsRef.current) {
            wsRef.current.close();
        }
    };

    const handleClose = () => {
        cleanup();
        onClose();
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks()[0].enabled = isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks()[0].enabled = isVideoOff;
            setIsVideoOff(!isVideoOff);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/90 backdrop-blur-md">
            <div className="w-full h-full max-w-7xl mx-auto flex flex-col p-4 md:p-6 gap-6 relative">
                
                {/* Header Info */}
                <div className="absolute top-6 left-6 z-10 flex items-center gap-4 bg-white p-3 rounded-2xl border-2 border-black shadow-md">
                    {peerImage ? (
                        <img src={peerImage} alt={peerName} className="w-12 h-12 rounded-full object-cover border-2 border-black" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-black">
                            <UserCircle className="size-7" />
                        </div>
                    )}
                    <div>
                        <h2 className="text-black font-bold text-lg leading-tight">{peerName}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className={`w-2 h-2 rounded-full ${status === "Connected" ? "bg-green-500" : "bg-yellow-500 animate-pulse"}`}></div>
                            <span className="text-slate-600 text-xs font-bold">{status}</span>
                        </div>
                    </div>
                </div>

                <button onClick={handleClose} className="absolute top-6 right-6 z-10 p-3 bg-white hover:bg-slate-100 rounded-full text-black border-2 border-black shadow-md transition-all">
                    <X className="size-6" />
                </button>

                {/* Video Grid */}
                <div className="flex-1 flex flex-col md:flex-row gap-4 items-center justify-center w-full mt-24 md:mt-0">
                    
                    {/* Remote Video (Main) */}
                    <div className="relative w-full md:w-2/3 h-[40vh] md:h-[70vh] bg-slate-100 rounded-3xl overflow-hidden shadow-2xl border-4 border-black">
                        <video 
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        {!remoteVideoRef.current?.srcObject && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-4">
                                <UserCircle className="size-20 opacity-50" />
                                <p className="text-lg font-bold">{status}</p>
                            </div>
                        )}
                    </div>

                    {/* Local Video (PIP or Side) */}
                    <div className="relative w-1/3 md:w-1/3 h-[30vh] md:h-auto md:aspect-[3/4] bg-slate-100 rounded-3xl overflow-hidden shadow-xl border-4 border-black">
                        <video 
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''} -scale-x-100`}
                        />
                        {isVideoOff && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
                                <UserCircle className="size-16 text-slate-400" />
                            </div>
                        )}
                        <div className="absolute bottom-4 left-4 bg-white px-3 py-1.5 rounded-lg text-black text-sm font-bold border-2 border-black shadow-sm">
                            You
                        </div>
                    </div>

                </div>

                {/* Controls */}
                <div className="h-24 flex items-center justify-center gap-6 pb-6">
                    <button 
                        onClick={toggleMute}
                        className={`p-4 rounded-full flex items-center justify-center transition-all border-2 border-black shadow-md ${
                            isMuted ? 'bg-red-50 text-red-600' : 'bg-white text-black hover:bg-slate-50'
                        }`}
                    >
                        {isMuted ? <MicOff className="size-6" /> : <Mic className="size-6" />}
                    </button>
                    
                    <button 
                        onClick={handleClose}
                        className="p-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center border-2 border-black shadow-lg transition-all scale-110"
                    >
                        <PhoneOff className="size-7" />
                    </button>

                    <button 
                        onClick={toggleVideo}
                        className={`p-4 rounded-full flex items-center justify-center transition-all border-2 border-black shadow-md ${
                            isVideoOff ? 'bg-red-50 text-red-600' : 'bg-white text-black hover:bg-slate-50'
                        }`}
                    >
                        {isVideoOff ? <VideoOff className="size-6" /> : <VideoIcon className="size-6" />}
                    </button>
                </div>

            </div>
        </div>
    );
}
