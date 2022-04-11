import { gql } from "@apollo/client";
import type { NextApiHandler } from "next";
import client from "../../utils/graphql-client";

const handler: NextApiHandler = async (req, res) => {
  const { url } = JSON.parse(req.body);

  await client.mutate({
    variables: { url },
    mutation: gql`
      mutation AddImage($url: String) {
        insert_images_one(object: { url: $url }) {
          id
        }
      }
    `,
  });

  res.status(200).json({ ok: true });
};

export default handler;
