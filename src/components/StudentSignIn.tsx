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
import axios from "axios";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { default as ReactSelect } from "react-select";
import axiosInstance from "@/lib/axios";
import PasswordInput from "./PasswordInput";
import { useModal } from "@/hooks/use-model-store";
import { departmensts } from "@/schema";

interface Option {
  label: string;
  value: string;
}

const formSchema = z.object({
  name: z.string().min(1, "Name is Required").default(""),
  sec_sit: z.string().min(1, "College is Required").default(""),
  student_id: z
    .string()
    .refine((str) => {
      const regex = /^(?:sec|sit)\d{2}[a-z]{0,3}\d{3}$/;
      const regexL = /^(?:secl|sitl)\d{2}[a-z]{0,3}\d{2}$/;
      return regex.test(str) || regexL.test(str);
    }, "Student Id Format Incorrect")
    .default(""),
  batch: z.string().min(1, "Batch is Required").default(""),
  section: z.string().min(1, "Section is Required").default(""),
  year_of_studying: z
    .string()
    .min(1, "Year Of Studying is Required")
    .default(""),
  register_num: z
    .string()
    .min(12, "Register number should be 12 digits")
    .default(""),
  password: z.string().min(8, "Password must be minimum 8").default(""),
  cpassword: z.string().min(8, "Password must be minimum 8").default(""),
  department: z.string().min(1, "Department is Required").default(""),
  phone_no: z.string().refine((str) => {
    return str.length == 10;
  }, "Phone number is invalid"),

  file: z.instanceof(FileList).optional(),
  mentor_name: z.object({ value: z.string(), label: z.string() }),
  skills: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .min(1, "Skills Must be selected"),
});

