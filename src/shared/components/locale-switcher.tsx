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

	const baseButtonClass = "px-3 py-1 rounded-md text-sm";
	const activeButtonClass = "bg-[#486284] text-white";
	const inactiveButtonClass = "bg-white text-[#486284] border";

	return (
		<div className="flex items-center gap-2">
			<button
				type="button"
				onClick={() => switchTo("ru")}
				className={`${baseButtonClass} ${isRu ? activeButtonClass : inactiveButtonClass}`}
				aria-pressed={isRu}
			>
				RU
			</button>
			<button
				type="button"
				onClick={() => switchTo("kk")}
				className={`${baseButtonClass} ${isKk ? activeButtonClass : inactiveButtonClass}`}
				aria-pressed={isKk}
			>
				KZ
			</button>
			<button
				type="button"
				onClick={() => switchTo("en")}
				className={`${baseButtonClass} ${isEn ? activeButtonClass : inactiveButtonClass}`}
				aria-pressed={isEn}
			>
				EN
			</button>
		</div>
	);
};
