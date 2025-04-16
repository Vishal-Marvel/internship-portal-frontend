import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { useSession } from "@/providers/context/SessionContext";
import axiosInstance from "@/lib/axios";
import { useSocket } from "@/hooks/use-socket";
import { useModal } from "@/hooks/use-model-store";
import { useEffect } from "react";

const DeleteSkill = () => {
  const { token, isTokenExpired } = useSession();
  const { onChange } = useSocket();
  const { isOpen, type, onClose, data } = useModal();
  const { skill } = data;

  const onSubmit = async () => {
    try {
      if (token && !isTokenExpired()) {
        const response = await axiosInstance.delete(
          "/skill/deleteskill/" + skill.id,
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );
        onChange("skills");
        onClose();
      }
    } catch (error: any) {
      const errorMessage = await error.response.data;
      console.error(error);
      toast(
        <>
          <AlertCircle /> {errorMessage.message}
        </>
      );
    }
  };
  const isModalOpen = isOpen && type == "deleteSkill";

  return (
    <AlertDialog open={isModalOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Skill ! </AlertDialogTitle>
          <AlertDialogDescription>
            This Will Delete the Skill and the related data
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onSubmit}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteSkill;
