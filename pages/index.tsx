import Head from 'next/head';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import styles from '../styles/Home.module.css';
import { useState } from 'react';

export async function getServerSideProps() {
  const client = new ApolloClient({
    uri: 'https://isthisalook.hasura.app/v1/graphql',
    cache: new InMemoryCache(),
    headers: {
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET,
    }
  });

  const seed = String(Math.random())

  const { data } = await client.query({
    query: gql`
      query GetImage {
        image: random_image(args: {seed: "${seed}"}) {
          id
          url
          upvotes
          downvotes
        }
      }
    `
  });

  return { props: { data, seed } }
}

const positiveEmojis = ["👏", "👍", "✌", "👌", "🤗", "🆗", "😄", "🌈", "💙", "✨", "🌤", "🙌", "😉", "🫦"];
const negativeEmojis = ["🙈", "👎", "📉", "🙅", "😫", "🎭"];

interface Status {
  vote: boolean;
  voted: boolean;
  added: boolean;
}

export default function Home({ data, seed }) {
  const [status, setStatus] = useState<Partial<Status>>({});
  const [urlValue, setUrlValue] = useState<string>("");
  const [message, setMessage] = useState(null);
  const image = data.image[0];
  const upvotes = image.upvotes || 0;
  const downvotes = image.downvotes || 0;
  const hasPopularApproval = upvotes - downvotes > 0;
  const percentageApproval = Math.round((upvotes / (upvotes + downvotes)) * 100);

  const positiveEmojiIndex = Math.floor(seed * positiveEmojis.length);
  const negativeEmojiIndex = Math.floor(seed * negativeEmojis.length);

  const handleVote = async (vote) => {
    setStatus({ ...status, voted: true, vote });

    await fetch("/api/vote", {
      method: "POST",
      body: JSON.stringify({ id: image.id, vote })
    });
  }

  const handleAdd = async () => {
    setMessage(null);

    if (![".png", ".jpg", ".gif", ".jpeg"].some((v) => urlValue.endsWith(v))) {
      setMessage("Invalid image type")
      return;
    }

    try {
      const request = await fetch("/api/addImage", {
        method: "POST",
        body: JSON.stringify({ url: urlValue })
      });
      if (!request.ok) throw new Error();
      setStatus({ ...status, added: true });
    } catch (e) {
      setMessage("A problem occurred")
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Is This A Look?</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Is This A Look?
        </h1>

        <img src={image.url} alt="A Look?" className={styles.image} />

        {!status.voted &&
          <div className={styles.buttons}>
            <div onClick={() => handleVote(true)} className={styles.voteButton} style={{ backgroundColor: 'green' }}>Yes! {positiveEmojis[positiveEmojiIndex]}</div>
            <div onClick={() => handleVote(false)} className={styles.voteButton} style={{ backgroundColor: '#d00000' }}>No {negativeEmojis[negativeEmojiIndex]}</div>
          </div>
        }

        {status.voted &&
          <div>Thanks for your vote!
            {status.vote === true && hasPopularApproval && percentageApproval > 0 && <div>{percentageApproval}% of voters agree with you -- this is, in fact, A Look!</div>}
            {status.vote === true && !hasPopularApproval && <div>{percentageApproval}% of voters disagree with you!</div>}
            {status.vote === false && hasPopularApproval && <div>{percentageApproval}% of voters disagree with you!</div>}
            {status.vote === false && !hasPopularApproval && percentageApproval < 100 && <div>{100 - percentageApproval}% of voters agree with you -- this is, in fact, Not A Look!</div>}
          </div>
        }

        {status.added && <div>Thanks for adding an image!</div>}
        {message && <div>{message}</div>}

        {!status.added &&
          <div className={styles.addWrapper}>
            <input type="url" style={{ width: 300, borderRight: 'none', outline: 'none', border: '1px solid #0070f3' }} value={urlValue} onChange={(e) => setUrlValue(e.target.value)} />
            <div className={styles.voteButton} style={{ backgroundColor: '#0070f3' }} onClick={handleAdd}>Add a picture URL</div>
          </div>
        }
      </main>

      <footer className={styles.footer}>
        <a
          href="https://aaronbuxbaum.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          yet another pseudorandom creation
        </a>
      </footer>
    </div>
  )
}
