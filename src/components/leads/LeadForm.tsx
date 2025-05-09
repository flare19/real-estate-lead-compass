
import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { LeadFormData, Profile } from '@/types/lead';

interface LeadFormProps {
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;
  formData: LeadFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleSwitchChange: (checked: boolean) => void;
  employees: Profile[];
  onCancel: () => void;
}

const LeadForm = ({
  onSubmit,
  isSubmitting,
  formData,
  handleChange,
  handleSelectChange,
  handleSwitchChange,
  employees,
  onCancel,
}: LeadFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Information</CardTitle>
        <CardDescription>
          Enter the details of the new lead to add to the system.
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Customer Name *</Label>
              <Input
                id="customer_name"
                name="customer_name"
                value={formData.customer_name}
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
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile_number">Mobile Number *</Label>
              <Input
                id="mobile_number"
                name="mobile_number"
                value={formData.mobile_number}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project_name">Project Name *</Label>
              <Input
                id="project_name"
                name="project_name"
                value={formData.project_name}
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
                value={formData.budget}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferred_area">Preferred Area *</Label>
              <Input
                id="preferred_area"
                name="preferred_area"
                value={formData.preferred_area}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team_leader">Team Leader *</Label>
              <Input
                id="team_leader"
                name="team_leader"
                value={formData.team_leader}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assigned_to">Assigned To *</Label>
              <Input
                id="assigned_to"
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_contacted_date">Last Contacted Date *</Label>
              <Input
                id="last_contacted_date"
                name="last_contacted_date"
                type="date"
                value={formData.last_contacted_date}
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
                value={formData.next_followup_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deal_status">Deal Status *</Label>
              <Select
                value={formData.deal_status}
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
                value={formData.interest_level}
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
                value={formData.property_type}
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
                  checked={formData.site_visit_done}
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
              value={formData.comments}
              onChange={handleChange}
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Add Lead'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LeadForm;
