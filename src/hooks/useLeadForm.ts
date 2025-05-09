
import { useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { LeadFormData } from '@/types/lead';

export const useLeadForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with default values
  const [formData, setFormData] = useState<LeadFormData>({
    customer_name: '',
    email: '',
    mobile_number: '',
    project_name: '',
    budget: '',
    preferred_area: '',
    team_leader: '',
    assigned_to: '',
    last_contacted_date: format(new Date(), 'yyyy-MM-dd'),
    next_followup_date: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    comments: '',
    deal_status: 'Not Contacted',
    interest_level: 'Yellow',
    property_type: 'apartment',
    site_visit_done: false,
  });

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
        budget: parseFloat(formData.budget),
      };

      const { error } = await supabase.from('leads').insert([formattedData]);

      if (error) throw error;

      toast({
        title: 'Lead Added Successfully',
        description: 'The new lead has been added to the system.',
      });

      navigate('/leads');
    } catch (error) {
      console.error('Error adding lead:', error);
      toast({
        title: 'Error Adding Lead',
        description: 'There was a problem adding the lead. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    isSubmitting,
    handleChange,
    handleSelectChange,
    handleSwitchChange,
    handleSubmit
  };
};
