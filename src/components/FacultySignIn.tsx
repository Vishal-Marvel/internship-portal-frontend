import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import PasswordInput from "./PasswordInput";
import { useModal } from "@/hooks/use-model-store";
import { departmensts } from "@/schema";

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

  password: z.string().min(8, "Password must be minimum 8").default(""),
  cpassword: z.string().min(8, "Password must be minimum 8").default(""),
  department: z.string().min(1, "Department is Required").default(""),
  phone_no: z.string().refine((str) => {
    return str.length == 10;
  }, "Phone number is invalid"),
  email: z.string().default(""),

  file: z.instanceof(FileList).optional(),
});

const FacultySignIn = () => {
  const router = useNavigate();
  const { onOpen } = useModal();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const isLoading = form.formState.isSubmitting;
  const fileRef = form.register("file");
  const [college, setCollege] = useState("@sairam.edu.in");

  useEffect(() => {
    if (
      form.getValues("faculty_id") &&
      form.getValues("faculty_id").length > 0
    ) {
      form.setValue("faculty_id", form.getValues("faculty_id").toLowerCase());
    }
  }, [form.watch("faculty_id")]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // console.log(values);
      if (values.file[0] && values.file[0].size > 1024 * 512) {
        onOpen("alert", { alertText: "File size Exceeds 512 kb" });

        return;
      }
      if (values.password != values.cpassword) {
        onOpen("alert", {
          alertText: "Password and Confirm Password, didn't match",
        });

        return;
      }
      const formdata = new FormData();
      formdata.append("name", values.name);
      formdata.append("sec_sit", values.sec_sit);
      formdata.append("faculty_id", values.faculty_id);
      formdata.append("department", values.department);
      formdata.append("email", values.email + college);
      formdata.append("phone_no", values.phone_no);
      formdata.append("password", values.password);

      if (values.file[0]) formdata.append("file", values.file[0]);

      const response = await axiosInstance.post("/staffs/signup", formdata);
      toast(
        <>
          <CheckCircle2 />
          <span>Staff Data Successfully Registered, Login to Continue</span>
        </>
      );
      console.log(response);

      form.reset();

      router("/faculties");
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
    if (form.getValues("sec_sit")?.length > 0) {
      if (form.getValues("sec_sit") == "sec") {
        setCollege("@sairam.edu.in");
      }
      if (form.getValues("sec_sit") == "sit") {
        setCollege("@sairamit.edu.in");
      }
    }
  }, [form.watch("sec_sit")]);

  return (
    <Card className=" w-full shadow-2xl bg-white/80 border-0 rounded-2xl">
      <CardHeader>
        <div className="w-full flex justify-between">
          <CardTitle>Faculty Register</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="relative md:h-[55vh] h-[600px] w-full bg-white rounded-2xl">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 p-4 "
            >
              <div className=" w-full gap-5 grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 items-start">
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
                  disabled={isLoading}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>College</FormLabel>
                      <FormControl>
                        <Select
                          disabled={isLoading}
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
                                Sairam Institute of Technology
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
                  disabled={isLoading}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faculty Id</FormLabel>
                      <Input
                        className=" bg-slate-200 shadow-inner"
                        disabled={isLoading}
                        placeholder="Enter Faculty Id"
                        type="text"
                        {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name={"department"}
                  disabled={isLoading}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel> Department</FormLabel>
                      <FormControl>
                        <Select
                          disabled={isLoading}
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
                          type="text"
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
                    <FormItem>
                      <FormLabel>Profile Photo (OPTIONAL)</FormLabel>
                      <FormControl>
                        <Input
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name={"email"}
                  disabled={isLoading}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <span className="flex items-center gap-2">
                        <Input
                          className=" bg-slate-200 shadow-inner"
                          disabled={isLoading}
                          placeholder="Enter Email"
                          type="text"
                          {...field}
                        />
                        {college}
                      </span>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name={"password"}
                  disabled={isLoading}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          className="bg-slate-200 shadow-inner"
                          placeholder="Enter Password"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name={"cpassword"}
                  disabled={isLoading}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          className="bg-slate-200 shadow-inner"
                          placeholder="Enter Confirm Password"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col space-y-1.5 pt-2">
                <Button type="submit" disabled={isLoading} variant="primary">
                  Sign In
                </Button>
              </div>
            </form>
          </Form>
          <ScrollBar />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default FacultySignIn;
