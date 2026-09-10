"use client";
import Image from "next/image";
import Link from "next/link";
export default function MobileCorporateHeader(){return <header className="mobileCorporateHeader"><div className="mobileBrand"><Image src="/locagora-logo.png" alt="Locagora" width={128} height={44}/><span className="versionBadge">V9.0</span></div><div className="mobileHeaderLinks"><Link href="/historia">História</Link><Link href="/negocios">Portfólio</Link></div></header>}
