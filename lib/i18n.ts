import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ChainedBackend, { ChainedBackendOptions } from "i18next-chained-backend";
//mport HttpBackend from "i18next-http-backend";
import ResourcesToBackend from "i18next-resources-to-backend";
// due to us using react native which has no folder i18n can pull jsons diretly from, we have to manually import all jsons here
import en from "~/localization/en.json";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";

//object containing all localization jsons
export const langResources = {
  en,
};

i18n
  .use({
    type: "languageDetector",
    name: "languageDetector",
    async: true,
    detect: function (callback: (val: string) => void) {
      AsyncStorage.getItem('language').then((val: string | null) => {
        const detected = val || Localization.getLocales()[0].languageCode || "en";
        callback(detected);
      });
    },
    cacheUserLanguage: function (lng: string) {
      return lng;
    },
  })
  .use(ChainedBackend)
  .use(initReactI18next)
  .init<ChainedBackendOptions>({
    debug: true,
    fallbackLng: "en",
    load: "languageOnly",
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    react: {
      useSuspense: false,
    },
    saveMissing: true,
    missingKeyHandler: () => { },
    backend: {
      backends: [
        //HttpBackend,
        ResourcesToBackend(langResources)
      ],
      backendOptions: [/*{
        loadPath: "{{lng}}/{{ns}}",
        request: (options: object, url: string, payload: object, callback: ((err: Error | null, res: { status: number, data: any } | null) => object)) => {
          
        },
      },*/
      ],
    }
  });

export default i18n;
