import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Settings, Monitor, QrCode, Volume2, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { loadSampleData } from '@/data/sampleStudents';
import { useCeremonyStore } from '@/stores/ceremonyStore';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { students } = useCeremonyStore();
  const { toast } = useToast();

  const features = [
    {
      icon: QrCode,
      title: 'QR Code Scanning',
      description: 'Instant student identification with fast QR scanning',
    },
    {
      icon: Monitor,
      title: 'LED Display Ready',
      description: 'Beautiful full-screen display optimized for projectors',
    },
    {
      icon: Volume2,
      title: 'Voice Announcement',
      description: 'Natural text-to-speech for ceremonial name reading',
    },
    {
      icon: Settings,
      title: 'Full Control',
      description: 'Manage sections, students, and ceremony flow easily',
    },
  ];

  const handleLoadSample = () => {
    loadSampleData();
    toast({
      title: "Sample Data Loaded",
      description: "8 sample students have been added to the system",
    });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center border border-gold/30">
              <GraduationCap className="w-7 h-7 text-gold" />
            </div>
            <span className="font-display text-2xl font-bold text-foreground">QRGrad</span>
          </div>
          <Link to="/admin">
            <Button variant="outline" className="border-gold/30 hover:bg-gold/10 hover:text-gold">
              <Shield className="w-4 h-4 mr-2" />
              Admin Panel
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="relative z-10 container mx-auto px-4 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 text-gold text-sm font-medium mb-8"
          >
            <GraduationCap className="w-4 h-4" />
            Graduation Ceremony System
          </motion.div>

          <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Make Every
            <br />
            <span className="text-gold">Graduate</span> Shine
          </h1>

          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto font-elegant">
            A modern QR-based graduation ceremony system with beautiful displays, 
            voice announcements, and seamless ceremony management.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/admin">
              <Button size="lg" className="bg-gold hover:bg-gold-dark text-primary-foreground px-8 h-14 text-lg">
                <Settings className="w-5 h-5 mr-2" />
                Open Admin Dashboard
              </Button>
            </Link>
            <Link to="/display" target="_blank">
              <Button size="lg" variant="outline" className="px-8 h-14 text-lg border-gold/30 hover:bg-gold/10">
                <Monitor className="w-5 h-5 mr-2" />
                Launch Display
              </Button>
            </Link>
          </div>

          {/* Load Sample Data */}
          {students.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8"
            >
              <Button
                variant="ghost"
                onClick={handleLoadSample}
                className="text-muted-foreground hover:text-gold"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Load Sample Data for Demo
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-24"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="admin-card text-center group hover:border-gold/30 transition-colors"
            >
              <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-gold/20 transition-colors">
                <feature.icon className="w-7 h-7 text-gold" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-24 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
          <div className="rounded-2xl overflow-hidden border border-border bg-card/50 backdrop-blur-sm p-2">
            <div className="rounded-xl overflow-hidden aspect-video bg-gradient-to-br from-navy-deep to-background flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 rounded-full border-2 border-gold/30 mx-auto mb-6 flex items-center justify-center">
                  <GraduationCap className="w-16 h-16 text-gold/50" />
                </div>
                <h2 className="font-display text-3xl text-gold/50 mb-2">Preview Display</h2>
                <p className="text-muted-foreground font-elegant">Open the display to see graduates</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 container mx-auto px-4 py-8 mt-16 border-t border-border">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <GraduationCap className="w-5 h-5" />
            <span className="font-display">QRGrad</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Designed for graduation ceremonies at schools and universities
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
