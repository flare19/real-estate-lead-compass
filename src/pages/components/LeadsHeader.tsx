
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { CSVLink } from 'react-csv';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Download,
  FileChartPie,
  Plus,
} from 'lucide-react';
import ImportLeads from './ImportLeads';

interface LeadsHeaderProps {
  onExportExcel: () => void;
  onViewClosedDeals: () => void;
  csvData: Record<string, any>[];
  onImport: () => void;
}

const LeadsHeader = ({ onExportExcel, onViewClosedDeals, csvData, onImport }: LeadsHeaderProps) => {
  const navigate = useNavigate();
  const { isCEO } = useAuth();

  const generateReport = () => {
    navigate('/reports');
  };

  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold tracking-tight">Leads Management</h1>
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onExportExcel}>
              Export to Excel
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <CSVLink 
                data={csvData} 
                filename={`Leads_${format(new Date(), 'yyyy-MM-dd')}.csv`}
                className="flex w-full items-center"
              >
                Export to CSV
              </CSVLink>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button onClick={onViewClosedDeals} variant="outline">
          Closed Deals
        </Button>
        
        {isCEO && (
          <>
            <Button onClick={generateReport} variant="outline">
              <FileChartPie className="mr-2 h-4 w-4" /> Generate Report
            </Button>
            <ImportLeads onImport={onImport} />
            <Button onClick={() => navigate('/leads/new')}>
              <Plus className="mr-2 h-4 w-4" /> Add Lead
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default LeadsHeader;
