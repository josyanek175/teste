import { Outlet, Link, createRootRoute, HeadContent, Scripts, useLocation } from "@tanstack/react-router";
import { AppSidebar } from "@/components/AppSidebar";
import { NumberProvider } from "@/hooks/use-active-number";

import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "NexaBoot — Gestão de Atendimento WhatsApp" },
      { name: "description", content: "Plataforma profissional de atendimento via WhatsApp" },
      { property: "og:title", content: "NexaBoot — Gestão de Atendimento WhatsApp" },
      { name: "twitter:title", content: "NexaBoot — Gestão de Atendimento WhatsApp" },
      { property: "og:description", content: "Plataforma profissional de atendimento via WhatsApp" },
      { name: "twitter:description", content: "Plataforma profissional de atendimento via WhatsApp" },
      { name: "twitter:card", content: "summary" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AuthenticatedLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Login page doesn't need sidebar
  if (location.pathname === "/login") {
    return <Outlet />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  return (
    <NumberProvider>
      <div className="flex h-screen overflow-hidden">
        <AppSidebar />
        <main className="flex flex-1 flex-col overflow-hidden">
          <Outlet />
        </main>
      </div>
    </NumberProvider>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <AuthenticatedLayout />
      <Toaster />
    </AuthProvider>
  );
}
