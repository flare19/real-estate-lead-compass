
import { useRef } from "react";
import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { FilePlus } from "lucide-react";

type ImportLeadsProps = {
  onImport?: () => void;
};

const ImportLeads = ({ onImport }: ImportLeadsProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<any>(worksheet);

      // Show import in progress toast
      toast({ title: "Importing leads...", description: "Leads are being imported. Please wait." });

      // Format and validate leads
      const mappedRows = rows
        .map((row) => ({
          customer_name: row["customer_name"]?.toString() || "",
          email: row["email"]?.toString() || "",
          mobile_number: row["mobile_number"]?.toString() || "",
          project_name: row["project_name"]?.toString() || "",
          budget: Number(row["budget"] ?? 0),
          preferred_area: row["preferred_area"]?.toString() || "",
          team_leader: row["team_leader"]?.toString() || "",
          assigned_to: row["assigned_to"]?.toString() || "",
          last_contacted_date: row["last_contacted_date"]?.toString() || "",
          next_followup_date: row["next_followup_date"]?.toString() || "",
          comments: row["comments"]?.toString() || "",
          deal_status: row["deal_status"]?.toString() || "Not Contacted",
          interest_level: row["interest_level"]?.toString() || "Yellow",
          property_type: row["property_type"]?.toString() || "",
          site_visit_done: row["site_visit_done"] === true || row["site_visit_done"] === "TRUE" || row["site_visit_done"] === "true",
        }))
        .filter(r => r.customer_name && r.email);

      if (mappedRows.length === 0) {
        toast({
          title: "No leads found!",
          description: "Please check your Excel and try again.",
          variant: "destructive",
        });
        return;
      }

      // Bulk insert into Supabase
      const { error } = await supabase.from("leads").insert(mappedRows);
      if (error) {
        toast({
          title: "Import failed",
          description: error.message || "Could not import leads.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Leads imported successfully",
          description: `${mappedRows.length} leads have been added!`,
        });
        if (onImport) onImport();
      }
    } catch (err) {
      toast({
        title: "Error importing leads",
        description: "There was a problem parsing or importing the file.",
        variant: "destructive",
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center">
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        className="flex gap-2"
        size="sm"
      >
        <FilePlus className="h-4 w-4" />
        Import Leads
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="text-xs text-gray-600 mt-1 text-center w-52">
        <strong>Instructions:</strong> Prepare an Excel file with the following columns:
        <br />
        <code>
          customer_name, email, mobile_number, project_name, budget, preferred_area,
          team_leader, assigned_to, last_contacted_date, next_followup_date, comments,
          deal_status, interest_level, property_type, site_visit_done
        </code>
        <br />
        Allowed deal_status: Not Contacted, Follow-up, Site Visit, Closed, Dropped.<br />
        Allowed interest_level: Red, Yellow, Green.<br />
        For site_visit_done, use TRUE or FALSE.
      </div>
    </div>
  );
};
export default ImportLeads;
