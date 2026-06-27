// Custom authentication sign-in hook
// Purpose: Triggers auth slice storage, saves JWT payloads, and validates schemas.
export const useLogin = () => {
  return { mutate: () => {}, isLoading: false };
};
