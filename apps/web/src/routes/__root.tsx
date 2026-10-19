import {
  HeadContent,
  useRouterState,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { TanstackQueryProvider } from "@/providers/tanstack-query";
import { ThemeProvider } from "@/providers/theme-provider";
import { getRootSession } from "@/features/user/lib/get-root-session";
import { VisitorTracker } from "@/features/visitors/visitor-tracker";
import { SessionProvider } from "@/providers/session-provider";
import type { ClientSessionResult } from "@auth/client";

export interface RouterAppContext {
  session?: ClientSessionResult;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    links: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "SkyCanvas Studio — Small tools. More possibility.",
      },
      {
        name: "description",
        content:
          "Thoughtful software for everyday work. Explore DiskVacuum, Job Agent, and the growing toolbox from SkyCanvas Studio.",
      },
      { name: "theme-color", content: "#141b17" },
    ],
  }),
  loader: async ({ location }) => {
    if (location.pathname === "/" || location.pathname.startsWith("/products/"))
      return { session: null };
    const session = await getRootSession();
    return { session: session ?? null };
  },
  staleTime: 30_000,
  gcTime: 5 * 60_000,

  component: RootDocument,
});

function RootDocument() {
  const { session } = Route.useLoaderData();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isMarketing = pathname === "/" || pathname.startsWith("/products/");
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {isMarketing ? (
            <Outlet />
          ) : (
            <SessionProvider initialSession={session}>
              <TanstackQueryProvider>
                <Outlet />
              </TanstackQueryProvider>
            </SessionProvider>
          )}
          {!isMarketing && <VisitorTracker />}
          <Toaster richColors position="top-center" />
          {/* {isDevelopment && <TanStackRouterDevtools position="bottom-left" />} */}
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
