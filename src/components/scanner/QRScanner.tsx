import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion } from 'framer-motion';
import { Camera, CameraOff, Scan } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QRScannerProps {
  onScan: (code: string) => void;
  isEnabled: boolean;
}

export const QRScanner = ({ onScan, isEnabled }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startScanner = useCallback(async () => {
    if (!containerRef.current || scannerRef.current) return;

    try {
      const scanner = new Html5Qrcode('qr-scanner-container');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText);
          // Play success feedback
          if (navigator.vibrate) {
            navigator.vibrate(200);
          }
        },
        () => {
          // Ignore scan errors
        }
      );

      setIsScanning(true);
      setError(null);
    } catch (err) {
      setError('Failed to start camera. Please ensure camera permissions are granted.');
      console.error('Scanner error:', err);
    }
  }, [onScan]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  useEffect(() => {
    if (!isEnabled && isScanning) {
      stopScanner();
    }
  }, [isEnabled, isScanning, stopScanner]);

  return (
    <div className="admin-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="admin-header flex items-center gap-2">
          <Scan className="w-6 h-6 text-gold" />
          QR Scanner
        </h3>
        <div className={`px-3 py-1 rounded-full text-sm border ${isEnabled ? 'status-active' : 'status-pending'}`}>
          {isEnabled ? 'Enabled' : 'Disabled'}
        </div>
      </div>

      {!isEnabled && (
        <div className="text-center py-8 text-muted-foreground">
          <CameraOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Enable scanning for a section to start</p>
        </div>
      )}

      {isEnabled && (
        <div className="space-y-4">
          <div 
            id="qr-scanner-container" 
            ref={containerRef}
            className="w-full aspect-square max-w-sm mx-auto rounded-lg overflow-hidden bg-muted"
          />

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive"
            >
              {error}
            </motion.div>
          )}

          <div className="flex justify-center gap-4">
            {!isScanning ? (
              <Button
                onClick={startScanner}
                className="bg-gold hover:bg-gold-dark text-primary-foreground"
              >
                <Camera className="w-4 h-4 mr-2" />
                Start Camera
              </Button>
            ) : (
              <Button
                onClick={stopScanner}
                variant="destructive"
              >
                <CameraOff className="w-4 h-4 mr-2" />
                Stop Camera
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
