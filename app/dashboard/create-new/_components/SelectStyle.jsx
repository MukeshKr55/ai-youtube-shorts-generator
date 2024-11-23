"use client";

import Image from "next/image";
import React, { useState } from "react";

function SelectStyle({ onUserSelect }) {
  const STYLE_OPT = [
    { name: "Abstract", image: "/abstract.jpg" },
    { name: "Anime", image: "/anime.jpg" },
    { name: "Cartoon Mix", image: "/toon-mix.jpg" },
    { name: "Door Eye", image: "/door-eye.jpg" },
    { name: "Lego", image: "/lego.jpg" },
    { name: "Neon", image: "/neon.jpg" },
    { name: "Pencil Sketch", image: "/sketch.jpg" },
    { name: "Pixar 3D", image: "/pixar.png" },
    { name: "Realstic", image: "/real.jpeg" },
    { name: "Retro Pixel", image: "/pixel.jpg" },
  ];

  const [selectedOpt, setSelectedOpt] = useState();

  return (
    <div className="mt-7">
      <h2 className="font-bold text-2xl text-primary">Style</h2>
      <p className="text-gray-500">Select your video style </p>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 2xl:grid-cols-8 gap-6 mt-3">
        {STYLE_OPT.map((item, idx) => (
          <div
            onClick={() => {
              setSelectedOpt(item.name);
              onUserSelect("style", item.name);
            }}
            key={idx}
            className={`relative hover:scale-110 transition-all cursor-pointer ${
              selectedOpt === item.name
                ? "border-4 border-primary rounded-xl text-primary"
                : "text-white"
            }`}
          >
            <Image
              src={item.image}
              alt={item.name}
              width={300}
              height={300}
              className="h-48 w-full object-cover rounded-lg"
            />
            <h2 className="text-center absolute p-1 bg-black bottom-0 w-full  rounded-b-lg">
              {item.name}
            </h2>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SelectStyle;
