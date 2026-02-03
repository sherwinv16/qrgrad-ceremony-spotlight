export interface Student {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  photo: string;
  section: string;
  awards: string[];
  qrCode: string;
  hasWalked: boolean;
  walkedAt?: Date;
  createdAt: Date;
}

export interface Section {
  id: string;
  name: string;
  order: number;
  isActive: boolean;
  scanningEnabled: boolean;
}

export interface CeremonyState {
  currentStudent: Student | null;
  isDisplaying: boolean;
  ceremonyStarted: boolean;
  activeSection: string | null;
}
