// this file originally was indexUtils in React InstantSearch
function getIndexId({ contextValue, indexContextValue }) {
  return indexContextValue
    ? indexContextValue.targetedIndex
    : contextValue.mainTargetedIndex;
}

function isMultiIndex({ indexContextValue }) {
  return Boolean(indexContextValue);
}

export function getResults(searchResults, props) {
  if (searchResults.results) {
    if (searchResults.results.hits) {
      return searchResults.results;
    }

    const indexId = getIndexId(props);

    if (searchResults.results[indexId]) {
      return searchResults.results[indexId];
    }
  }

  return {};
}

function getNamespaceAndAttributeName(id) {
  const parts = id.match(/^([^.]*)\.(.*)/);
  const namespace = parts && parts[1];
  const attributeName = parts && parts[2];

  return { namespace, attributeName };
}

function hasRefinements({
  multiIndex,
  indexId,
  namespace,
  attributeName,
  id,
  searchState,
}) {
  if (multiIndex && namespace) {
    return (
      searchState.indices &&
      searchState.indices[indexId] &&
      searchState.indices[indexId][namespace] &&
      Object.hasOwnProperty.call(
        searchState.indices[indexId][namespace],
        attributeName
      )
    );
  }

  if (multiIndex) {
    return (
      searchState.indices &&
      searchState.indices[indexId] &&
      Object.hasOwnProperty.call(searchState.indices[indexId], id)
    );
  }

  if (namespace) {
    return (
      searchState[namespace] &&
      Object.hasOwnProperty.call(searchState[namespace], attributeName)
    );
  }

  return Object.hasOwnProperty.call(searchState, id);
}

function getRefinements({
  multiIndex,
  indexId,
  namespace,
  attributeName,
  id,
  searchState,
}) {
  if (multiIndex && namespace) {
    return searchState.indices[indexId][namespace][attributeName];
  }
  if (multiIndex) {
    return searchState.indices[indexId][id];
  }
  if (namespace) {
    return searchState[namespace][attributeName];
  }

  return searchState[id];
}

function getCurrentRefinementValue(props, searchState, id, defaultValue) {
  const indexId = getIndexId(props);
  const { namespace, attributeName } = getNamespaceAndAttributeName(id);
  const multiIndex = isMultiIndex(props);
  const args = {
    multiIndex,
    indexId,
    namespace,
    attributeName,
    id,
    searchState,
  };
  const hasRefinementsValue = hasRefinements(args);

  if (hasRefinementsValue) {
    return getRefinements(args);
  }

  if (props.defaultRefinement) {
    return props.defaultRefinement;
  }

  return defaultValue;
}

export function getCurrentRefinement(props, searchState) {
  const page = 1;
  const currentRefinement = getCurrentRefinementValue(
    props,
    searchState,
    'page',
    page
  );

  if (typeof currentRefinement === 'string') {
    return parseInt(currentRefinement, 10);
  }
  return currentRefinement;
}

export function refineValue(
  searchState,
  nextRefinement,
  props,
  resetPage,
  namespace
) {
  if (isMultiIndex(props)) {
    const indexId = getIndexId(props);
    return namespace
      ? refineMultiIndexWithNamespace(
          searchState,
          nextRefinement,
          indexId,
          resetPage,
          namespace
        )
      : refineMultiIndex(searchState, nextRefinement, indexId, resetPage);
  } else {
    // When we have a multi index page with shared widgets we should also
    // reset their page to 1 if the resetPage is provided. Otherwise the
    // indices will always be reset
    // see: https://github.com/algolia/react-instantsearch/issues/310
    // see: https://github.com/algolia/react-instantsearch/issues/637
    if (searchState.indices && resetPage) {
      Object.keys(searchState.indices).forEach(targetedIndex => {
        searchState = refineValue(
          searchState,
          { page: 1 },
          { indexContextValue: { targetedIndex } },
          true,
          namespace
        );
      });
    }
    return namespace
      ? refineSingleIndexWithNamespace(
          searchState,
          nextRefinement,
          resetPage,
          namespace
        )
      : refineSingleIndex(searchState, nextRefinement, resetPage);
  }
}

function refineMultiIndex(searchState, nextRefinement, indexId, resetPage) {
  const page = resetPage ? { page: 1 } : undefined;
  const state =
    searchState.indices && searchState.indices[indexId]
      ? {
          ...searchState.indices,
          [indexId]: {
            ...searchState.indices[indexId],
            ...nextRefinement,
            ...page,
          },
        }
      : {
          ...searchState.indices,
          [indexId]: {
            ...nextRefinement,
            ...page,
          },
        };

  return {
    ...searchState,
    indices: state,
  };
}

function refineSingleIndex(searchState, nextRefinement, resetPage) {
  const page = resetPage ? { page: 1 } : undefined;
  return { ...searchState, ...nextRefinement, ...page };
}

function refineMultiIndexWithNamespace(
  searchState,
  nextRefinement,
  indexId,
  resetPage,
  namespace
) {
  const page = resetPage ? { page: 1 } : undefined;
  const state =
    searchState.indices && searchState.indices[indexId]
      ? {
          ...searchState.indices,
          [indexId]: {
            ...searchState.indices[indexId],
            [namespace]: {
              ...searchState.indices[indexId][namespace],
              ...nextRefinement,
            },
            page: 1,
          },
        }
      : {
          ...searchState.indices,
          [indexId]: {
            [namespace]: nextRefinement,
            ...page,
          },
        };

  return {
    ...searchState,
    indices: state,
  };
}

function refineSingleIndexWithNamespace(
  searchState,
  nextRefinement,
  resetPage,
  namespace
) {
  const page = resetPage ? { page: 1 } : undefined;
  return {
    ...searchState,
    [namespace]: { ...searchState[namespace], ...nextRefinement },
    ...page,
  };
}
