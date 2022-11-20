import styles from '../styles/Home.module.css';
import Head from 'next/head';
import nextPackage from 'next/package.json';
import React from 'react';

export default function Home({}) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Next.js</title>
        <meta content="Generated by create next app" name="description" />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js!</a> v{nextPackage.version}
        </h1>

        <p className={styles.description}>
          Get started by editing <code className={styles.code}>pages/index.tsx</code>
        </p>
      </main>
    </div>
  );
}
