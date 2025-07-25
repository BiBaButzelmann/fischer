"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pen } from "lucide-react";
import { ChangeEventHandler, useState } from "react";

type Props = {
  groupId: number;
  groupName: string;
  onChangeGroupName: (groupId: number, groupName: string) => void;
};

export function GroupTitle({
  groupId,
  groupName: initialGroupName,
  onChangeGroupName,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [groupName, setGroupName] = useState(initialGroupName);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setGroupName(e.target.value);
  };

  const handleUpdate = () => {
    onChangeGroupName(groupId, groupName);
    setIsEditing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleUpdate();
  };

  const handleBlur = () => {
    handleUpdate();
  };

  const handleEditClick = () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    handleUpdate();
  };

  return (
    <div className="flex items-center gap-2">
      {isEditing ? (
        <form onSubmit={handleSubmit} className="flex-1">
          <Input
            autoFocus
            className="flex-1"
            value={groupName}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </form>
      ) : (
        <span className="flex-1">{groupName}</span>
      )}
      <Button size="icon" variant="ghost" onClick={handleEditClick}>
        <Pen className="h-4 w-4" />
      </Button>
    </div>
  );
}
