import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export function ChangePhoneNumberSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-56 md:h-8 md:w-64" />{" "}
        <Skeleton className="h-5 w-full mt-1.5" />{" "}
      </CardHeader>
      <CardContent className="px-6">
        <Skeleton className="h-10 w-full" />
      </CardContent>
      <CardFooter className="items-center px-6 [.border-t]:pt-6 flex flex-col justify-between gap-4 rounded-b-xl md:flex-row !py-4 border-t bg-sidebar">
        <Skeleton className="h-4 w-full md:h-5 md:w-3/4" />{" "}
        <Skeleton className="h-10 w-24" />
      </CardFooter>
    </Card>
  );
}
