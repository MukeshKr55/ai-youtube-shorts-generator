import { UserDetailContext } from "@/app/_context/UserDetailContext";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import { useContext } from "react";

function Header() {
  const { userDetail } = useContext(UserDetailContext);

  const userButtonAppearance = {
    elements: {
      userButtonAvatarBox: "w-10 h-10", // Custom width and height
      userButtonPopoverCard: "bg-blue-500", // Custom background for the popover card
      userButtonPopoverActionButton: "text-blue-600", // Custom text color for action buttons
    },
  };
  return (
    <div className="p-3 px-5 flex items-center justify-between shadow-md">
      <div className="flex gap-3 items-center">
        <Image src={"/logo.svg"} width={50} height={50} />
        <h2 className="hidden md:block font-bold text-2xl">
          AI Shorts Generator
        </h2>
      </div>
      <div className="flex gap-3 items-center">
        <div className="flex items-center gap-1">
          <Image
            src={"/coin.png"}
            width={26}
            height={26}
            alt="remaining_coin"
          />
          <h2 className="font-semibold text-xl">{userDetail?.credits}</h2>
        </div>
        <Button>Dashboard</Button>
        <UserButton appearance={userButtonAppearance} />
      </div>
    </div>
  );
}

export default Header;
