import { Skeleton } from "@/components/ui/skeleton";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="flex space-x-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
      <Skeleton className="h-4 w-[300px]" />
    </div>
  );
}
