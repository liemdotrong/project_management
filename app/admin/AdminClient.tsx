"use client";

import UserClient from "./UserClient";

export default function AdminClient({ initialUsers }: { initialUsers: any[] }) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 overflow-y-auto">
        <UserClient users={initialUsers} />
      </div>
    </div>
  );
}
