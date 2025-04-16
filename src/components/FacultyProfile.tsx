import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { Staff, departmensts } from "@/schema";
import { useSession } from "@/providers/context/SessionContext";
import { cn } from "@/lib/utils";
import { useModal } from "@/hooks/use-model-store";

const formSchema = z.object({
  name: z.string().min(1, "Name is Required").default(""),
  sec_sit: z.string().min(1, "College is Required").default(""),
  faculty_id: z
    .string()
    .refine((str) => {
      const regex = /^(?:sect|sitt)\d{2}[a-z]{0,3}\d{3}$/;
      return regex.test(str);
    }, "Faculty Id Format Incorrect")
    .default(""),
  email: z.string().default(""),

  department: z.string().min(1, "Department is Required").default(""),
  phone_no: z.string().refine((str) => {
    return str.length == 10;
  }, "Phone number is invalid"),

  file: z.instanceof(FileList).optional(),
});

const FacultyProfile = ({ staff }: { staff: Staff }) => {
  const { token, role, isTokenExpired } = useSession();
  const [image, setImage] = useState("");
  const [update, setUpdate] = useState(false);
  const [imgaeOpen, setImgaeOpen] = useState(false);
  const { onOpen } = useModal();

  const isPrincipal = role && role.includes("principal");
  const isCeo = role && role.includes("ceo");
  const isAdmin = role && role.includes("admin");

  const isAuthenticated = isPrincipal || isAdmin || isCeo;

  const router = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const isLoading = form.formState.isSubmitting || !update;
  const fileRef = form.register("file");

  useEffect(() => {
    if (staff) {
      form.setValue("name", staff.name);
      form.setValue("sec_sit", staff.sec_sit);

      form.setValue("faculty_id", staff.faculty_id);
      form.setValue("department", staff.department);
      form.setValue(
        "email",
        staff.email.slice(0, staff.email.lastIndexOf("@"))
      );
      form.setValue("phone_no", staff.phone_no);
    }
    getImage();
  }, [staff]);

  const getImage = async () => {
    if (staff) {
      const imageResponse = await axiosInstance.get(
        "/students/image/" + staff.profile_photo,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
      setImage(imageResponse.data.image);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isTokenExpired()) return;
      if (values.file[0] && values.file[0].size > 1024 * 512) {
        onOpen("alert", { alertText: "File size Exceeds 512 kb" });
        return;
      }

      const formdata = new FormData();
      formdata.append("name", values.name);
      formdata.append("sec_sit", values.sec_sit);
      formdata.append("faculty_id", values.faculty_id);
      formdata.append("department", values.department);
      formdata.append("email", values.email + "@sairam.edu.in");
      formdata.append("phone_no", values.phone_no);

      if (values.file[0]) formdata.append("file", values.file[0]);

      await axiosInstance.put(`/staffs/update/` + staff.id, formdata, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });
      toast(
        <>
          <CheckCircle2 />
          <span>Staff Data Updated</span>
        </>
      );

      form.reset();

      router("/");
    } catch (error) {
      console.error(error);
      toast(
        <>
          <AlertCircle />
          {error.response.data.message}
        </>
      );
      //   console.error(error.response.data.message);
    }
  };

  useEffect(() => {
    if (
      form.getValues("faculty_id") &&
      form.getValues("faculty_id").length > 0
    ) {
      form.setValue("faculty_id", form.getValues("faculty_id").toLowerCase());
    }
  }, [form.watch("faculty_id")]);

  return (
    <Card className="h-full md:max-w-[70vw] w-full shadow-2xl bg-white/80 border-0 rounded-2xl">
      <CardHeader>
        <div className="w-full flex justify-between">
          <CardTitle>Staff Profile</CardTitle>
          <Button
            variant={update ? "destructive" : "default"}
            onClick={() => setUpdate(!update)}
          >
            {!update ? "Update" : "Close"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="md:h-fit h-[65vh] w-full bg-white rounded-2xl">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 p-4"
            >
              <div className=" w-full gap-8 grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 items-start">
                <div
                  className={cn(
                    "flex flex-col w-full items-center space-y-6 lg:col-span-3 md:col-span-2 col-span-1",
                    update && "hidden"
                  )}
                >
                  <FormLabel> Profile Photo</FormLabel>

                  <img
                    src={"data:image/jpg;charset=utf-8;base64," + image}
                    height={100}
                    width={100}
                  />
                </div>
                <FormField
                  name={"name"}
                  disabled={isLoading}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          className=" bg-slate-200 shadow-inner"
                          disabled={isLoading}
                          placeholder="Enter Name "
                          type="text"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name={"sec_sit"}
                  disabled={isLoading || !isAuthenticated}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>College</FormLabel>
                      <FormControl>
                        <Select
                          disabled={isLoading || !isAuthenticated}
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className=" bg-slate-200 shadow-inner">
                              <SelectValue placeholder="Select College" />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="sec">
                                Sri Sairam Engineering College
                              </SelectItem>
                              <SelectItem value="sit">
                                Sairam Institute Of Technology
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name={"faculty_id"}
                  disabled={isLoading || !isAuthenticated}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faculty Id</FormLabel>
                      <Input
                        className=" bg-slate-200 shadow-inner"
                        disabled={isLoading || !isAuthenticated}
                        placeholder="Enter Faculty Id"
                        type="text"
                        {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name={"email"}
                  disabled={isLoading || !isAuthenticated}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <span className="flex items-center gap-2">
                        <Input
                          className=" bg-slate-200 shadow-inner"
                          disabled={isLoading || !isAuthenticated}
                          placeholder="Enter Email"
                          type="text"
                          {...field}
                        />
                        @sairam.edu.in
                      </span>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name={"department"}
                  disabled={isLoading || !isAuthenticated}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Select
                          disabled={isLoading || !isAuthenticated}
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className=" bg-slate-200 shadow-inner">
                              <SelectValue placeholder="Select Department" />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent>
                            <SelectGroup>
                              {departmensts?.map((department, index) => {
                                return (
                                  <SelectItem
                                    value={department.value}
                                    key={index}
                                  >
                                    {department.label}
                                  </SelectItem>
                                );
                              })}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name={"phone_no"}
                  disabled={isLoading}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          className=" bg-slate-200 shadow-inner"
                          disabled={isLoading}
                          placeholder="Enter Phone Number"
                          type="number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name={"file"}
                  disabled={isLoading}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className={!update && "hidden"}>
                      <FormLabel>Profile Photo</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          className="bg-slate-200 shadow-inner"
                          type="file"
                          placeholder="Insert Pofile Photo"
                          accept="image/*"
                          {...fileRef}
                        />
                      </FormControl>
                      <FormDescription>
                        Upload only image files, file size should be less than
                        512 kb
                      </FormDescription>
                      <FormDescription>
                        <span
                          className={cn(
                            " text-blue-400 hover:underline cursor-pointer",
                            imgaeOpen && "hidden"
                          )}
                          onClick={() => setImgaeOpen(true)}
                        >
                          Click To {!imgaeOpen ? "View" : "Close"}
                        </span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div
                  className={cn(
                    "w-full justify-center items-center lg:col-span-3 md:col-span-2 col-span-1",
                    imgaeOpen && update ? "flex" : "hidden"
                  )}
                >
                  <div className="relative flex">
                    <X
                      className="cursor-pointer -right-3 -top-3 absolute"
                      onClick={() => setImgaeOpen(false)}
                    />
                    <img
                      className={cn(" text-blue-500 hover:underline right-1/2")}
                      src={"data:image/jpg;charset=utf-8;base64," + image}
                      height={100}
                      width={100}
                    />
                  </div>
                </div>
              </div>
              {update && (
                <div className="flex flex-col space-y-1.5 pt-2">
                  <Button type="submit" disabled={isLoading} variant="primary">
                    Update
                  </Button>
                </div>
              )}
            </form>
          </Form>
          <ScrollBar />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default FacultyProfile;
