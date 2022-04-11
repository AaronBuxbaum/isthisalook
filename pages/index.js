import Head from 'next/head'
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import styles from '../styles/Home.module.css'
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
          score
          url
          views
        }
      }
    `
  });

  return { props: { data } }
}

export default function Home({ data }) {
  const [status, setStatus] = useState({});
  const [urlValue, setUrlValue] = useState();

  const handleVote = async (vote) => {
    setStatus({ ...status, voted: true, vote });
  }

  const handleAdd = () => {
    setStatus({ ...status, added: true });
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
        <img src={data.image[0].url} alt="A Look?" className={styles.image} />
        {!status.voted &&
          <div className={styles.buttons}>
            <div onClick={() => handleVote(true)} className={styles.voteButton} style={{ backgroundColor: 'green' }}>Yes! 👜</div>
            <div onClick={() => handleVote(false)} className={styles.voteButton} style={{ backgroundColor: '#d00000' }}>No 😔</div>
          </div>}

        {status.voted && <div>Thanks for your vote!</div>}
        {status.added && <div>Thanks for adding an image!</div>}

        {!status.added &&
          <div className={styles.addWrapper}>
            <input type="url" style={{ width: 300, borderRight: 'none', outline: 'none', border: '1px solid #0070f3' }} value={urlValue} onChange={(e) => setUrlValue(e.target.value)} />
            <div className={styles.voteButton} style={{ backgroundColor: '#0070f3' }} onClick={handleAdd}>Add a picture</div>
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
