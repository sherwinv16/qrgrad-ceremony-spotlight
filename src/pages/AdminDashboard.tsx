import { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { StudentList } from '@/components/admin/StudentList';
import { SectionManager } from '@/components/admin/SectionManager';
import { CeremonyControls } from '@/components/admin/CeremonyControls';
import { WalkedLog } from '@/components/admin/WalkedLog';
import { ManualOverride } from '@/components/admin/ManualOverride';
import { QRScanner } from '@/components/scanner/QRScanner';
import { useCeremonyStore } from '@/stores/ceremonyStore';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ExternalLink, GraduationCap, Settings, Scan, History, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('students');
  const { 
    getStudentByQR, 
    setCurrentStudent, 
    markStudentWalked, 
    sections,
    ceremonyState 
  } = useCeremonyStore();
  const { speakGraduate } = useTextToSpeech();
  const { toast } = useToast();
  const { signOut, user } = useAuth();

  const activeSection = sections.find(s => s.id === ceremonyState.activeSection);
  const isScanningEnabled = activeSection?.scanningEnabled || false;

  const handleQRScan = useCallback(async (qrCode: string) => {
    console.log('[AdminDashboard] QR Scanned:', qrCode);
    const student = getStudentByQR(qrCode);
    
    if (!student) {
      toast({
        title: "Unknown QR Code",
        description: "This QR code is not registered in the system",
        variant: "destructive",
      });
      return;
    }

    if (student.hasWalked) {
      toast({
        title: "Already Walked",
        description: `${student.name} has already walked`,
        variant: "destructive",
      });
      return;
    }

    if (activeSection && student.section !== activeSection.name) {
      toast({
        title: "Wrong Section",
        description: `${student.name} is from ${student.section}, not ${activeSection.name}`,
        variant: "destructive",
      });
      return;
    }

    // Display student - this broadcasts to display page
    console.log('[AdminDashboard] Setting current student:', student.name);
    setCurrentStudent(student);
    markStudentWalked(student.id);
    
    // Announce name
    await speakGraduate(student.name, student.awards);

    toast({
      title: "Student Displayed",
      description: student.name,
    });

    // Clear after delay
    setTimeout(() => {
      console.log('[AdminDashboard] Clearing current student');
      setCurrentStudent(null);
    }, 8000);
  }, [getStudentByQR, setCurrentStudent, markStudentWalked, speakGraduate, toast, activeSection]);

  const handleManualSelect = useCallback(async (studentId: string) => {
    console.log('[AdminDashboard] Manual select:', studentId);
    const student = useCeremonyStore.getState().students.find(s => s.id === studentId);
    if (student) {
      console.log('[AdminDashboard] Setting current student (manual):', student.name);
      setCurrentStudent(student);
      markStudentWalked(student.id);
      await speakGraduate(student.name, student.awards);
      
      toast({
        title: "Student Displayed",
        description: `${student.name} is now showing on the display`,
      });
      
      setTimeout(() => {
        console.log('[AdminDashboard] Clearing current student (manual)');
        setCurrentStudent(null);
      }, 8000);
    }
  }, [setCurrentStudent, markStudentWalked, speakGraduate, toast]);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">QRGrad</h1>
              <p className="text-xs text-muted-foreground">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user.email}
              </span>
            )}
            <Link to="/display" target="_blank">
              <Button variant="outline" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Open Display</span>
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 bg-muted">
                <TabsTrigger value="students" className="gap-2 data-[state=active]:bg-gold data-[state=active]:text-primary-foreground">
                  <GraduationCap className="w-4 h-4" />
                  Students
                </TabsTrigger>
                <TabsTrigger value="sections" className="gap-2 data-[state=active]:bg-gold data-[state=active]:text-primary-foreground">
                  <Settings className="w-4 h-4" />
                  Sections
                </TabsTrigger>
                <TabsTrigger value="scanner" className="gap-2 data-[state=active]:bg-gold data-[state=active]:text-primary-foreground">
                  <Scan className="w-4 h-4" />
                  Scanner
                </TabsTrigger>
              </TabsList>

              <TabsContent value="students" className="mt-6">
                <StudentList />
              </TabsContent>

              <TabsContent value="sections" className="mt-6">
                <SectionManager />
              </TabsContent>

              <TabsContent value="scanner" className="mt-6 space-y-6">
                <QRScanner onScan={handleQRScan} isEnabled={isScanningEnabled} />
                <ManualOverride onSelectStudent={handleManualSelect} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Controls & Log */}
          <div className="space-y-6">
            <CeremonyControls />
            <WalkedLog />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
