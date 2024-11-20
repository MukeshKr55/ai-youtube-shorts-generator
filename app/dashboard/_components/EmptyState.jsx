import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

function EmptyState() {
  return (
    <div className="p-5 py-24 mt-10 flex items-center flex-col border-2 border-dashed gap-2">
      <h2 className="">You don't have any short video created</h2>
      <Link href={"/dashboard/create-new"}>
        <Button>Create New Short Video</Button>
      </Link>
    </div>
  );
}

export default EmptyState;
