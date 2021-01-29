import React from 'react'
import { format } from 'date-fns'
import styles from './Footer.module.css'

export default ({ revalidatedAt }: { revalidatedAt: string }) => (
  <footer className={styles.footer}>
    <div className="">
      <p>{format(new Date(revalidatedAt), 'dd.MM.yyyy HH:mm')}</p>
    </div>
    <div className="">
      <p>Hugo Holmqvist 2021</p>
    </div>
    <div className="">
      <a href="https://github.com/MergHQ/piikki">GitHub</a>
    </div>
  </footer>
)
