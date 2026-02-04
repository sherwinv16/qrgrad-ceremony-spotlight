import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Student, Section, CeremonyState } from '@/types/student';
import { v4 as uuidv4 } from 'uuid';

// Broadcast channel for cross-tab communication
const BROADCAST_CHANNEL_NAME = 'qrgrad-ceremony-sync';

interface CeremonyStore {
  // Students
  students: Student[];
  addStudent: (student: Omit<Student, 'id' | 'qrCode' | 'hasWalked' | 'createdAt'>) => Student;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  getStudentByQR: (qrCode: string) => Student | undefined;
  markStudentWalked: (id: string) => void;
  
  // Sections
  sections: Section[];
  addSection: (name: string) => void;
  updateSection: (id: string, updates: Partial<Section>) => void;
  deleteSection: (id: string) => void;
  toggleSectionScanning: (id: string) => void;
  
  // Ceremony state
  ceremonyState: CeremonyState;
  setCurrentStudent: (student: Student | null) => void;
  startCeremony: () => void;
  endCeremony: () => void;
  setActiveSection: (sectionId: string | null) => void;
  
  // Walked log
  walkedStudents: Student[];
  clearWalkedLog: () => void;
  
  // Reset
  resetCeremony: () => void;
  
  // Sync
  broadcastUpdate: () => void;
}

// Create broadcast channel for cross-tab sync
let broadcastChannel: BroadcastChannel | null = null;

try {
  broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
} catch (e) {
  console.warn('BroadcastChannel not supported, falling back to localStorage events');
}

export const useCeremonyStore = create<CeremonyStore>()(
  persist(
    (set, get) => ({
      students: [],
      sections: [
        { id: 'section-a', name: 'Section A', order: 1, isActive: false, scanningEnabled: false },
        { id: 'section-b', name: 'Section B', order: 2, isActive: false, scanningEnabled: false },
        { id: 'section-c', name: 'Section C', order: 3, isActive: false, scanningEnabled: false },
      ],
      ceremonyState: {
        currentStudent: null,
        isDisplaying: false,
        ceremonyStarted: false,
        activeSection: null,
      },
      walkedStudents: [],

      broadcastUpdate: () => {
        const state = get();
        const syncData = {
          type: 'CEREMONY_UPDATE',
          ceremonyState: state.ceremonyState,
          timestamp: Date.now(),
        };
        
        if (broadcastChannel) {
          broadcastChannel.postMessage(syncData);
        }
        
        // Also use localStorage for fallback
        localStorage.setItem('qrgrad-sync', JSON.stringify(syncData));
      },

      addStudent: (studentData) => {
        const newStudent: Student = {
          ...studentData,
          id: uuidv4(),
          qrCode: `QRGRAD-${uuidv4()}`,
          hasWalked: false,
          createdAt: new Date(),
        };
        set((state) => ({ students: [...state.students, newStudent] }));
        return newStudent;
      },

      updateStudent: (id, updates) => {
        set((state) => ({
          students: state.students.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },

      deleteStudent: (id) => {
        set((state) => ({
          students: state.students.filter((s) => s.id !== id),
        }));
      },

      getStudentByQR: (qrCode) => {
        return get().students.find((s) => s.qrCode === qrCode);
      },

      markStudentWalked: (id) => {
        const student = get().students.find((s) => s.id === id);
        if (student) {
          const walkedStudent = { ...student, hasWalked: true, walkedAt: new Date() };
          set((state) => ({
            students: state.students.map((s) =>
              s.id === id ? walkedStudent : s
            ),
            walkedStudents: [...state.walkedStudents, walkedStudent],
          }));
        }
      },

      addSection: (name) => {
        const currentSections = get().sections;
        if (currentSections.length >= 50) {
          console.warn('Maximum of 50 sections reached');
          return;
        }
        const newSection: Section = {
          id: uuidv4(),
          name,
          order: currentSections.length + 1,
          isActive: false,
          scanningEnabled: false,
        };
        set((state) => ({ sections: [...state.sections, newSection] }));
      },

      updateSection: (id, updates) => {
        set((state) => ({
          sections: state.sections.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },

      deleteSection: (id) => {
        set((state) => ({
          sections: state.sections.filter((s) => s.id !== id),
        }));
      },

      toggleSectionScanning: (id) => {
        set((state) => ({
          sections: state.sections.map((s) =>
            s.id === id ? { ...s, scanningEnabled: !s.scanningEnabled } : s
          ),
        }));
      },

      setCurrentStudent: (student) => {
        set((state) => ({
          ceremonyState: {
            ...state.ceremonyState,
            currentStudent: student,
            isDisplaying: !!student,
          },
        }));
        // Broadcast the update to other tabs (display page)
        get().broadcastUpdate();
      },

      startCeremony: () => {
        set((state) => ({
          ceremonyState: {
            ...state.ceremonyState,
            ceremonyStarted: true,
          },
        }));
        get().broadcastUpdate();
      },

      endCeremony: () => {
        set((state) => ({
          ceremonyState: {
            ...state.ceremonyState,
            ceremonyStarted: false,
            currentStudent: null,
            isDisplaying: false,
          },
        }));
        get().broadcastUpdate();
      },

      setActiveSection: (sectionId) => {
        set((state) => ({
          ceremonyState: {
            ...state.ceremonyState,
            activeSection: sectionId,
          },
          sections: state.sections.map((s) => ({
            ...s,
            isActive: s.id === sectionId,
            scanningEnabled: s.id === sectionId ? s.scanningEnabled : false,
          })),
        }));
      },

      clearWalkedLog: () => {
        set({ walkedStudents: [] });
      },

      resetCeremony: () => {
        set((state) => ({
          students: state.students.map((s) => ({ ...s, hasWalked: false, walkedAt: undefined })),
          walkedStudents: [],
          ceremonyState: {
            currentStudent: null,
            isDisplaying: false,
            ceremonyStarted: false,
            activeSection: null,
          },
        }));
        get().broadcastUpdate();
      },
    }),
    {
      name: 'qrgrad-ceremony-storage',
    }
  )
);

// Listen for updates from other tabs
if (broadcastChannel) {
  broadcastChannel.onmessage = (event) => {
    if (event.data.type === 'CEREMONY_UPDATE') {
      const store = useCeremonyStore.getState();
      useCeremonyStore.setState({
        ceremonyState: event.data.ceremonyState,
      });
    }
  };
}

// Fallback: Listen for localStorage changes
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'qrgrad-sync' && event.newValue) {
      try {
        const data = JSON.parse(event.newValue);
        if (data.type === 'CEREMONY_UPDATE') {
          useCeremonyStore.setState({
            ceremonyState: data.ceremonyState,
          });
        }
      } catch (e) {
        console.error('Error parsing sync data:', e);
      }
    }
  });
}
