import { studentColumns } from "@/components/data-table-cols/student-columns";
import { DataTable } from "@/components/ui/data-table";
import axiosInstance from "@/lib/axios";
import { useSession } from "@/providers/context/SessionContext";
import { Student } from "@/schema";
import { VisibilityState } from "@tanstack/react-table";
import { AlertCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
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
const ViewMentees = () => {
  const { id } = useParams();
  const { token, role } = useSession();
  const [width, setWidth] = useState(isMobileView());
  const isMentor = role?.includes("mentor");
  const isTapCell = role?.includes("tapcell");
  const isPrincipal = role?.includes("principal");
  const isCEO = role?.includes("ceo");
  const isInternshipCoordinator = role?.includes("internshipcoordinator");
  const isHOD = role?.includes("hod");

  useEffect(() => {
    const handleResize = () => {
      setWidth(isMobileView());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const visibleColumns: VisibilityState = {
    select: false,
    sec_sit: width > 1 && (isCEO || isTapCell),
    section: width > 1 && (!isMentor || isHOD || isInternshipCoordinator),
    department: width > 1 && (isPrincipal || isCEO || isTapCell),
    batch: width > 1 && (!isMentor || isHOD || isInternshipCoordinator),
    mentor_name: width > 1 && (isPrincipal || isCEO || isHOD || isTapCell),
    skills: width > 1,
    placement_status: false,
    total_days_internship: width > 0 && (isMentor || isInternshipCoordinator),
  };
  const [student, setStudent] = useState<Student[]>([]);
  const getStudent = async () => {
    try {
      const response = await axiosInstance.get(
        "/staffs/mentee-students/" + id,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
      let student = await response.data.data.students;
      student = student?.map((student) => ({
        ...student,
        placement_status: student.placement_status ? "Placed" : "Not Placed",
        total_days_internship: student.total_days_internship ?? 0,
      }));
      setStudent(student);
    } catch (error) {
      toast(
        <>
          <AlertCircle />
          {error.response.data.message}
        </>
      );
    }
  };
  useEffect(() => {
    getStudent();
  }, []);
  return (
    <div className="grid place-items-center w-full">
      <DataTable
        title="Mentees"
        tableType="student"
        data={student}
        columns={studentColumns}
        visibleColumns={visibleColumns}
      />
    </div>
  );
};

export default ViewMentees;
