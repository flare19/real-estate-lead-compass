import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { supabase, Lead } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { UserCog, Search, PlusCircle, Eye, Download, Trash2, FileChartPie } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  role: string;
  created_at: string;
  email: string;
  mobile_number?: string; // Updated to match DB schema
  salary?: number;
  is_terminated?: boolean;
  termination_date?: string | null;
}

const TeamManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [employeeLeads, setEmployeeLeads] = useState<Record<string, Lead[]>>({});
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState<Profile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddEmployeeDialog, setShowAddEmployeeDialog] = useState(false);
  const [showEditEmployeeDialog, setShowEditEmployeeDialog] = useState(false);
  const [showTerminateDialog, setShowTerminateDialog] = useState(false);
  
  useEffect(() => {
    fetchTeamData();
  }, []);
  
  const fetchTeamData = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching employee data...");
      
      // Fetch employee profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'Employee');
        
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }
      
      console.log("Profiles data received:", profilesData);
      
      // Fetch all leads
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*');
        
      if (leadsError) {
        console.error("Error fetching leads:", leadsError);
        throw leadsError;
      }
      
      console.log("Leads data received:", leadsData);
      
      if (profilesData && leadsData) {
        setEmployees(profilesData as Profile[]);
        
        // Group leads by assigned_to
        const groupedLeads: Record<string, Lead[]> = {};
        (leadsData as Lead[]).forEach(lead => {
          if (!groupedLeads[lead.assigned_to]) {
            groupedLeads[lead.assigned_to] = [];
          }
          groupedLeads[lead.assigned_to].push(lead);
        });
        
        setEmployeeLeads(groupedLeads);

        // Set the first found employee as selected
        if (profilesData.length > 0) {
          setSelectedEmployee(profilesData[0].name);
          setSelectedEmployeeDetails(profilesData[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch team data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add employee form schema - removed password requirement since we can't directly set it
  const employeeFormSchema = z.object({
    name: z.string().min(3, { message: "Name must be at least 3 characters" }),
    email: z.string().email({ message: "Must be a valid email address" }),
    mobile_number: z.string().optional(), // Updated to match DB schema
    salary: z.coerce.number().min(0).optional(),
  });

  // Edit employee form schema
  const editEmployeeFormSchema = z.object({
    mobile_number: z.string().optional(), // Updated to match DB schema
    salary: z.coerce.number().min(0).optional(),
  });

  const addEmployeeForm = useForm<z.infer<typeof employeeFormSchema>>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      name: "",
      email: "",
      mobile_number: "", // Updated to match DB schema
      salary: undefined,
    },
  });

  const editEmployeeForm = useForm<z.infer<typeof editEmployeeFormSchema>>({
    resolver: zodResolver(editEmployeeFormSchema),
    defaultValues: {
      mobile_number: "", // Updated to match DB schema
      salary: undefined,
    },
  });

  const handleAddEmployee = async (values: z.infer<typeof employeeFormSchema>) => {
    try {
      console.log("Adding new employee:", values);
      
      // We can't create auth users without service role key, so we'll show a notification
      toast({
        title: 'Info',
        description: `Employee data will be added, but authentication access requires setup by an admin.`,
      });

      // Create profile directly without auth
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            name: values.name,
            email: values.email,
            role: 'Employee',
            mobile_number: values.mobile_number || null, // Updated to match DB schema
            salary: values.salary || null,
            is_terminated: false,
            termination_date: null,
          },
        ]);

      if (profileError) {
        console.error("Profile error:", profileError);
        throw profileError;
      }

      toast({
        title: 'Success',
        description: `Employee ${values.name} has been added.`,
      });

      setShowAddEmployeeDialog(false);
      addEmployeeForm.reset();
      fetchTeamData();
    } catch (error) {
      console.error('Error adding employee:', error);
      toast({
        title: 'Error',
        description: 'Failed to add employee. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleViewEmployeeDetails = (employee: Profile) => {
    setSelectedEmployee(employee.name);
    setSelectedEmployeeDetails(employee);
  };

  const handleEditEmployeeClick = (employee: Profile) => {
    setSelectedEmployeeDetails(employee);
    editEmployeeForm.setValue('mobile_number', employee.mobile_number || '');
    editEmployeeForm.setValue('salary', employee.salary || undefined);
    setShowEditEmployeeDialog(true);
  };

  const handleEditEmployee = async (values: z.infer<typeof editEmployeeFormSchema>) => {
    if (!selectedEmployeeDetails) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          mobile_number: values.mobile_number || null, // Updated to match DB schema
          salary: values.salary || null,
        })
        .eq('id', selectedEmployeeDetails.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Employee details updated successfully.`,
      });

      setShowEditEmployeeDialog(false);
      fetchTeamData();
    } catch (error) {
      console.error('Error updating employee details:', error);
      toast({
        title: 'Error',
        description: 'Failed to update employee details. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleTerminateEmployee = async () => {
    if (!selectedEmployeeDetails) return;

    try {
      const terminationDate = new Date().toISOString();

      const { error } = await supabase
        .from('profiles')
        .update({
          is_terminated: true,
          termination_date: terminationDate,
        })
        .eq('id', selectedEmployeeDetails.id);

      if (error) throw error;

      toast({
        title: 'Employee Terminated',
        description: `${selectedEmployeeDetails.name} has been terminated.`,
      });

      setShowTerminateDialog(false);
      fetchTeamData();
    } catch (error) {
      console.error('Error terminating employee:', error);
      toast({
        title: 'Error',
        description: 'Failed to terminate employee. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAssignLead = (employeeName: string) => {
    navigate('/leads/new', { state: { preselectedEmployee: employeeName } });
  };

  const generateEmployeeReport = (employeeName: string) => {
    const leads = employeeLeads[employeeName] || [];
    
    if (leads.length === 0) {
      toast({
        title: 'No Data',
        description: 'No leads found for this employee to generate a report.',
      });
      return;
    }
    
    const worksheetData = leads.map(lead => ({
      'Customer Name': lead.customer_name,
      'Email': lead.email,
      'Mobile': lead.mobile_number,
      'Project': lead.project_name,
      'Budget': lead.budget,
      'Area': lead.preferred_area,
      'Status': lead.deal_status,
      'Interest Level': lead.interest_level,
      'Last Contacted': lead.last_contacted_date,
      'Next Followup': lead.next_followup_date,
    }));
    
    // Calculate summary statistics
    const totalLeads = leads.length;
    const closedLeads = leads.filter(lead => lead.deal_status === 'Closed').length;
    const activeLeads = leads.filter(lead => lead.deal_status !== 'Closed' && lead.deal_status !== 'Dropped').length;
    const droppedLeads = leads.filter(lead => lead.deal_status === 'Dropped').length;
    const conversionRate = totalLeads ? (closedLeads / totalLeads) * 100 : 0;
    
    // Add summary sheet data
    const summaryData = [
      { 'Metric': 'Total Leads', 'Value': totalLeads },
      { 'Metric': 'Active Leads', 'Value': activeLeads },
      { 'Metric': 'Closed Deals', 'Value': closedLeads },
      { 'Metric': 'Dropped Leads', 'Value': droppedLeads },
      { 'Metric': 'Conversion Rate', 'Value': `${conversionRate.toFixed(1)}%` },
    ];
    
    // Create workbook with two sheets
    const workbook = XLSX.utils.book_new();
    const leadsSheet = XLSX.utils.json_to_sheet(worksheetData);
    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    
    XLSX.utils.book_append_sheet(workbook, leadsSheet, 'Leads');
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    // Generate file name with employee name and date
    const fileName = `${employeeName}_Report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    
    // Write and download
    XLSX.writeFile(workbook, fileName);
    
    toast({
      title: 'Report Generated',
      description: `Report for ${employeeName} has been downloaded.`,
    });
  };

  // Calculate employee score (scale 1-10) based on conversion rate and number of leads
  const calculateEmployeeScore = (employeeName: string): number => {
    const leads = employeeLeads[employeeName] || [];
    if (leads.length === 0) return 0;
    
    const totalLeads = leads.length;
    const closedLeads = leads.filter(lead => lead.deal_status === 'Closed').length;
    const conversionRate = totalLeads > 0 ? (closedLeads / totalLeads) * 100 : 0;
    
    // Score based on conversion rate (max 7 points) and volume (max 3 points)
    const conversionScore = Math.min(7, (conversionRate / 100) * 7);
    const volumeScore = Math.min(3, (totalLeads / 20) * 3); // Assuming 20 leads is excellent
    
    return Math.round(conversionScore + volumeScore);
  };

  // Filter employees based on search
  const filteredEmployees = employees.filter(employee => 
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get leads for selected employee by name
  const selectedEmployeeLeads = selectedEmployee ? (employeeLeads[selectedEmployee] || []) : [];

  // Calculate statistics for selected employee
  const employeeStats = selectedEmployee ? {
    totalLeads: selectedEmployeeLeads.length,
    activeLeads: selectedEmployeeLeads.filter(lead => lead.deal_status !== 'Closed' && lead.deal_status !== 'Dropped').length,
    closedLeads: selectedEmployeeLeads.filter(lead => lead.deal_status === 'Closed').length,
    droppedLeads: selectedEmployeeLeads.filter(lead => lead.deal_status === 'Dropped').length,
    todayFollowups: selectedEmployeeLeads.filter(lead => lead.next_followup_date === format(new Date(), 'yyyy-MM-dd')).length,
    conversionRate: selectedEmployeeLeads.length ? 
      ((selectedEmployeeLeads.filter(lead => lead.deal_status === 'Closed').length / selectedEmployeeLeads.length) * 100).toFixed(1) : 
      '0',
    score: calculateEmployeeScore(selectedEmployee),
  } : null;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
        
        <Dialog open={showAddEmployeeDialog} onOpenChange={setShowAddEmployeeDialog}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                Enter the details of the new employee. Note: Password creation requires admin setup.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...addEmployeeForm}>
              <form onSubmit={addEmployeeForm.handleSubmit(handleAddEmployee)} className="space-y-4">
                <FormField
                  control={addEmployeeForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addEmployeeForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john.doe@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addEmployeeForm.control}
                  name="mobile_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 234 567 890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addEmployeeForm.control}
                  name="salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="50000" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setShowAddEmployeeDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Employee</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search employees by name or email..."
              className="pl-8 w-full md:w-1/2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              {employees.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No employees found. Add your first employee using the button above.</p>
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No employees match your search criteria.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Leads</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((employee) => (
                      <TableRow 
                        key={employee.id} 
                        className={employee.name === selectedEmployee ? "bg-muted/50" : ""}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <UserCog className="h-5 w-5 mr-2 text-primary" />
                            {employee.name}
                            {employee.is_terminated && (
                              <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                                Terminated
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>{employee.mobile_number || 'Not provided'}</TableCell>
                        <TableCell>
                          {employee.is_terminated ? (
                            <span className="text-red-500">
                              Terminated on {employee.termination_date ? format(new Date(employee.termination_date), 'dd MMM yyyy') : 'N/A'}
                            </span>
                          ) : (
                            <span className="text-green-500">Active</span>
                          )}
                        </TableCell>
                        <TableCell>{employeeLeads[employee.name]?.length || 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold">
                              {calculateEmployeeScore(employee.name)}
                            </div>
                            <div className="ml-2 w-24 h-2 bg-gray-200 rounded-full">
                              <div 
                                className="h-full bg-primary rounded-full" 
                                style={{ width: `${(calculateEmployeeScore(employee.name) / 10) * 100}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleViewEmployeeDetails(employee)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleAssignLead(employee.name)}
                              disabled={employee.is_terminated}
                            >
                              Assign Lead
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedEmployeeDetails && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Employee Details: {selectedEmployeeDetails.name}</CardTitle>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleEditEmployeeClick(selectedEmployeeDetails)}
              >
                Edit Details
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => generateEmployeeReport(selectedEmployeeDetails.name)}
              >
                <FileChartPie className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
              {!selectedEmployeeDetails.is_terminated && (
                <AlertDialog open={showTerminateDialog} onOpenChange={setShowTerminateDialog}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Terminate Employee
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will mark {selectedEmployeeDetails.name} as terminated. They will no longer be able to access the system.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleTerminateEmployee}>
                        Terminate
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="stats">
              <TabsList>
                <TabsTrigger value="stats">Statistics</TabsTrigger>
                <TabsTrigger value="leads">Assigned Leads</TabsTrigger>
                <TabsTrigger value="details">Personal Details</TabsTrigger>
              </TabsList>
              
              {employeeStats && (
                <>
                  <TabsContent value="stats">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                      <div className="bg-slate-100 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Total Leads</p>
                        <p className="text-2xl font-bold">{employeeStats.totalLeads}</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Active Leads</p>
                        <p className="text-2xl font-bold">{employeeStats.activeLeads}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Closed Deals</p>
                        <p className="text-2xl font-bold">{employeeStats.closedLeads}</p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Dropped Leads</p>
                        <p className="text-2xl font-bold">{employeeStats.droppedLeads}</p>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Today's Follow-ups</p>
                        <p className="text-2xl font-bold">{employeeStats.todayFollowups}</p>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-2">Performance Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Conversion Rate</span>
                            <span className="font-medium">{employeeStats.conversionRate}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${employeeStats.conversionRate}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Performance Score</span>
                            <span className="font-medium">{employeeStats.score}/10</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(employeeStats.score / 10) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="leads">
                    <div className="mt-4">
                      {selectedEmployeeLeads.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">No leads assigned to this employee.</p>
                      ) : (
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Customer Name</TableHead>
                                <TableHead>Project</TableHead>
                                <TableHead>Budget</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Next Follow-up</TableHead>
                                <TableHead>Interest Level</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedEmployeeLeads.map((lead) => (
                                <TableRow key={lead.id}>
                                  <TableCell className="font-medium">{lead.customer_name}</TableCell>
                                  <TableCell>{lead.project_name}</TableCell>
                                  <TableCell>₹{lead.budget.toLocaleString()}</TableCell>
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
                                  <TableCell>{lead.next_followup_date || 'Not scheduled'}</TableCell>
                                  <TableCell>
                                    <span
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        lead.interest_level === 'Green'
                                          ? 'bg-green-100 text-green-800'
                                          : lead.interest_level === 'Yellow'
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {lead.interest_level}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => navigate(`/leads/view/${lead.id}`)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </>
              )}
              
              <TabsContent value="details">
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedEmployeeDetails.email}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Mobile</p>
                      <p className="font-medium">{selectedEmployeeDetails.mobile_number || 'Not provided'}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Salary</p>
                      <p className="font-medium">
                        {selectedEmployeeDetails.salary ? `₹${selectedEmployeeDetails.salary.toLocaleString()}` : 'Not provided'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Registered Date</p>
                      <p className="font-medium">{format(new Date(selectedEmployeeDetails.created_at), 'dd MMM yyyy')}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className={selectedEmployeeDetails.is_terminated ? "font-medium text-red-500" : "font-medium text-green-500"}>
                        {selectedEmployeeDetails.is_terminated ? 'Terminated' : 'Active'}
                      </p>
                    </div>
                    {selectedEmployeeDetails.is_terminated && selectedEmployeeDetails.termination_date && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Termination Date</p>
                        <p className="font-medium">{format(new Date(selectedEmployeeDetails.termination_date), 'dd MMM yyyy')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Edit Employee Dialog */}
      <Dialog open={showEditEmployeeDialog} onOpenChange={setShowEditEmployeeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee Details</DialogTitle>
            <DialogDescription>
              Update the details for {selectedEmployeeDetails?.name}.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editEmployeeForm}>
            <form onSubmit={editEmployeeForm.handleSubmit(handleEditEmployee)} className="space-y-4">
              <FormField
                control={editEmployeeForm.control}
                name="mobile_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile</FormLabel>
                    <FormControl>
                      <Input placeholder="Mobile number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editEmployeeForm.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary</FormLabel>
                    <FormControl>
                      <Input placeholder="Salary amount" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setShowEditEmployeeDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamManagement;
