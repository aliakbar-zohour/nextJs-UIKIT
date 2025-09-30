// components/Sidebar/CreateStep2.tsx
"use client";
import { useState } from "react";
import { UserType } from "@/app/types/types";
import UserFilter from "@/components/Calendar/UserFilter";

interface Step2Props {
  users: UserType[];
  newUser: UserType | null;
  setNewUser: (user: UserType) => void;
  newDesc: string;
  setNewDesc: (desc: string) => void;
  onPrev: () => void;
  onSave: () => void;
}

export default function CreateStep2({
  users,
  newUser,
  setNewUser,
  newDesc,
  setNewDesc,
  onPrev,
  onSave,
}: Step2Props) {
  const [searchUser, setSearchUser] = useState("");

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 text-gray-700">
        مرحله ۲: انتخاب کاربر
      </h2>
      <UserFilter
        users={users}
        onSelect={(u) => {
          setNewUser(u);
          setSearchUser(u.name);
        }}
      />
      <label className="block mb-2 text-sm text-gray-600">توضیحات</label>
      <textarea
        value={newDesc}
        onChange={(e) => setNewDesc(e.target.value)}
        className="border p-2 rounded-xl w-full mb-4"
      />
      <div className="flex justify-between mt-4">
        <button
          onClick={onPrev}
          className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300"
        >
          قبلی
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600"
        >
          ذخیره
        </button>
      </div>
    </div>
  );
}
