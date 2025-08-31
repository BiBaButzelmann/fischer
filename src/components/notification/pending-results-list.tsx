type Props = {
  participantId?: number;
  items: React.ReactNode[];
};

export function PendingResultsList({ items }: Props) {
  return (
    <>
      <div className="px-4 py-3 border-b border-gray-200 dark:border-card-border">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Ausstehende Ergebnismeldungen
        </h3>
      </div>
      {items}
    </>
  );
}
