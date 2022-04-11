import { gql } from "@apollo/client";
import type { NextApiHandler } from "next";
import client from "../../utils/graphql-client";

const handler: NextApiHandler = async (req, res) => {
  const { vote, id } = JSON.parse(req.body);

  await client.mutate({
    variables: {
      upvotes: vote === true ? 1 : 0,
      downvotes: vote === false ? 1 : 0,
      id,
    },
    mutation: gql`
      mutation VoteOnImage(
        $upvotes: numeric!
        $downvotes: numeric!
        $id: uuid!
      ) {
        update_images_by_pk(
          pk_columns: { id: $id }
          _inc: { upvotes: $upvotes, downvotes: $downvotes }
        ) {
          id
        }
      }
    `,
  });

  res.status(200);
};

export default handler;
