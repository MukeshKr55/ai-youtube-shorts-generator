import { SignIn } from "@clerk/nextjs";
import Image from "next/image";

export default function Page() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 h-screen gap-2">
      <div className="">
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
  );
}
