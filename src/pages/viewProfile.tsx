import FacultyProfile from "@/components/FacultyProfile";
import StudentProfile from "@/components/StudentProfile";
import { useModal } from "@/hooks/use-model-store";
import { useSocket } from "@/hooks/use-socket";
import axiosInstance from "@/lib/axios";
import { useSession } from "@/providers/context/SessionContext";
import { Staff, Student } from "@/schema";
import { useEffect, useState } from "react";

const ViewProfilePage = () => {
  const [student, setStudent] = useState<Student>();
  const [staff, setStaff] = useState<Staff>();
  const { token, isTokenExpired, role } = useSession();
  const { onOpen, onClose } = useModal();
  const getData = async () => {
    try {
      if (!token || isTokenExpired()) {
        return;
      }
      onOpen("loader");
      if (role.includes("student")) {
        const response = await axiosInstance.get("/students/viewStudent", {
          headers: {
            Authorization: "Bearer " + token,
          },
        });
        setStudent(response.data.data.student);
      } else {
        const response = await axiosInstance.get("/staffs/viewStaff", {
          headers: {
            Authorization: "Bearer " + token,
          },
        });
        setStaff(response.data.data.staff);
      }
      onClose();
    } catch (error) {
      onClose();
      console.log(error);
    }
  };
  useEffect(() => {
    getData();
  }, []);
  return (
    <div>
      {role && role.includes("student") ? (
        <StudentProfile student={student} />
      ) : (
        <FacultyProfile staff={staff} />
      )}
    </div>
  );
};

export default ViewProfilePage;
