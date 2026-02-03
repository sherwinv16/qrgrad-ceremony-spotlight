import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCeremonyStore } from '@/stores/ceremonyStore';
import { Student } from '@/types/student';

interface StudentFormProps {
  student?: Student | null;
  onClose: () => void;
}

export const StudentForm = ({ student, onClose }: StudentFormProps) => {
  const { sections, addStudent, updateStudent } = useCeremonyStore();
  const [formData, setFormData] = useState({
    firstName: student?.firstName || '',
    lastName: student?.lastName || '',
    photo: student?.photo || '',
    section: student?.section || sections[0]?.name || '',
    awards: student?.awards || [],
  });
  const [newAward, setNewAward] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const studentData = {
      ...formData,
      name: `${formData.firstName} ${formData.lastName}`,
    };

    if (student) {
      updateStudent(student.id, studentData);
    } else {
      addStudent(studentData);
    }

    onClose();
  };

  const handleAddAward = () => {
    if (newAward.trim()) {
      setFormData((prev) => ({
        ...prev,
        awards: [...prev.awards, newAward.trim()],
      }));
      setNewAward('');
    }
  };

  const handleRemoveAward = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      awards: prev.awards.filter((_, i) => i !== index),
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          photo: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
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
          className="admin-card w-full max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="admin-header">
              {student ? 'Edit Student' : 'Add New Student'}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo Upload */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-dashed border-border bg-muted flex items-center justify-center">
                {formData.photo ? (
                  <img
                    src={formData.photo}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Upload className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div>
                <Label htmlFor="photo" className="cursor-pointer">
                  <span className="text-sm text-gold hover:text-gold-light underline">
                    Upload Photo
                  </span>
                </Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
                  placeholder="John"
                  required
                  className="bg-muted border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Doe"
                  required
                  className="bg-muted border-border"
                />
              </div>
            </div>

            {/* Section */}
            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Select
                value={formData.section}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, section: value }))}
              >
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.name}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Awards */}
            <div className="space-y-2">
              <Label>Awards & Honors</Label>
              <div className="flex gap-2">
                <Input
                  value={newAward}
                  onChange={(e) => setNewAward(e.target.value)}
                  placeholder="e.g., Magna Cum Laude"
                  className="bg-muted border-border"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAward();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddAward} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.awards.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.awards.map((award, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-gold/10 text-gold border border-gold/30 text-sm"
                    >
                      {award}
                      <button
                        type="button"
                        onClick={() => handleRemoveAward(index)}
                        className="hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-gold hover:bg-gold-dark text-primary-foreground">
                {student ? 'Update' : 'Add'} Student
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
