export default function NovelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64 py-4">
        {children}
      </div>
    </>
  )
}