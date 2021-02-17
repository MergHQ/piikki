import { h, mount } from 'harmaja'
import App from './App'
import appStore from './stores/app-store'
import './styles.css'

mount(<App {...appStore()} />, document.getElementById('root'))
