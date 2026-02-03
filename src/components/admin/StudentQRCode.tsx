import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Student } from '@/types/student';
import { useRef } from 'react';

interface StudentQRCodeProps {
  student: Student;
  onClose: () => void;
}

export const StudentQRCode = ({ student, onClose }: StudentQRCodeProps) => {
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = 400;
      canvas.height = 500;
      
      if (ctx) {
        // White background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw QR code
        ctx.drawImage(img, 50, 50, 300, 300);
        
        // Add name
        ctx.fillStyle = 'black';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(student.name, 200, 400);
        
        // Add section
        ctx.font = '16px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText(student.section, 200, 430);
        
        // Download
        const link = document.createElement('a');
        link.download = `${student.name.replace(/\s+/g, '_')}_QR.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>QR Code - ${student.name}</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                font-family: Arial, sans-serif;
                margin: 0;
              }
              .qr-container {
                text-align: center;
                padding: 40px;
                border: 2px solid #d4af37;
                border-radius: 12px;
              }
              .name {
                font-size: 24px;
                font-weight: bold;
                margin-top: 20px;
              }
              .section {
                font-size: 18px;
                color: #666;
                margin-top: 8px;
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              ${qrRef.current?.innerHTML}
              <div class="name">${student.name}</div>
              <div class="section">${student.section}</div>
            </div>
            <script>
              window.onload = () => {
                window.print();
                window.close();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="admin-card w-full max-w-sm text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="admin-header">QR Code</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div ref={qrRef} className="qr-container mx-auto w-fit mb-6">
            <QRCodeSVG
              value={student.qrCode}
              size={200}
              level="H"
              includeMargin
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-lg text-foreground">{student.name}</h3>
            <p className="text-muted-foreground">{student.section}</p>
          </div>

          <div className="text-xs text-muted-foreground mb-6 font-mono break-all">
            {student.qrCode}
          </div>

          <div className="flex gap-3">
            <Button onClick={handleDownload} className="flex-1 bg-gold hover:bg-gold-dark text-primary-foreground">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button onClick={handlePrint} variant="outline" className="flex-1">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
