import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";

function CustomLoading({ loading }) {
  return (
    <AlertDialog open={loading}>
      <AlertDialogContent className="bg-white">
        <div className="flex flex-col items-center justify-center space-y-6 my-10">
          <div className="relative">
            <Image
              src="/progress.gif"
              alt="Loading animation"
              width={200}
              height={200}
              className="animate-spin-slow"
            />
          </div>
          <AlertDialogTitle className="text-center text-2xl font-semibold text-gray-800">
            Generating your video...
          </AlertDialogTitle>
          <p className="text-md text-gray-600 text-center px-6">
            Processing your video may takes 3-5 mins. <br />
            Feel free to refresh or close the page – your video will be
            available in your dashboard once it is ready.
          </p>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default CustomLoading;
