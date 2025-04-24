import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { supabase, Lead } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useToast } from '@/components/ui/use-toast';
import {
  Search,
  Edit,
  Trash2,
  Download,
  ChevronDown,
  Filter,
  MoreHorizontal,
  Plus,
  FileChartPie,
} from 'lucide-react';
import ImportLeads from './components/ImportLeads';

const ViewLeads = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, isCEO } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [uniqueAreas, setUniqueAreas] = useState<string[]>([]);
  const leadsPerPage = 10;

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('leads').select('*');

      if (error) throw error;

      if (data) {
        setLeads(data as Lead[]);
        setFilteredLeads(data as Lead[]);
        
        const areas = [...new Set(data.map(lead => lead.preferred_area))];
        setUniqueAreas(areas);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch leads. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [leads, searchTerm, budgetFilter, statusFilter, areaFilter]);

  const applyFilters = () => {
    let results = [...leads];

    if (searchTerm) {
      results = results.filter(
        (lead) =>
          lead.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.preferred_area.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (budgetFilter !== 'all') {
      const [min, max] = budgetFilter.split('-').map(Number);
      
      if (!max) {
        results = results.filter((lead) => lead.budget >= min);
      } else {
        results = results.filter(
          (lead) => lead.budget >= min && lead.budget <= max
        );
      }
    }

    if (statusFilter !== 'all') {
      results = results.filter((lead) => lead.deal_status === statusFilter);
    }
    
    if (areaFilter !== 'all') {
      results = results.filter((lead) => lead.preferred_area === areaFilter);
    }

    setFilteredLeads(results);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setBudgetFilter('all');
    setStatusFilter('all');
    setAreaFilter('all');
  };

  const handleDelete = async (id: string, assignedTo: string) => {
    if (!isCEO) {
      toast({
        title: 'Permission Denied',
        description: 'Only CEO can delete leads.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.from('leads').delete().eq('id', id);

      if (error) throw error;

      setLeads((prevLeads) => prevLeads.filter((lead) => lead.id !== id));
      toast({
        title: 'Lead Deleted',
        description: 'The lead has been deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete lead. Please try again.',
        variant: 'destructive',
      });
    }
  };

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

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredLeads);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
    XLSX.writeFile(workbook, `Leads_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };
  
  const generateReport = () => {
    navigate('/reports');
  };
  
  const viewClosedDeals = () => {
    setStatusFilter('Closed');
  };

  const handleEmailClick = (email: string) => {
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`, '_blank');
  };

  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const csvData = filteredLeads.map((lead) => ({
    'Customer Name': lead.customer_name,
    'Email': lead.email,
    'Mobile': lead.mobile_number,
    'Project': lead.project_name,
    'Budget': lead.budget,
    'Area': lead.preferred_area,
    'Team Leader': lead.team_leader,
    'Assigned To': lead.assigned_to,
    'Last Contacted': lead.last_contacted_date,
    'Next Followup': lead.next_followup_date,
    'Status': lead.deal_status,
    'Interest': lead.interest_level,
    'Property Type': lead.property_type,
    'Site Visit': lead.site_visit_done ? 'Yes' : 'No',
    'Comments': lead.comments,
  }));

  return (
    <div className="space-y-6">
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
              <DropdownMenuItem onClick={exportToExcel}>
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
          
          <Button onClick={viewClosedDeals} variant="outline">
            Closed Deals
          </Button>
          
          {isCEO && (
            <>
              <Button onClick={generateReport} variant="outline">
                <FileChartPie className="mr-2 h-4 w-4" /> Generate Report
              </Button>
              <ImportLeads onImport={fetchLeads} />
              <Button onClick={() => navigate('/leads/new')}>
                <Plus className="mr-2 h-4 w-4" /> Add Lead
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search and Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, email or area..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <Select value={budgetFilter} onValueChange={setBudgetFilter}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Budget" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Budgets</SelectItem>
                  <SelectItem value="0-50000">₹0 - ₹50,000</SelectItem>
                  <SelectItem value="50000-100000">₹50,000 - ₹100,000</SelectItem>
                  <SelectItem value="100000-250000">₹100,000 - ₹250,000</SelectItem>
                  <SelectItem value="250000-500000">₹250,000 - ₹500,000</SelectItem>
                  <SelectItem value="500000-1000000">₹500,000 - ₹1,000,000</SelectItem>
                  <SelectItem value="1000000-">Above ₹1,000,000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Not Contacted">Not Contacted</SelectItem>
                  <SelectItem value="Follow-up">Follow-up</SelectItem>
                  <SelectItem value="Site Visit">Site Visit</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Dropped">Dropped</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={areaFilter} onValueChange={setAreaFilter}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Area" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  {uniqueAreas.map(area => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lead List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No leads found. Try changing your filters.</p>
            </div>
          ) : (
            <>
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
                            onClick={() => handleEmailClick(lead.email)}
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
                                  onClick={() => handleDelete(lead.id, lead.assigned_to)}
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

              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => paginate(currentPage - 1)}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <PaginationItem key={i}>
                          <PaginationLink
                            onClick={() => paginate(pageNum)}
                            isActive={currentPage === pageNum}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => paginate(currentPage + 1)}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewLeads;
