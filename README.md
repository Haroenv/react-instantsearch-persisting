# Persisting Infinite Hits

This example shows two methods for doing InfiniteHits, where the loaded items, nor the scroll position gets lost when the user navigates to the product detail page.

Getting this example running can be done two ways:

- online: <https://codesandbox.io/s/github/haroenv/react-instantsearch-persisting>
- local: clone <https://github.com/haroenv/react-instantsearch-persisting>, `npm install && npm dev`

## Methodologies

### Modal

This option avoids the issue of items unloading, by never navigating. This is a technique employed by most native applications as well.

The steps taken are:

1. Add a potential modal to every hit
2. add click listeners (not for cmd-click) to the link
3. open the respective modal
4. add a listener to the back button, as well as browser back button to close the modal

An `iframe` is used to embed the product page inside the modal, so it can have its own life cycle and respectively call `getInitialProps` to request the information (in this case from Algolia, but that could be any method).

Note that here, even if a user "navigates back" using the browser, we actually `pushState`, so go forward. This likely isn't an issue for users, and could be fixable by more detailed specification of the expected behavior.

### Caching

Using the Algolia cache as persisted storage isn't a good option in this case, since it will cache individual responses, not a conjoined list of hits. Its cache is also not externally accessible, meaning that persisting it in e.g. `localStorage` is not straightforward.

The steps taken are:

1. copy the `InstantSearch` component (since it's not exported)
2. copy `indexUtils` (since they're needed for this custom connector)
3. copy `connectInfiniteHits`
4. modify the new connector to accept a `cache` prop
5. write to the cache (if available) before sending props to the inner component
6. read from the cache if it's the first time the component renders

I've chosen to use `sessionStorage`, not `localStorage`, since `localStorage` is shared across tabs, and can thus break the search results if people have multiple tabs opened.

The product page has its own page, so it can have its own life cycle and respectively call `getInitialProps` to request the information (in this case from Algolia, but that could be any method).

## Constraints

There's a lot of constraints with these options, so here are the ones I took in account making the demo:

* server side rendering for results
* server side rendering for detail page
* back button keeps / restores scroll position
* refresh on search page is undefined behavior
* link share search page is undefined behavior
* using Next.js
* product page has a URL and is independently visitable

In both examples, refreshing on the search page, or sharing a search results link will start from page 0, since those are the most pertinent results.