const StudentSignIn = () => {
  const router = useNavigate();
  const [years, setYears] = useState<string[]>([]);
  const [skills, setSkills] = useState<Option[]>([]);
  const [mentors, setMentors] = useState<Option[]>([]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const isLoading = form.formState.isSubmitting;
  const fileRef = form.register("file");
  const { onOpen, onClose } = useModal();

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const yearRanges = [];

    for (let i = 0; i < 4; i++) {
      const startYear = currentYear - i;
      const endYear = startYear + 4;
      yearRanges.push(`${startYear}-${endYear}`);
    }
    setYears(yearRanges);
  }, []);

  const getSkills = async () => {
    try {
      const response = await axiosInstance.get(
        "https://internship-portal-backend.vercel.app/internship/api/v1/skill/getAllSkills"
      );
      setSkills(
        response.data.data.skillNames.map((skill, index) => ({
          value: skill.id,
          label: skill.name,
        }))
      );
    } catch (error) {
      console.error(error.response.data);
    }
  };

  const getMentors = async () => {
    try {
      onOpen("loader");
      const response = await axiosInstance.get(
        `https://internship-portal-backend.vercel.app/internship/api/v1/staffs/${form.getValues(
          "department"
        )}/${form.getValues("sec_sit")}/mentors`
      );
      const data = response.data.data;
      setMentors(
        Object.keys(data).map((key, index) => ({
          value: data[key],
          label: `${key} (${data[key]})`,
        }))
      );
      onClose();
    } catch (error) {
      onClose();
      console.error(error.response.data);
    }
  };

  useEffect(() => {
    getSkills();
  }, []);

  useEffect(() => {
    if (
      form.getValues("student_id") &&
      form.getValues("student_id").length > 0
    ) {
      form.setValue("student_id", form.getValues("student_id").toLowerCase());
    }
  }, [form.watch("student_id")]);

  useEffect(() => {
    if (
      form.getValues("department") &&
      form.getValues("department") != "" &&
      form.getValues("sec_sit") &&
      form.getValues("sec_sit") != ""
    ) {
      getMentors();
    }
  }, [form.watch("department"), form.watch("sec_sit")]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
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
      formdata.append("section", values.section);
      formdata.append("batch", values.batch);
      formdata.append("student_id", values.student_id);
      formdata.append("year_of_studying", values.year_of_studying);
      formdata.append("register_num", values.register_num);
      formdata.append("department", values.department);
      formdata.append("email", values.student_id + "@sairamtap.edu.in");
      formdata.append("phone_no", values.phone_no);
      formdata.append("mentor_name", values.mentor_name.label);
      formdata.append("mentor_email", values.mentor_name.value);
      formdata.append("password", values.password);

      values.skills.forEach((skill, index) => {
        formdata.append(`skills`, skill.value);
      });
      if (values.file[0]) formdata.append("file", values.file[0]);
      onOpen("loader");

      const response = await axiosInstance.post(
        "https://internship-portal-backend.vercel.app/internship/api/v1/students/signup",
        formdata
      );
      onClose();
      toast(
        <>
          <CheckCircle2 />
          <span>
            Student Data Successfully Registered <br /> Login to Continue
          </span>
        </>
      );

      form.reset();

      router("/");
    } catch (error) {
      onClose();
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

  return (
    <Card className="h-full w-full shadow-2xl bg-white/80 border-0 rounded-2xl">
      <CardHeader>
        <div className="w-full flex justify-between">
          <CardTitle>Student Register</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="md:h-[55vh] h-[600px] w-full bg-white rounded-2xl">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 p-4"
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
                  name={"student_id"}
                  disabled={isLoading}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student Id</FormLabel>
                      <Input
                        className=" bg-slate-200 shadow-inner"
                        disabled={isLoading}
                        placeholder="Enter Student Id"
                        type="text"
                        {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name={"year_of_studying"}
                  disabled={isLoading}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Of Studying</FormLabel>
                      <FormControl>
                        <Select
                          disabled={isLoading}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className=" bg-slate-200 shadow-inner">
                              <SelectValue placeholder="Select Year of Studying" />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="I">I</SelectItem>
                              <SelectItem value="II">II</SelectItem>
                              <SelectItem value="III">III</SelectItem>
                              <SelectItem value="IV">IV</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name={"batch"}
                  disabled={isLoading}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch</FormLabel>
                      <FormControl>
                        <Select
                          disabled={isLoading}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className=" bg-slate-200 shadow-inner">
                              <SelectValue placeholder="Select Academic Year" />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent>
                            <SelectGroup>
                              {years &&
                                years.map((year, index) => (
                                  <SelectItem value={year} key={index}>
                                    {year}
                                  </SelectItem>
                                ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name={"register_num"}
                  disabled={isLoading}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Register Number</FormLabel>
                      <FormControl>
                        <Input
                          className=" bg-slate-200 shadow-inner"
                          disabled={isLoading}
                          placeholder="Enter Register Number"
                          type="string"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name={"section"}
                  disabled={isLoading}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section</FormLabel>
                      <FormControl>
                        <Select
                          disabled={isLoading}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className=" bg-slate-200 shadow-inner">
                              <SelectValue placeholder="Select Section" />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="A">A</SelectItem>
                              <SelectItem value="B">B</SelectItem>
                              <SelectItem value="C">C</SelectItem>
                              <SelectItem value="D">D</SelectItem>
                              <SelectItem value="E">E</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
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
                  name={"mentor_name"}
                  disabled={isLoading || mentors.length == 0}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mentor Name</FormLabel>
                      <FormControl>
                        <ReactSelect
                          classNamePrefix="bg-slate-200"
                          isDisabled={isLoading || mentors.length == 0}
                          onChange={field.onChange}
                          placeholder={"Select Mentor"}
                          onBlur={field.onBlur}
                          // @ts-ignore
                          options={mentors}
                          menuPlacement="auto"
                          maxMenuHeight={100}
                        />
                      </FormControl>
                      <FormMessage />
                      {mentors.length == 0 && (
                        <FormDescription>No Mentors Found</FormDescription>
                      )}
                    </FormItem>
                  )}
                />
                <FormField
                  name={"skills"}
                  disabled={isLoading}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills</FormLabel>
                      <FormControl>
                        <ReactSelect
                          isMulti
                          classNamePrefix="bg-slate-200"
                          isDisabled={isLoading}
                          onChange={field.onChange}
                          placeholder={"Select Skills"}
                          onBlur={field.onBlur}
                          // @ts-ignore
                          options={skills}
                          menuPlacement="auto"
                          maxMenuHeight={120}
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
                />{" "}
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
      <CardFooter>
        <div className="flex flex-col items-center w-full justify-center gap-3">
          Already Have a Account{" "}
          <Link to={"/"}>
            <Button variant="primary" className="p-2">
              Log in
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default StudentSignIn;
