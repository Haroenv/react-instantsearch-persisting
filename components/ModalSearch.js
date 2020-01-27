import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from '@reach/dialog';
import VisuallyHidden from '@reach/visually-hidden';
import {
  SearchBox,
  InfiniteHits,
  Configure,
  Highlight,
  InstantSearch,
} from 'react-instantsearch-dom';
import Router from 'next/router';

function HitComponent({ hit }) {
  const hitRef = useRef(null);
  const [showingDetail, setShowingDetail] = useState(false);

  const detailURL = `/product/${hit.objectID}`;

  useEffect(() => {
    Router.beforePopState(() => {
      setShowingDetail(!showingDetail);

      return false;
    });
  }, [showingDetail]);

  useEffect(() => {
    const hitElement = hitRef.current;
    const oldURL = window.location.href;
    const cleanup = () => {
      if (hitElement) {
        hitElement.scrollIntoView();
      }

      window.history.pushState(window.history.state, '', oldURL);
    };

    if (showingDetail) {
      window.scrollTo(0, 0);
      window.history.pushState(window.history.state, '', detailURL);
      return cleanup;
    }
    return () => {};
  }, [showingDetail, detailURL]);

  return (
    <>
      <a
        ref={hitRef}
        href={detailURL}
        onClick={e => {
          if (e.ctrlKey || e.metaKey || e.altKey) {
            return;
          }
          e.preventDefault();
          setShowingDetail(true);
        }}
      >
        {/* no alt tag available here, so removed */}
        <img src={hit.image} alt="" />
        <p>
          <Highlight attribute="name" hit={hit} />
        </p>
      </a>
      {showingDetail && (
        <Dialog
          aria-label="product detail"
          isOpen
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            background: 'white',
            width: '100vw',
            height: '100%',
            zIndex: 999,
          }}
        >
          <button
            className="close-button"
            onClick={() => setShowingDetail(false)}
          >
            <VisuallyHidden>back</VisuallyHidden>
            <span aria-hidden>{'<'}</span>
          </button>
          {/* using an iframe here so it fetches using getInitialProps */}
          <iframe
            src={detailURL}
            style={{
              background: 'white',
              width: '100%',
              height: '100%',
              border: 'none',
            }}
          />
        </Dialog>
      )}
    </>
  );
}

export function ModalSearch(props) {
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
        <h1>React InstantSearch + Next.Js</h1>
        <SearchBox />
      </header>

      <InfiniteHits hitComponent={HitComponent} />

      <footer>
        <div>
          See{' '}
          <a href="https://github.com/algolia/react-instantsearch/tree/master/examples/next">
            source code
          </a>{' '}
          on github
        </div>
      </footer>
    </InstantSearch>
  );
}
