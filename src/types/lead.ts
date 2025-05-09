
import { Lead } from "@/lib/supabase";

export interface LeadFormData {
  customer_name: string;
  email: string;
  mobile_number: string;
  project_name: string;
  budget: string;
  preferred_area: string;
  team_leader: string;
  assigned_to: string;
  last_contacted_date: string;
  next_followup_date: string;
  comments: string;
  deal_status: string;
  interest_level: string;
  property_type: string;
  site_visit_done: boolean;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
}
