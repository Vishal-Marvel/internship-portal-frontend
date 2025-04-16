import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axiosInstance from "@/lib/axios";
import { Staff } from "@/schema";
import { AlertCircle, AlertTriangle, CircleAlert } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/providers/context/SessionContext";
import { useSocket } from "@/hooks/use-socket";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  staff: string;
  loading: boolean;
}

const ChangeMentee = ({ staff, loading }: Props) => {
  const { token } = useSession();
  const { onChange } = useSocket();
  const { type, onSocketClose } = useSocket();
  const [faculty, setFaculty] = useState<Staff[]>([]);
  const [fromMentor, setFromMentor] = useState(staff);
  const [toMentor, setToMentor] = useState("");
  useEffect(() => {
    setFromMentor(staff);
  }, [staff]);
  const handleFromMentorChange = (e) => {
    if (toMentor == e) {
      setToMentor("");
    }
    setFromMentor(e);
  };
  const handleToMentorChange = (e) => {
    setToMentor(e);
  };
  useEffect(() => {
    onChange("fromMentor", { fromMentor });
    setTimeout(() => onChange("toMentor", { toMentor }), 100);
    setTimeout(() => onSocketClose(), 100);
  }, [fromMentor, toMentor]);
  const getStaff = async () => {
    try {
      const response = await axiosInstance.get(
        "/staffs/viewMultipleStaff/mentor",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
      setFaculty(response.data.data.staffs);
    } catch (error) {
      toast(
        <>
          <AlertCircle />
          {error.response.data.message}
        </>
      );
    }
  };
  useEffect(() => {
    if (!type) getStaff();
  }, [type]);
  return (
    <Card className="bg-transparent">
      <CardContent className="w-full flex gap-10 p-5 md:flex-row flex-col justify-evenly">
        <div className="flex flex-col gap-3">
          <span className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
            From Mentor
          </span>
          <Select
            value={fromMentor}
            onValueChange={handleFromMentorChange}
            disabled={loading}
          >
            <SelectTrigger className="md:w-[30vw] w-full bg-slate-300 shadow-inner">
              <SelectValue placeholder="Select Staff" />
            </SelectTrigger>
            <SelectContent>
              {faculty?.map((faculty, index) => (
                <SelectItem key={faculty.id} value={faculty.id}>
                  {faculty.name} -{" "}
                  <span className="text-sm">({faculty.email})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-3">
          <span className="uppercase text-xs font-bold text-zinc-500 dark:text-secondary/70">
            To Mentor
          </span>
          <Select
            value={toMentor}
            onValueChange={handleToMentorChange}
            disabled={loading}
          >
            <SelectTrigger className="md:w-[30vw] w-full bg-slate-300 shadow-inner">
              <SelectValue placeholder="Select Staff" />
            </SelectTrigger>
            <SelectContent>
              {faculty?.map((faculty, index) => {
                if (fromMentor != faculty.id)
                  return (
                    <SelectItem key={faculty.id} value={faculty.id}>
                      {faculty.name} -{" "}
                      <span className="text-sm">({faculty.email})</span>
                    </SelectItem>
                  );
              })}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChangeMentee;
