import { h, mount } from 'harmaja'
import App from './App'
import appStore from './stores/appStore'
import './styles.css'

mount(<App {...appStore()} />, document.getElementById('root'))
