import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "@/providers/context/SessionContext";
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
const MobileToggle = () => {
  const { pathname } = useLocation();
  const { role } = useSession();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      if (isMobileView() == 2) {
        setOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger>
        <Menu className="h-6 w-6 lg:hidden flex" />
      </SheetTrigger>
      <SheetContent side="top" className="bg-slate-200">
        <SheetHeader>
          <SheetTitle asChild>
            <Link
              to={"/dashboard"}
              className="grid place-content-center"
              onClick={() => setOpen(false)}
            >
              <img
                src="/logo.png"
                className="h-16 aspect-auto place-self-center"
              />
            </Link>
          </SheetTitle>
        </SheetHeader>
        <div className="flex p-3 flex-col">
          {role?.includes("student") && (
            <Link
              onClick={() => setOpen(false)}
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
                  onClick={() => setOpen(false)}
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
                    onClick={() => setOpen(false)}
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
                    onClick={() => setOpen(false)}
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
                  onClick={() => setOpen(false)}
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
      </SheetContent>
    </Sheet>
  );
};

export default MobileToggle;
