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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AlertCircle, ConstructionIcon } from "lucide-react";
import { useSession } from "@/providers/context/SessionContext";
import { useEffect, useState } from "react";
import PasswordInput from "./PasswordInput";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { useTheme } from "@/providers/theme-provider";
import { useModal } from "@/hooks/use-model-store";

const formSchema = z.object({
  email: z.string().min(1, { message: "Email is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

const StudentLogin = () => {
  const router = useNavigate();
  const { setTheme } = useTheme();
  const { onOpen, onClose } = useModal();

  const { setSession } = useSession();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    if (form.getValues("email") && form.getValues("email").length >= 0)
      form.setValue("email", form.getValues("email").toLowerCase());
  }, [form.watch("email")]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      onOpen("loader");
      const response = await axiosInstance.post(
        "/students/login",
        { email: values.email + "@sairamtap.edu.in", password: values.password }
      );
      setSession(
        response.data.data.token,
        response.data.data.roles,
        response.data.data.clg
      );
      setTheme(response.data.data.clg);
      form.reset();
      onClose();
      router("/dashboard");
    } catch (error: any) {
      onClose();
      const errorMessage = await error.response.data;

      toast(
        <>
          <AlertCircle /> {errorMessage.message}
        </>
      );
    }
  };

  return (
    <Card className=" shadow-2xl bg-white/80 rounded-2xl">
      <CardHeader>
        <CardTitle>Student Log In</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid w-full items-center gap-10 ">
              <FormField
                disabled={isLoading}
                name={"email"}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Id</FormLabel>
                    <FormControl>
                      <span className="flex items-center gap-5">
                        <Input
                          className=" bg-slate-300 shadow-inner"
                          disabled={isLoading}
                          placeholder="Username"
                          type="text"
                          {...field}
                        />
                        @sairamtap.edu.in
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
      <CardFooter className="flex text-center ">
        <div className="flex flex-col items-center w-full justify-center gap-3">
          Haven't Signed up yet?{" "}
          <Link to={"/student/signin"}>
            <Button variant="primary" className="p-2">
              Sign in
            </Button>
          </Link>
        </div>
        <div className="flex flex-col items-center w-full justify-center gap-3">
          Forgot password?{" "}
          <Link to={"/forgetpass?student=1"}>
            <Button variant="primary" className="p-2">
              Click here
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default StudentLogin;
