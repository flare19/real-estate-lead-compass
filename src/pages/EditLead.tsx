import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase, Lead } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';

const EditLead = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, isCEO } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<Lead>>({
    deal_status: "Not Contacted",
    interest_level: "Yellow",
    site_visit_done: false,
  });
  const [originalLead, setOriginalLead] = useState<Lead | null>(null);

  useEffect(() => {
    if (id) {
      fetchLead(id);
    }
  }, [id]);

  const fetchLead = async (leadId: string) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData(data);
        setOriginalLead(data as Lead);
      }
    } catch (error) {
      console.error('Error fetching lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch lead details. Please try again.',
        variant: 'destructive',
      });
      navigate('/leads');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && originalLead) {
      if (!isCEO && profile?.name !== originalLead.assigned_to) {
        toast({
          title: 'Permission Denied',
          description: 'You can only edit leads assigned to you.',
          variant: 'destructive',
        });
        navigate('/leads');
      }
    }
  }, [isLoading, originalLead, isCEO, profile, navigate, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, site_visit_done: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formattedData = {
        ...formData,
        budget: typeof formData.budget === 'string' ? parseFloat(formData.budget) : formData.budget,
      };

      const { error } = await supabase
        .from('leads')
        .update(formattedData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Lead Updated Successfully',
        description: 'The lead information has been updated.',
      });

      navigate('/leads');
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: 'Error Updating Lead',
        description: 'There was a problem updating the lead. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Edit Lead</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lead Information</CardTitle>
          <CardDescription>
            Update the lead details below.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="customer_name">Customer Name *</Label>
                <Input
                  id="customer_name"
                  name="customer_name"
                  value={formData.customer_name || ''}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile_number">Mobile Number *</Label>
                <Input
                  id="mobile_number"
                  name="mobile_number"
                  value={formData.mobile_number || ''}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_name">Project Name *</Label>
                <Input
                  id="project_name"
                  name="project_name"
                  value={formData.project_name || ''}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Budget (in ₹) *</Label>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.budget || ''}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferred_area">Preferred Area *</Label>
                <Input
                  id="preferred_area"
                  name="preferred_area"
                  value={formData.preferred_area || ''}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="team_leader">Team Leader *</Label>
                <Input
                  id="team_leader"
                  name="team_leader"
                  value={formData.team_leader || ''}
                  onChange={handleChange}
                  required
                  readOnly={!isCEO}
                  className={!isCEO ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
                  tabIndex={!isCEO ? -1 : undefined}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned_to">Assigned To *</Label>
                <Input
                  id="assigned_to"
                  name="assigned_to"
                  value={formData.assigned_to || ''}
                  onChange={handleChange}
                  required
                  readOnly={!isCEO}
                  className={!isCEO ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}
                  tabIndex={!isCEO ? -1 : undefined}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_contacted_date">Last Contacted Date *</Label>
                <Input
                  id="last_contacted_date"
                  name="last_contacted_date"
                  type="date"
                  value={formData.last_contacted_date || ''}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="next_followup_date">Next Followup Date *</Label>
                <Input
                  id="next_followup_date"
                  name="next_followup_date"
                  type="date"
                  value={formData.next_followup_date || ''}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deal_status">Deal Status *</Label>
                <Select
                  value={formData.deal_status || "Not Contacted"}
                  onValueChange={(value) => handleSelectChange('deal_status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not Contacted">Not Contacted</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                    <SelectItem value="Site Visit">Site Visit</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                    <SelectItem value="Dropped">Dropped</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interest_level">Interest Level *</Label>
                <Select
                  value={formData.interest_level || "Yellow"}
                  onValueChange={(value) => handleSelectChange('interest_level', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Interest Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Red">Red</SelectItem>
                    <SelectItem value="Yellow">Yellow</SelectItem>
                    <SelectItem value="Green">Green</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="property_type">Property Type *</Label>
                <Select
                  value={formData.property_type || ''}
                  onValueChange={(value) => handleSelectChange('property_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="plot">Plot</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_visit_done">Site Visit Done</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="site_visit_done"
                    checked={formData.site_visit_done || false}
                    onCheckedChange={handleSwitchChange}
                  />
                  <Label htmlFor="site_visit_done">
                    {formData.site_visit_done ? 'Yes' : 'No'}
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                name="comments"
                value={formData.comments || ''}
                onChange={handleChange}
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => navigate('/leads')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Lead'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default EditLead;
