import { useState, useEffect } from 'react';
import { supabase, Lead } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

export const useLeadsData = () => {
  const { toast } = useToast();
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

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('leads').select('*');

      if (error) throw error;

      if (data) {
        setLeads(data as Lead[]);
        setFilteredLeads(data as Lead[]);
        
        const areas = [...new Set(data.map(lead => lead.preferred_area).filter(Boolean))];
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
    fetchLeads();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [leads, searchTerm, budgetFilter, statusFilter, areaFilter]);

  const applyFilters = () => {
    let results = [...leads];

    // Fix search functionality - convert everything to lowercase for case-insensitive search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      results = results.filter(
        (lead) =>
          (lead.customer_name && lead.customer_name.toLowerCase().includes(term)) ||
          (lead.email && lead.email.toLowerCase().includes(term)) ||
          (lead.preferred_area && lead.preferred_area.toLowerCase().includes(term))
      );
    }

    // Fix budget filter
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

    // Fix status filter
    if (statusFilter !== 'all') {
      results = results.filter((lead) => lead.deal_status === statusFilter);
    }
    
    // Fix area filter
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

  const handleEmailClick = (email: string) => {
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`, '_blank');
  };

  const viewClosedDeals = () => {
    setStatusFilter('Closed');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredLeads);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
    XLSX.writeFile(workbook, `Leads_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const deleteAllLeads = async (password: string) => {
    try {
      // Verify password
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) throw authError;
      
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to perform this action.',
          variant: 'destructive',
        });
        return false;
      }
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password,
      });
      
      if (signInError) {
        toast({
          title: 'Error',
          description: 'Incorrect password. Please try again.',
          variant: 'destructive',
        });
        return false;
      }
      
      // Delete all leads
      const { error: deleteError } = await supabase
        .from('leads')
        .delete()
        .neq('id', 'placeholder'); // Delete all leads
      
      if (deleteError) throw deleteError;
      
      setLeads([]);
      setFilteredLeads([]);
      
      toast({
        title: 'Success',
        description: 'All leads have been deleted.',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting all leads:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete leads. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Fix csvData to ensure Budget is converted to string
  const csvData = filteredLeads.map((lead) => ({
    'Customer Name': lead.customer_name || '',
    'Email': lead.email || '',
    'Mobile': lead.mobile_number || '',
    'Project': lead.project_name || '',
    'Budget': lead.budget?.toString() || '',
    'Area': lead.preferred_area || '',
    'Team Leader': lead.team_leader || '',
    'Assigned To': lead.assigned_to || '',
    'Last Contacted': lead.last_contacted_date || '',
    'Next Followup': lead.next_followup_date || '',
    'Status': lead.deal_status || '',
    'Interest': lead.interest_level || '',
    'Property Type': lead.property_type || '',
    'Site Visit': lead.site_visit_done ? 'Yes' : 'No',
    'Comments': lead.comments || '',
  }));

  // Pagination helpers
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return {
    leads,
    filteredLeads,
    currentLeads,
    searchTerm,
    setSearchTerm,
    budgetFilter,
    setBudgetFilter,
    statusFilter,
    setStatusFilter,
    areaFilter,
    setAreaFilter,
    isLoading,
    handleDelete,
    handleEmailClick,
    resetFilters,
    viewClosedDeals,
    exportToExcel,
    csvData,
    currentPage,
    totalPages,
    paginate,
    fetchLeads,
    uniqueAreas,
    deleteAllLeads
  };
};
