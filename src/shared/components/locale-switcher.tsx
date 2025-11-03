"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "../configs/i18/navigation";

export const LocaleSwitcher = () => {
	const router = useRouter();
	const currentLocale = useLocale();
	const pathname = usePathname();
	const isRu = currentLocale === "ru";
	const isKk = currentLocale === "kk";
	const isEn = currentLocale === "en";

	const switchTo = (locale: "ru" | "kk" | "en") => {
		// usePathname from next-intl returns the pathname without the locale prefix.
		// Use the locale-aware router to switch locales while preserving the pathname.
		router.replace(pathname || "/", { locale });
	};

	return (
		<div className="flex items-center gap-2">
			<button
				type="button"
				onClick={() => switchTo("ru")}
				className={`px-3 py-1 rounded-md text-sm ${isRu ? "bg-[#486284] text-white" : "bg-white text-[#486284] border"}`}
				aria-pressed={isRu}
			>
				RU
			</button>
			<button
				type="button"
				onClick={() => switchTo("kk")}
				className={`px-3 py-1 rounded-md text-sm ${isKk ? "bg-[#486284] text-white" : "bg-white text-[#486284] border"}`}
				aria-pressed={isKk}
			>
				KZ
			</button>
			<button
				type="button"
				onClick={() => switchTo("en")}
				className={`px-3 py-1 rounded-md text-sm ${isEn ? "bg-[#486284] text-white" : "bg-white text-[#486284] border"}`}
				aria-pressed={isEn}
			>
				EN
			</button>
		</div>
	);
};
