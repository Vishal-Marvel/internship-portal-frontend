import StudentInternship from "@/components/StudentInternship";
import { useModal } from "@/hooks/use-model-store";
import { useSocket } from "@/hooks/use-socket";
import axiosInstance from "@/lib/axios";
import { useSession } from "@/providers/context/SessionContext";
import { Internship } from "@/schema";
import { AlertCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

const ViewInternshipPage = () => {
  const { id } = useParams();
  const [internship, setInternship] = useState<Internship>();
  const { token, isTokenExpired } = useSession();
  const { type, onSocketClose } = useSocket();
  const { onOpen, onClose } = useModal();

  const getInternship = async () => {
    if (token && !isTokenExpired()) {
      if (!type || type == "internship") {
        try {
          onOpen("loader");
          const response = await axiosInstance.get("/internships/" + id, {
            headers: {
              Authorization: "Bearer " + token,
            },
          });
          setInternship(response.data.data.internshipDetails);
          onClose();
        } catch (error) {
          onClose();
          toast(
            <>
              <AlertCircle />
              {error.response.data.message}
            </>
          );
        }
        onSocketClose();
      }
    }
  };

  useEffect(() => {
    getInternship();
  }, [token, type]);

  return (
    <div className="grid place-items-center w-full">
      <StudentInternship internship={internship} />
    </div>
  );
};

export default ViewInternshipPage;
