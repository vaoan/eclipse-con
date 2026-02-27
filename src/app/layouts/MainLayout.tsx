import { useCallback, useEffect, useRef } from "react";
import {
  Outlet,
  type Location,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useTranslation } from "react-i18next";

const getSectionFromLocation = (location: Location) => {
  const hashSection = location.hash ? location.hash.slice(1) : null;
  return hashSection ?? "";
};

const isSectionSyncNavigation = (location: Location) => {
  const state = location.state as { __sectionSync?: boolean } | null;
  return !!state?.__sectionSync;
};

const shouldSkipAutoScroll = (lastClickAt: number | null) => {
  return lastClickAt !== null && Date.now() - lastClickAt < 1200;
};

const scheduleScrollToSection = (
  section: string,
  scrollToSection: (sectionId: string, behavior: ScrollBehavior) => void
) => {
  let attempts = 0;
  const maxAttempts = 12;

  const applyScroll = () => {
    scrollToSection(section, "auto");
  };

  const tryScroll = () => {
    const target = document.getElementById(section);
    if (target) {
      applyScroll();
      return;
    }
    attempts += 1;
    if (attempts < maxAttempts) {
      window.setTimeout(tryScroll, 200);
    }
  };

  window.requestAnimationFrame(tryScroll);
  const onLoad = () => {
    applyScroll();
  };
  window.addEventListener("load", onLoad, { once: true });
  return () => {
    window.removeEventListener("load", onLoad);
  };
};

const useAnchorNavigation = (
  location: ReturnType<typeof useLocation>,
  navigate: ReturnType<typeof useNavigate>,
  setLastClick: (timestamp: number) => void,
  scrollToSection: (sectionId: string, behavior: ScrollBehavior) => void
) => {
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
      setLastClick(Date.now());
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
  }, [
    location.pathname,
    location.search,
    navigate,
    scrollToSection,
    setLastClick,
  ]);
};

const useHashNavigation = (
  location: ReturnType<typeof useLocation>,
  getLastClick: () => number | null,
  scrollToSection: (sectionId: string, behavior: ScrollBehavior) => void
) => {
  useEffect(() => {
    const section = getSectionFromLocation(location);
    if (
      !section ||
      shouldSkipAutoScroll(getLastClick()) ||
      isSectionSyncNavigation(location)
    ) {
      return;
    }

    const cleanup = scheduleScrollToSection(section, scrollToSection);
    return cleanup;
  }, [location, getLastClick, scrollToSection]);
};

const SkipToContentLink = ({ label }: { readonly label: string }) => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-6 focus:z-50 focus:rounded-full focus:border focus:border-accent/60 focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-foreground focus:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
  >
    {label}
  </a>
);

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const lastClickRef = useRef<number | null>(null);
  const { t } = useTranslation();

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

  const setLastClick = useCallback((timestamp: number) => {
    lastClickRef.current = timestamp;
  }, []);
  const getLastClick = useCallback(() => lastClickRef.current, []);

  useAnchorNavigation(location, navigate, setLastClick, scrollToSection);
  useHashNavigation(location, getLastClick, scrollToSection);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SkipToContentLink label={t("app.skipToContent")} />
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
