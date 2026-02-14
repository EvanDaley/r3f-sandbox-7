import { useMemo } from "react";
import { customizationOptions } from "../config/customizationOptions";
import useCharacterCustomizerStore from "../stores/useCharacterCustomizerStore";

const findOption = (options, selectedId) =>
  options.find((option) => option.id === selectedId) ?? options[0];

export default function useCharacterCustomizerOptions() {
  const selection = useCharacterCustomizerStore((state) => state.selection);

  return useMemo(
    () => ({
      selection,
      selectedBaseModel: findOption(customizationOptions.baseModel, selection.baseModel),
      selectedHeadwear: findOption(customizationOptions.headwear, selection.headwear),
      selectedHairStyle: findOption(customizationOptions.hairStyle, selection.hairStyle),
    }),
    [selection]
  );
}
