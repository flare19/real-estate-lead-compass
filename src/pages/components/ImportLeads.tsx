
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, UploadCloud } from 'lucide-react';
import { read, utils } from 'xlsx';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface ImportLeadsProps {
  onImport: () => void;
}

const ImportLeads = ({ onImport }: ImportLeadsProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      const file = e.target.files[0];
      const data = await file.arrayBuffer();
      const workbook = read(data);
      
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet);
      
      if (jsonData.length === 0) {
        throw new Error("No data found in the Excel file");
      }
      
      console.log("Processing data:", jsonData);
      
      // Process and validate data
      const processedData = jsonData.map((row: any) => ({
        customer_name: row['Customer Name'] || row['customer_name'] || '',
        email: row['Email'] || row['email'] || '',
        mobile_number: row['Mobile'] || row['mobile_number'] || '',
        project_name: row['Project'] || row['project_name'] || '',
        budget: Number(row['Budget'] || row['budget'] || 0),
        preferred_area: row['Area'] || row['preferred_area'] || '',
        team_leader: row['Team Leader'] || row['team_leader'] || '',
        assigned_to: row['Assigned To'] || row['assigned_to'] || '',
        last_contacted_date: row['Last Contacted'] || row['last_contacted_date'] || null,
        next_followup_date: row['Next Followup'] || row['next_followup_date'] || null,
        comments: row['Comments'] || row['comments'] || '',
        deal_status: row['Status'] || row['deal_status'] || 'Not Contacted',
        interest_level: row['Interest'] || row['interest_level'] || 'Yellow',
        property_type: row['Property Type'] || row['property_type'] || '',
        site_visit_done: row['Site Visit'] === 'Yes' || row['site_visit_done'] === true || false
      }));
      
      console.log("Processed data:", processedData);
      
      // Insert data into Supabase
      const { error, data: result } = await supabase.from('leads').insert(processedData);
      
      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      toast({
        title: 'Import Successful',
        description: `${processedData.length} leads imported successfully.`
      });
      
      setIsDialogOpen(false);
      onImport();
      
      // Reset the file input
      e.target.value = '';
      
    } catch (error) {
      console.error('Error importing leads:', error);
      toast({
        title: 'Import Failed',
        description: 'There was an error importing your leads. Please check your file format and try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
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
          <DialogTitle>Import Leads</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 w-full flex flex-col items-center">
            <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex flex-col items-center">
                <Button variant="outline" disabled={isUploading}>
                  {isUploading ? 'Uploading...' : 'Select Excel File'}
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Upload .xlsx or .xls file with lead data
                </p>
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportLeads;
