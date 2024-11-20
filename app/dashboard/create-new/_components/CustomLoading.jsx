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
        <div className="flex flex-col items-center justify-center my-10">
          <Image src="/progress.gif" alt="loading" width={200} height={200} />
          <AlertDialogTitle>
            Generating your video... Do not Refresh
          </AlertDialogTitle>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default CustomLoading;
