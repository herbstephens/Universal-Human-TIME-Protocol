/**
 * Purpose: Reusable Header component for Marriage DAO
 * Displays the logo in the top-left corner
 */

import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 p-6">
      <Link href="/" className="inline-block">
        <Image
          src="/Isotype.png"
          alt="Marriage DAO Logo"
          width={60}
          height={60}
          priority
          className="hover:opacity-80 transition-opacity"
        />
      </Link>
    </header>
  );
}

