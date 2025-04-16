import AddStudentInternship from "@/components/AddStudentInternship";
import { useModal } from "@/hooks/use-model-store";
import axiosInstance from "@/lib/axios";
import { useSession } from "@/providers/context/SessionContext";
import axios from "axios";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const AddStudentInternshipPage = () => {
  const navigate = useNavigate();
  const { onOpen, onClose } = useModal();
  const { token, role } = useSession();
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get("student");
  const [student, setStudent] = useState("");
  useEffect(() => {
    setStudent(id);
  }, [id]);
  const getStatus = async () => {
    try {
      setLoading(true);
      onOpen("loader");
      if (!role?.includes("student") && student == "") return;
      const response = await axios.get(
        `/internships/check${!role?.includes("student") ? "/" + student : ""}`,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
      setLoading(false);
      onClose();
    } catch (error) {
      onClose();
      if (role?.includes("student")) {
        toast(
          <>
            <AlertCircle />
            {error.response.data.message}
          </>
        );
        navigate("/dashboard");
      } else {
        setLoading(false);

        // console.error(error);
        onOpen("alert", {
          alertText: error.response.data.message,
        });
      }
    }
  };

  useEffect(() => {
    getStatus();
  }, [student]);

  return (
    <div className="w-full md:w-fit">
      {!loading && <AddStudentInternship student={student} />}
    </div>
  );
};

export default AddStudentInternshipPage;
