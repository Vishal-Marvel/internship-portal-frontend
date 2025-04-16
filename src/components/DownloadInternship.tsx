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

import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { useSession } from "@/providers/context/SessionContext";
import { departmensts } from "@/schema";
import { useModal } from "@/hooks/use-model-store";

const formSchema = z.object({
  batch: z.string().optional(),
  sec_sit: z.string().optional(),
  department: z.string().optional(),
  sem: z.string().optional(),
  section: z.string().optional(),
});

const DownloadInternshipComponent = () => {
  const { token, isTokenExpired, role } = useSession();
  const { onOpen, onClose } = useModal();
  const isMentor = role?.includes("mentor");
  const isInternCoordinator = role?.includes("internshipcoordinator");
  const isHOD = role?.includes("hod");
  const isPrincipal = role?.includes("principal");
  const isAdmin =
    role?.includes("tapcell") ||
    role?.includes("ceo") ||
    role?.includes("admin");
  const [years, setYears] = useState<string[]>([]);
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!token || isTokenExpired()) return;
      onOpen("loader");
      // console.log(Object.values(values).join(", "));
      const response = await axiosInstance.post(
        "/internships/download-internships",
        values,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
          responseType: "arraybuffer",
        }
      );
      const url = window.URL.createObjectURL(
        new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = Object.values(values).join("_") + "_details.xlsx";
      a.target = "_blank";
      a.click();
      onClose();
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
          <CardTitle>Download Internship</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="md:h-fit h-fit w-full bg-white rounded-2xl">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 p-4"
            >
              <div
                className=" w-full gap-5 grid items-start  "
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                }}
              >
                {isAdmin && (
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
                )}
                {(isAdmin || isPrincipal || isHOD || isInternCoordinator) && (
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
                                <SelectValue placeholder="Select Batch" />
                              </SelectTrigger>
                            </FormControl>

                            <SelectContent>
                              <SelectGroup>
                                {years.map((year, index) => (
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
                )}
                {(isAdmin || isPrincipal) && (
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
                )}
                {(!isMentor || isInternCoordinator) && (
                  <FormField
                    name={"section"}
                    disabled={isLoading}
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section</FormLabel>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  name={"sem"}
                  disabled={isLoading}
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
                              <SelectItem value="I">I</SelectItem>
                              <SelectItem value="II">II</SelectItem>
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
              </div>
              <div className="flex flex-col space-y-1.5 pt-2">
                <Button type="submit" disabled={isLoading} variant="primary">
                  Download
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

export default DownloadInternshipComponent;
