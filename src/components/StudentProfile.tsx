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
import axios from "axios";
import { AlertCircle, CalendarIcon, CheckCircle2, X } from "lucide-react";
import { useSession } from "@/providers/context/SessionContext";
import { Link, useNavigate } from "react-router-dom";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { Skill, Student, departmensts } from "@/schema";
import { default as ReactSelect } from "react-select";
import axiosInstance from "@/lib/axios";
import { cn } from "@/lib/utils";
import { useSocket } from "@/hooks/use-socket";
import { useModal } from "@/hooks/use-model-store";

interface Props {
  student: Student;
}

const formSchema = z.object({
  name: z.string().min(1, "Name is Required").default(""),
  sec_sit: z.string().min(1, "College is Required").default(""),
  student_id: z.string().min(1, "Student ID is Required").default(""),
  batch: z.string().min(1, "Batch is Required").default(""),
  section: z.string().min(1, "Section is Required").default(""),
  year_of_studying: z
    .string()
    .min(1, "Year Of Studying is Required")
    .default(""),
  register_num: z.string().min(1, "Register number is Required").default(""),
  department: z.string().min(1, "Department is Required").default(""),
  email: z.string().email().default(""),
  phone_no: z.string().refine((str) => {
    return str.length == 10;
  }, "Phone number is invalid"),
  total_days_internship: z.number().nullable(),
  placement_status: z.string().optional(),
  placed_company: z.string().optional(),
  file: z.instanceof(FileList).optional(),
  mentor_name: z.string(),
  skills: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .min(1, "Skills Must be selected"),
});

interface Option {
  label: string;
  value: string;
}

