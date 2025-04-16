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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AlertCircle, ArrowLeft, CheckCircle, ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import PasswordInput from "@/components/PasswordInput";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  email: z.string().min(1, { message: "Email is required" }),
  otp: z.string(),
  NPass: z.string(),
  ConfNPass: z.string(),
});

const FacultyForgotPassword = () => {
  const router = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      otp: "",
      NPass: "",
      ConfNPass: "",
    },
  });
  const isLoading = form.formState.isSubmitting;
  const [OTPShown, setOTPShown] = useState(false);
  const [time, setTime] = useState(20);

  useEffect(() => {
    const reduce = () => {
      if (OTPShown) {
        setTime((prev) => prev - 1);
      }
    };
    if (time > 0) {
      const timer = setInterval(
        reduce,

        1000
      );
      return () => clearInterval(timer);
    }
  }, [OTPShown, time]);

  useEffect(() => {
    if (form.getValues("email") && form.getValues("email").length >= 0)
      form.setValue("email", form.getValues("email").toLowerCase());
  }, [form.watch("email")]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!OTPShown) {
        await axiosInstance.post("/staffs/forgot-password", {
          email: values.email + "@sairam.edu.in",
        });
        setOTPShown(true);
      } else {
        if (!values.otp) {
          form.setError("otp", { message: "OTP is required" });
        }
        if (!values.NPass) {
          form.setError("NPass", { message: "Password is required" });
        }
        if (!values.ConfNPass) {
          form.setError("ConfNPass", {
            message: "Confirm Password is required",
          });
        }
        if (values.NPass != values.ConfNPass) {
          toast(
            <>
              <AlertCircle /> Passwords didn't match
            </>
          );

          return;
        }
        await axiosInstance.post("/staffs/set-forgot-password", {
          email: values.email + "@sairam.edu.in",
          otp: values.otp,
          newPassword: values.NPass,
        });
        form.reset();
        toast(
          <>
            <CheckCircle className="h-5 w-5 mr-2" /> Password Reset
            Successfully,
            <br />
            Login To Continue
          </>
        );
        router("/?faculty=1");
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
  return (
    <Card className="shadow-2xl bg-white/100 rounded-2xl w-full md:min-w-[30vw]">
      <CardHeader>
        <CardTitle className="flex gap-2 items-center">
          <ArrowLeft
            className="h-5 w-5 cursor-pointer hover:scale-110 transition-all duration-100 ease-in"
            onClick={() => router("/")}
          />
          Forget Password
        </CardTitle>
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <span className="flex items-center gap-5">
                        <Input
                          className=" bg-slate-300 shadow-inner"
                          disabled={isLoading}
                          placeholder="Faculty Id"
                          type="text"
                          {...field}
                        />
                        @sairam.edu.in
                      </span>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {OTPShown && (
                <>
                  <FormField
                    name={"otp"}
                    disabled={isLoading}
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>OTP</FormLabel>
                        <FormControl>
                          <div className="w-full flex justify-center">
                            <InputOTP
                              maxLength={6}
                              disabled={isLoading}
                              {...field}
                            >
                              <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                              </InputOTPGroup>
                              <InputOTPSeparator />
                              <InputOTPGroup>
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                              </InputOTPGroup>
                            </InputOTP>
                          </div>
                        </FormControl>
                        <FormMessage />
                        <FormDescription
                          className={cn(
                            time == 0
                              ? "text-blue-400 hover:underline cursor-pointer"
                              : "cursor-default"
                          )}
                        >
                          (Resend OTP
                          {time > 0 &&
                            `in ${Math.floor(time / 60)} : ${time % 60}`}
                          )
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  <FormField
                    name={"NPass"}
                    disabled={isLoading}
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <PasswordInput
                            className=" bg-slate-300 shadow-inner"
                            disabled={isLoading}
                            placeholder="*********"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name={"ConfNPass"}
                    disabled={isLoading}
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <PasswordInput
                            className=" bg-slate-300 shadow-inner"
                            disabled={isLoading}
                            placeholder="*********"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>
            <div className="flex flex-col space-y-1.5 pt-2">
              <Button type="submit" disabled={isLoading} variant="primary">
                {OTPShown ? "Submit" : "Send OTP"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default FacultyForgotPassword;
