"use client";

import { usePersistedState } from "../lib/local-store";
import {
  listsSeed,
  prospectsSeed,
  scoringDefault,
  sequencesSeed,
  type Prospect,
  type ProspectList,
  type ScoringConfig,
  type Sequence,
} from "./seed";

export function useProspects() {
  return usePersistedState<Prospect[]>("humyn.reach.prospects.v1", prospectsSeed);
}

export function useCustomLists() {
  return usePersistedState<ProspectList[]>("humyn.reach.lists.v1", []);
}

export function useSequences() {
  return usePersistedState<Sequence[]>("humyn.reach.sequences.v1", sequencesSeed);
}

export function useScoring() {
  return usePersistedState<ScoringConfig>("humyn.reach.scoring.v1", scoringDefault);
}

export function useAllLists(): ProspectList[] {
  const [custom] = useCustomLists();
  return [...listsSeed, ...custom];
}
