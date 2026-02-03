import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, ToggleLeft, ToggleRight, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCeremonyStore } from '@/stores/ceremonyStore';

export const SectionManager = () => {
  const { sections, addSection, deleteSection, toggleSectionScanning, setActiveSection, ceremonyState } = useCeremonyStore();
  const [newSectionName, setNewSectionName] = useState('');

  const handleAddSection = () => {
    if (newSectionName.trim()) {
      addSection(newSectionName.trim());
      setNewSectionName('');
    }
  };

  return (
    <div className="admin-card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="admin-header flex items-center gap-2">
          <Layers className="w-6 h-6 text-gold" />
          Sections
        </h3>
      </div>

      {/* Add Section */}
      <div className="flex gap-2 mb-6">
        <Input
          value={newSectionName}
          onChange={(e) => setNewSectionName(e.target.value)}
          placeholder="New section name"
          className="bg-muted border-border"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAddSection();
            }
          }}
        />
        <Button onClick={handleAddSection} className="bg-gold hover:bg-gold-dark text-primary-foreground">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Section List */}
      <div className="space-y-3">
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
              ceremonyState.activeSection === section.id
                ? 'bg-gold/10 border-gold/30'
                : 'bg-muted/50 border-border'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${section.isActive ? 'bg-emerald-400' : 'bg-muted-foreground'}`} />
              <span className="font-medium">{section.name}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Set Active */}
              <Button
                size="sm"
                variant={ceremonyState.activeSection === section.id ? 'default' : 'outline'}
                onClick={() => setActiveSection(ceremonyState.activeSection === section.id ? null : section.id)}
                className={ceremonyState.activeSection === section.id ? 'bg-gold hover:bg-gold-dark text-primary-foreground' : ''}
              >
                {ceremonyState.activeSection === section.id ? 'Active' : 'Set Active'}
              </Button>

              {/* Toggle Scanning */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => toggleSectionScanning(section.id)}
                disabled={ceremonyState.activeSection !== section.id}
                className={section.scanningEnabled ? 'text-emerald-400' : 'text-muted-foreground'}
              >
                {section.scanningEnabled ? (
                  <ToggleRight className="w-5 h-5" />
                ) : (
                  <ToggleLeft className="w-5 h-5" />
                )}
              </Button>

              {/* Delete */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteSection(section.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {sections.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No sections created</p>
          <p className="text-sm mt-1">Add sections to organize your ceremony</p>
        </div>
      )}
    </div>
  );
};
