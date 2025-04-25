import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Lead } from '@/lib/supabase';
import BirthdayAnimation from '@/components/BirthdayAnimation';
import { LeadActivityLog } from '@/components/LeadActivityLog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Users, ArrowUpRight, TrendingUp, CheckCircle, CalendarDays } from 'lucide-react';

const Dashboard = () => {
  const { isCEO, profile } = useAuth();
  const navigate = useNavigate();
  const [showBirthdayAnimation, setShowBirthdayAnimation] = useState(false);
  const [stats, setStats] = useState({
    totalLeads: 0,
    activeLeads: 0,
    convertedLeads: 0,
    recentLeads: [] as Lead[],
  });
  const [todayActivities, setTodayActivities] = useState<Lead[]>([]);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const { count: totalCount } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true });

        const { count: activeCount } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .neq('deal_status', 'Closed');

        const { count: convertedCount } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('deal_status', 'Closed')
          .eq('interest_level', 'Green');

        const { data: recentLeads } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        const { data: followups } = await supabase
          .from('leads')
          .select('*')
          .eq('next_followup_date', today)
          .if(!isCEO, 'eq', 'assigned_to', profile?.email)
          .order('assigned_to');

        setStats({
          totalLeads: totalCount || 0,
          activeLeads: activeCount || 0,
          convertedLeads: convertedCount || 0,
          recentLeads: recentLeads as Lead[] || [],
        });

        setTodayActivities(followups as Lead[] || []);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchDashboardStats();
  }, [today, isCEO, profile?.email]);

  useEffect(() => {
    const currentDate = new Date();
    const isBirthday = currentDate.getDate() === 10 && currentDate.getMonth() === 4; // May is 4 (0-based)
    
    if (isBirthday && profile?.email === 'nitinlokhande2009@gmail.com') {
      setShowBirthdayAnimation(true);
    } else {
      setShowBirthdayAnimation(false);
    }
  }, [profile?.email]);

  return (
    <div className="space-y-6">
      {showBirthdayAnimation && <BirthdayAnimation />}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        {isCEO && (
          <Button onClick={() => navigate('/leads/new')}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Lead
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
            <p className="text-xs text-muted-foreground">All leads in the system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLeads}</div>
            <p className="text-xs text-muted-foreground">Leads in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Converted Leads</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.convertedLeads}</div>
            <p className="text-xs text-muted-foreground">Successfully closed deals</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent">
        <TabsList>
          <TabsTrigger value="recent">Recent Leads</TabsTrigger>
          <TabsTrigger value="today">Today's Activities</TabsTrigger>
          {isCEO && <TabsTrigger value="activity-log">Activity Log</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.recentLeads.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent leads found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 px-2 text-left font-medium">Customer</th>
                          <th className="py-3 px-2 text-left font-medium">Project</th>
                          <th className="py-3 px-2 text-left font-medium">Status</th>
                          <th className="py-3 px-2 text-left font-medium">Area</th>
                          <th className="py-3 px-2 text-left font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentLeads.map((lead) => (
                          <tr key={lead.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-2">{lead.customer_name}</td>
                            <td className="py-3 px-2">{lead.project_name}</td>
                            <td className="py-3 px-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  lead.deal_status === 'Closed'
                                    ? 'bg-green-100 text-green-800'
                                    : lead.deal_status === 'Not Contacted'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {lead.deal_status}
                              </span>
                            </td>
                            <td className="py-3 px-2">{lead.preferred_area}</td>
                            <td className="py-3 px-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/leads/${lead.id}`)}
                              >
                                <ArrowUpRight className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="flex justify-center mt-4">
                  <Button variant="outline" onClick={() => navigate('/leads')}>
                    View All Leads
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="today">
          <Card>
            <CardHeader>
              <CardTitle>Today's Follow-ups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {todayActivities.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No follow-ups scheduled for today</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 px-2 text-left font-medium">Customer</th>
                          <th className="py-3 px-2 text-left font-medium">Project</th>
                          <th className="py-3 px-2 text-left font-medium">Assigned To</th>
                          <th className="py-3 px-2 text-left font-medium">Follow-up Date</th>
                          <th className="py-3 px-2 text-left font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {todayActivities.map((lead) => (
                          <tr key={lead.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-2">{lead.customer_name}</td>
                            <td className="py-3 px-2">{lead.project_name}</td>
                            <td className="py-3 px-2">{lead.assigned_to}</td>
                            <td className="py-3 px-2">
                              <div className="flex items-center">
                                <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                                {lead.next_followup_date}
                              </div>
                            </td>
                            <td className="py-3 px-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate(`/leads/${lead.id}`)}
                              >
                                <ArrowUpRight className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isCEO && (
          <TabsContent value="activity-log">
            <Card>
              <CardHeader>
                <CardTitle>Recent Lead Changes</CardTitle>
              </CardHeader>
              <CardContent>
                <LeadActivityLog />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Dashboard;
