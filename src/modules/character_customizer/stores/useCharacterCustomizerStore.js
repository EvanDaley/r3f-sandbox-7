import { create } from "zustand";
import { customizationOptions } from "../config/customizationOptions";

const initialSelection = {
  baseModel: customizationOptions.baseModel[0].id,
  headwear: customizationOptions.headwear[0].id,
  hairStyle: customizationOptions.hairStyle[0].id,
};

const useCharacterCustomizerStore = create((set) => ({
  selection: initialSelection,
  setSelection: (category, optionId) =>
    set((state) => ({
      selection: {
        ...state.selection,
        [category]: optionId,
      },
    })),
  resetSelection: () => set({ selection: initialSelection }),
}));

export default useCharacterCustomizerStore;
