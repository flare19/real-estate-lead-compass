
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import LeadForm from '@/components/leads/LeadForm';
import { useEmployeeData } from '@/hooks/useEmployeeData';
import { useLeadForm } from '@/hooks/useLeadForm';

const AddLead = () => {
  const navigate = useNavigate();
  const { employees } = useEmployeeData();
  const { 
    formData, 
    isSubmitting, 
    handleChange, 
    handleSelectChange, 
    handleSwitchChange, 
    handleSubmit 
  } = useLeadForm();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Add New Lead</h1>
      </div>

      <LeadForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        formData={formData}
        handleChange={handleChange}
        handleSelectChange={handleSelectChange}
        handleSwitchChange={handleSwitchChange}
        employees={employees}
        onCancel={() => navigate('/leads')}
      />
    </div>
  );
};

export default AddLead;
