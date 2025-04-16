import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { useSession } from "@/providers/context/SessionContext";
import axiosInstance from "@/lib/axios";
import { useSocket } from "@/hooks/use-socket";
import { useModal } from "@/hooks/use-model-store";

const formSchema = z.object({
  skillName: z.string().min(1, { message: "Skill Name is required" }),
});

const AddSkill = () => {
  const { token, isTokenExpired } = useSession();
  const { onChange } = useSocket();
  const { isOpen, type, onClose } = useModal();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skillName: "",
    },
  });
  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (token && !isTokenExpired()) {
        const response = await axiosInstance.post("/skill/addSkill", values, {
          headers: {
            Authorization: "Bearer " + token,
          },
        });
        form.reset();
        onClose();
        onChange("skills");
      }
    } catch (error: any) {
      const errorMessage = await error.response.data;

      toast(
        <>
          <AlertCircle /> {errorMessage.message}
        </>
      );
    }
  };
  const isModalOpen = isOpen && type == "addSkill";

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0  w-full">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Add Skill
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <FormField
                disabled={isLoading}
                name={"skillName"}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skill Name</FormLabel>
                    <FormControl>
                      <Input
                        className=" bg-slate-200 shadow-inner"
                        disabled={isLoading}
                        placeholder="Enter Skill Name"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4 rounded-lg">
              <Button variant="primary" disabled={isLoading}>
                Add
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSkill;
