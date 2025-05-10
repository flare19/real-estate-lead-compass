
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Profile } from '@/types/lead';

export const useEmployeeData = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching employees from profiles table...');
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'Employee');

        if (error) {
          console.error('Error fetching employees:', error);
          throw error;
        }

        console.log('Employees data received:', data);
        if (data) {
          setEmployees(data);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch employee data.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, [toast]);

  return { employees, isLoading };
};
