export function UnderConstruction({ title }: { title: string }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="max-w-sm text-muted-foreground">
        Раздел в разработке. Он появится в одном из следующих обновлений.
      </p>
    </main>
  )
}
