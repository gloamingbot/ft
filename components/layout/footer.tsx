export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 text-xs text-muted-foreground font-mono">
            <p>
              © {new Date().getFullYear()} gloaming/bot. All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
            <span>Built with Predict</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
