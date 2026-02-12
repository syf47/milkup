import { computed, ref } from "vue";
import { useTauriWindow } from "@/composables/useTauriWindow";
import useContent from "./useContent";

const { filePath, isModified } = useContent();
const { setTitle: tauriSetTitle } = useTauriWindow();

const title = ref("");

const fileName = computed(() => {
  const parts = filePath.value.split(/[\\/]/);
  return parts.at(-1) ?? "";
});

function updateTitle() {
  const name = fileName.value || "Untitled";
  const prefix = isModified.value ? "*" : "";
  tauriSetTitle(filePath.value || null);
  title.value = `${prefix}${name}`;
}

export default function useTitle() {
  return {
    title,
    updateTitle,
  };
}
