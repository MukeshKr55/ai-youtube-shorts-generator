import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { MoveRight, Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const userButtonAppearance = {
    elements: {
      userButtonAvatarBox: "w-10 h-10",
      userButtonPopoverCard: "bg-blue-500",
      userButtonPopoverActionButton: "text-blue-600",
    },
  };

  return (
    <>
      {/* Header */}
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
          <UserButton appearance={userButtonAppearance} />
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-white via-purple-100 to-gray-100 min-h-screen">
        <div className="text-center px-8 pt-16">
          <h2 className="font-bold text-4xl lg:text-6xl text-gray-800">
            Build Your Short Video <span className="text-primary">With AI</span>
          </h2>
          <p className="text-lg lg:text-2xl mt-4 text-gray-600">
            Effortlessly Build AI-Generated Short Videos in Minutes
          </p>
          <div className="mt-8 flex justify-center items-center gap-4">
            <Link href={"/dashboard"}>
              <Button className="gap-2 lg:px-8 lg:py-6 lg:text-lg bg-primary text-white rounded-lg shadow-lg hover:shadow-xl transition">
                Get Started <MoveRight />
              </Button>
            </Link>
            <Button
              className="gap-2 lg:px-8 lg:py-6 lg:text-lg border-2 border-primary text-primary hover:bg-primary-light hover:text-black rounded-lg shadow-md"
              variant="outline"
            >
              <Video /> Watch Demo
            </Button>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-40 lg:mt-60 px-8 pb-20">
          <h2 className="text-center font-bold text-3xl md:text-4xl lg:text-6xl text-gray-800 mb-8 md:mb-12">
            How It Works?
          </h2>
          <div className="flex flex-wrap justify-center gap-y-12 md:gap-y-16 gap-x-6 md:gap-x-8 lg:gap-y-24">
            {[
              {
                step: "1",
                title: "Select Content Type",
                description:
                  "Choose the type of content for your short video, whether it's educational, promotional, or entertaining.",
              },
              {
                step: "2",
                title: "Select Style",
                description:
                  "Pick a style that fits your vision, from minimalistic to bold and dynamic designs.",
              },
              {
                step: "3",
                title: "Select Voice",
                description:
                  "Customize the voice for your short video with options like tone, language, and accent.",
              },
              {
                step: "4",
                title: "Select Duration",
                description:
                  "Set the duration of your video to match your preferred length, from quick bites to detailed narratives.",
              },
              {
                step: "5",
                title: "Generate",
                description:
                  "Let the AI handle the rest and generate your high-quality, ready-to-share short video effortlessly.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="text-center bg-white shadow-md hover:shadow-lg p-6 rounded-lg transition w-full max-w-xs md:max-w-sm"
              >
                <div className="w-16 h-16 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 bg-primary text-white text-2xl md:text-3xl font-bold flex items-center justify-center rounded-full">
                  {item.step}
                </div>
                <h3 className="font-bold text-lg md:text-2xl mb-2 md:mb-4 text-gray-800">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm md:text-lg">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
