import { InvariantError } from '../../../shared/lib/invariant-error'
import { PrefetchKind } from '../router-reducer/router-reducer-types'

export const enum FetchStrategy {
  // Deliberately ordered so we can easily compare two segments
  // and determine if one segment is "more specific" than another
  // (i.e. if it contains more data and shouldn't be fetched/replaced)
  LoadingBoundary = 0,
  PPR = 1,
  PPRDynamic = 2,
  Full = 3,
}

export function isFetchStrategyLessSpecific(
  currentStrategy: FetchStrategy,
  newStrategy: FetchStrategy
): boolean {
  return currentStrategy < newStrategy
}

export function convertFetchStrategyToPrefetchKind(
  fetchStrategy: FetchStrategy
): PrefetchKind.AUTO | PrefetchKind.FULL {
  switch (fetchStrategy) {
    case FetchStrategy.LoadingBoundary:
    case FetchStrategy.PPR: {
      return PrefetchKind.AUTO
    }
    case FetchStrategy.Full: {
      return PrefetchKind.FULL
    }
    case FetchStrategy.PPRDynamic: {
      // This helper is only used if clientSegmentCache is not enabled.
      // It's not possible to use dynamic prefetches without it.
      throw new InvariantError(
        `FetchStrategy.PPRDynamic should never be used when experimental.clientSegmentCache is disabled`
      )
    }
    default: {
      fetchStrategy satisfies never
      throw new InvariantError(`Unexpected FetchStrategy: ${fetchStrategy}`)
    }
  }
}

export function convertPrefetchKindToFetchStrategy(
  prefetchKind: PrefetchKind.AUTO | PrefetchKind.FULL
) {
  switch (prefetchKind) {
    case PrefetchKind.AUTO: {
      // We default to PPR. We'll discover whether or not the route supports it with the initial prefetch.
      return FetchStrategy.PPR
    }
    case PrefetchKind.FULL: {
      return FetchStrategy.Full
    }

    default: {
      prefetchKind satisfies never
      throw new InvariantError(`Unexpected PrefetchKind: ${prefetchKind}`)
    }
  }
}
