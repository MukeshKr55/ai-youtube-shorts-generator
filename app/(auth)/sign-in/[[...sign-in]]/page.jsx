import { Button } from "@/components/ui/button";
import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
  return (
    <div className="bg-gradient-to-b from-white via-purple-100 to-gray-100 min-h-screen">
      <div className="p-3 px-5 flex items-center justify-between shadow-md bg-white">
        <div className="flex gap-3 items-center">
          <Image src={"/logo.svg"} width={50} height={50} alt="Logo" />
          <Link href={"/"}>
            <h2 className="hidden md:block font-bold text-2xl text-gray-800">
              AI Shorts Generator
            </h2>
          </Link>
        </div>
        <div className="flex gap-3 items-center">
          <Link href={"/dashboard"}>
            <Button className="bg-primary text-white hover:bg-primary-dark rounded-lg shadow-md">
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="lg:block hidden">
          <Image
            src={"/sign_image.jpg"}
            alt="sign-image"
            width={800}
            height={800}
            className="w-full object-cover h-full"
          />
        </div>
        <div className="flex justify-center items-center h-screen">
          <SignIn />
        </div>
      </div>
    </div>
  );
}
