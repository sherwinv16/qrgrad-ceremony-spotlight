import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCeremonyStore } from '@/stores/ceremonyStore';
import { useToast } from '@/hooks/use-toast';

interface ManualOverrideProps {
  onSelectStudent: (studentId: string) => void;
}

export const ManualOverride = ({ onSelectStudent }: ManualOverrideProps) => {
  const { students, sections, ceremonyState } = useCeremonyStore();
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const activeSection = sections.find(s => s.id === ceremonyState.activeSection);
  
  const filteredStudents = students.filter(
    (s) =>
      !s.hasWalked &&
      (activeSection ? s.section === activeSection.name : true) &&
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (studentId: string) => {
    onSelectStudent(studentId);
    toast({
      title: "Student Selected",
      description: "Manually triggered display for student",
    });
    setSearchQuery('');
  };

  return (
    <div className="admin-card">
      <h3 className="admin-header flex items-center gap-2 mb-4">
        <UserPlus className="w-6 h-6 text-gold" />
        Manual Override
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Click to display a student if QR scanning fails
      </p>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search student..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-muted border-border"
        />
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredStudents.slice(0, 10).map((student) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border hover:border-gold/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <img
                src={student.photo || '/placeholder.svg'}
                alt={student.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground truncate">{student.name}</div>
              <div className="text-xs text-muted-foreground">{student.section}</div>
            </div>
            <Button
              size="sm"
              onClick={() => handleSelect(student.id)}
              className="bg-gold hover:bg-gold-dark text-primary-foreground"
            >
              <CheckCircle className="w-4 h-4" />
            </Button>
          </motion.div>
        ))}

        {filteredStudents.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No matching students found
          </div>
        )}
      </div>
    </div>
  );
};
