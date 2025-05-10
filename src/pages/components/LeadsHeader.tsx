import { useState } from 'react';
import { CSVLink } from 'react-csv';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { FileText, Download, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { Lead } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import ImportLeads from './ImportLeads';
import { useToast } from '@/components/ui/use-toast';

interface LeadsHeaderProps {
  onExportExcel: () => void;
  onViewClosedDeals: () => void;
  onImport: () => void;
  csvData: Record<string, string>[];
  onDeleteAll?: (password: string) => Promise<boolean>;
}

const LeadsHeader = ({ 
  onExportExcel, 
  onViewClosedDeals, 
  csvData,
  onImport,
  onDeleteAll 
}: LeadsHeaderProps) => {
  const { isCEO } = useAuth();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAll = async () => {
    if (!onDeleteAll) return;

    setIsDeleting(true);
    try {
      const success = await onDeleteAll(password);
      if (success) {
        setShowDeleteDialog(false);
        setPassword('');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Lead Management</h1>
        <p className="text-muted-foreground">Manage and track all your leads.</p>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={onViewClosedDeals}>
          <CheckCircle className="mr-2 h-4 w-4" /> Closed Deals
        </Button>
        
        {csvData.length > 0 && (
          <>
            <CSVLink 
              data={csvData} 
              filename="leads.csv" 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              <FileText className="mr-2 h-4 w-4" /> Export CSV
            </CSVLink>
            
            <Button variant="outline" onClick={onExportExcel}>
              <Download className="mr-2 h-4 w-4" /> Export Excel
            </Button>
          </>
        )}
        
        {isCEO && (
          <>
            <ImportLeads onImport={onImport} />
            
            <Button 
              variant="destructive" 
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete All Leads
            </Button>
          </>
        )}
      </div>
      
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" /> Delete All Leads
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. All leads will be permanently deleted from the database.
              Please enter your password to confirm.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAll}
              disabled={!password || isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete All Leads'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadsHeader;
