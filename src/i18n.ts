import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation strings for the web app
const resources = {
  en: {
    translation: {
      nav: {
        ethiopianYouthLeague: "Ethiopian Youth League",
        aboutUs: "About Us",
        events: "Events",
        youthCompetitions: "Youth Competitions",
        media: "Media",
        tournaments: "Tournaments",
        fixtures: "Fixtures",
        news: "News",
        watchLive: "Watch Live",
        signIn: "Sign In",
        signOut: "Sign Out",
        dashboard: "Dashboard"
      },
      home: {
        upcomingMatches: "Upcoming Matches",
        matchResults: "Match Results",
        fullSchedule: "Full Schedule",
        viewAll: "View All",
      }
    }
  },
  am: {
    translation: {
      nav: {
        ethiopianYouthLeague: "የኢትዮጵያ ወጣቶች ሊግ",
        aboutUs: "ስለ እኛ",
        events: "ክስተቶች",
        youthCompetitions: "የወጣቶች ውድድሮች",
        media: "ሚዲያ",
        tournaments: "ውድድሮች",
        fixtures: "ጨዋታዎች",
        news: "ዜና",
        watchLive: "በቀጥታ ይመልከቱ",
        signIn: "ይግቡ",
        signOut: "ይውጡ",
        dashboard: "ዳሽቦርድ"
      },
      home: {
        upcomingMatches: "የሚቀጥሉት ጨዋታዎች",
        matchResults: "የጨዋታ ውጤቶች",
        fullSchedule: "ሙሉ ፕሮግራም",
        viewAll: "ሁሉንም ይመልከቱ",
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already safe from xss
    },
  });

export default i18n;
