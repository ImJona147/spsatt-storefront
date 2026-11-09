export default function ProductLoading(): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      className="container mx-auto animate-pulse px-4 py-6 motion-reduce:animate-none sm:px-6 sm:py-8 lg:px-8 lg:pb-12"
    >
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-12">
        <div className="mx-auto flex w-full flex-col-reverse gap-3 lg:mx-0 lg:flex-row">
          <div className="flex gap-2 lg:flex-col">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className="size-14 shrink-0 rounded-lg bg-muted sm:size-16"
              />
            ))}
          </div>
          <div className="mx-auto aspect-square w-[min(82%,32rem)] rounded-xl bg-muted/70 lg:mx-0 lg:w-[min(calc(100%-5.5rem),32rem)]" />
        </div>
        <div className="space-y-5">
          <div className="h-4 w-32 rounded-sm bg-muted" />
          <div className="h-10 w-4/5 rounded-sm bg-muted" />
          <div className="h-9 w-36 rounded-sm bg-muted" />
          <div className="h-5 w-28 rounded-sm bg-muted" />
          <div className="mt-6 space-y-3 rounded-lg border border-border bg-secondary/40 p-5">
            <div className="h-4 w-20 rounded-sm bg-muted" />
            <div className="h-12 w-full rounded-lg bg-muted" />
          </div>
          <div className="space-y-3 border-t border-border pt-6">
            <div className="h-5 w-28 rounded-sm bg-muted" />
            <div className="h-4 w-full rounded-sm bg-muted" />
            <div className="h-4 w-5/6 rounded-sm bg-muted" />
            <div className="h-4 w-2/3 rounded-sm bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
