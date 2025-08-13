"use client";

import {
    useEffect,
    useState,
} from 'react';

import { socket } from '@/lib/socket';

export default function Home() {
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [transport, setTransport] = useState<string>("N/A");
    const [messages, setMessages] = useState<Array<{ from: string; message: string; to: string }>>([]);

    useEffect(() => {
        if (socket.connected) {
            onConnect();
        }

        function onConnect() {
            setIsConnected(true);
            setTransport(socket.io.engine.transport.name);

            socket.io.engine.on("upgrade", (transport: any) => {
                setTransport(transport.name);
            });
        }

        function onDisconnect() {
            setIsConnected(false);
            setTransport("N/A");
        }

        function onMessage(data: { from: string; message: string; to: string }) {
            setMessages(prev => [...prev, data]);
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("message", onMessage);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("message", onMessage);
        };
    }, []);

    async function SendMessage() {
        try {
            const message = "Hehe!"; // Replace with your actual message
            await socket.emit("message", { from: "user01", message, to: "user02" }); // Event name 'message'
            console.log("Sent message:", message);
        } catch (err) {
            console.error("Error sending message:", err);
        }
    }

    return (
        <>
            <div className="p-6 max-w-md mx-auto">
                <h1 className="text-2xl font-bold mb-4">Socket.io Test</h1>
                <p className="mb-2">Status: <span className={isConnected ? "text-green-600" : "text-red-600"}>{isConnected ? "connected" : "disconnected"}</span></p>
                <p className="mb-4">Transport: {transport}</p>
                <button 
                    onClick={SendMessage}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
                >
                    Send Test Message
                </button>
                
                <div className="mt-6">
                    <h2 className="text-lg font-semibold mb-2">Messages:</h2>
                    <div className="space-y-2">
                        {messages.map((msg, index) => (
                            <div key={index} className="p-3 bg-gray-100 rounded">
                                <p><strong>From:</strong> {msg.from}</p>
                                <p><strong>To:</strong> {msg.to}</p>
                                <p><strong>Message:</strong> {msg.message}</p>
                            </div>
                        ))}
                        {messages.length === 0 && (
                            <p className="text-gray-500">No messages yet</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
