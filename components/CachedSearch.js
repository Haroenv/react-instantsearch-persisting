import React, { useRef } from 'react';
import Link from 'next/link';
import {
  SearchBox,
  Configure,
  Highlight,
  InstantSearch,
} from 'react-instantsearch-dom';
import { InfiniteHitsWithCache } from './InfiniteHitsWithCache';

function Hit({ hit }) {
  const hitRef = useRef(null);

  const detailURL = `/product/${hit.objectID}`;

  return (
    <Link href="/product/[pid]" as={detailURL}>
      <a ref={hitRef} className="hit-item">
        {/* no alt tag available here, so removed */}
        {/* fixed height is needed, to allow browser to restore scroll position */}
        <img src={hit.image} alt="" />
        <p>
          <Highlight attribute="name" hit={hit} />
        </p>
      </a>
    </Link>
  );
}

const infiniteHitCache = {
  read() {
    try {
      return JSON.parse(localStorage.getItem('ais-infinite-hits')) || [];
    } catch (e) {
      return [];
    }
  },
  write(hits) {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.setItem('ais-infinite-hits', JSON.stringify(hits));
  },
};

export function CachedSearch(props) {
  return (
    <InstantSearch
      searchClient={props.searchClient}
      resultsState={props.resultsState}
      onSearchStateChange={props.onSearchStateChange}
      searchState={props.searchState}
      createURL={props.createURL}
      indexName={props.indexName}
      {...props}
    >
      <Configure hitsPerPage={12} />
      <header>
        <Link href="/">
          <a>back</a>
        </Link>
        <h1>Fetching Infinite Hits before displaying</h1>
        <SearchBox />
      </header>

      <InfiniteHitsWithCache hitComponent={Hit} cache={infiniteHitCache} />

      <footer>
        <div>
          See{' '}
          <a href="https://github.com/Haroenv/react-instantsearch-persisting/blob/master/components/CachedSearch.js">
            source code
          </a>{' '}
          on github
        </div>
      </footer>
    </InstantSearch>
  );
}
