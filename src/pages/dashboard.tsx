import { DashBoardChart } from "@/components/DashBoardChart";
import axiosInstance from "@/lib/axios";
import { cn } from "@/lib/utils";
import { useSession } from "@/providers/context/SessionContext";
import { Student } from "@/schema";
import { useEffect, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import ViewInternships from "@/pages/viewInternships";
import { useSocket } from "@/hooks/use-socket";

const Dashboard = () => {
  const { token, role, isTokenExpired } = useSession();

  if (role && role.includes("student")) {
    const [student, setStudent] = useState<Student>();
    const [visible, setVisible] = useState(true);
    const { type, onSocketClose } = useSocket();
    const getData = async () => {
      try {
        if (isTokenExpired()) return;
        if (!type || type == "internship") {
          const studentResponse = await axiosInstance.get(
            "/students/viewStudent",
            {
              headers: {
                Authorization: "Bearer " + token,
              },
            }
          );
          setStudent(studentResponse.data.data.student);
          onSocketClose();
        }
      } catch (error) {
        console.error(error.response.data.message || error);
      }
    };
    useEffect(() => {
      getData();
    }, [type]);
    useEffect(() => {
      if (student) {
        const timer = setTimeout(() => setVisible(false), 3000);
        return () => clearTimeout(timer);
      }
    }, [student]);

    return (
      <div className="flex justify-center items-center w-full gap-5">
        <div
          className={cn(
            !visible ? "hidden " : "lg:h-[70vh] md:w-[30vw] w-full",
            " text-center bg-white/80 p-4 rounded-lg m-2 transition-all duration-700 ease-in"
          )}
        >
          <span>Number of Days Completed</span>
          {student && student?.total_days_internship <= 45 ? (
            <DashBoardChart
              datas={[
                student?.total_days_internship,
                45 - Number(student?.total_days_internship),
              ]}
              labels={["Completed", "Remaining"]}
            />
          ) : (
            <DashBoardChart
              datas={[
                student?.total_days_internship,
                Number(student?.total_days_internship) - 45,
              ]}
              labels={["Completed", "Excess"]}
            />
          )}
        </div>
        <div
          className={cn(
            "gap-5 md:max-h-[85vh] w-full",
            !visible ? "flex items-center justify-center" : "hidden"
          )}
        >
          <div className="lg:block hidden">
            <ResizablePanelGroup
              direction="vertical"
              className={cn(
                "lg:min-h-[80vh]  rounded-lg lg:block hidden max-w-[270px]"
              )}
            >
              <ResizablePanel
                defaultSize={50}
                className="lg:min-w-[200px] lg:flex hidden justify-center"
              >
                <div
                  className={cn(
                    "h-[250px] w-[200px] text-center bg-white/80 p-4 rounded-lg m-2 transition-all duration-700 ease-in"
                  )}
                >
                  <span>Number of Days Completed</span>
                  {student && student?.total_days_internship <= 45 ? (
                    <DashBoardChart
                      datas={[
                        student?.total_days_internship,
                        45 - Number(student?.total_days_internship),
                      ]}
                      labels={["Completed", "Remaining"]}
                    />
                  ) : (
                    <DashBoardChart
                      datas={[
                        student?.total_days_internship,
                        Number(student?.total_days_internship) - 45,
                      ]}
                      labels={["Completed", "Excess"]}
                    />
                  )}
                </div>
              </ResizablePanel>
              <ResizableHandle
                withHandle
                className="lg:flex hidden bg-slate-700 w-fit"
              />
              <ResizablePanel defaultSize={50} className="lg:block hidden">
                <div
                  className={cn(
                    "h-[250px] w-[250px]  text-center bg-white/80 p-4 rounded-lg m-2 transition-all duration-700 ease-in"
                  )}
                >
                  <span>Notifications</span>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>

          <div className="h-full flex flex-1 flex-col items-center justify-center">
            <div
              className={cn(
                visible && "hidden",
                "transition-all duration-100 ease-in"
              )}
            >
              <ViewInternships />
            </div>
          </div>
        </div>
      </div>
    );
  } else {
  }
};

export default Dashboard;
