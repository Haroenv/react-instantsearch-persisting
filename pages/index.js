import React from 'react';
import Link from 'next/link';

function Index() {
  return (
    <>
      <h1>Approaches for not losing scroll position</h1>
      <p>The goals that are solved by this approach are:</p>
      <ul>
        <li>server side rendering for results</li>
        <li>server side rendering for detail page</li>
        <li>back button keeps / restores scroll position</li>
        <li>refresh on search page is undefined behavior</li>
        <li>link share search page is undefined behavior</li>
      </ul>
      <p>approaches:</p>
      <ul>
        <li>
          <Link href="/search-modal">
            <a>Modal approach</a>
          </Link>
        </li>
        <li>
          <Link href="/search-cached">
            <a>Fetching the infinite hits again via a cache</a>
          </Link>
        </li>
      </ul>
    </>
  );
}

export default Index;
