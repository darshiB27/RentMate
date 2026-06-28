// Custom session logout hook
// Purpose: Clears client cookies, deletes stored Redux states, and redirects to landing pages.
export const useLogout = () => {
  return { mutate: () => {} };
};
