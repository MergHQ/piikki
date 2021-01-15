import React from 'react'
import styles from './Footer.module.css'

export default () => (
  <footer className={styles.footer}>
    <div className="footer__left">
      <p>Hugo Holmqvist 2021</p>
    </div>
    <div className="footer__right">
      <a href="https://github.com/MergHQ/piikki">GitHub</a>
    </div>
  </footer>
)
