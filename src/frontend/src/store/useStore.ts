import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CompareListStore,
  SavedPropertiesStore,
  SearchFiltersStore,
  SearchFormValues,
} from "../types";

const MAX_COMPARE = 4;

export const useCompareStore = create<CompareListStore>()(
  persist(
    (set, get) => ({
      ids: [],
      add: (id) => {
        const current = get().ids;
        if (current.length >= MAX_COMPARE) return;
        if (current.some((i) => i === id)) return;
        set({ ids: [...current, id] });
      },
      remove: (id) => set({ ids: get().ids.filter((i) => i !== id) }),
      clear: () => set({ ids: [] }),
    }),
    { name: "nestfind-compare" },
  ),
);

export const useSavedStore = create<SavedPropertiesStore>()(
  persist(
    (set, get) => ({
      ids: [],
      add: (id) => {
        if (!get().ids.some((i) => i === id)) {
          set({ ids: [...get().ids, id] });
        }
      },
      remove: (id) => set({ ids: get().ids.filter((i) => i !== id) }),
      toggle: (id) => {
        const ids = get().ids;
        if (ids.some((i) => i === id)) {
          set({ ids: ids.filter((i) => i !== id) });
        } else {
          set({ ids: [...ids, id] });
        }
      },
      has: (id) => get().ids.some((i) => i === id),
    }),
    { name: "nestfind-saved" },
  ),
);

const defaultFilters: SearchFormValues = {
  keyword: "",
  city: "",
  propertyType: "",
  minPrice: "",
  maxPrice: "",
  minBedrooms: "",
  minBathrooms: "",
};

export const useSearchStore = create<SearchFiltersStore>()((set) => ({
  ...defaultFilters,
  setFilters: (filters) => set((state) => ({ ...state, ...filters })),
  reset: () => set(defaultFilters),
}));
