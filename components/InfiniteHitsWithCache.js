import React from 'react';
import { createConnector } from 'react-instantsearch-dom';
import deepEqual from 'fast-deep-equal';
import {
  getResults,
  refineValue,
  getCurrentRefinement,
} from './util/indexUtils';

function addAbsolutePositions(hits, hitsPerPage, page) {
  return hits.map((hit, index) => ({
    ...hit,
    __position: hitsPerPage * page + index + 1,
  }));
}

function addQueryID(hits, queryID) {
  if (!queryID) {
    return hits;
  }
  return hits.map(hit => ({
    ...hit,
    __queryID: queryID,
  }));
}

// mostly the same as the real connectInfiniteHits
const connectInfiniteHits = createConnector({
  displayName: 'InfiniteHitsWithCache',
  getProvidedProps(props, searchState, searchResults) {
    const results = getResults(searchResults, props);

    this._allResults = this._allResults || [];
    this._prevState = this._prevState || {};

    if (!results) {
      return {
        hits: [],
        hasPrevious: false,
        hasMore: false,
        refine: () => {},
        refinePrevious: () => {},
        refineNext: () => {},
      };
    }

    const {
      page,
      hits: rawHits = [],
      hitsPerPage,
      nbPages,
      _state: { page: p, ...currentState } = {},
    } = results;

    const hits = addQueryID(
      addAbsolutePositions(rawHits, hitsPerPage, page),
      results.queryID
    );

    // Differing from connector here, read from cache on initial load
    const cachedHits = props.cache && props.cache.read();
    const hasCached = cachedHits.length > 0;

    if (this._firstReceivedPage === undefined) {
      // Differing from connector here, read only happens on initial load,
      // not always when _allResults gets invalidated
      this._allResults = hasCached ? cachedHits : [...hits];
      // if the hits were cached, we show _from_ page 0, since you can not start
      // caching from a non-0 page.
      this._firstReceivedPage = hasCached ? 0 : page;
      // the last page requested gets calculated based on how many cached items
      // were returned
      this._lastReceivedPage = Math.ceil(
        this._allResults.length / results.hitsPerPage
      );
    } else if (!deepEqual(currentState, this._prevState)) {
      this._allResults = [...hits];
      this._firstReceivedPage = page;
      this._lastReceivedPage = page;
    } else if (this._lastReceivedPage < page) {
      this._allResults = [...this._allResults, ...hits];
      this._lastReceivedPage = page;
    } else if (this._firstReceivedPage > page) {
      this._allResults = [...hits, ...this._allResults];
      this._firstReceivedPage = page;
    }

    // Differing from connector here, write to cache on every change
    if (props.cache) {
      props.cache.write(this._allResults);
    }

    this._prevState = currentState;

    const hasPrevious = this._firstReceivedPage > 0;
    const lastPageIndex = nbPages - 1;
    const hasMore = page < lastPageIndex;
    const refinePrevious = event =>
      this.refine(event, this._firstReceivedPage - 1);
    const refineNext = event => this.refine(event, this._lastReceivedPage + 1);

    return {
      hits: this._allResults,
      hasPrevious,
      hasMore,
      refinePrevious,
      refineNext,
    };
  },

  getSearchParameters(searchParameters, props, searchState) {
    return searchParameters.setQueryParameters({
      page: getCurrentRefinement(props, searchState) - 1,
    });
  },

  refine(props, searchState, event, index) {
    if (index === undefined && this._lastReceivedPage !== undefined) {
      index = this._lastReceivedPage + 1;
    } else if (index === undefined) {
      index = getCurrentRefinement(props, searchState);
    }

    const id = 'page';
    const nextValue = { [id]: index + 1 };
    const resetPage = false;
    return refineValue(searchState, nextValue, props, resetPage);
  },
});

// copied from react-instantsearch-dom/components/infinite-hits

const cx = (...parts) =>
  parts
    .filter(element => element || element === '')
    .map(part => `ais-InfiniteHits${part ? `-${part}` : ''}`)
    .join(' ');

export const InfiniteHitsWithCache = connectInfiniteHits(
  ({ hitComponent: HitComponent, hits, hasMore, refineNext, className }) => {
    return (
      <div className={[cx(''), className].join(' ')}>
        <ul className={cx('list')}>
          {hits.map(hit => (
            <li key={hit.objectID} className={cx('item')}>
              <HitComponent hit={hit} />
            </li>
          ))}
        </ul>
        <button
          className={cx('loadMore', !hasMore && 'loadMore--disabled')}
          onClick={() => refineNext()}
          disabled={!hasMore}
        >
          Load more
        </button>
      </div>
    );
  }
);
