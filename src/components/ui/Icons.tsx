/**
 * Shared outline icons — 24×24 viewBox, currentColor.
 * Use className for size/color (e.g. "h-4 w-4").
 */

import type { ReactNode } from "react";

type IconProps = {
  className?: string;
  title?: string;
};

function base(
  paths: ReactNode,
  { className = "", title }: IconProps,
  strokeWidth = 1.75,
) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      {paths}
    </svg>
  );
}

export function IconHome(p: IconProps) {
  return base(
    <>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6.5 9.5V20h11V9.5" />
    </>,
    p,
  );
}

export function IconQuestions(p: IconProps) {
  return base(
    <>
      <path d="M8 6h11a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-4 3v-3H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3" />
      <path d="M9.5 11.5h7M9.5 14.5h5" />
    </>,
    p,
  );
}

export function IconAnswers(p: IconProps) {
  return base(
    <>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M8 9h8M8 12h5" />
    </>,
    p,
  );
}

export function IconAsk(p: IconProps) {
  return base(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </>,
    p,
  );
}

export function IconSearch(p: IconProps) {
  return base(
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16.5 16.5 3.5 3.5" />
    </>,
    p,
  );
}

export function IconMenu(p: IconProps) {
  return base(<path d="M4 7h16M4 12h16M4 17h10" />, p);
}

export function IconClose(p: IconProps) {
  return base(<path d="M6 6l12 12M18 6 6 18" />, p);
}

export function IconUser(p: IconProps) {
  return base(
    <>
      <circle cx="12" cy="9" r="3.25" />
      <path d="M5.5 19.5c1.5-3 4-4.5 6.5-4.5s5 1.5 6.5 4.5" />
    </>,
    p,
  );
}

export function IconSignIn(p: IconProps) {
  return base(
    <>
      <path d="M10 7H6.5A2.5 2.5 0 0 0 4 9.5v5A2.5 2.5 0 0 0 6.5 17H10" />
      <path d="M14 12H8m6 0-2.5-2.5M14 12l-2.5 2.5" />
    </>,
    p,
  );
}

export function IconSignOut(p: IconProps) {
  return base(
    <>
      <path d="M14 7h3.5A2.5 2.5 0 0 1 20 9.5v5a2.5 2.5 0 0 1-2.5 2.5H14" />
      <path d="M10 12h6m-6 0 2.5-2.5M10 12l2.5 2.5" />
    </>,
    p,
  );
}

export function IconComments(p: IconProps) {
  return base(
    <>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      <path d="M8 12h.01M12 12h.01M16 12h.01" />
    </>,
    p,
  );
}

export function IconReply(p: IconProps) {
  return base(
    <>
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H12" />
    </>,
    p,
  );
}

export function IconEdit(p: IconProps) {
  return base(
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </>,
    p,
  );
}

export function IconTrash(p: IconProps) {
  return base(
    <>
      <path d="M4 7h16" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M7 7l1 12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-12" />
    </>,
    p,
  );
}

export function IconCheck(p: IconProps) {
  return base(<path d="m5 12 5 5L20 7" />, p, 2);
}

export function IconCheckCircle(p: IconProps) {
  return base(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16 9" />
    </>,
    p,
  );
}

export function IconFlame(p: IconProps) {
  return base(
    <path d="M12 3c2 3 1 5 1 5s3-1 4 2c1.5 3.5-1 8-5 8s-6.5-4.5-5-8c1-3 3-4 5-7z" />,
    p,
  );
}

export function IconClock(p: IconProps) {
  return base(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>,
    p,
  );
}

export function IconRoom(p: IconProps) {
  return base(
    <>
      <path d="M4 20V8l8-4 8 4v12" />
      <path d="M9 20v-6h6v6" />
    </>,
    p,
  );
}

export function IconArrowLeft(p: IconProps) {
  return base(
    <>
      <path d="M19 12H5" />
      <path d="m11 6-6 6 6 6" />
    </>,
    p,
  );
}

export function IconArrowRight(p: IconProps) {
  return base(
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>,
    p,
  );
}

export function IconChevronRight(p: IconProps) {
  return base(<path d="m9 6 6 6-6 6" />, p, 2.25);
}

export function IconChevronUp(p: IconProps) {
  return base(<path d="m6 14 6-6 6 6" />, p, 2.25);
}

export function IconChevronDown(p: IconProps) {
  return base(<path d="m6 10 6 6 6-6" />, p, 2.25);
}

export function IconSave(p: IconProps) {
  return base(
    <>
      <path d="M5 5h11l3 3v11H5V5z" />
      <path d="M8 5v5h7V5M8 19v-6h8v6" />
    </>,
    p,
  );
}

export function IconSend(p: IconProps) {
  return base(<path d="m4 12 16-7-7 16-2-7-7-2z" />, p);
}

export function IconLayers(p: IconProps) {
  return base(
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 16 9 5 9-5" />
    </>,
    p,
  );
}

export function IconBell(p: IconProps) {
  return base(
    <>
      <path d="M6 9a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </>,
    p,
  );
}
