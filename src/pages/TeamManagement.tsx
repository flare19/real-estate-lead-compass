
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { supabase, Lead } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserCog, Search } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  role: string;
  created_at: string;
  email: string;
}

const TeamManagement = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [employeeLeads, setEmployeeLeads] = useState<Record<string, Lead[]>>({});
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchTeamData();
  }, []);
  
  const fetchTeamData = async () => {
    setIsLoading(true);
    try {
      // Fetch employee profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'Employee');
        
      if (profilesError) throw profilesError;
      
      // Fetch all leads
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('*');
        
      if (leadsError) throw leadsError;
      
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
        
        // Set first employee as default selected
        if (profilesData.length > 0) {
          setSelectedEmployee(profilesData[0].name);
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

  // Filter employees based on search
  const filteredEmployees = employees.filter(employee => 
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected employee's leads
  const selectedEmployeeLeads = selectedEmployee ? (employeeLeads[selectedEmployee] || []) : [];
  
  // Calculate statistics for selected employee
  const employeeStats = selectedEmployee ? {
    totalLeads: selectedEmployeeLeads.length,
    activeLeads: selectedEmployeeLeads.filter(lead => lead.deal_status !== 'Closed' && lead.deal_status !== 'Dropped').length,
    closedLeads: selectedEmployeeLeads.filter(lead => lead.deal_status === 'Closed').length,
    droppedLeads: selectedEmployeeLeads.filter(lead => lead.deal_status === 'Dropped').length,
    todayFollowups: selectedEmployeeLeads.filter(lead => lead.next_followup_date === format(new Date(), 'yyyy-MM-dd')).length,
  } : null;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
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
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No employees found.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Assigned Leads</TableHead>
                    <TableHead>Registered Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow 
                      key={employee.id} 
                      className={employee.name === selectedEmployee ? "bg-muted/50" : "cursor-pointer hover:bg-muted/50"}
                      onClick={() => setSelectedEmployee(employee.name)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <UserCog className="h-5 w-5 mr-2 text-primary" />
                          {employee.name}
                        </div>
                      </TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.role}</TableCell>
                      <TableCell>{employeeLeads[employee.name]?.length || 0}</TableCell>
                      <TableCell>{format(new Date(employee.created_at), 'dd MMM yyyy')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedEmployee && employeeStats && (
        <Card>
          <CardHeader>
            <CardTitle>Employee Performance: {selectedEmployee}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="stats">
              <TabsList>
                <TabsTrigger value="stats">Statistics</TabsTrigger>
                <TabsTrigger value="leads">Assigned Leads</TabsTrigger>
              </TabsList>
              
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
                        <span className="font-medium">
                          {employeeStats.totalLeads ? 
                            ((employeeStats.closedLeads / employeeStats.totalLeads) * 100).toFixed(1) + '%' : 
                            '0%'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ 
                            width: employeeStats.totalLeads ? 
                              ((employeeStats.closedLeads / employeeStats.totalLeads) * 100) + '%' : 
                              '0%' 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Drop Rate</span>
                        <span className="font-medium">
                          {employeeStats.totalLeads ? 
                            ((employeeStats.droppedLeads / employeeStats.totalLeads) * 100).toFixed(1) + '%' : 
                            '0%'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full" 
                          style={{ 
                            width: employeeStats.totalLeads ? 
                              ((employeeStats.droppedLeads / employeeStats.totalLeads) * 100) + '%' : 
                              '0%' 
                          }}
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
                            <TableHead>Status</TableHead>
                            <TableHead>Next Follow-up</TableHead>
                            <TableHead>Interest Level</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedEmployeeLeads.map((lead) => (
                            <TableRow key={lead.id}>
                              <TableCell className="font-medium">{lead.customer_name}</TableCell>
                              <TableCell>{lead.project_name}</TableCell>
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
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TeamManagement;
