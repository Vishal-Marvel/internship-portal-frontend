import axiosInstance from "@/lib/axios";
import { useSession } from "@/providers/context/SessionContext";
import { Internship, Student } from "@/schema";
import { useEffect, useState } from "react";
import { AlertCircle, CirclePlus, Download } from "lucide-react";
import { toast } from "sonner";
import { Link, useSearchParams } from "react-router-dom";
import ViewStudentInternships from "@/components/ViewStudentInternships";
import { useSocket } from "@/hooks/use-socket";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-model-store";

const ViewInternships = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const student = searchParams.get("student");
  const { token, role, isTokenExpired } = useSession();
  const [internships, setInternships] = useState<Internship[]>([]);
  const { type, onSocketClose, data } = useSocket();
  const { onOpen, onClose } = useModal();

  const getData = async () => {
    try {
      if (isTokenExpired()) return;

      if (role?.includes("student")) {
        const response = await axiosInstance.get("/students/internships", {
          headers: {
            Authorization: "Bearer " + token,
          },
        });
        setInternships(response.data.data.internships);
      } else {
        onOpen("loader");
        if (student) {
          const response = await axiosInstance.get(
            "/internships/view-student-internships/" + student,
            {
              headers: {
                Authorization: "Bearer " + token,
              },
            }
          );
          setInternships(response.data.data.internships);
        } else {
          const response = await axiosInstance.get("/internships/view/all", {
            headers: {
              Authorization: "Bearer " + token,
            },
          });
          setInternships(response.data.data.internships);
        }
        onClose();
      }

      onSocketClose();
    } catch (error) {
      onClose();
      toast(
        <>
          <AlertCircle />
          {error.response.data.message}
        </>
      );
      onSocketClose();
    }
  };

  useEffect(() => {
    if (!type || type == "internship") getData();
  }, [type, student]);

  return (
    <div className="relative">
      {!role?.includes("student") && (
        <Link to={"/download"}>
          <Button
            className={`absolute top-2  ${
              student ? "right-24 -translate-x-1/2" : "right-3"
            }`}
            variant={student ? "default" : "primary"}
          >
            <Download className="mr-2 h-5 w-5" /> Download
          </Button>
        </Link>
      )}
      {(role?.includes("student") || student) && (
        <Link to={"/addInternship" + (student ? `?student=${student}` : "")} className="absolute top-2 right-3">
          <Button variant="primary" className="p-2">
            <CirclePlus className="h-5 w-5 mr-2" /> Add Internship
          </Button>
        </Link>
      )}
      <ViewStudentInternships
        internships={internships}
        student={student && internships[0]?.student}
        mine={role?.includes("student")}
      />
    </div>
  );
};

export default ViewInternships;
