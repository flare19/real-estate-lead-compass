
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Lead } from '@/lib/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface LeadsTableProps {
  currentLeads: Lead[];
  isLoading: boolean;
  onDelete: (id: string, assignedTo: string) => void;
  onEmailClick: (email: string) => void;
}

const LeadsTable = ({ currentLeads, isLoading, onDelete, onEmailClick }: LeadsTableProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, isCEO } = useAuth();

  const handleEdit = (id: string, assignedTo: string) => {
    if (!isCEO && profile?.name !== assignedTo) {
      toast({
        title: 'Permission Denied',
        description: 'You can only edit leads assigned to you.',
        variant: 'destructive',
      });
      return;
    }

    navigate(`/leads/edit/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (currentLeads.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No leads found. Try changing your filters.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Area</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Next Followup</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentLeads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="font-medium">{lead.customer_name}</TableCell>
              <TableCell>
                <button
                  onClick={() => onEmailClick(lead.email)}
                  className="text-primary hover:underline"
                >
                  {lead.email}
                </button>
              </TableCell>
              <TableCell>{lead.project_name}</TableCell>
              <TableCell>₹{lead.budget.toLocaleString()}</TableCell>
              <TableCell>{lead.preferred_area}</TableCell>
              <TableCell>{lead.assigned_to}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    lead.deal_status === 'Closed'
                      ? 'bg-green-100 text-green-800'
                      : lead.deal_status === 'Not Contacted'
                      ? 'bg-blue-100 text-blue-800'
                      : lead.deal_status === 'Dropped'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {lead.deal_status}
                </span>
              </TableCell>
              <TableCell>{lead.next_followup_date}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {(isCEO || profile?.name === lead.assigned_to) && (
                      <DropdownMenuItem onClick={() => handleEdit(lead.id, lead.assigned_to)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                    )}
                    {isCEO && (
                      <DropdownMenuItem 
                        onClick={() => onDelete(lead.id, lead.assigned_to)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeadsTable;
