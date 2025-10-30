"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function NavArrows() {
  const router = useRouter();
  const pathname = usePathname();

  //hide navigation arrows on specific pages
  const hideOn = new Set<string>(["/login"]);
  if (hideOn.has(pathname)) return null;

  return (
    <nav className="fixed top-6 right-6 flex gap-3 z-50">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-lg"
        aria-label="Go back"
      >
        &#8592;
      </button>

      {/* Next button */}
      <Link
        href="/patient_actions"
        className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-lg inline-flex items-center justify-center"
        aria-label="Go to Patient Action"
      >
        &#8594;
      </Link>
    </nav>
  );
}
