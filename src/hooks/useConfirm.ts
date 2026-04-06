import { useConfirmStore } from "@/store/confirmStore";

export function useConfirm() {
  const confirm = useConfirmStore((state) => state.confirm);
  return { confirm };
}
