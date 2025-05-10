
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLeadsData } from '@/hooks/useLeadsData';
import LeadsHeader from './components/LeadsHeader';
import LeadFilters from './components/LeadFilters';
import LeadsTable from './components/LeadsTable';
import LeadsPagination from './components/LeadsPagination';

const ViewLeads = () => {
  const {
    currentLeads,
    searchTerm,
    setSearchTerm,
    budgetFilter,
    setBudgetFilter,
    statusFilter,
    setStatusFilter,
    areaFilter,
    setAreaFilter,
    isLoading,
    handleDelete,
    handleEmailClick,
    resetFilters,
    viewClosedDeals,
    exportToExcel,
    csvData,
    currentPage,
    totalPages,
    paginate,
    fetchLeads,
    uniqueAreas
  } = useLeadsData();

  return (
    <div className="space-y-6">
      <LeadsHeader 
        onExportExcel={exportToExcel} 
        onViewClosedDeals={viewClosedDeals} 
        csvData={csvData}
        onImport={fetchLeads}
      />

      <LeadFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        budgetFilter={budgetFilter}
        onBudgetFilterChange={setBudgetFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        areaFilter={areaFilter}
        onAreaFilterChange={setAreaFilter}
        uniqueAreas={uniqueAreas}
        onResetFilters={resetFilters}
      />

      <Card>
        <CardHeader>
          <CardTitle>Lead List</CardTitle>
        </CardHeader>
        <CardContent>
          <LeadsTable 
            currentLeads={currentLeads}
            isLoading={isLoading}
            onDelete={handleDelete}
            onEmailClick={handleEmailClick}
          />
          
          {!isLoading && currentLeads.length > 0 && (
            <LeadsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={paginate}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewLeads;
