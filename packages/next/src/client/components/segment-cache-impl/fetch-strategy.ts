import { InvariantError } from '../../../shared/lib/invariant-error'
import { PrefetchKind } from '../router-reducer/router-reducer-types'

export const enum FetchStrategy {
  PPR,
  Full,
  LoadingBoundary,
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
