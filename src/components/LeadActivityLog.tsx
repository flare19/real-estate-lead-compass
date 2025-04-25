
import { useEffect, useState } from 'react';
import { format, isWithinHours } from 'date-fns';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

type LeadActivity = {
  id: string;
  employee_name: string;
  lead_id: string;
  customer_name: string;
  field_changed: string;
  old_value: string;
  new_value: string;
  created_at: string;
  is_dismissed: boolean;
};

export const LeadActivityLog = () => {
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchActivities = async () => {
      const { data, error } = await supabase
        .from('lead_activities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching activities:', error);
        return;
      }

      // Filter out activities older than 3 hours
      const recentActivities = data?.filter(activity => 
        !activity.is_dismissed && isWithinHours(new Date(activity.created_at), 3)
      ) || [];

      setActivities(recentActivities);
    };

    fetchActivities();

    // Subscribe to new activities
    const subscription = supabase
      .channel('lead_activities')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'lead_activities' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setActivities(prev => [payload.new as LeadActivity, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleRevert = async (activity: LeadActivity) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ [activity.field_changed]: activity.old_value })
        .eq('id', activity.lead_id);

      if (error) throw error;

      toast({
        title: "Change Reverted",
        description: `Successfully reverted ${activity.field_changed} change made by ${activity.employee_name}`,
      });

      // Mark activity as dismissed
      await handleDismiss(activity.id);
    } catch (error) {
      console.error('Error reverting change:', error);
      toast({
        title: "Error",
        description: "Failed to revert the change",
        variant: "destructive",
      });
    }
  };

  const handleDismiss = async (activityId: string) => {
    try {
      await supabase
        .from('lead_activities')
        .update({ is_dismissed: true })
        .eq('id', activityId);

      setActivities(prev => prev.filter(a => a.id !== activityId));
    } catch (error) {
      console.error('Error dismissing activity:', error);
    }
  };

  if (activities.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">No recent activities</p>;
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-center justify-between bg-background p-4 rounded-lg border relative group animate-fade-in"
        >
          <div className="flex-1">
            <p className="text-sm">
              <span className="font-medium">{activity.employee_name}</span> has changed{' '}
              <span className="font-medium">{activity.field_changed}</span> for{' '}
              <span className="font-medium">{activity.customer_name}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(activity.created_at), 'MMM d, yyyy HH:mm')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRevert(activity)}
            >
              Revert
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handleDismiss(activity.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
