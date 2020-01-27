import React from 'react';
import algoliasearch from 'algoliasearch/lite';
import Head from '../../components/head';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

function Product({ hit }) {
  return (
    <>
      <Head title="detail" />
      <p>Product: {hit.objectID}</p>
      <img src={hit.image}></img>
    </>
  );
}

Product.getInitialProps = async ({ query }) => {
  const hit = await searchClient
    .initIndex('instant_search')
    .getObject(query.pid);
  return { hit };
};

export default Product;
