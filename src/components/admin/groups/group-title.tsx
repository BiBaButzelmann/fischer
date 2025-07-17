"use client";

import { updateGroupName } from "@/actions/group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pen } from "lucide-react";
import { ChangeEventHandler, useState, useTransition } from "react";

type Props = {
  groupId: number;
  groupName: string;
};

export function GroupTitle({ groupId, groupName: initialGroupName }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [groupName, setGroupName] = useState(initialGroupName);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setGroupName(e.target.value);
  };

  const handleUpdate = () => {
    startTransition(async () => {
      await updateGroupName(groupId, groupName);
    });
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
      <Button
        disabled={isPending}
        size="icon"
        variant="ghost"
        onClick={handleEditClick}
      >
        <Pen className="h-4 w-4" />
      </Button>
    </div>
  );
}
