import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, Edit2, QrCode, Eye, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCeremonyStore } from '@/stores/ceremonyStore';
import { Student } from '@/types/student';
import { StudentForm } from './StudentForm';
import { StudentQRCode } from './StudentQRCode';
import { StudentPreview } from './StudentPreview';
import { useToast } from '@/hooks/use-toast';

const MAX_STUDENTS = 1000;

export const StudentList = () => {
  const { students, deleteStudent } = useCeremonyStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showQR, setShowQR] = useState<Student | null>(null);
  const [previewStudent, setPreviewStudent] = useState<Student | null>(null);
  const { toast } = useToast();

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.section.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingStudent(null);
  };

  const handleAddStudent = () => {
    if (students.length >= MAX_STUDENTS) {
      toast({
        title: "Limit Reached",
        description: `Maximum of ${MAX_STUDENTS} students allowed`,
        variant: "destructive",
      });
      return;
    }
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="admin-header flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-gold" />
            Students ({students.length} / {MAX_STUDENTS})
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage graduate information and QR codes
          </p>
        </div>
        <Button
          onClick={handleAddStudent}
          className="bg-gold hover:bg-gold-dark text-primary-foreground"
          disabled={students.length >= MAX_STUDENTS}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or section..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-muted border-border"
        />
      </div>

      {/* Student Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredStudents.map((student, index) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="admin-card group relative"
          >
            <div className="flex gap-4">
              {/* Photo */}
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                <img
                  src={student.photo || '/placeholder.svg'}
                  alt={student.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{student.name}</h3>
                <p className="text-sm text-muted-foreground">{student.section}</p>
                {student.awards.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {student.awards.slice(0, 2).map((award, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/30"
                      >
                        {award}
                      </span>
                    ))}
                    {student.awards.length > 2 && (
                      <span className="text-xs text-muted-foreground">
                        +{student.awards.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Status */}
              {student.hasWalked && (
                <div className="absolute top-2 right-2">
                  <span className="status-completed text-xs px-2 py-1 rounded-full border">
                    Walked
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-border">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setPreviewStudent(student)}
                className="flex-1 text-muted-foreground hover:text-foreground"
              >
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowQR(student)}
                className="flex-1 text-gold hover:text-gold-light"
              >
                <QrCode className="w-4 h-4 mr-1" />
                QR
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEdit(student)}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteStudent(student.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No students found</p>
          <p className="text-sm mt-1">Add your first student to get started</p>
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <StudentForm
          student={editingStudent}
          onClose={handleCloseForm}
        />
      )}

      {showQR && (
        <StudentQRCode
          student={showQR}
          onClose={() => setShowQR(null)}
        />
      )}

      {previewStudent && (
        <StudentPreview
          student={previewStudent}
          onClose={() => setPreviewStudent(null)}
        />
      )}
    </div>
  );
};