const StudentProfile = ({ student }: Props) => {
  const { onChange } = useSocket();
  const { token, role } = useSession();
  const [years, setYears] = useState<string[]>([]);

  const [skills, setSkills] = useState<Option[]>([]);
  const [image, setImage] = useState("");
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const [update, setUpdate] = useState(false);
  const { onOpen } = useModal();

  const isLoading = form.formState.isSubmitting || !update;
  const fileRef = form.register("file");
  const isStudent = role && role.includes("student");
  const [imgaeOpen, setImgaeOpen] = useState(false);

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
      const response = await axiosInstance.get("/skill/getAllSkills");
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

  useEffect(() => {
    getSkills();
  }, []);

  const getImage = async () => {
    if (student) {
      const imageResponse = await axiosInstance.get(
        "/students/image/" + student.profile_photo,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
      setImage(imageResponse.data.image);
    }
  };

  useEffect(() => {
    if (student) {
      setYears([student.batch]);
      form.setValue("name", student.name);
      form.setValue("sec_sit", student.sec_sit);
      form.setValue("batch", student.batch);
      form.setValue("section", student.section);
      form.setValue("student_id", student.student_id);
      form.setValue("year_of_studying", student.year_of_studying);
      form.setValue("register_num", student.register_num);
      form.setValue("department", student.department);
      form.setValue("email", student.email);
      form.setValue("phone_no", student.phone_no);
      form.setValue("total_days_internship", student.total_days_internship);
      form.setValue("placement_status", student.placement_status || "unplaced");
      form.setValue("placed_company", student.placed_company);
      form.setValue("mentor_name", student.mentor_name);
      form.setValue(
        "skills",
        //@ts-ignore
        student.skills.map((skill) => ({ value: skill.id, label: skill.name }))
      );
    }
    getImage();
  }, [student]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (values.file && values.file[0].size > 1024 * 512) {
        onOpen("alert", { alertText: "File size Exceeds 512 kb" });

        return;
      }
      const formdata = new FormData();
      formdata.append("name", values.name);
      formdata.append("section", values.section);
      formdata.append("batch", values.batch);
      formdata.append("student_id", values.student_id);
      formdata.append("year_of_studying", values.year_of_studying);
      formdata.append("register_num", values.register_num);
      formdata.append("department", values.department);
      formdata.append("email", values.email);
      formdata.append("phone_no", values.phone_no);
      formdata.append(
        "total_days_internship",
        String(values.total_days_internship)
      );
      formdata.append("placement_status", values.placement_status);
      formdata.append("placed_company", values.placed_company);
      formdata.append("mentor_name", values.mentor_name);
      values.skills.forEach((skill, index) => {
        formdata.append(`skills`, skill.value);
      });
      if (values.file) {
        formdata.append("file", values.file[0]);
      }
      if (isStudent) {
        const response = await axiosInstance.put("/students/update", formdata, {
          headers: {
            Authorization: "Bearer " + token,
          },
        });
        toast(
          <>
            <CheckCircle2 />
            <span>{response.data.message}</span>
          </>
        );
      } else {
        const response = await axiosInstance.put(
          "/students/" + student.id,
          formdata,
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );
        toast(
          <>
            <CheckCircle2 />
            <span>{response.data.message}</span>
          </>
        );
      }

      setUpdate(false);
      onChange("studentProfile");
    } catch (error) {
      // console.error(error);
      toast(
        <>
          <AlertCircle />
          {error.response.data.message}
        </>
      );

      console.error(error.response.data.message);
    }
  };

  return (
    <Card className="h-full w-full shadow-2xl bg-white/80 rounded-2xl">
      <CardHeader>
        <div className="w-full flex justify-between">
          <CardTitle>Student Profile</CardTitle>
          <Button
            variant={update ? "destructive" : "default"}
            onClick={() => setUpdate(!update)}
          >
            {!update ? "Update" : "Close"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="md:h-[55vh] h-[70vh] md:max-w-[70vw] bg-white rounded-2xl">
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
                          value={field.value}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name={"sec_sit"}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>College</FormLabel>
                      <FormControl>
                        <Select
                          disabled={true}
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className=" bg-slate-200 shadow-inner">
                              <SelectValue placeholder="Select College" />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="sec">
                                Sairam Engineering College
                              </SelectItem>
                              <SelectItem value="sit">
                                Sairam Institure Of Technology
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
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student Id</FormLabel>
                      <Input
                        className=" bg-slate-200 shadow-inner"
                        disabled={true}
                        placeholder="Enter Student Id"
                        type="text"
                        value={field.value}
                        {...field}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name={"year_of_studying"}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Of Studying</FormLabel>
                      <FormControl>
                        <Select
                          disabled={isLoading}
                          onValueChange={field.onChange}
                          value={field.value}
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
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch</FormLabel>
                      <FormControl>
                        <Select
                          disabled={true}
                          onValueChange={field.onChange}
                          value={field.value}
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
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Register Number</FormLabel>
                      <FormControl>
                        <Input
                          className=" bg-slate-200 shadow-inner"
                          disabled={true}
                          placeholder="Enter Register Number"
                          type="string"
                          value={field.value}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name={"department"}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel> Department</FormLabel>
                      <FormControl>
                        <Select
                          disabled={true}
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
                  name={"section"}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section</FormLabel>
                      <FormControl>
                        <Select
                          disabled={isLoading}
                          onValueChange={field.onChange}
                          value={field.value}
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
                  name={"email"}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          className=" bg-slate-200 shadow-inner"
                          disabled={true}
                          placeholder="Enter Email "
                          type="email"
                          value={field.value}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name={"phone_no"}
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
                          value={field.value}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name={"total_days_internship"}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Days Of Internship</FormLabel>
                      <FormControl>
                        <Input
                          className=" bg-slate-200 shadow-inner"
                          disabled={true}
                          placeholder="Total Days Of Internship"
                          type="text"
                          value={field.value}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading || isStudent}
                  control={form.control}
                  name="placement_status"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Placement Status</FormLabel>
                      <FormControl>
                        <Select
                          disabled={isLoading || isStudent}
                          value={field.value}
                          onValueChange={field.onChange}
                          defaultValue="unplaced"
                        >
                          <FormControl>
                            <SelectTrigger className=" bg-slate-200 shadow-inner">
                              <SelectValue placeholder="Select Placement Status" />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="placed">Placed</SelectItem>
                              <SelectItem value="unplaced">Unplaced</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  disabled={isLoading || isStudent}
                  name={"placed_company"}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placed Company</FormLabel>
                      <FormControl>
                        <Input
                          className=" bg-slate-200 shadow-inner"
                          disabled={isLoading || isStudent}
                          placeholder="Enter Placed Company"
                          type="text"
                          value={field.value}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name={"mentor_name"}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mentor Name</FormLabel>
                      <FormControl>
                        <Input
                          className=" bg-slate-200 shadow-inner"
                          disabled={true}
                          placeholder="Enter Mentor Name "
                          type="text"
                          value={field.value}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name={"skills"}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills</FormLabel>
                      <FormControl>
                        <ReactSelect
                          isMulti
                          isDisabled={isLoading}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          // defaultValue={skills[0]}
                          value={field.value}
                          options={skills}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name={"file"}
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className={!update && "hidden"}>
                      <FormLabel>Profile Photo</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          className="bg-slate-200 shadow-inner"
                          type="file"
                          placeholder="Insert Profile Photo"
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
                    "w-full justify-center items-center",
                    imgaeOpen ? "flex" : "hidden"
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

export default StudentProfile;
