
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import LeadForm from '@/components/leads/LeadForm';
import { useEmployeeData } from '@/hooks/useEmployeeData';
import { useLeadForm } from '@/hooks/useLeadForm';

interface LocationState {
  preselectedEmployee?: string;
}

const AddLead = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { employees } = useEmployeeData();
  const { 
    formData, 
    isSubmitting, 
    handleChange, 
    handleSelectChange, 
    handleSwitchChange, 
    handleSubmit, 
    setFormValue
  } = useLeadForm();

  // Check if we have a preselected employee from location state
  useEffect(() => {
    const state = location.state as LocationState;
    if (state && state.preselectedEmployee) {
      setFormValue('assigned_to', state.preselectedEmployee);
    }
  }, [location.state, setFormValue]);

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
        handleSwitchChange={(name, checked) => handleSwitchChange(name, checked)}
        employees={employees}
        onCancel={() => navigate('/leads')}
      />
    </div>
  );
};

export default AddLead;
