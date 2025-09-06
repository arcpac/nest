import React from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MainNavBar = () => {
  return (
    <header className="px-6 md:px-16 py-4 border-b border-gray-200 sticky top-0 z-50 bg-white">
      <div className="container mx-auto text-neutral-500 flex justify-between items-center">
        <h1 className="text-xl font-bold">Split Nest</h1>

        <nav className="hidden md:flex space-x-4 md:space-x-10">
          <Link href="/">Home</Link>
          <Link href="/households">Households</Link>
          <Link href="/profile">Profile</Link>
        </nav>

        <div className="flex items-center space-x-4">
          <div className="flex flex-col text-right">
            <div className="font-medium">Username</div>
            <div className="text-sm text-gray-400">email@example.com</div>
          </div>

          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default MainNavBar;
