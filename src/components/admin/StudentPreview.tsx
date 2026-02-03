import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Student } from '@/types/student';
import { CeremonyDisplay } from '@/components/ceremony/CeremonyDisplay';

interface StudentPreviewProps {
  student: Student;
  onClose: () => void;
}

export const StudentPreview = ({ student, onClose }: StudentPreviewProps) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
        onClick={onClose}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-background/50 backdrop-blur-sm hover:bg-background/80"
        >
          <X className="w-6 h-6" />
        </Button>
        
        <CeremonyDisplay student={student} />
      </motion.div>
    </AnimatePresence>
  );
};
