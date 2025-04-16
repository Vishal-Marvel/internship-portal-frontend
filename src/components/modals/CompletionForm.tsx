import { useModal } from "@/hooks/use-model-store";
import { useSession } from "@/providers/context/SessionContext";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axiosInstance from "@/lib/axios";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useSocket } from "@/hooks/use-socket";

const formSchema = z.object({
  certificate: z.instanceof(FileList).optional(),
});
const CompletionForm = () => {
  const { isOpen, onClose, onOpen, type, data } = useModal();
  const { token, isTokenExpired } = useSession();
  const { internship } = data;

  const { onChange } = useSocket();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const isLoading =
    form.formState.isSubmitting || internship?.approval_status != "Approved";
  const fileRef = form.register("certificate");

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isTokenExpired()) {
        onClose();
        return;
      }
      const formData = new FormData();
      if (values.certificate[0]?.size > 1048576) {
        onOpen("alert", { alertText: "File size Exceeds 1 Mb" });
      }
      formData.append("certificate", values.certificate[0]);

      await axiosInstance.post(
        `/internships/completion-update/${internship?.id}`,
        formData,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
      form.reset();
      onChange("internship");
      onClose();
    } catch (error) {
      const errorMessage = await error.response.data;

      toast(
        <>
          <AlertCircle /> {errorMessage.message}
        </>
      );
    }
  };

  const isModalOpen = isOpen && type === "completeInternship";

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0  w-full">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Upload Completion Certificate
          </DialogTitle>
          <DialogDescription>
            By Uploading this certificate, you have completed this internship
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <FormField
                control={form.control}
                name="certificate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                      Completion Certificate
                    </FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                        accept="*.pdf"
                        type="file"
                        {...fileRef}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4 rounded-lg">
              <Button variant="primary" disabled={isLoading}>
                Upload
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CompletionForm;
