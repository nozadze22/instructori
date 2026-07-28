import {
  createSearchParamsCache,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringEnum,
} from "nuqs/server";

/** Shared URL parsers — use with useQueryState / useQueryStates */
export const searchParams = {
  q: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: parseAsStringEnum(["asc", "desc"] as const).withDefault("desc"),
  modal: parseAsBoolean.withDefault(false),
};

/** Server Components: parse searchParams once per request */
export const searchParamsCache = createSearchParamsCache({
  q: searchParams.q,
  page: searchParams.page,
  perPage: searchParams.perPage,
  sort: searchParams.sort,
});
