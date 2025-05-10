
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { LeadFormData } from '@/types/lead';

export const useLeadForm = (initialLead?: any) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<LeadFormData>({
    customer_name: initialLead?.customer_name || '',
    email: initialLead?.email || '',
    mobile_number: initialLead?.mobile_number || '',
    project_name: initialLead?.project_name || '',
    budget: initialLead?.budget?.toString() || '',
    preferred_area: initialLead?.preferred_area || '',
    team_leader: initialLead?.team_leader || '',
    assigned_to: initialLead?.assigned_to || '',
    last_contacted_date: initialLead?.last_contacted_date || '',
    next_followup_date: initialLead?.next_followup_date || '',
    comments: initialLead?.comments || '',
    deal_status: initialLead?.deal_status || 'Not Contacted',
    interest_level: initialLead?.interest_level || 'Yellow',
    property_type: initialLead?.property_type || '',
    site_visit_done: initialLead?.site_visit_done || false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, value: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // New function to set form value directly
  const setFormValue = (name: keyof LeadFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const leadData = {
        ...formData,
        budget: Number(formData.budget),
      };

      if (initialLead?.id) {
        // Update existing lead
        const { error } = await supabase
          .from('leads')
          .update(leadData)
          .eq('id', initialLead.id);

        if (error) throw error;

        toast({
          title: 'Lead Updated',
          description: 'The lead has been updated successfully.',
        });
      } else {
        // Create new lead
        const { error } = await supabase
          .from('leads')
          .insert([leadData]);

        if (error) throw error;

        toast({
          title: 'Lead Added',
          description: 'The lead has been added successfully.',
        });
      }

      navigate('/leads');
    } catch (error) {
      console.error('Error saving lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to save lead. Please try again.',
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
    handleSubmit,
    setFormValue
  };
};
