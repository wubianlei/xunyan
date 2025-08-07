import { Component, PropsWithChildren } from 'react'

// Import SASS overrides before other styles to fix Taro UI deprecated functions
import './styles/sass-overrides.scss'
import './app.css'
import './app.less'

// import 'taro-ui/dist/style/index.scss' 
import 'taro-ui/dist/style/index.scss'

  class App extends Component<PropsWithChildren> {

  componentDidMount () {}

  componentDidShow () {}

  componentDidHide () {}

  // this.props.children 是将要会渲染的页面
  render () {
    return this.props.children
  }
}


export default App
