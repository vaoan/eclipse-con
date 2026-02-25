import { useCallback, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = useCallback(
    (sectionId: string, behavior: ScrollBehavior) => {
      const id = decodeURIComponent(sectionId.replace(/^#/, ""));
      if (!id) {
        return;
      }

      if (id === "hero") {
        window.scrollTo({ top: 0, behavior });
        return;
      }

      const target = document.getElementById(id);
      if (!target) {
        return;
      }

      const nav = document.querySelector<HTMLElement>(
        '[data-anchor-nav="true"]'
      );
      const navOffset = nav?.offsetHeight ?? 0;
      const top = target.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({
        top: Math.max(0, top - navOffset - 12),
        behavior,
      });
    },
    []
  );

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      const trigger =
        event.target instanceof Element
          ? event.target.closest<HTMLAnchorElement>('a[href^="#"]')
          : null;
      if (!trigger) {
        return;
      }

      const href = trigger.getAttribute("href");
      if (!href || href === "#") {
        return;
      }

      const id = decodeURIComponent(href.slice(1));
      const target = document.getElementById(id);
      if (!target) {
        return;
      }

      event.preventDefault();
      const nextSearch = new URLSearchParams(location.search);
      nextSearch.set("section", id);
      void navigate(
        {
          pathname: location.pathname,
          search: `?${nextSearch.toString()}`,
        },
        { replace: false }
      );
      scrollToSection(id, "smooth");
    };

    document.addEventListener("click", onDocumentClick);

    return () => {
      document.removeEventListener("click", onDocumentClick);
    };
  }, [location.pathname, location.search, navigate, scrollToSection]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get("section");
    if (!section) {
      return;
    }

    const target = document.getElementById(section);
    if (!target) {
      return;
    }

    window.requestAnimationFrame(() => {
      scrollToSection(section, "auto");
    });
  }, [location.search, scrollToSection]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        <Outlet />
      </main>
    </div>
  );
}
