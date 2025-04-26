"use client";

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { useSession } from "@/providers/context/SessionContext";
import PasswordInput from "./PasswordInput";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { useTheme } from "@/providers/theme-provider";
import { useEffect, useState } from "react";
import { useModal } from "@/hooks/use-model-store";

const formSchema = z.object({
  email: z.string().min(1, { message: "Email is required" }),
  password: z.string().min(1, { message: "Password is required" }),
  sec_sit: z.string(),
});

const FacultyLogin = () => {
  const router = useNavigate();
  const { setTheme } = useTheme();
  const { onOpen, onClose } = useModal();
  const { setSession } = useSession(); 

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      sec_sit: "sec",
    },
  });
  const isLoading = form.formState.isSubmitting;
  const [college, setCollege] = useState("@sairam.edu.in");

  useEffect(() => {
    if (form.getValues("email") && form.getValues("email").length >= 0)
      form.setValue("email", form.getValues("email").toLowerCase());
  }, [form.watch("email")]);

  useEffect(() => {
    console.log(form.getValues("sec_sit"));
    if (form.getValues("sec_sit")?.length > 0) {
      if (form.getValues("sec_sit") == "sec") {
        setCollege("@sairam.edu.in");
      }
      if (form.getValues("sec_sit") == "sit") {
        setCollege("@sairamit.edu.in");
      }
    }
  }, [form.watch("sec_sit")]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      onOpen("loader");
      const response = await axiosInstance.post("/staffs/login", {
        email: values.email + college,
        password: values.password,
      });
      setSession(
        response.data.data.token,
        response.data.data.roles.toString(),
        "faculty"
      );
      setTheme("faculty");
      form.reset();
      onClose();
      router("/dashboard");
    } catch (error: any) {
      const errorMessage = await error.response.data;

      toast(
        <>
          <AlertCircle /> {errorMessage.message}
        </>
      );
    } finally {
      onClose();
    }
  };

  return (
    <Card className=" shadow-2xl bg-white/80 rounded-2xl">
      <CardHeader>
        <CardTitle>Faculty Log In</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <div className="grid w-full items-center gap-6 ">
              <FormField
                control={form.control}
                name="sec_sit"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>College</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="sec" />
                          </FormControl>
                          <FormLabel className="">
                            Sri Sairam Engineering College
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="sit" />
                          </FormControl>
                          <FormLabel className="">
                            Sairam Institute Of Technology
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isLoading}
                name={"email"}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <span className="flex items-center gap-5">
                        <Input
                          className=" bg-slate-300 shadow-inner"
                          disabled={isLoading}
                          placeholder="Email"
                          type="text"
                          {...field}
                        />
                        {college}
                      </span>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                disabled={isLoading}
                name={"password"}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        className=" bg-slate-300 shadow-inner"
                        disabled={isLoading}
                        placeholder="Enter Password"
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
                Log In
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex text-center w-full">
        <div className="flex flex-col items-center w-full justify-center gap-3">
          Forgot password?{" "}
          <Link to={"/forgetpass?faculty=1"}>
            <Button variant="primary" className="p-2">
              Click here
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default FacultyLogin;
