import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Internship, approvalStatuses, internshipStatuses } from "@/schema";
import { DataTableColumnHeader } from "../ui/data-table/data-column-header";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { useSession } from "@/providers/context/SessionContext";
import { useModal } from "@/hooks/use-model-store";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const internshipColumns: ColumnDef<Internship>[] = [
  {
    accessorKey: "student.student_id",
    id: "student_id",
    header: "Student Id",
    cell: ({ row }) => {
      const internship = row.original;
      return (
        <div className="text-center font-medium">
          <Link
            className="hover:underline"
            to={"/profile/student/" + internship.student.id}
          >
            {row.getValue("student_id")}
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "student.batch",
    id: "batch",
    header: "batch",
    cell: ({ row }) => (
      <div className="text-center font-medium">{row.getValue("batch")}</div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "student.section",
    id: "section",
    header: "section",
    cell: ({ row }) => (
      <div className="text-center font-medium">{row.getValue("section")}</div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "student.department",
    id: "department",
    header: "department",
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {row.getValue("department")}
      </div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "sem",
    header: "Sem",
    cell: ({ row }) => (
      <div className="text-center font-medium">{row.getValue("sem")}</div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "company_name",
    header: ({ column }) => {
      return <div className="text-center">Company Name</div>;
    },
    cell: ({ row }) => {
      const internship = row.original;
      return (
        <div className="text-center font-medium">
          <Link
            className="hover:underline"
            to={"/internship/" + internship.id}
          >
            {row.getValue("company_name")}
          </Link>
        </div>
      );
    }
     
  },
  {
    accessorKey: "starting_date",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Starting Date" />;
    },
    cell: ({ row }) => (
      <div className="text-center font-medium ">
        {new Date(row.getValue("starting_date")).toLocaleDateString("en-GB")}
      </div>
    ),
  },
  {
    accessorKey: "ending_date",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Ending Date" />;
    },
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {new Date(row.getValue("ending_date")).toLocaleDateString("en-GB")}
      </div>
    ),
  },
  {
    accessorKey: "mode_of_intern",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Mode" />;
    },
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {
          //@ts-ignore
          row.getValue("mode_of_intern")?.charAt(0).toUpperCase() +
            //@ts-ignore
            row.getValue("mode_of_intern")?.slice(1)
        }
      </div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "no_of_days",
    id: "days",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="No Of Days" />;
    },
    cell: ({ row }) => {
      return (
        <div className="items-center justify-center text-center">
          <span>{row.getValue("days")}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "approval_status",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Approval Status" />;
    },
    cell: ({ row }) => {
      const status = approvalStatuses.find(
        (status) => status.value === row.getValue("approval_status")
      );

      if (!status) {
        return null;
      }

      return (
        <div className="items-center flex">
          {status.icon && <status.icon className="mr-2 h-4 w-4 " />}
          <span>{status.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "internship_status",
    header: ({ column }) => {
      return (
        <DataTableColumnHeader column={column} title="Completion Status" />
      );
    },
    cell: ({ row }) => {
      const status = internshipStatuses.find(
        (status) => status.value === row.getValue("internship_status")
      );

      if (!status) {
        return null;
      }

      return (
        <div className="items-center flex">
          {status.icon && <status.icon className="mr-2 h-4 w-4 " />}
          <span>{status.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  // {
  //   id: "actions",
  //   cell: ({ row }) => {
  //     const internship = row.original;
  //     const { role } = useSession();
  //     const { onOpen } = useModal();
  //     const navigate = useNavigate();
  //     return (
  //       <DropdownMenu>
  //         <DropdownMenuTrigger asChild>
  //           <Button variant="ghost" className="h-8 w-8 p-0">
  //             <span className="sr-only">Open menu</span>
  //             <MoreHorizontal className="h-4 w-4" />
  //           </Button>
  //         </DropdownMenuTrigger>
  //         <DropdownMenuContent align="end">
  //           <DropdownMenuLabel>Actions</DropdownMenuLabel>

  //           <DropdownMenuItem
  //             className="cursor-pointer"
  //             onClick={() => {
  //               navigate("/internship/" + internship.id);
  //             }}
  //           >
  //             View Internship
  //           </DropdownMenuItem>
  //           {role?.includes("student") &&
  //             internship.approval_status == "Approved" &&
  //             !internship.certificate && (
  //               <DropdownMenuItem
  //                 className="cursor-pointer"
  //                 onClick={() => {
  //                   onOpen("completeInternship", { internship });
  //                 }}
  //               >
  //                 Upload Certificate
  //               </DropdownMenuItem>
  //             )}
  //         </DropdownMenuContent>
  //       </DropdownMenu>
  //     );
  //   },
  // },
];
