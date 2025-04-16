import { DataTableFacetedFilter } from "@/components/ui/data-table/data-faceted-filter";
import axiosInstance from "@/lib/axios";
import { useSession } from "@/providers/context/SessionContext";
import {
  approvalStatuses,
  internshipStatuses,
  noOfDays,
  placement_statuses,
} from "@/schema";
import { Table } from "@tanstack/react-table";
import { useEffect, useState } from "react";
interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}
function StudentToolBar<TData>({ table }: DataTableToolbarProps<TData>) {
  const { role } = useSession();
  const isMentor = role?.includes("mentor");
  const isTapCell = role?.includes("tapcell");
  const isPrincipal = role?.includes("principal");
  const isCEO = role?.includes("ceo");
  const isInternshipCoordinator = role?.includes("internshipcoordinator");
  const isHOD = role?.includes("hod");
  const [skills, setSkills] = useState([]);
  const getSkills = async () => {
    const response = await axiosInstance.get("/skill/getAllSkills");
    setSkills(
      response.data.data.skillNames.map((skill: string, index) => ({
        //@ts-ignore
        value: skill.name,
        //@ts-ignore
        label: skill.name,
      }))
    );
  };
  useEffect(() => {
    getSkills();
  }, []);
  return (
    <>
      {table.getColumn("placement_status") && (
        <DataTableFacetedFilter
          column={table.getColumn("placement_status")}
          title="Placement Status"
          options={placement_statuses}
        />
      )}
      {table.getColumn("total_days_internship") && (
        <DataTableFacetedFilter
          column={table.getColumn("total_days_internship")}
          title="Internship Completed Days"
          //@ts-ignore
          options={Array.from(
            table.getColumn("total_days_internship").getFacetedUniqueValues()
          ).map((value) => ({ value: value[0], label: value[0] }))}
        />
      )}
      {(isCEO || isTapCell) && table.getColumn("sec_sit") && (
        <DataTableFacetedFilter
          column={table.getColumn("sec_sit")}
          title="College"
          options={Array.from(
            table.getColumn("sec_sit").getFacetedUniqueValues()
          ).map((value) => ({
            value: value[0],
            label: value[0]?.toUpperCase(),
          }))}
        />
      )}
      {(!isMentor || isHOD || isInternshipCoordinator) &&
        table.getColumn("batch") && (
          <DataTableFacetedFilter
            column={table.getColumn("batch")}
            title="Batch"
            options={Array.from(
              table.getColumn("batch").getFacetedUniqueValues()
            ).map((value) => ({ value: value[0], label: value[0] }))}
          />
        )}
      {(isPrincipal || isCEO || isTapCell) && table.getColumn("department") && (
        <DataTableFacetedFilter
          column={table.getColumn("department")}
          title="Department"
          options={Array.from(
            table.getColumn("department").getFacetedUniqueValues()
          ).map((value) => ({
            value: value[0],
            label: value[0]?.toUpperCase(),
          }))}
        />
      )}
      {(!isMentor || isHOD || isInternshipCoordinator) &&
        table.getColumn("section") && (
          <DataTableFacetedFilter
            column={table.getColumn("section")}
            title="Section"
            options={Array.from(
              table.getColumn("section").getFacetedUniqueValues()
            ).map((value) => ({ value: value[0], label: value[0] }))}
          />
        )}

      {table.getColumn("skills") && (
        <DataTableFacetedFilter
          column={table.getColumn("skills")}
          title="Skills"
          options={skills}
        />
      )}
    </>
  );
}

export default StudentToolBar;
