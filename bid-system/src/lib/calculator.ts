import { toPairs, reverse, sortBy, values, forEach } from "lodash";
import { Group, Rank, Stat } from "../types";

// Map of group -> value
export function get_ranks(statsMap: Record<Group, Stat>): Record<Group, Rank> {
  const pairs = toPairs(statsMap);
  const sortedByValue: [Group, number][] = reverse(sortBy(values(pairs), [(p) => p[1]]));

  const rankMap: Record<Group, Rank> = {};
  // start with 1
  let curRank = 1;
  let last: number | undefined = undefined;
  forEach(sortedByValue, (cur, idx) => {
    // Handle duplicates
    if (last == undefined || last !== cur[1]) {
      // Bump rank if not the same
      curRank = idx + 1;
    }
    rankMap[cur[0]] = curRank;
    last = cur[1];
  });
  return rankMap;
}
