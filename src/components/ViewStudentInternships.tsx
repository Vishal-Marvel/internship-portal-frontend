import { internshipColumns } from "@/components/data-table-cols/internship-columns";
import { DataTable } from "@/components/ui/data-table";
import { useSession } from "@/providers/context/SessionContext";
import { Internship, Student } from "@/schema";
import { VisibilityState } from "@tanstack/react-table";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
interface Props {
  internships: Internship[];
  student?: Student;
  mine?: boolean;
}
function isMobileView() {
  if (window) {
    // Get the width of the viewport
    const width =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth;
    if (width >= 1024) {
      return 2;
    } else if (width >= 768 && width < 1024) {
      return 1;
    } else if (width < 768) {
      return 0;
    }
  }
}
const ViewStudentInternships = ({ internships, student, mine }: Props) => {
  const [width, setWidth] = useState(isMobileView());
  const navigate = useNavigate();
  useEffect(() => {
    const handleResize = () => {
      setWidth(isMobileView());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const { role } = useSession();
  const visibleColumns: VisibilityState = {
    student_id: !role?.includes("student") || !student,
    starting_date: width > 0,
    ending_date: width > 1,
    days: width > 0,
    approval_status: width > 1,
    department: false,
    internship_status: width > 0,
    batch: false,
    section: false,
    sem: false,
    actions: role?.includes("student"),
  };

  const handleRowClick = (row: Internship) => {
    navigate("/internship/" + row.id);
  };
  return (
    <DataTable
      tableType="internship"
      title={`${student ? student.name : mine ? "My" : "Student"} Internships`}
      data={internships}
      columns={internshipColumns}
      visibleColumns={visibleColumns}
      onRowClick={handleRowClick}
    />
  );
};

export default ViewStudentInternships;
