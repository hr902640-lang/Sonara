export function StatusPill({ children, ok = false }: { children: React.ReactNode; ok?: boolean }) { return <span className={ok ? "statusPill ok" : "statusPill"}>{children}</span>; }
