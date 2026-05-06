import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  const nextLanguageLabel = language === "en" ? "አማ" : "EN";

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="gap-1.5 px-2 text-xs font-semibold"
      onClick={toggleLanguage}
      aria-label={language === "en" ? "Switch to Amharic" : "Switch to English"}
      title={language === "en" ? "Switch to Amharic" : "Switch to English"}
      data-no-translate
    >
      <Languages className="h-4 w-4" />
      <span>{nextLanguageLabel}</span>
    </Button>
  );
}
