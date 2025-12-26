"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, X } from "lucide-react";

interface QRScannerProps {
    onScan: (decodedText: string) => void;
    onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const startScanner = async () => {
            try {
                const html5QrCode = new Html5Qrcode("qr-reader");
                scannerRef.current = html5QrCode;

                await html5QrCode.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 }
                    },
                    (decodedText) => {
                        // Successfully scanned
                        html5QrCode.stop();
                        onScan(decodedText);
                    },
                    (errorMessage) => {
                        // Scanning error (can be ignored for continuous scanning)
                    }
                );

                setIsScanning(true);
            } catch (err: any) {
                console.error("Scanner error:", err);
                setError("Camera access denied or not available. Please enter the code manually.");
            }
        };

        startScanner();

        return () => {
            if (scannerRef.current && isScanning) {
                scannerRef.current.stop().catch(console.error);
            }
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative w-full max-w-md">
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all z-10"
                >
                    <X size={24} />
                </button>

                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <Camera size={24} className="text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white">Scan QR Code</h2>
                            <p className="text-xs text-slate-400">Point your camera at the QR code</p>
                        </div>
                    </div>

                    {error ? (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
                            <p className="text-red-400 text-sm font-medium">{error}</p>
                            <button
                                onClick={onClose}
                                className="mt-4 px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg font-bold transition-all"
                            >
                                Close Scanner
                            </button>
                        </div>
                    ) : (
                        <div className="relative">
                            <div
                                id="qr-reader"
                                className="rounded-xl overflow-hidden border-2 border-indigo-500/30"
                            />
                            <div className="mt-4 text-center">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                                    <div className="h-2 w-2 bg-indigo-500 rounded-full animate-pulse" />
                                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                                        Scanning...
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
