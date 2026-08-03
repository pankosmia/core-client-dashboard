import { doI18n } from "pankosmia-lib/i18n";

// Generic extractor: walks clientInterfaces -> endpoints -> a given field,
// and maps each item to a row. `getItems` controls how items are pulled
// out of the endpoint (handles the special subMenu/flavor case), and
// `mapItem` controls how each item becomes the final shape.
function extractClientInterfaceItems(clientInterfaces, { getItems, mapItem }) {
  if (!clientInterfaces) return [];

  return Object.entries(clientInterfaces).flatMap(
    ([category, categoryValue]) => {
      const endpoints = categoryValue?.endpoints ?? {};

      return Object.entries(endpoints).flatMap(
        ([endpointKey, endpointValue]) => {
          const items = getItems(endpointValue) ?? [];
          if (!Array.isArray(items)) return [];

          return items.flatMap((item) =>
            mapItem({ item, category, endpointKey, endpointValue }),
          );
        },
      );
    },
  );
}

export function allInterfaces(clientInterfaces, i18nRef, chooseRepo) {
  // eliaspinero: Stopped using this function, so I commented it for now
  /* const withReturnParam = (category, url) =>
    `/clients/${category}#${url.replace("%%REPO_PATH%%", chooseRepo)}?returnTypePage=dashboard`;
 */
  return {
    aboutRepoInterface: extractClientInterfaceItems(clientInterfaces, {
      getItems: (endpointValue) => endpointValue?.about_repo,
      mapItem: ({ item, category, endpointKey }) => {
        const separator = item.url.includes("?") ? "&" : "?";
        return {
          category: endpointKey,
          label: doI18n(item.label, i18nRef.current),
          url: `/clients/${category}#${item.url}${separator}returnTypePage=dashboard` /* url: withReturnParam(category, item.url), */,
        };
      },
    }),

    versionManagerInterface: extractClientInterfaceItems(clientInterfaces, {
      getItems: (endpointValue) => endpointValue?.manager,
      mapItem: ({ item, category }) => ({
        category,
        label: doI18n(item.label, i18nRef.current),
        url: `/clients/${category}#${item.url}`,
      }),
    }),

    tC4ProjectInterface: extractClientInterfaceItems(clientInterfaces, {
      getItems: (endpointValue) => endpointValue?.initDocument,
      mapItem: ({ item, category }) => ({
        category,
        label: doI18n(item.label, i18nRef.current),
        url: `/clients/${category}/#${item.url}`,
      }),
    }),

    importTc4Interface: extractClientInterfaceItems(clientInterfaces, {
      getItems: (endpointValue) => endpointValue?.importContent,
      mapItem: ({ item, category }) => ({
        category,
        label: doI18n(item.label, i18nRef.current),
        url: `/clients/${category}/#${item.url}`,
      }),
    }),

    itemExportInterface: extractClientInterfaceItems(clientInterfaces, {
      getItems: (endpointValue) => {
        const exportsArray = endpointValue?.export;
        if (!Array.isArray(exportsArray)) return [];

        return exportsArray.flatMap((doc) => {
          const flavorItems = doc?.subMenu?.[0];
          if (!flavorItems) return [];

          return Object.entries(flavorItems).flatMap(([flavorKey, items]) =>
            items.map((item) => ({ ...item, flavorKey })),
          );
        });
      },
      mapItem: ({ item, category, endpointKey }) => {
        const separator = item.url.includes("?") ? "&" : "?";
        return {
          category: endpointKey,
          endpoint: endpointKey,
          key: item.flavorKey,
          label: doI18n(item.label, i18nRef.current),
          url: `/clients/${category}#${item.url}${separator}returnTypePage=dashboard`,
        };
      },
    }),
  };
}
