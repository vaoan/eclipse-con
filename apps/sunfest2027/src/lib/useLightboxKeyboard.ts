import { useEffect } from "react";

/** Parameters for {@link useLightboxKeyboard}. */
interface LightboxKeyboardParams {
  readonly open: boolean;
  /** The dialog element, used for focus and the Tab focus-trap. */
  readonly dialogRef: { readonly current: HTMLElement | null };
  readonly onClose: () => void;
  /** Step the carousel by a delta (−1 previous, +1 next). */
  readonly onStep: (delta: number) => void;
}

/**
 * While open, locks body scroll, focuses the dialog, and wires Escape (close),
 * arrow keys (step) and Tab (focus-trap over the dialog's buttons). Restores
 * the previously focused element on close.
 */
export function useLightboxKeyboard({
  open,
  dialogRef,
  onClose,
  onStep,
}: LightboxKeyboardParams): void {
  useEffect(() => {
    if (!open) {
      return;
    }
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowLeft") {
        onStep(-1);
      } else if (event.key === "ArrowRight") {
        onStep(1);
      } else if (event.key === "Tab") {
        const focusable =
          dialogRef.current?.querySelectorAll<HTMLElement>("button");
        if (!focusable || focusable.length === 0) {
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) {
          return;
        }
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previouslyFocused?.focus();
    };
  }, [open, dialogRef, onClose, onStep]);
}
