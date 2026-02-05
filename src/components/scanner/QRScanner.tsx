import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion } from 'framer-motion';
import { Camera, CameraOff, Scan, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QRScannerProps {
  onScan: (code: string) => void;
  isEnabled: boolean;
}

export const QRScanner = ({ onScan, isEnabled }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerIdRef = useRef<string>(`qr-scanner-${Date.now()}`);
  const isMountedRef = useRef<boolean>(true);
  const scanCooldownRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const startScanner = useCallback(async () => {
    const containerId = containerIdRef.current;
    const containerElement = document.getElementById(containerId);
    if (!containerElement || scannerRef.current) return;

    try {
      setError(null);
      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Prevent duplicate scans within 3 seconds
          if (lastScanned === decodedText) return;
          
          if (scanCooldownRef.current) {
            clearTimeout(scanCooldownRef.current);
          }
          
          setLastScanned(decodedText);
          onScan(decodedText);
          
          // Play success feedback
          if (navigator.vibrate) {
            navigator.vibrate(200);
          }
          
          // Reset cooldown after 3 seconds
          scanCooldownRef.current = setTimeout(() => {
            setLastScanned(null);
          }, 3000);
        },
        () => {
          // Ignore scan errors (no QR found)
        }
      );

      if (isMountedRef.current) {
        setIsScanning(true);
      }
    } catch (err: any) {
      console.error('Scanner error:', err);
      if (isMountedRef.current) {
        if (err?.message?.includes('Permission')) {
          setError('Camera permission denied. Please allow camera access in your browser settings.');
        } else if (err?.message?.includes('NotFoundError')) {
          setError('No camera found. Please connect a camera and try again.');
        } else {
          setError('Failed to start camera. Please ensure camera permissions are granted.');
        }
      }
    }
  }, [onScan, lastScanned]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const scanner = scannerRef.current;
        scannerRef.current = null;
        
        // Check if scanner is running before stopping
        if (scanner.isScanning) {
          await scanner.stop();
        }
        
        if (isMountedRef.current) {
          setIsScanning(false);
          setError(null);
        }
      } catch (err) {
        console.error('Error stopping scanner:', err);
        // Even on error, try to clean up
        scannerRef.current = null;
        if (isMountedRef.current) {
          setIsScanning(false);
        }
      }
    }
  }, []);

  // Create scanner container on mount, outside of React's control
  useEffect(() => {
    isMountedRef.current = true;
    const containerId = containerIdRef.current;
    
    // Create the scanner container element manually
    if (wrapperRef.current) {
      const existingContainer = document.getElementById(containerId);
      if (!existingContainer) {
        const container = document.createElement('div');
        container.id = containerId;
        container.style.width = '100%';
        container.style.height = '100%';
        wrapperRef.current.appendChild(container);
      }
    }
    
    return () => {
      isMountedRef.current = false;
      if (scanCooldownRef.current) {
        clearTimeout(scanCooldownRef.current);
      }
      // Synchronous cleanup for unmount
      if (scannerRef.current) {
        const scanner = scannerRef.current;
        scannerRef.current = null;
        
        // Stop scanner asynchronously but don't wait
        if (scanner.isScanning) {
          scanner.stop().catch(() => {});
        }
      }
      
      // Remove the manually created container
      const containerElement = document.getElementById(containerId);
      if (containerElement && containerElement.parentNode) {
        containerElement.parentNode.removeChild(containerElement);
      }
    };
  }, []);

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
          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium mb-2">Scanner Disabled</p>
          <p className="text-sm">To enable scanning:</p>
          <ol className="text-sm mt-2 text-left max-w-xs mx-auto space-y-1">
            <li>1. Go to the "Sections" tab</li>
            <li>2. Click "Set Active" on a section</li>
            <li>3. Click the toggle icon to enable scanning</li>
          </ol>
        </div>
      )}

      {isEnabled && (
        <div className="space-y-4">
          {/* Wrapper for scanner - the actual container is created manually via useEffect */}
          <div className="w-full aspect-square max-w-sm mx-auto rounded-lg overflow-hidden bg-muted relative">
            {/* Placeholder shown when not scanning */}
            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <CameraOff className="w-12 h-12 text-muted-foreground/50" />
              </div>
            )}
            {/* Scanner container wrapper - content managed outside React */}
            <div 
              ref={wrapperRef} 
              className="absolute inset-0"
              style={{ display: isScanning ? 'block' : 'none' }}
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm"
            >
              {error}
            </motion.div>
          )}

          {lastScanned && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm text-center"
            >
              ✓ Scanned successfully
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
