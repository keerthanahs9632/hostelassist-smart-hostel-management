import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { api } from '../../services/api';
import { Asset, Complaint } from '../../types';
import { ConditionBadge } from '../common/Badge';
import { AssetQrTagModal } from '../admin/AssetQrTagModal';
import {
  X,
  QrCode,
  Search,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  History,
  DollarSign,
  Loader2,
  ScanLine,
  Camera,
  CameraOff,
  Upload,
} from 'lucide-react';

interface AssetScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetSelected?: (asset: Asset) => void;
}

const SAMPLE_CODES = ['AST-ELEC-001', 'AST-PLUMB-002', 'AST-WIFI-004', 'AST-WATER-005'];

export const AssetScannerModal: React.FC<AssetScannerModalProps> = ({
  isOpen,
  onClose,
  onAssetSelected,
}) => {
  const [assetCode, setAssetCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [pastComplaints, setPastComplaints] = useState<Complaint[]>([]);
  const [viewingQrForAsset, setViewingQrForAsset] = useState<Asset | null>(null);

  // Camera & QR State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera when closing
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const stopCamera = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    setError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera device API not supported in this browser or environment.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsCameraActive(true);
        scanVideoFrame();
      }
    } catch (err: any) {
      stopCamera();
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Use image upload or enter asset code below.'
          : err.message || 'Unable to access camera.'
      );
    }
  };

  const scanVideoFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        // Detected a QR code!
        const scannedText = code.data.trim();
        stopCamera();
        setAssetCode(scannedText);
        handleLookup(scannedText);
        return;
      }
    }

    animFrameIdRef.current = requestAnimationFrame(scanVideoFrame);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          const scannedText = code.data.trim();
          setAssetCode(scannedText);
          handleLookup(scannedText);
        } else {
          setError('No QR code detected in the uploaded image. Please try another image or enter the code manually.');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    // Reset file input so same file can be chosen again
    e.target.value = '';
  };

  if (!isOpen) return null;

  const parseScannedPayload = (raw: string): string => {
    const text = raw.trim();
    if (!text) return '';

    // If QR code contains JSON string (e.g. generated on backend with metadata)
    if (text.startsWith('{') && text.endsWith('}')) {
      try {
        const obj = JSON.parse(text);
        if (obj.code) return String(obj.code).trim();
        if (obj.assetCode) return String(obj.assetCode).trim();
        if (obj.id) return String(obj.id).trim();
      } catch {
        // Not JSON
      }
    }

    // If QR code contains URL with data parameter (e.g. qrserver)
    if (text.includes('data=')) {
      const match = text.match(/[?&]data=([^&]+)/);
      if (match) return decodeURIComponent(match[1]).trim();
    }

    // If URL ending in asset code (e.g. /assets/AST-ELEC-001)
    if (text.startsWith('http://') || text.startsWith('https://')) {
      const parts = text.split('/');
      const last = parts[parts.length - 1];
      if (last && (last.includes('AST-') || last.includes('ast-'))) {
        return last.trim();
      }
    }

    return text;
  };

  const handleLookup = async (codeToSearch: string) => {
    const cleanCode = parseScannedPayload(codeToSearch);
    if (!cleanCode) return;
    setError(null);
    setLoading(true);
    try {
      let foundAsset: Asset | null = null;
      let pastList: any[] = [];

      // 1. Try direct asset lookup by ID or Code
      try {
        const directRes = await api.getAssetById(cleanCode);
        if (directRes && directRes.asset) {
          foundAsset = directRes.asset;
          pastList = directRes.pastComplaints || [];
        }
      } catch {
        // Continue to search endpoint
      }

      // 2. If direct lookup did not find it, search asset collection
      if (!foundAsset) {
        const res = await api.getAssets({ code: cleanCode, search: cleanCode });
        if (res.assets && res.assets.length > 0) {
          const matched =
            res.assets.find(
              (a) =>
                a.assetCode.toLowerCase() === cleanCode.toLowerCase() ||
                a.id.toLowerCase() === cleanCode.toLowerCase()
            ) || res.assets[0];

          const detailRes = await api.getAssetById(matched.id);
          foundAsset = detailRes.asset;
          pastList = detailRes.pastComplaints || [];
        }
      }

      if (!foundAsset) {
        setError(`No registered asset found with code "${cleanCode}".`);
        setAsset(null);
        setPastComplaints([]);
      } else {
        setAsset(foundAsset);
        setPastComplaints(pastList);
      }
    } catch (err: any) {
      setError(err.message || 'Lookup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Asset QR &amp; History Lookup
              </h2>
              <p className="text-xs text-slate-500">Scan or enter equipment QR code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Scanner Area */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[220px]">
            <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

            {/* Hidden canvas for video frame extraction */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Hidden file input for QR image upload */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            {isCameraActive ? (
              <div className="relative w-full flex flex-col items-center">
                <div className="relative w-full max-w-xs aspect-4/3 rounded-xl overflow-hidden bg-black border-2 border-sky-500 shadow-lg">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    muted
                  />
                  {/* Scanner Reticle */}
                  <div className="absolute inset-0 border-2 border-dashed border-sky-400/80 rounded-lg m-6 pointer-events-none flex items-center justify-center">
                    <ScanLine className="w-10 h-10 text-sky-400 animate-pulse" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-sky-300 font-medium flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                    Scanning for equipment QR code...
                  </span>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-3 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1"
                  >
                    <CameraOff className="w-3.5 h-3.5" />
                    Stop Camera
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                <ScanLine className="w-12 h-12 text-sky-400 animate-pulse mb-2" />
                <span className="text-xs font-semibold text-slate-200">
                  Equipment Barcode &amp; QR Scanner
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 max-w-xs">
                  Scan physical asset tag with camera, upload a photo, or choose a test code
                </span>

                {cameraError && (
                  <div className="mt-2.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] max-w-sm">
                    {cameraError}
                  </div>
                )}

                {/* Scanner Actions: Live Camera & Upload */}
                <div className="mt-4 flex flex-wrap justify-center gap-2 z-10">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Start Camera
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload QR Image
                  </button>
                </div>

                {/* 1-Click Simulated codes */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 w-full flex flex-col items-center">
                  <span className="text-[10px] text-slate-400 font-medium mb-1.5">
                    Or 1-Click Test Scenarios:
                  </span>
                  <div className="flex flex-wrap justify-center gap-1.5 z-10">
                    {SAMPLE_CODES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setAssetCode(c);
                          handleLookup(c);
                        }}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-sky-900/60 text-sky-300 text-[10px] font-mono border border-slate-700 cursor-pointer"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Manual Input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLookup(assetCode);
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Enter Asset Code (e.g. AST-ELEC-001)"
                value={assetCode}
                onChange={(e) => setAssetCode(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-sky-600 hover:bg-sky-500 text-white transition disabled:opacity-50 flex items-center gap-1"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
            </button>
          </form>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Asset details if found */}
          {asset && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
                      {asset.assetCode}
                    </span>
                    <ConditionBadge condition={asset.condition} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {asset.name}
                  </h3>
                  <div className="text-xs text-slate-500">
                    Location: {asset.block}, Room {asset.roomNumber} (Floor {asset.floor})
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewingQrForAsset(asset)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-950/60 hover:text-sky-600 flex items-center gap-1.5 transition cursor-pointer border border-slate-200 dark:border-slate-700"
                    title="View & Download QR tag"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>View QR Tag</span>
                  </button>

                  {onAssetSelected && (
                    <button
                      onClick={() => {
                        onAssetSelected(asset);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm cursor-pointer"
                    >
                      Select Asset
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Purchase Cost</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    ₹{asset.purchaseCost.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Total Repair Cost</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    ₹{asset.totalRepairCost.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Warranty Exp.</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {asset.warrantyExpiryDate}
                  </span>
                </div>
              </div>

              {/* Maintenance History */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5 flex items-center gap-1">
                  <History className="w-3 h-3" />
                  Past Failure History ({pastComplaints.length} tickets)
                </span>

                {pastComplaints.length === 0 ? (
                  <div className="text-xs text-slate-500 italic">
                    No previous breakdown records on this asset.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {pastComplaints.map((c) => (
                      <div
                        key={c.id}
                        className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {c.title}
                          </span>
                          <div className="text-[10px] text-slate-400">
                            {new Date(c.createdAt).toLocaleDateString()} · Status: {c.status}
                          </div>
                        </div>
                        {c.totalRepairCost ? (
                          <span className="text-xs font-semibold text-rose-600">
                            ₹{c.totalRepairCost}
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {viewingQrForAsset && (
        <AssetQrTagModal
          asset={viewingQrForAsset}
          onClose={() => setViewingQrForAsset(null)}
        />
      )}
    </div>
  );
};
