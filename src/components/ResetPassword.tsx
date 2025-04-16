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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AlertCircle, CheckCircle, ConstructionIcon } from "lucide-react";
import { useSession } from "@/providers/context/SessionContext";
import { useEffect, useState } from "react";
import PasswordInput from "./PasswordInput";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { useTheme } from "@/providers/theme-provider";

const formSchema = z.object({
  OPassword: z.string().min(1, { message: "Old Password is required" }),
  NPassword: z.string().min(1, { message: "New Password is required" }),
  CNPassword: z
    .string()
    .min(1, { message: "Confirm New Password is required" }),
});

const ResetPassword = () => {
  const router = useNavigate();
  const { token, role } = useSession();
  const isStudent = role?.includes("student");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      OPassword: "",
      NPassword: "",
      CNPassword: "",
    },
  });
  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (values.CNPassword != values.NPassword) {
        form.setError("CNPassword", { message: "Passwords didn't match" });
        return;
      }
      await axiosInstance.post(
        `/${isStudent ? "students" : "staffs"}/change-password`,
        { oldPassword: values.OPassword, newPassword: values.NPassword },
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      toast(
        <>
          <CheckCircle /> Password Resetted Successfully
        </>
      );
      form.reset();

      router("/dashboard");
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
    <Card className=" shadow-2xl bg-white/80 rounded-2xl lg:w-[30%] md:w-[45vw] min-w-[40vw]">
      <CardHeader>
        <CardTitle>Reset Password</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid w-full items-center gap-10 ">
              <FormField
                disabled={isLoading}
                name={"OPassword"}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
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
                disabled={isLoading}
                name={"NPassword"}
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
                disabled={isLoading}
                name={"CNPassword"}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
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
            </div>
            <div className="flex flex-col space-y-1.5 pt-2">
              <Button type="submit" disabled={isLoading} variant="primary">
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ResetPassword;
