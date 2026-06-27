import { createFormHook } from "@tanstack/react-form";
import { AppFormHookContexts } from "./context";

export const AppFormHook = createFormHook({
  fieldContext: AppFormHookContexts.fieldContext,
  formContext: AppFormHookContexts.formContext,
  fieldComponents: {},
  formComponents: {},
});
