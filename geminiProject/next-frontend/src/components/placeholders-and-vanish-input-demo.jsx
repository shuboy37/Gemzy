"use client";

import React from "react";

import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";

export default function PlaceholdersAndVanishInputDemo({
  className = "",
  onChange = () => {},
  value = "",
  onSubmit = () => {},
  disabled = false,
}) {
  const placeholders = [
    "What's the first rule of Fight Club?",
    "Who is Tyler Durden?",
    "Where is Andrew Laeddis hiding?",
    "Write a JavaScript method to reverse a string",
    "How to assemble your own PC?",
  ];
  return (
    <div className={`${className} w-full max-w-xl`}>
      <PlaceholdersAndVanishInput
        placeholders={placeholders}
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
        disabled={disabled}
      />
    </div>
  );
}
