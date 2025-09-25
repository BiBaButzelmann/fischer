type Props = {
  groupName: string;
};

export function GroupBadge({ groupName }: Props) {
  return (
    <div className="flex-shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center w-12 h-12 p-3">
      <span className="font-bold text-blue-600 dark:text-blue-400 text-xl">
        {groupName}
      </span>
    </div>
  );
}
