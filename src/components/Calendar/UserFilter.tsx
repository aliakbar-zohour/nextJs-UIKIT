// components/UserFilter.tsx
import { useState } from "react";
import { UserType } from "@/app/types/types";

interface UserFilterProps {
  users: UserType[];
  onSelect: (user: UserType) => void;
}

export default function UserFilter({ users, onSelect }: UserFilterProps) {
  const [search, setSearch] = useState("");

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="جستجوی کاربر..."
        className="px-3 py-2 border rounded-xl w-full"
      />
      {search && (
        <div className="absolute bg-white border rounded-xl mt-1 w-full max-h-48 overflow-y-auto shadow">
          {users
            .filter((u) => u.name.toLowerCase().includes(search.toLowerCase()))
            .map((u) => (
              <div
                key={u.id}
                onClick={() => {
                  onSelect(u);
                  setSearch(u.name);
                }}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
              >
                <img src={u.avatar} className="w-12 h-12 rounded-full" />
                <span>{u.name}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
