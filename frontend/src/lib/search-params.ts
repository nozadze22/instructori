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
  city: parseAsString.withDefault(""),
  mode: parseAsStringEnum(["waypoints", "command"] as const).withDefault(
    "waypoints",
  ),
  action: parseAsStringEnum([
    "TURN_LEFT",
    "TURN_RIGHT",
    "STOP",
    "PARKING",
    "REVERSE",
    "U_TURN",
    "CUSTOM",
  ] as const).withDefault("TURN_RIGHT"),
};

/** Server Components: parse searchParams once per request */
export const searchParamsCache = createSearchParamsCache({
  q: searchParams.q,
  page: searchParams.page,
  perPage: searchParams.perPage,
  sort: searchParams.sort,
});
