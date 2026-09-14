import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Asset } from '../../types';
import {
  X,
  Download,
  Printer,
  Copy,
  Check,
  QrCode,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface AssetQrTagModalProps {
  asset: Asset;
  onClose: () => void;
}

export const AssetQrTagModal: React.FC<AssetQrTagModalProps> = ({ asset, onClose }) => {
  const stickerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rawQrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stickerDataUrl, setStickerDataUrl] = useState<string>('');
  const [rawQrDataUrl, setRawQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [genError, setGenError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'sticker' | 'raw'>('sticker');

  useEffect(() => {
    let isMounted = true;

    const generateQrAndSticker = async () => {
      setIsGenerating(true);
      setGenError(null);

      try {
        // 1. Generate Raw QR Code Data URL
        const qrCodeString = asset.assetCode || asset.id;
        const qrDataUrlResult = await QRCode.toDataURL(qrCodeString, {
          width: 320,
          margin: 1,
          errorCorrectionLevel: 'H',
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        });

        if (!isMounted) return;
        setRawQrDataUrl(qrDataUrlResult);

        // 2. Render Full Official Asset Tag on Canvas
        const canvas = document.createElement('canvas');
        // High resolution for sharp printing: 600 x 780 px
        canvas.width = 600;
        canvas.height = 780;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Canvas context unavailable');
        }

        // Background: Clean white with subtle rounded border
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 600, 780);

        // Outer equipment border
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 6;
        ctx.strokeRect(12, 12, 576, 756);

        // Inner frame border
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(20, 20, 560, 740);

        // Header Banner: Deep slate header
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(20, 20, 560, 96);

        // Header Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 30px "Plus Jakarta Sans", -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('HOSTELASSIST', 300, 62);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 13px "Plus Jakarta Sans", -apple-system, sans-serif';
        ctx.letterSpacing = '2px';
        ctx.fillText('OFFICIAL MAINTENANCE & ASSET TAG', 300, 88);

        // Equipment Name
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 22px "Plus Jakarta Sans", -apple-system, sans-serif';
        ctx.letterSpacing = '0px';
        
        // Truncate name if too long to fit nicely
        let displayName = asset.name;
        if (displayName.length > 36) {
          displayName = displayName.substring(0, 33) + '...';
        }
        ctx.fillText(displayName, 300, 155);

        // Asset Code Pill Box
        const codeText = asset.assetCode;
        ctx.fillStyle = '#f1f5f9';
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2;
        
        // Center the code pill
        const pillWidth = 280;
        const pillHeight = 44;
        const pillX = (600 - pillWidth) / 2;
        const pillY = 175;
        
        ctx.fillRect(pillX, pillY, pillWidth, pillHeight);
        ctx.strokeRect(pillX, pillY, pillWidth, pillHeight);

        ctx.fillStyle = '#0369a1';
        ctx.font = 'bold 22px monospace';
        ctx.fillText(codeText, 300, 204);

        // Draw the QR Code image in the center
        const qrImage = new Image();
        qrImage.crossOrigin = 'anonymous';
        qrImage.src = qrDataUrlResult;

        await new Promise((resolve, reject) => {
          qrImage.onload = resolve;
          qrImage.onerror = reject;
        });

        if (!isMounted) return;

        // QR Code Container Box
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.fillRect(150, 240, 300, 300);
        ctx.strokeRect(150, 240, 300, 300);

        // Draw QR
        ctx.drawImage(qrImage, 160, 250, 280, 280);

        // Divider
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(40, 565);
        ctx.lineTo(560, 565);
        ctx.stroke();

        // Location & Category Info Box
        ctx.fillStyle = '#334155';
        ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(`LOCATION: ${asset.block} · ROOM ${asset.roomNumber} (FLOOR ${asset.floor})`, 300, 600);

        ctx.fillStyle = '#64748b';
        ctx.font = '14px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(`Category: ${asset.category}   |   Installed: ${asset.purchaseDate ? asset.purchaseDate.split('T')[0] : 'N/A'}`, 300, 630);

        // Warning / Instruction Footer
        ctx.fillStyle = '#0284c7';
        ctx.font = 'bold 14px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('SCAN WITH HOSTELASSIST CAMERA TO LOG REPAIRS', 300, 680);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px monospace';
        ctx.fillText('DO NOT REMOVE OR DEFACE PROPERTY OF CAMPUS HOUSING', 300, 715);

        const fullStickerUrl = canvas.toDataURL('image/png');
        setStickerDataUrl(fullStickerUrl);
        setIsGenerating(false);
      } catch (err: any) {
        if (!isMounted) return;
        setGenError(err.message || 'Failed to generate QR tag');
        setIsGenerating(false);
      }
    };

    generateQrAndSticker();

    return () => {
      isMounted = false;
    };
  }, [asset]);

  // Download Handler (Guaranteed to download PNG via local base64 Data URL)
  const handleDownload = (type: 'sticker' | 'raw') => {
    const dataUrl = type === 'sticker' ? stickerDataUrl : rawQrDataUrl;
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${asset.assetCode}-${type === 'sticker' ? 'tag-sticker' : 'qr-code'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Handler
  const handlePrint = () => {
    const dataUrl = activeTab === 'sticker' ? stickerDataUrl : rawQrDataUrl;
    if (!dataUrl) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to print this asset tag.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Asset Tag - ${asset.assetCode}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-family: sans-serif;
            }
            img {
              max-width: 480px;
              width: 100%;
              height: auto;
              border-radius: 8px;
            }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" alt="Asset Tag" />
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    try {
      const dataUrl = activeTab === 'sticker' ? stickerDataUrl : rawQrDataUrl;
      if (!dataUrl) return;

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: copy asset code
      navigator.clipboard.writeText(asset.assetCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Equipment QR Tag
              </h2>
              <p className="text-xs text-slate-500 font-mono">{asset.assetCode}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 flex flex-col items-center">
          {/* View Mode Toggle: Printable Sticker vs Pure QR Code */}
          <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 w-full max-w-xs text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('sticker')}
              className={`flex-1 py-1.5 rounded-lg transition text-center ${
                activeTab === 'sticker'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              Printable Sticker Tag
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('raw')}
              className={`flex-1 py-1.5 rounded-lg transition text-center ${
                activeTab === 'raw'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              Pure QR Code
            </button>
          </div>

          {/* QR Display Card */}
          <div className="w-full flex flex-col items-center justify-center min-h-[300px]">
            {isGenerating ? (
              <div className="py-16 text-center space-y-2">
                <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <span className="text-xs text-slate-500">Generating high-res equipment tag...</span>
              </div>
            ) : genError ? (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{genError}</span>
              </div>
            ) : (
              <div className="relative group">
                {activeTab === 'sticker' ? (
                  <div className="p-3 bg-white rounded-2xl border-2 border-slate-900 dark:border-slate-700 shadow-xl max-w-[280px]">
                    <img
                      src={stickerDataUrl}
                      alt={`Asset Tag ${asset.assetCode}`}
                      className="w-full h-auto rounded-lg shadow-sm"
                    />
                  </div>
                ) : (
                  <div className="p-5 bg-white rounded-2xl border-2 border-slate-900 dark:border-slate-700 shadow-xl text-center space-y-2">
                    <img
                      src={rawQrDataUrl}
                      alt={`QR Code ${asset.assetCode}`}
                      className="w-48 h-48 mx-auto"
                    />
                    <div className="font-mono text-xs font-bold text-slate-900">
                      {asset.assetCode}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Asset Metadata summary */}
          <div className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Equipment Name:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{asset.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Assigned Room:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {asset.block} · Room {asset.roomNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">QR Encoded Payload:</span>
              <span className="font-mono text-[11px] font-bold text-sky-600 dark:text-sky-400">
                {asset.assetCode}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => handleDownload(activeTab)}
            disabled={isGenerating || !stickerDataUrl}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={isGenerating || !stickerDataUrl}
            className="py-2.5 px-3.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
            title="Print label sticker"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            type="button"
            onClick={handleCopyImage}
            disabled={isGenerating || !stickerDataUrl}
            className="py-2.5 px-3.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
