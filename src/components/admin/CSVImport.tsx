 import { useState, useRef } from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import { Upload, Download, FileText, AlertCircle, CheckCircle2, X, HelpCircle } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
 import { Alert, AlertDescription } from '@/components/ui/alert';
 import { useCeremonyStore } from '@/stores/ceremonyStore';
 import { useToast } from '@/hooks/use-toast';
 
 interface CSVRow {
   firstName: string;
   lastName: string;
   section: string;
   awards: string;
   photo: string;
 }
 
 interface ImportResult {
   success: number;
   errors: string[];
 }
 
 const CSV_TEMPLATE = `firstName,lastName,section,awards,photo
 John,Doe,Section A,"Magna Cum Laude, Dean's Lister",https://example.com/photo.jpg
 Jane,Smith,Section B,Summa Cum Laude,
 Robert,Johnson,Section A,,`;
 
 export const CSVImport = () => {
   const [isOpen, setIsOpen] = useState(false);
   const [isDragging, setIsDragging] = useState(false);
   const [preview, setPreview] = useState<CSVRow[]>([]);
   const [errors, setErrors] = useState<string[]>([]);
   const [importResult, setImportResult] = useState<ImportResult | null>(null);
   const [isProcessing, setIsProcessing] = useState(false);
   const fileInputRef = useRef<HTMLInputElement>(null);
   
   const { addStudentBulk, students } = useCeremonyStore();
   const { toast } = useToast();
   
   const MAX_STUDENTS = 1000;
   const remainingSlots = MAX_STUDENTS - students.length;
 
   const downloadTemplate = () => {
     const blob = new Blob([CSV_TEMPLATE.trim()], { type: 'text/csv' });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = 'students_template.csv';
     document.body.appendChild(a);
     a.click();
     document.body.removeChild(a);
     URL.revokeObjectURL(url);
     
     toast({
       title: "Template Downloaded",
       description: "Fill in the template and import it back",
     });
   };
 
   const parseCSV = (text: string): { rows: CSVRow[]; errors: string[] } => {
     const lines = text.trim().split('\n');
     const errors: string[] = [];
     const rows: CSVRow[] = [];
     
     if (lines.length < 2) {
       errors.push('CSV file must have a header row and at least one data row');
       return { rows, errors };
     }
     
     // Parse header
     const header = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));
     const requiredColumns = ['firstname', 'lastname', 'section'];
     const missingColumns = requiredColumns.filter(col => !header.includes(col));
     
     if (missingColumns.length > 0) {
       errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
       return { rows, errors };
     }
     
     const firstNameIdx = header.indexOf('firstname');
     const lastNameIdx = header.indexOf('lastname');
     const sectionIdx = header.indexOf('section');
     const awardsIdx = header.indexOf('awards');
     const photoIdx = header.indexOf('photo');
     
     // Parse data rows
     for (let i = 1; i < lines.length; i++) {
       const line = lines[i].trim();
       if (!line) continue;
       
       // Handle quoted values with commas inside
       const values: string[] = [];
       let current = '';
       let inQuotes = false;
       
       for (const char of line) {
         if (char === '"') {
           inQuotes = !inQuotes;
         } else if (char === ',' && !inQuotes) {
           values.push(current.trim());
           current = '';
         } else {
           current += char;
         }
       }
       values.push(current.trim());
       
       const firstName = values[firstNameIdx]?.trim() || '';
       const lastName = values[lastNameIdx]?.trim() || '';
       const section = values[sectionIdx]?.trim() || '';
       
       if (!firstName || !lastName) {
         errors.push(`Row ${i + 1}: First name and last name are required`);
         continue;
       }
       
       if (!section) {
         errors.push(`Row ${i + 1}: Section is required`);
         continue;
       }
       
       rows.push({
         firstName,
         lastName,
         section,
         awards: awardsIdx >= 0 ? values[awardsIdx]?.trim() || '' : '',
         photo: photoIdx >= 0 ? values[photoIdx]?.trim() || '' : '',
       });
     }
     
     return { rows, errors };
   };
 
   const handleFile = (file: File) => {
     if (!file.name.endsWith('.csv')) {
       setErrors(['Please upload a CSV file']);
       return;
     }
     
     const reader = new FileReader();
     reader.onload = (e) => {
       const text = e.target?.result as string;
       const { rows, errors } = parseCSV(text);
       
       if (rows.length > remainingSlots) {
         errors.push(`Can only import ${remainingSlots} more students (${rows.length} in file)`);
       }
       
       setPreview(rows.slice(0, remainingSlots));
       setErrors(errors);
       setImportResult(null);
     };
     reader.readAsText(file);
   };
 
   const handleDrop = (e: React.DragEvent) => {
     e.preventDefault();
     setIsDragging(false);
     const file = e.dataTransfer.files[0];
     if (file) handleFile(file);
   };
 
   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) handleFile(file);
   };
 
   const handleImport = async () => {
     if (preview.length === 0) return;
     
     setIsProcessing(true);
     const successCount = { value: 0 };
     const importErrors: string[] = [];
     
     try {
       const studentsToAdd = preview.map(row => ({
         firstName: row.firstName,
         lastName: row.lastName,
         name: `${row.firstName} ${row.lastName}`,
         section: row.section,
         awards: row.awards ? row.awards.split(',').map(a => a.trim()).filter(Boolean) : [],
         photo: row.photo || '',
       }));
       
       const added = addStudentBulk(studentsToAdd);
       successCount.value = added;
       
       setImportResult({
         success: successCount.value,
         errors: importErrors,
       });
       
       toast({
         title: "Import Complete",
         description: `Successfully imported ${successCount.value} students`,
       });
       
       setPreview([]);
     } catch (error) {
       importErrors.push('An error occurred during import');
       setImportResult({
         success: successCount.value,
         errors: importErrors,
       });
     } finally {
       setIsProcessing(false);
     }
   };
 
   const resetState = () => {
     setPreview([]);
     setErrors([]);
     setImportResult(null);
     if (fileInputRef.current) {
       fileInputRef.current.value = '';
     }
   };
 
   const handleClose = () => {
     setIsOpen(false);
     resetState();
   };
 
   return (
     <>
       <Button
         variant="outline"
         onClick={() => setIsOpen(true)}
         className="gap-2"
       >
         <Upload className="w-4 h-4" />
         Import CSV
       </Button>
 
       <Dialog open={isOpen} onOpenChange={handleClose}>
         <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2">
               <FileText className="w-5 h-5 text-gold" />
               Import Students from CSV
             </DialogTitle>
             <DialogDescription>
               Upload a CSV file to bulk import student data. Maximum {remainingSlots} students can be imported.
             </DialogDescription>
           </DialogHeader>
 
           <div className="space-y-4">
             {/* Instructions */}
             <Alert className="border-gold/30 bg-gold/5">
               <HelpCircle className="h-4 w-4 text-gold" />
               <AlertDescription className="text-sm">
                 <strong>Instructions:</strong>
                 <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                   <li><strong>firstName</strong> - Student's first name (required)</li>
                   <li><strong>lastName</strong> - Student's last name (required)</li>
                   <li><strong>section</strong> - Section name, e.g., "Section A" (required)</li>
                   <li><strong>awards</strong> - Comma-separated awards in quotes, e.g., "Magna Cum Laude, Dean's Lister"</li>
                   <li><strong>photo</strong> - URL to student photo (optional)</li>
                 </ul>
               </AlertDescription>
             </Alert>
 
             {/* Download Template Button */}
             <Button
               variant="outline"
               onClick={downloadTemplate}
               className="w-full gap-2 border-dashed"
             >
               <Download className="w-4 h-4" />
               Download CSV Template
             </Button>
 
             {/* Drop Zone */}
             <div
               className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                 isDragging 
                   ? 'border-gold bg-gold/10' 
                   : 'border-border hover:border-gold/50'
               }`}
               onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
               onDragLeave={() => setIsDragging(false)}
               onDrop={handleDrop}
             >
               <input
                 ref={fileInputRef}
                 type="file"
                 accept=".csv"
                 onChange={handleFileSelect}
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
               />
               <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
               <p className="text-sm text-muted-foreground">
                 Drag and drop your CSV file here, or click to browse
               </p>
             </div>
 
             {/* Errors */}
             <AnimatePresence>
               {errors.length > 0 && (
                 <motion.div
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: 'auto' }}
                   exit={{ opacity: 0, height: 0 }}
                 >
                   <Alert variant="destructive">
                     <AlertCircle className="h-4 w-4" />
                     <AlertDescription>
                       <ul className="list-disc list-inside text-sm">
                         {errors.map((error, i) => (
                           <li key={i}>{error}</li>
                         ))}
                       </ul>
                     </AlertDescription>
                   </Alert>
                 </motion.div>
               )}
             </AnimatePresence>
 
             {/* Preview */}
             <AnimatePresence>
               {preview.length > 0 && (
                 <motion.div
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   className="space-y-3"
                 >
                   <div className="flex items-center justify-between">
                     <h4 className="font-medium text-sm">
                       Preview ({preview.length} students)
                     </h4>
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={resetState}
                       className="h-8 px-2"
                     >
                       <X className="w-4 h-4" />
                     </Button>
                   </div>
                   
                   <div className="max-h-48 overflow-y-auto rounded-lg border border-border">
                     <table className="w-full text-sm">
                       <thead className="bg-muted sticky top-0">
                         <tr>
                           <th className="text-left p-2 font-medium">Name</th>
                           <th className="text-left p-2 font-medium">Section</th>
                           <th className="text-left p-2 font-medium">Awards</th>
                         </tr>
                       </thead>
                       <tbody>
                         {preview.slice(0, 10).map((row, i) => (
                           <tr key={i} className="border-t border-border">
                             <td className="p-2">{row.firstName} {row.lastName}</td>
                             <td className="p-2">{row.section}</td>
                             <td className="p-2 text-muted-foreground">
                               {row.awards || '-'}
                             </td>
                           </tr>
                         ))}
                         {preview.length > 10 && (
                           <tr className="border-t border-border">
                             <td colSpan={3} className="p-2 text-center text-muted-foreground">
                               ... and {preview.length - 10} more
                             </td>
                           </tr>
                         )}
                       </tbody>
                     </table>
                   </div>
 
                   <Button
                     onClick={handleImport}
                     disabled={isProcessing}
                     className="w-full bg-gold hover:bg-gold-dark text-primary-foreground"
                   >
                     {isProcessing ? 'Importing...' : `Import ${preview.length} Students`}
                   </Button>
                 </motion.div>
               )}
             </AnimatePresence>
 
             {/* Import Result */}
             <AnimatePresence>
               {importResult && (
                 <motion.div
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                 >
                  <Alert className="border-emerald-500/30 bg-emerald-500/10">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                     <AlertDescription>
                       Successfully imported {importResult.success} students!
                     </AlertDescription>
                   </Alert>
                 </motion.div>
               )}
             </AnimatePresence>
           </div>
         </DialogContent>
       </Dialog>
     </>
   );
 };