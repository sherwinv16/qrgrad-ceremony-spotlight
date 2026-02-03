import { motion } from 'framer-motion';
import { Play, Square, RotateCcw, Users, UserCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCeremonyStore } from '@/stores/ceremonyStore';

export const CeremonyControls = () => {
  const { 
    ceremonyState, 
    startCeremony, 
    endCeremony, 
    resetCeremony,
    students,
    walkedStudents 
  } = useCeremonyStore();

  const totalStudents = students.length;
  const walkedCount = walkedStudents.length;
  const remainingCount = totalStudents - walkedCount;

  return (
    <div className="admin-card">
      <h3 className="admin-header mb-6">Ceremony Controls</h3>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 rounded-lg bg-muted/50">
          <Users className="w-6 h-6 mx-auto mb-2 text-gold" />
          <div className="text-2xl font-bold text-foreground">{totalStudents}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
        <div className="text-center p-4 rounded-lg bg-muted/50">
          <UserCheck className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
          <div className="text-2xl font-bold text-emerald-400">{walkedCount}</div>
          <div className="text-xs text-muted-foreground">Walked</div>
        </div>
        <div className="text-center p-4 rounded-lg bg-muted/50">
          <Clock className="w-6 h-6 mx-auto mb-2 text-amber-400" />
          <div className="text-2xl font-bold text-amber-400">{remainingCount}</div>
          <div className="text-xs text-muted-foreground">Remaining</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Progress</span>
          <span>{totalStudents > 0 ? Math.round((walkedCount / totalStudents) * 100) : 0}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-gold to-gold-light"
            initial={{ width: 0 }}
            animate={{ width: `${totalStudents > 0 ? (walkedCount / totalStudents) * 100 : 0}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-3">
        {!ceremonyState.ceremonyStarted ? (
          <Button
            onClick={startCeremony}
            className="w-full bg-gold hover:bg-gold-dark text-primary-foreground"
            size="lg"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Ceremony
          </Button>
        ) : (
          <Button
            onClick={endCeremony}
            variant="destructive"
            className="w-full"
            size="lg"
          >
            <Square className="w-5 h-5 mr-2" />
            End Ceremony
          </Button>
        )}

        <Button
          onClick={resetCeremony}
          variant="outline"
          className="w-full"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset All Progress
        </Button>
      </div>

      {/* Status */}
      <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${ceremonyState.ceremonyStarted ? 'bg-emerald-400 animate-pulse' : 'bg-muted-foreground'}`} />
          <span className="text-sm font-medium">
            {ceremonyState.ceremonyStarted ? 'Ceremony In Progress' : 'Ceremony Not Started'}
          </span>
        </div>
        {ceremonyState.currentStudent && (
          <div className="mt-2 text-sm text-muted-foreground">
            Currently displaying: <span className="text-gold">{ceremonyState.currentStudent.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};
