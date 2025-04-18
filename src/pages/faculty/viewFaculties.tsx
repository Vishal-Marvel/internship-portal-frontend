import { facultyColumns } from "@/components/data-table-cols/staff-columns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useModal } from "@/hooks/use-model-store";
import { useSocket } from "@/hooks/use-socket";
import axiosInstance from "@/lib/axios";
import { useSession } from "@/providers/context/SessionContext";
import { Staff } from "@/schema";
import { VisibilityState } from "@tanstack/react-table";
import { AlertCircle, CirclePlus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
function isMobileView() {
  if (window) {
    // Get the width of the viewport
    const width =
      window.innerWidth ||
      document.documentElement.clientWidth ||
      document.body.clientWidth;
    if (width >= 1024) {
      return 2;
    } else if (width >= 768 && width < 1024) {
      return 1;
    } else if (width < 768) {
      return 0;
    }
  }
}
const ViewFaculties = () => {
  const { token, role } = useSession();
  const [width, setWidth] = useState(isMobileView());
  const { type, onSocketClose } = useSocket();
  const { onOpen, onClose } = useModal();
  useEffect(() => {
    const handleResize = () => {
      setWidth(isMobileView());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const visibleColumns: VisibilityState = {
    sec_sit: width > 0 && role?.includes("ceo"),
    department:
      width > 0 && (role?.includes("principal") || role?.includes("ceo")),
  };
  const [faculty, setFaculty] = useState<Staff[]>([]);
  const getStaff = async () => {
    try {
      onOpen("loader");
      const response = await axiosInstance.get(
        "/staffs/viewMultipleStaff/all",
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );
      setFaculty(response.data.data.staffs);
      onSocketClose();
      onClose();
    } catch (error) {
      onClose();
      if (error.response.data.message != "")
        toast(
          <>
            <AlertCircle />
            {error.response.data.message}
          </>
        );
    }
  };
  useEffect(() => {
    if (!type || type == "staff") getStaff();
  }, [type]);
  const navigate = useNavigate();
  const handleRowClick = (row: Staff) => {
    if (row.roles.includes("mentor")) navigate("/mentees/" + row.id);
  };
  return (
    <div className="relative flex  justify-center items-center">
      <Link to={"/faculty/signin"} className="absolute top-3 right-3">
        <Button variant="primary" className="p-2">
          <CirclePlus className="h-5 w-5 mr-2" /> Add Faculty
        </Button>
      </Link>
      <DataTable
        title="Faculties"
        tableType="faculty"
        data={faculty}
        columns={facultyColumns}
        visibleColumns={visibleColumns}
        onRowClick={handleRowClick}
      />
    </div>
  );
};

export default ViewFaculties;
