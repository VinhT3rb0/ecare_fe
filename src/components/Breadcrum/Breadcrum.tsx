"use client";

import Link from "next/link";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
    return (
        <nav className="text-sm text-white mb-2">
            {items.map((item, idx) => (
                <span key={idx}>
                    {item.href ? (
                        <Link href={item.href} className="hover:text-[#11A998] transition-colors">
                            {item.label}
                        </Link>
                    ) : (
                        <span
                            className={
                                idx === items.length - 1
                                    ? "text-white font-semibold"
                                    : "text-gray-600"
                            }
                        >
                            {item.label}
                        </span>
                    )}
                    {idx < items.length - 1 && <span className="mx-2 text-gray-400">{">"}</span>}
                </span>
            ))}
        </nav>
    );
}
