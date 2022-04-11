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

  const { url } = JSON.parse(req.body);

  await client.mutate({
    variables: { url },
    mutation: gql`
      mutation AddImage($url: String) {
        insert_images_one(object: {url: $url}) {
          id
        }
      }
    `
  });

  res.status(200).json()
}
