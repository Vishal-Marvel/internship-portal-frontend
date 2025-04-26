import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTheme } from "@/providers/theme-provider";

import { Link } from "react-router-dom";

const ExpiredPage = () => {
  const {setTheme} = useTheme();
  const handleClick = () =>{
    setTheme("default")
  }
  return (
    <Card className=" shadow-2xl bg-white/80 rounded-2xl">
      <CardHeader>
        <CardTitle>Session Expired</CardTitle>
      </CardHeader>
      <CardContent>
        Your Session has expired. Please log in again to continue.
        <div className="flex justify-center items-center mt-4">
          <Link to="/" onClick={handleClick} className={buttonVariants({variant: "primary"})}>
            Go to Login
          </Link>
        </div>
      </CardContent>
      <CardFooter className="flex text-center w-full"></CardFooter>
    </Card>
  );
};

export default ExpiredPage;
