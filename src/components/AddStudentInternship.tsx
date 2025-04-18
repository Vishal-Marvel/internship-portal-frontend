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
import { AlertCircle, CalendarIcon, CheckCircle2 } from "lucide-react";
import { useSession } from "@/providers/context/SessionContext";
import { useNavigate } from "react-router-dom";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";
import axiosInstance from "@/lib/axios";
import { useModal } from "@/hooks/use-model-store";
import { Student } from "@/schema";

const formSchema = z.object({
  company_name: z.string().min(1, "Company Name is Required").default(""),
  company_address: z.string().min(1, "Company Address is Required").default(""),
  company_ph_no: z
    .string()
    .refine((str) => str.length == 10, "Company Phone Number is Invalid")
    .default(""),
  cin_gst_udyog: z.string().min(1, "CIN/GST/UDYOG is Required").default(""),
  cin_gst_udyog_no: z
    .string()
    .min(1, "CIN/GST/UDYOG number is Required")
    .default(""),
  industry_supervisor_name: z
    .string()
    .min(1, "Inturtry Supervisor Name is Required")
    .default(""),
  industry_supervisor_ph_no: z
    .string()
    .refine(
      (str) => str.length == 10,
      "Inturtry Supervisor Phone Number is Invalid"
    )
    .default(""),
  industry_supervisor_email: z
    .string()
    .min(1, "Inturtry Supervisor Email is Required")
    .default(""),
  current_cgpa: z
    .string()
    .refine((str) => {
      const num = parseFloat(str);
      return num >= 1 && num <= 10;
    }, "CGPA must be within 1-10")
    .default(""),
  sem: z.string().min(1, "Sem is Required").default(""),
  mode_of_intern: z.string().min(1, "Mode of Intern is Required").default(""),
  starting_date: z.date(),
  no_of_days: z.string().min(1, "Number Of Days is Required").default(""),
  location: z.string().min(1, "Location is Required").default(""),
  domain: z.string().min(1, "Domain is Required").default(""),
  file: z.instanceof(FileList).optional(),
});

