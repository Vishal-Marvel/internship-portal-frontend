import axiosInstance from "@/lib/axios";
import { Button } from "./ui/button";
import React, { useEffect } from "react";
import { useSession } from "@/providers/context/SessionContext";
import { useModal } from "@/hooks/use-model-store";
import { useSocket } from "@/hooks/use-socket";
interface Props {
  id: string;
  role: "mentor" | "hod" | "internshipcoordinator" | "tapcell" | "principal";
}

const ApproveRejectSendBack = ({ id, role }: Props) => {
  const { token, isTokenExpired } = useSession();
  const { onOpen, onClose } = useModal();
  const { onChange } = useSocket();

  const handleApprove = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    try {
      if (isTokenExpired()) return;
      onOpen("loader");
      await axiosInstance.post(
        `/internships/approval/${role}/${id}`,
        {},
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
      onChange("approval");
      onClose();
      // console.log(response);
    } catch (error) {
      onClose();
      console.error(error);
    }
  };
  const handleReject = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    onOpen("rejectInternship", { role: role, id: id });
  };
  const handleSendBack = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    onOpen("sendbackInternship", { role: role, id: id });
  };
  return (
    <div className="grid md:grid-cols-3 grid-cols-1 gap-3">
      <Button variant="primary" onClick={handleApprove} type="button">
        Approve
      </Button>
      <Button variant="destructive" onClick={handleReject} type="button">
        Reject
      </Button>
      <Button variant="secondary" onClick={handleSendBack} type="button">
        Send back
      </Button>
    </div>
  );
};

export default ApproveRejectSendBack;
