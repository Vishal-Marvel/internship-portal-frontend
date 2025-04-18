import React from "react";
import UserButton from "./UserButton";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { publicRoutes } from "@/providers/Provider";
import { useSession } from "@/providers/context/SessionContext";
import MobileToggle from "./MobileToggle";

const Navbar = () => {
  const { pathname } = useLocation();
  const { role } = useSession();
  return (
    <div
      className={cn(
        publicRoutes.includes(pathname)
          ? "hidden"
          : "absolute top-0 md:top-3 md:left-1/2 md:-translate-x-1/2 md:w-3/4 w-full  md:rounded-3xl md:h-[7%] h-[8vh] bg-slate-300/25"
      )}
    >
      <div className=" h-full  relative flex w-full justify-center">
        <div className="flex items-center w-[92%] justify-between">
          <div className="flex gap-2">
            <MobileToggle />
            <Link
              to={"/dashboard"}
              className={cn(
                pathname == "/dashboard" && " text-black rounded-lg ",
                "flex items-center transition-all text-slate-300/80 duration-100 ease-in"
              )}
            >
              <img
                src="/logo.png"
                className="object-cover h-[40px] aspect-auto"
              />
            </Link>
            <div className="hidden lg:flex gap-2">
              {role?.includes("student") && (
                <Link
                  to={"/addInternship"}
                  className={cn(
                    pathname == "/addInternship" &&
                      "bg-slate-300/80 text-black rounded-lg ",
                    "flex items-center transition-all text-slate-300/80 duration-100 ease-in"
                  )}
                >
                  <Button className=" uppercase" variant="link">
                    Add Internship
                  </Button>
                </Link>
              )}
              {!role?.includes("student") && (
                <>
                  {(role?.includes("hod") ||
                    role?.includes("principal") ||
                    role?.includes("admin") ||
                    role?.includes("ceo")) && (
                    <Link
                      to={"/faculties"}
                      className={cn(
                        pathname == "/faculties" &&
                          "bg-slate-300/80 text-black rounded-lg ",
                        "flex items-center transition-all text-slate-300/80 duration-100 ease-in"
                      )}
                    >
                      <Button className=" uppercase" variant="link">
                        View Faculties
                      </Button>
                    </Link>
                  )}
                  {!role?.includes("admin") && (
                    <>
                      <Link
                        to={"/students"}
                        className={cn(
                          pathname == "/students" &&
                            "bg-slate-300/80 text-black rounded-lg ",
                          "flex items-center transition-all text-slate-300/80 duration-100 ease-in"
                        )}
                      >
                        <Button className=" uppercase" variant="link">
                          View Students
                        </Button>
                      </Link>
                      <Link
                        to={"/studentInternships"}
                        className={cn(
                          pathname == "/studentInternships" &&
                            "bg-slate-300/80 text-black rounded-lg ",
                          "flex items-center transition-all text-slate-300/80 duration-100 ease-in"
                        )}
                      >
                        <Button className=" uppercase" variant="link">
                          View Internships
                        </Button>
                      </Link>
                    </>
                  )}
                  {(role?.includes("hod") ||
                    role?.includes("principal") ||
                    role?.includes("tapcell") ||
                    role?.includes("admin") ||
                    role?.includes("ceo")) && (
                    <Link
                      to={"/skills"}
                      className={cn(
                        pathname == "/skills" &&
                          "bg-slate-300/80 text-black rounded-lg ",
                        "flex items-center transition-all text-slate-300/80 duration-100 ease-in"
                      )}
                    >
                      <Button className=" uppercase" variant="link">
                        Modify Skills
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
          <UserButton />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