const AddStudentInternship = ({
  student,
  id,
}: {
  student?: Student;
  id?: string;
}) => {
  const router = useNavigate();
  const { token, role } = useSession();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const isLoading = form.formState.isSubmitting;
  const [mode, setMode] = useState("");
  const fileRef = form.register("file");
  const [cin_gst_udyog, setcin_gst_udyog] = useState<string>();
  const { onOpen, onClose } = useModal();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const formdata = new FormData();
      if (!values.file[0]) {
        onOpen("alert", { alertText: "Offer letter File is Required" });
        return;
      }
      if (values.file[0]?.size > 1048576) {
        onOpen("alert", { alertText: "Offer Letter File Size exceeded, 1 mb" });
        return;
      }

      formdata.append("company_name", values.company_name);
      formdata.append("company_address", values.company_address);
      formdata.append("company_ph_no", values.company_ph_no);
      formdata.append("current_cgpa", values.current_cgpa);
      formdata.append("cin_gst_udyog_no", values.cin_gst_udyog_no);
      formdata.append("cin_gst_udyog", values.cin_gst_udyog);
      formdata.append("sem", values.sem);
      formdata.append(
        "industry_supervisor_name",
        values.industry_supervisor_name
      );
      formdata.append(
        "industry_supervisor_ph_no",
        values.industry_supervisor_ph_no
      );

      formdata.append(
        "industry_supervisor_email",
        values.industry_supervisor_email
      );
      formdata.append("mode_of_intern", values.mode_of_intern);
      formdata.append("starting_date", values.starting_date.toISOString());
      formdata.append("no_of_days", values.no_of_days);
      formdata.append("location", values.location);
      formdata.append("domain", values.domain);

      formdata.append("file", values.file[0]);
      if (!role?.includes("student")) formdata.append("student_id", id);
      onOpen("loader");
      const response = await axiosInstance.post(
        "/internships/register",
        formdata,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
      onClose();

      toast(
        <>
          <CheckCircle2 />
          <span>{response.data.message}</span>
        </>
      );

      form.reset();

      router("/dashboard");
    } catch (error) {
      onClose();

      toast(
        <>
          <AlertCircle />
          {error.response.data.message}
        </>
      );

      console.error(error.response.data.message);
    }
  };

  useEffect(() => {
    setcin_gst_udyog(form.getValues("cin_gst_udyog"));
  }, [form.watch("cin_gst_udyog")]);

  useEffect(() => {
    if (
      form.getValues("mode_of_intern") == "online" &&
      mode != "online" &&
      !isLoading
    )
      onOpen("alert", {
        alertText:
          "You have selected  'Online' mode , where the number of days will be calculated by half",
      });
    if (form.getValues("mode_of_intern") != "")
      setMode(form.getValues("mode_of_intern"));
  }, [form.watch("mode_of_intern")]);

  return (
    <Card className="h-full w-full shadow-2xl bg-white/80 rounded-2xl">
      <CardHeader>
        <CardTitle>
          Add Internship for {student.name} ({student.student_id})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="md:h-[65vh] h-[75vh] w-full bg-white rounded-2xl">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 p-4"
            >
              <div className=" w-full gap-8 flex flex-col items-start">
                <div className="gap-4 flex flex-col w-full">
                  <span className="text-xl font-semibold">Company Details</span>
                  <div className="grid md:grid-cols-2 grid-cols-1 gap-8 md:pl-3 items-center">
                    <div className="grid lg:grid-cols-2 grid-cols-1 gap-8">
                      <FormField
                        disabled={isLoading}
                        name={"company_name"}
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <Input
                                className=" bg-slate-200 shadow-inner"
                                disabled={isLoading}
                                placeholder="Enter Company Name "
                                type="text"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        disabled={isLoading}
                        name={"company_ph_no"}
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Phone Number</FormLabel>
                            <FormControl>
                              <Input
                                className=" bg-slate-200 shadow-inner"
                                disabled={isLoading}
                                placeholder="Enter Company Phone Number"
                                type="number"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        disabled={isLoading}
                        name={"cin_gst_udyog"}
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CIN/GST/UDYOG</FormLabel>
                            <Select
                              disabled={isLoading}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className=" bg-slate-200 shadow-inner">
                                <SelectValue placeholder="Select CIN/GST/UDYOG" />
                              </SelectTrigger>

                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value="cin">CIN</SelectItem>
                                  <SelectItem value="gst">GST</SelectItem>
                                  <SelectItem value="udyog">UDYOG</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        disabled={isLoading}
                        name={"cin_gst_udyog_no"}
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="uppercase">
                              {cin_gst_udyog ? cin_gst_udyog : "CIN/GST/UDYOG"}
                            </FormLabel>
                            <FormControl>
                              <Input
                                className=" bg-slate-200 shadow-inner"
                                disabled={isLoading}
                                placeholder={`Enter ${
                                  (cin_gst_udyog &&
                                    cin_gst_udyog.toUpperCase()) ||
                                  "CIN/GST/UDYOG"
                                } Number`}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      disabled={isLoading}
                      name={"company_address"}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Address</FormLabel>
                          <FormControl>
                            <Textarea
                              className=" bg-slate-200 shadow-inner lg:min-h-[150px] lg:max-h-[150px] md:min-h-[300px] md:max-h-[300px]  min-h-[100px] max-h-[100px]"
                              disabled={isLoading}
                              placeholder="Enter Company Address"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="gap-4 flex flex-col w-full">
                  <span className="text-xl font-semibold">
                    Industry Supervisor Details
                  </span>
                  <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8 md:pl-3 items-center">
                    <FormField
                      disabled={isLoading}
                      name={"industry_supervisor_name"}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry Supervisor Name</FormLabel>
                          <FormControl>
                            <Input
                              className=" bg-slate-200 shadow-inner"
                              disabled={isLoading}
                              placeholder="Enter Industry Supervisor Name "
                              type="text"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      disabled={isLoading}
                      name={"industry_supervisor_ph_no"}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry Supervisor Number</FormLabel>
                          <FormControl>
                            <Input
                              className=" bg-slate-200 shadow-inner"
                              disabled={isLoading}
                              placeholder="Enter Industry Supervisor Number"
                              type="number"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      disabled={isLoading}
                      name={"industry_supervisor_email"}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel> Industry Supervisor Email</FormLabel>
                          <FormControl>
                            <Input
                              className=" bg-slate-200 shadow-inner"
                              disabled={isLoading}
                              placeholder="Enter Industry Supervisor Email"
                              type="email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="gap-4 flex flex-col w-full">
                  <span className="text-xl font-semibold">
                    Academic & Internship Details
                  </span>
                  <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8 md:pl-3 items-center">
                    <FormField
                      disabled={isLoading}
                      name={"current_cgpa"}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current CGPA</FormLabel>
                          <FormControl>
                            <Input
                              className=" bg-slate-200 shadow-inner"
                              disabled={isLoading}
                              placeholder="Enter Current CGPA "
                              type="text"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      disabled={isLoading}
                      name={"sem"}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SEM</FormLabel>
                          <FormControl>
                            <Select
                              disabled={isLoading}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger className=" bg-slate-200 shadow-inner">
                                  <SelectValue placeholder="Select SEM" />
                                </SelectTrigger>
                              </FormControl>

                              <SelectContent>
                                <SelectGroup>
                                  {!role?.includes("student") && (
                                    <>
                                      <SelectItem value="I">I</SelectItem>
                                      <SelectItem value="II">II</SelectItem>
                                    </>
                                  )}

                                  <SelectItem value="III">III</SelectItem>
                                  <SelectItem value="IV">IV</SelectItem>
                                  <SelectItem value="V">V</SelectItem>
                                  <SelectItem value="VI">VI</SelectItem>
                                  <SelectItem value="VII">VII</SelectItem>
                                  <SelectItem value="VIII">VIII</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      disabled={isLoading}
                      name={"mode_of_intern"}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mode Of Intern</FormLabel>
                          <FormControl>
                            <Select
                              disabled={isLoading}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger className=" bg-slate-200 shadow-inner">
                                  <SelectValue placeholder="Select Mode of Intern" />
                                </SelectTrigger>
                              </FormControl>

                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value="online">Online</SelectItem>
                                  <SelectItem value="offline">
                                    Offline
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
                      control={form.control}
                      name="starting_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Starting Date</FormLabel>
                          <FormControl>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "text-left font-normal bg-slate-200 shadow-inner",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => {
                                    const today = new Date();
                                    const futureDate = new Date(today);
                                    futureDate.setDate(today.getDate() + 45);
                                    const pastDate = new Date(today);
                                    pastDate.setDate(today.getDate() - (role?.includes("student") ? 15 : 100));
                                    return date > futureDate || date < pastDate;
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      disabled={isLoading}
                      name={"no_of_days"}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Days</FormLabel>
                          <FormControl>
                            <Select
                              disabled={isLoading}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger className=" bg-slate-200 shadow-inner">
                                  <SelectValue placeholder="Select Number of Days" />
                                </SelectTrigger>
                              </FormControl>

                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value="15">15</SelectItem>
                                  <SelectItem value="30">30</SelectItem>
                                  <SelectItem value="45">45</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      disabled={isLoading}
                      name={"location"}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input
                              className=" bg-slate-200 shadow-inner"
                              disabled={isLoading}
                              placeholder="Enter Location "
                              type="text"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      disabled={isLoading}
                      name={"domain"}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Domain</FormLabel>
                          <FormControl>
                            <Input
                              className=" bg-slate-200 shadow-inner"
                              disabled={isLoading}
                              placeholder="Enter Domain "
                              type="text"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      disabled={isLoading}
                      name={"file"}
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Offer Letter</FormLabel>
                          <FormControl>
                            <Input
                              className="bg-slate-200 shadow-inner"
                              type="file"
                              placeholder="Insert Offer Letter"
                              accept=".pdf"
                              size={1024 * 1024 * 5}
                              {...fileRef}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-1.5 pt-2">
                <Button type="submit" disabled={isLoading} variant="primary">
                  Add Internship
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

export default AddStudentInternship;
