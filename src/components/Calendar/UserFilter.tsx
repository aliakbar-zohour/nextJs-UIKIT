import { useEffect, useState } from "react";
import { UserType } from "@/app/types/types";

interface UserFilterProps {
  users: UserType[];
  onSelect: (user: UserType) => void;
  hideList?: boolean;
  placeholder?: string;
}

export default function UserFilter({
  users,
  onSelect,
  hideList = false,
  placeholder = "جستجوی کاربر...",
}: UserFilterProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(true);

  useEffect(() => {
    setOpen(!hideList);
  }, [hideList]);

  const q = search.trim().toLowerCase();
  const results = q
    ? users.filter((u) => (u.name || "").toLowerCase().includes(q))
    : [];

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setOpen(true);
        }}
        placeholder={placeholder}
        className="px-3 py-2 border rounded-xl w-full"
      />
      {search && open && (
        <div className="absolute bg-white border rounded-xl mt-1 w-full max-h-48 overflow-y-auto shadow">
          {results.map((u) => (
            <div
              key={u.id}
              onClick={() => {
                onSelect(u);
                setSearch(u.name);
                setOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <img
                src={u.avatar}
                alt={u.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <span>{u.name}</span>
            </div>
          ))}
          {results.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">
              موردی یافت نشد
            </div>
          )}
        </div>
      )}
    </div>
  );
}
