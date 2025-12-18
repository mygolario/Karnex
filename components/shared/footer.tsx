export function Footer() {
  return (
    <footer className="w-full border-t bg-background py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4 md:px-8 max-w-screen-2xl">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-right">
          © 2024 Karnex. تمامی حقوق محفوظ است.
        </p>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <a href="#" className="hover:underline hover:text-primary">قوانین و مقررات</a>
          <a href="#" className="hover:underline hover:text-primary">حریم خصوصی</a>
        </div>
      </div>
    </footer>
  );
}
