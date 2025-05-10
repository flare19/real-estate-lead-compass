
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lead, supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ViewLeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLead = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setLead(data as Lead);
        }
      } catch (error) {
        console.error('Error fetching lead:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch lead details.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchLead();
    }
  }, [id, toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <h2 className="text-2xl font-bold">Lead Not Found</h2>
        <p className="text-muted-foreground">The requested lead could not be found.</p>
        <Button onClick={() => navigate('/leads')}>Return to Lead List</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Lead Details</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Customer Name</p>
              <p className="text-lg">{lead.customer_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg">{lead.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Mobile Number</p>
              <p className="text-lg">{lead.mobile_number}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Project</p>
              <p className="text-lg">{lead.project_name}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Budget</p>
              <p className="text-lg">₹{lead.budget.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Preferred Area</p>
              <p className="text-lg">{lead.preferred_area}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Property Type</p>
              <p className="text-lg">{lead.property_type}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lead Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Deal Status</p>
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
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Interest Level</p>
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
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Site Visit Done</p>
              <p className="text-lg">{lead.site_visit_done ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assignment & Follow-up</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Team Leader</p>
              <p className="text-lg">{lead.team_leader}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
              <p className="text-lg">{lead.assigned_to}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Contacted</p>
              <p className="text-lg">{lead.last_contacted_date || 'Not contacted yet'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Next Follow-up</p>
              <p className="text-lg">{lead.next_followup_date || 'Not scheduled'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{lead.comments || 'No comments'}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewLeadDetails;
