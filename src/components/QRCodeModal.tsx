import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Event } from '../types';
import { QrCode, MapPin, X, ExternalLink } from 'lucide-react';

interface QRCodeModalProps {
  event: Event;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ event, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const qrData = event.googleMapUrl || `https://maps.google.com/?q=${encodeURIComponent(event.restaurantName)}`;
      QRCode.toCanvas(canvasRef.current, qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#4f46e5',
          light: '#ffffff',
        },
      }).catch((err) => console.error(err));
    }
  }, [event]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-sm rounded-2xl p-6 border border-slate-700/60 shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-full w-12 h-12 mx-auto flex items-center justify-center mb-3">
          <QrCode className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-heading font-extrabold text-white">
          Event QR Code
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">{event.restaurantName}</p>

        {/* QR Code Canvas */}
        <div className="my-4 flex justify-center bg-white p-3 rounded-2xl border border-slate-700 w-fit mx-auto shadow-lg">
          <canvas ref={canvasRef} />
        </div>

        <p className="text-xs text-slate-300">
          Scan with mobile camera to open Google Maps venue directions or share RSVP link!
        </p>

        <a
          href={event.googleMapUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all"
        >
          <span>Open Directions Map</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};

export default QRCodeModal;
