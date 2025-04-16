import ChangeMentee from "@/components/ChangeMentee";
import { studentColumns } from "@/components/data-table-cols/student-columns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useModal } from "@/hooks/use-model-store";
import { useSocket } from "@/hooks/use-socket";
import axiosInstance from "@/lib/axios";
import { useSession } from "@/providers/context/SessionContext";
import { Student } from "@/schema";
import { VisibilityState } from "@tanstack/react-table";
import { AlertCircle, CheckCircle, CircleCheck } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
const ChangeMentees = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { token, isTokenExpired } = useSession();
  const { type, onSocketClose, data, onChange } = useSocket();
  const { fromMentor, toMentor, rows } = data;
  const [id, setId] = useState(searchParams.get("mentor"));
  const [width, setWidth] = useState(isMobileView());
  const [toFaculty, setToFaculty] = useState("");
  const [selectedRows, setSelectedRows] = useState({});
  const [loading, setLoading] = useState(false);
  const { onOpen, onClose } = useModal();

  useEffect(() => {
    const handleResize = () => {
      setWidth(isMobileView());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const visibleColumns: VisibilityState = {
    select: true,
    sec_sit: false,
    year_of_studying: width > 1,
    section: width > 0,
    department: width > 1,
    mentor_name: false,
    skills: false,
    placement_status: false,
    placed_company: false,
    total_days_internship: false,
  };
  const [student, setStudent] = useState<Student[]>([]);
  const getStudent = async () => {
    if (token && !isTokenExpired()) {
      try {
        onOpen("loader");
        const response = await axiosInstance.get(
          "/staffs/mentee-students/" + id,
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );
        let student = await response.data.data.students;

        setStudent(student);
        onClose();
        onSocketClose();
      } catch (error) {
        toast(
          <>
            <AlertCircle />
            {error.response.data.message}
          </>
        );
      }
    }
  };
  useEffect(() => {
    getStudent();
  }, [id]);
  useEffect(() => {
    if (type == "mentee") getStudent();
  }, [type]);
  useEffect(() => {
    if (type == "fromMentor") {
      setId(fromMentor);
    }
    if (type == "toMentor") {
      setToFaculty(toMentor);
    }
    if (type == "rows") {
      setSelectedRows(rows);
    }
    onSocketClose();
  }, [type]);

  const handleSubmit = async () => {
    try {
      if (toFaculty == "") {
        toast(
          <>
            <AlertCircle />
            To Mentor Is Not Selected
          </>
        );
        return;
      }

      if (token && !isTokenExpired()) {
        const students = student
          .filter((_, index) => selectedRows[index])
          .map((student) => student.id);
        if (students.length == 0) {
          toast(
            <>
              <AlertCircle />
              Select Mentees To Change
            </>
          );
          return;
        }
        setLoading(true);
        onOpen("loader");
        const response = await axiosInstance.post(
          "/staffs/updateMentees",
          {
            to_staff: toFaculty,
            students,
          },
          { headers: { Authorization: "Bearer " + token } }
        );
        onSocketClose();
        onClose();
        toast(
          <>
            <CircleCheck />
            {response.data.message}
          </>
        );
        setLoading(false);
        onChange("rowSelection");

        setTimeout(() => onChange("mentee"), 100);
      }
    } catch (error) {
      console.error(error);
      toast(
        <>
          <AlertCircle />
          {error.response.data.message}
        </>
      );
    }
  };
  return (
    <div className="flex flex-col w-full items-center justify-center gap-4">
      <div className="flex flex-1 flex-col w-full p-2 items-center bg-white/80 rounded-md">
        <ChangeMentee staff={id} loading={loading} />

        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          Update
        </Button>
      </div>

      <DataTable
        tableType="mentee"
        title="Faculty Mentees"
        data={student}
        columns={studentColumns}
        visibleColumns={visibleColumns}
      />
    </div>
  );
};

export default ChangeMentees;
