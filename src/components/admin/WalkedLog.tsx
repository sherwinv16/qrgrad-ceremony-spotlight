import { motion } from 'framer-motion';
import { History, User, Clock } from 'lucide-react';
import { useCeremonyStore } from '@/stores/ceremonyStore';
import { format } from 'date-fns';

export const WalkedLog = () => {
  const { walkedStudents } = useCeremonyStore();

  const sortedStudents = [...walkedStudents].sort(
    (a, b) => new Date(b.walkedAt || 0).getTime() - new Date(a.walkedAt || 0).getTime()
  );

  return (
    <div className="admin-card">
      <h3 className="admin-header flex items-center gap-2 mb-6">
        <History className="w-6 h-6 text-gold" />
        Ceremony Log ({walkedStudents.length})
      </h3>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {sortedStudents.map((student, index) => (
          <motion.div
            key={`${student.id}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-gold/30">
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
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {student.walkedAt ? format(new Date(student.walkedAt), 'HH:mm:ss') : '-'}
            </div>
          </motion.div>
        ))}
      </div>

      {walkedStudents.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No students have walked yet</p>
        </div>
      )}
    </div>
  );
};
