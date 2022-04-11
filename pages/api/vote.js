import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

export default async function handler(req, res) {
  const client = new ApolloClient({
    uri: 'https://isthisalook.hasura.app/v1/graphql',
    cache: new InMemoryCache(),
    headers: {
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET,
      "content-type": "application/json"
    }
  });

  const { vote, id } = JSON.parse(req.body);

  await client.mutate({
    variables: { upvotes: vote === true ? 1 : 0, downvotes: vote === false ? 1 : 0, id },
    mutation: gql`
      mutation VoteOnImage($upvotes: numeric!, $downvotes: numeric!, $id: uuid!) {
        update_images_by_pk(pk_columns: {id: $id}, _inc: {upvotes: $upvotes, downvotes: $downvotes }) {
          id
        }
      }
    `
  });

  res.status(200).json()
}
