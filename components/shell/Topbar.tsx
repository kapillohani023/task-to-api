import { Breadcrumbs } from "./Breadcrumbs";
import { AccountMenu } from "./AccountMenu";
import { GeminiKeyStatus } from "./GeminiKeyStatus";
import { CommandTrigger } from "./CommandTrigger";

export function Topbar({
  hasKey,
  name,
  email,
  image,
}: {
  hasKey: boolean;
  name: string | null;
  email: string | null;
  image: string | null;
}) {
  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border bg-surface/95 backdrop-blur">
      <div className="flex h-full items-center gap-3 px-4 md:px-6">
        <div className="flex shrink-0 items-center gap-2">
          <span aria-hidden className="h-4 w-0.5 rounded-full bg-accent" />
          <span className="text-sm font-semibold tracking-[-0.01em] text-fg">T2A</span>
        </div>
        <span aria-hidden className="text-fg-subtle">
          /
        </span>
        <Breadcrumbs />
        <div className="ml-auto flex items-center gap-2">
          <CommandTrigger />
          <GeminiKeyStatus hasKey={hasKey} />
          <AccountMenu name={name} email={email} image={image} />
        </div>
      </div>
    </header>
  );
}
