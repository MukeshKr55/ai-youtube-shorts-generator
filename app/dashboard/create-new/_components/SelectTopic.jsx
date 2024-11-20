"use client";

import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

function SelectTopic({ onUserSelect }) {
  const OPT = [
    "Custom Prompt",
    "Random AI Story",
    "Anime facts",
    "Scary Story",
    "Historical Facts",
    "Bed Time Story",
    "Motivational Quotes",
    "Fun Facts",
  ];

  const [selectedOpt, setSelectedOpt] = useState();

  return (
    <div className="">
      <h2 className="font-bold text-2xl text-primary">Content</h2>
      <p className="text-gray-500">What is the topic of your video?</p>

      <Select
        onValueChange={(value) => {
          setSelectedOpt(value),
            value !== "Custom Prompt" && onUserSelect("topic", value);
        }}
      >
        <SelectTrigger className="w-full mt-2 p-6 text-lg">
          <SelectValue placeholder="Select Content Type" />
        </SelectTrigger>
        <SelectContent>
          {OPT.map((item, idx) => (
            <SelectItem key={idx} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedOpt === "Custom Prompt" && (
        <Textarea
          onChange={(e) => onUserSelect("topic", e.target.value)}
          className="mt-3"
          placeholder="Write Prompt on which you want to generate video"
        />
      )}
    </div>
  );
}

export default SelectTopic;
