
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, UploadCloud } from 'lucide-react';
import { read, utils } from 'xlsx';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';

interface ImportLeadsProps {
  onImport: () => void;
}

const ImportLeads = ({ onImport }: ImportLeadsProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    setIsUploading(true);
    setProgress(10);
    
    try {
      const file = e.target.files[0];
      setFileName(file.name);
      
      // Read the file
      const data = await file.arrayBuffer();
      setProgress(30);
      
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet);
      
      if (jsonData.length === 0) {
        throw new Error("No data found in the Excel file");
      }
      
      setProgress(50);
      console.log("Processing data:", jsonData);
      
      // Process and validate data
      const processedData = jsonData.map((row: any) => {
        // Handle date formatting
        let lastContactedDate = row['Last Contacted'] || row['last_contacted_date'] || null;
        let nextFollowupDate = row['Next Followup'] || row['next_followup_date'] || null;
        
        // Ensure dates are in YYYY-MM-DD format
        if (lastContactedDate && typeof lastContactedDate === 'number') {
          // Handle Excel date serial numbers
          const dateObj = new Date(Math.round((lastContactedDate - 25569) * 86400 * 1000));
          lastContactedDate = dateObj.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        }
        
        if (nextFollowupDate && typeof nextFollowupDate === 'number') {
          // Handle Excel date serial numbers
          const dateObj = new Date(Math.round((nextFollowupDate - 25569) * 86400 * 1000));
          nextFollowupDate = dateObj.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        }
        
        return {
          customer_name: row['Customer Name'] || row['customer_name'] || '',
          email: row['Email'] || row['email'] || '',
          mobile_number: String(row['Mobile'] || row['mobile_number'] || ''),
          project_name: row['Project'] || row['project_name'] || '',
          budget: Number(row['Budget'] || row['budget'] || 0),
          preferred_area: row['Area'] || row['preferred_area'] || '',
          team_leader: row['Team Leader'] || row['team_leader'] || '',
          assigned_to: row['Assigned To'] || row['assigned_to'] || '',
          last_contacted_date: lastContactedDate,
          next_followup_date: nextFollowupDate,
          comments: row['Comments'] || row['comments'] || '',
          deal_status: row['Status'] || row['deal_status'] || 'Not Contacted',
          interest_level: row['Interest'] || row['interest_level'] || 'Yellow',
          property_type: row['Property Type'] || row['property_type'] || 'apartment',
          site_visit_done: row['Site Visit'] === 'Yes' || row['site_visit_done'] === true || false
        };
      });
      
      setProgress(70);
      console.log("Processed data:", processedData);
      
      // Insert data into Supabase in batches of 50
      const batchSize = 50;
      const batches = Math.ceil(processedData.length / batchSize);
      
      for (let i = 0; i < batches; i++) {
        const start = i * batchSize;
        const end = Math.min((i + 1) * batchSize, processedData.length);
        const batch = processedData.slice(start, end);
        
        const { error } = await supabase.from('leads').insert(batch);
        
        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
        
        setProgress(70 + Math.floor((i + 1) / batches * 30));
      }
      
      toast({
        title: 'Import Successful',
        description: `${processedData.length} leads imported successfully from ${file.name}.`
      });
      
      setIsDialogOpen(false);
      onImport();
      
      // Reset the file input and progress
      e.target.value = '';
      setFileName('');
      setProgress(0);
      
    } catch (error: any) {
      console.error('Error importing leads:', error);
      toast({
        title: 'Import Failed',
        description: error.message || 'There was an error importing your leads. Please check your file format and try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" /> Import Leads
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Leads from Excel</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 w-full flex flex-col items-center">
            <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
            
            {isUploading ? (
              <div className="w-full space-y-4">
                <p className="text-center">{fileName}</p>
                <Progress value={progress} className="h-2 w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  Uploading and processing... {progress}%
                </p>
              </div>
            ) : (
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  <Button variant="outline" disabled={isUploading}>
                    Select Excel File
                  </Button>
                </div>
                <input 
                  id="file-upload" 
                  type="file" 
                  className="hidden" 
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </label>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportLeads;
