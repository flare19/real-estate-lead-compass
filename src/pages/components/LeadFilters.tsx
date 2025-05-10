
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, Search } from 'lucide-react';

interface LeadFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  budgetFilter: string;
  onBudgetFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  areaFilter: string;
  onAreaFilterChange: (value: string) => void;
  uniqueAreas: string[];
  onResetFilters: () => void;
}

const LeadFilters = ({
  searchTerm,
  onSearchChange,
  budgetFilter,
  onBudgetFilterChange,
  statusFilter,
  onStatusFilterChange,
  areaFilter,
  onAreaFilterChange,
  uniqueAreas,
  onResetFilters,
}: LeadFiltersProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Search and Filter</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, email or area..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <div>
            <Select value={budgetFilter} onValueChange={onBudgetFilterChange}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Budget" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Budgets</SelectItem>
                <SelectItem value="0-50000">₹0 - ₹50,000</SelectItem>
                <SelectItem value="50000-100000">₹50,000 - ₹100,000</SelectItem>
                <SelectItem value="100000-250000">₹100,000 - ₹250,000</SelectItem>
                <SelectItem value="250000-500000">₹250,000 - ₹500,000</SelectItem>
                <SelectItem value="500000-1000000">₹500,000 - ₹1,000,000</SelectItem>
                <SelectItem value="1000000-">Above ₹1,000,000</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Not Contacted">Not Contacted</SelectItem>
                <SelectItem value="Follow-up">Follow-up</SelectItem>
                <SelectItem value="Site Visit">Site Visit</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
                <SelectItem value="Dropped">Dropped</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select value={areaFilter} onValueChange={onAreaFilterChange}>
              <SelectTrigger>
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Area" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                {uniqueAreas.map(area => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onResetFilters}>
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LeadFilters;
