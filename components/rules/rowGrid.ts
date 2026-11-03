/**
 * One grid definition shared by the column headings and every rule row, so the
 * set reads as a well-set index rather than a stack of cards.
 *
 * Below lg the row is two lines: the sentence, then its readings.
 * From lg the readings become columns. From xl the kind gets a column too.
 */
export const ROW_GRID = [
  "grid items-baseline gap-x-3",
  "grid-cols-[minmax(0,1fr)_auto]",
  "lg:grid-cols-[minmax(0,1fr)_3.25rem_3.25rem_3.25rem_6rem_5.75rem]",
  "xl:grid-cols-[minmax(0,1fr)_6rem_3.25rem_3.25rem_3.25rem_6rem_5.75rem]",
].join(" ");

export const CELL = {
  text: "col-start-1 row-start-1 min-w-0",
  kind: "hidden xl:block xl:col-start-2 xl:row-start-1",
  applied: "hidden lg:block lg:col-start-2 lg:row-start-1 xl:col-start-3",
  kept: "hidden lg:block lg:col-start-3 lg:row-start-1 xl:col-start-4",
  reverted: "hidden lg:block lg:col-start-4 lg:row-start-1 xl:col-start-5",
  health: "hidden lg:flex lg:col-start-5 lg:row-start-1 xl:col-start-6",
  actions: "col-start-2 row-start-1 lg:col-start-6 xl:col-start-7",
  meta: "col-span-2 col-start-1 row-start-2 lg:hidden",
} as const;
