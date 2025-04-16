import { useModal } from "@/hooks/use-model-store";
import { useSession } from "@/providers/context/SessionContext";
import { useNavigate } from "react-router-dom";
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
import { AlertCircle, CheckCircle } from "lucide-react";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useSocket } from "@/hooks/use-socket";
import { useEffect, useState } from "react";
import ReactSelect from "react-select";

const formSchema = z.object({
  roles: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .min(1, "Atleast One Role Must be selected"),
});

interface Option {
  label: string;
  value: string;
}

const ModifyRole = () => {
  const { isOpen, onClose, type, data, onOpen } = useModal();
  const { token, isTokenExpired, role } = useSession();
  const { faculty } = data;
  const [roles, setRoles] = useState<Option[]>([]);
  const { onChange } = useSocket();
  const isModalOpen = isOpen && type == "updateRole";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const isLoading = form.formState.isSubmitting;
  const getRoles = async () => {
    try {
      if (token && !isTokenExpired() && !role?.includes("student")) {
        const response = await axiosInstance.get("/staffs/viewAllRoles", {
          headers: {
            Authorization: "Bearer " + token,
          },
        });
        setRoles(
          response.data.roles.map((role) => ({
            value: role?.id,
            label: role?.name?.toUpperCase(),
          }))
        );
      }
    } catch (error) {
      console.error(error);
    }
  };
  const getStaffRoles = async () => {
    try {
      const response = await axiosInstance.get(
        "/staffs/viewStaffRoles/" + faculty.id,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
      form.setValue(
        "roles",
        response.data.roles.map((role, index) => ({
          value: role?.id,
          label: role?.role_name.toUpperCase(),
        }))
      );
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    form.reset();
    getRoles();
  }, [isModalOpen]);

  useEffect(() => {
    if (faculty) {
      getStaffRoles();
    }
  }, [faculty]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isTokenExpired()) {
        onClose();
        return;
      }

      const response = await axiosInstance.post(
        `/staffs/updateRole/${faculty?.id}`,
        { roles: values.roles.map((role) => role.value) },
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
      form.reset();
      toast(
        <>
          <CheckCircle /> {response.data.message}
        </>
      );
      onClose();
      onChange("staff");
    } catch (error) {
      const errorMessage = await error.response.data;
      console.error(errorMessage);

      toast(
        <>
          <AlertCircle /> {errorMessage.message}
        </>
      );
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0  w-full">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Update Roles
          </DialogTitle>
          <DialogDescription>
            Updating Roles for {faculty?.name}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <FormField
                control={form.control}
                name="roles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
                      Choose Roles
                    </FormLabel>
                    <FormControl>
                      <ReactSelect
                        isMulti
                        classNamePrefix="bg-slate-200"
                        isDisabled={isLoading}
                        onChange={field.onChange}
                        placeholder={"Select Roles"}
                        onBlur={field.onBlur}
                        // @ts-ignore
                        options={roles}
                        menuPlacement="auto"
                        maxMenuHeight={150}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4 rounded-lg">
              <Button variant="primary" disabled={isLoading}>
                Update
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ModifyRole;
