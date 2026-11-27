"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { UserIcon } from "./icons";

// The profile icon in the header: the sign in page when nobody is signed in, the account page when
// someone is. It reads the plain "customer_session" cookie, so the header itself stays cached.
export default function AccountLink({ lang, label, className }) {
  const pathname = usePathname();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    setSignedIn(/(?:^|; )customer_session=1/.test(document.cookie));
  }, [pathname]);

  return (
    <Link href={`/${lang}/${signedIn ? "account" : "login"}`} aria-label={label} className={className}>
      <UserIcon />
    </Link>
  );
}
