import { useCeremonyStore } from '@/stores/ceremonyStore';

// Sample student data for demo purposes
export const sampleStudents = [
  {
    firstName: 'Alexandra',
    lastName: 'Martinez',
    name: 'Alexandra Martinez',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
    section: 'Section A',
    awards: ['Summa Cum Laude', 'Best in Computer Science'],
  },
  {
    firstName: 'James',
    lastName: 'Anderson',
    name: 'James Anderson',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    section: 'Section A',
    awards: ['Magna Cum Laude'],
  },
  {
    firstName: 'Emily',
    lastName: 'Chen',
    name: 'Emily Chen',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    section: 'Section A',
    awards: ['With Honors', 'Dean\'s Lister'],
  },
  {
    firstName: 'Michael',
    lastName: 'Johnson',
    name: 'Michael Johnson',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    section: 'Section B',
    awards: ['Cum Laude'],
  },
  {
    firstName: 'Sarah',
    lastName: 'Williams',
    name: 'Sarah Williams',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    section: 'Section B',
    awards: ['Best in Mathematics', 'Academic Excellence'],
  },
  {
    firstName: 'David',
    lastName: 'Thompson',
    name: 'David Thompson',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    section: 'Section B',
    awards: [],
  },
  {
    firstName: 'Isabella',
    lastName: 'Rodriguez',
    name: 'Isabella Rodriguez',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
    section: 'Section C',
    awards: ['Valedictorian', 'Gold Medal'],
  },
  {
    firstName: 'Robert',
    lastName: 'Davis',
    name: 'Robert Davis',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
    section: 'Section C',
    awards: ['Leadership Award'],
  },
];

export const loadSampleData = () => {
  const store = useCeremonyStore.getState();
  
  // Only load if no students exist
  if (store.students.length === 0) {
    sampleStudents.forEach((student) => {
      store.addStudent(student);
    });
  }
};
