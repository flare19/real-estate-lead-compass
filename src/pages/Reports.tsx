
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase, Lead } from '@/lib/supabase';
import { Download, FileChartPie } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Reports = () => {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Data for charts
  const [statusData, setStatusData] = useState<any[]>([]);
  const [interestData, setInterestData] = useState<any[]>([]);
  const [areaData, setAreaData] = useState<any[]>([]);
  const [assigneeData, setAssigneeData] = useState<any[]>([]);

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
        processData(data as Lead[]);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch leads data for reporting.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processData = (leads: Lead[]) => {
    // Process status data
    const statusCounts: Record<string, number> = {};
    leads.forEach(lead => {
      statusCounts[lead.deal_status] = (statusCounts[lead.deal_status] || 0) + 1;
    });
    
    const statusChartData = Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count
    }));
    setStatusData(statusChartData);

    // Process interest level data
    const interestCounts: Record<string, number> = {};
    leads.forEach(lead => {
      interestCounts[lead.interest_level] = (interestCounts[lead.interest_level] || 0) + 1;
    });
    
    const interestChartData = Object.entries(interestCounts).map(([level, count]) => ({
      name: level,
      value: count
    }));
    setInterestData(interestChartData);

    // Process area data
    const areaCounts: Record<string, number> = {};
    leads.forEach(lead => {
      areaCounts[lead.preferred_area] = (areaCounts[lead.preferred_area] || 0) + 1;
    });
    
    // Sort by count and take top 5
    const sortedAreas = Object.entries(areaCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([area, count]) => ({
        name: area,
        value: count
      }));
    setAreaData(sortedAreas);

    // Process assignee data
    const assigneeCounts: Record<string, number> = {};
    leads.forEach(lead => {
      assigneeCounts[lead.assigned_to] = (assigneeCounts[lead.assigned_to] || 0) + 1;
    });
    
    const assigneeChartData = Object.entries(assigneeCounts).map(([assignee, count]) => ({
      name: assignee,
      leads: count
    }));
    setAssigneeData(assigneeChartData);
  };

  const exportReport = () => {
    try {
      // Create a new workbook
      const wb = XLSX.utils.book_new();
      
      // Add leads data
      const leadsWS = XLSX.utils.json_to_sheet(leads.map(lead => ({
        'Customer Name': lead.customer_name,
        'Email': lead.email,
        'Mobile': lead.mobile_number,
        'Project': lead.project_name,
        'Budget': lead.budget,
        'Area': lead.preferred_area,
        'Assigned To': lead.assigned_to,
        'Status': lead.deal_status,
        'Interest Level': lead.interest_level
      })));
      XLSX.utils.book_append_sheet(wb, leadsWS, 'Leads');
      
      // Add status summary
      const statusWS = XLSX.utils.json_to_sheet(statusData);
      XLSX.utils.book_append_sheet(wb, statusWS, 'Status Summary');
      
      // Add interest level summary
      const interestWS = XLSX.utils.json_to_sheet(interestData);
      XLSX.utils.book_append_sheet(wb, interestWS, 'Interest Summary');
      
      // Add area summary
      const areaWS = XLSX.utils.json_to_sheet(areaData);
      XLSX.utils.book_append_sheet(wb, areaWS, 'Area Summary');
      
      // Add assignee summary
      const assigneeWS = XLSX.utils.json_to_sheet(assigneeData);
      XLSX.utils.book_append_sheet(wb, assigneeWS, 'Assignee Summary');
      
      // Generate & download the report
      XLSX.writeFile(wb, `Lead_Report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      
      toast({
        title: 'Report Generated',
        description: 'Your report has been generated successfully.'
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate report. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
        <Button onClick={exportReport}>
          <Download className="mr-2 h-4 w-4" /> Export Full Report
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Tabs defaultValue="summary">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="status">Lead Status</TabsTrigger>
            <TabsTrigger value="area">Area Analysis</TabsTrigger>
            <TabsTrigger value="team">Team Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Lead Status Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ChartContainer className="h-full" config={{}}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Interest Level Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ChartContainer className="h-full" config={{}}>
                    <PieChart>
                      <Pie
                        data={interestData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {interestData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="status">
            <Card>
              <CardHeader>
                <CardTitle>Lead Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ChartContainer className="h-full" config={{}}>
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Count" fill="#8884d8" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="area">
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Preferred Areas</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ChartContainer className="h-full" config={{}}>
                  <BarChart data={areaData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Number of Leads" fill="#82ca9d" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Team Lead Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ChartContainer className="h-full" config={{}}>
                  <BarChart data={assigneeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="leads" name="Number of Leads" fill="#0088FE" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Reports;
