import React, { cloneElement } from "react"
import PropTypes from "prop-types"

//import "./topbar.less"
import Logo from "./logo_small.png"
import {parseSearch, serializeSearch} from "../../core/utils"

export default class Topbar extends React.Component {

  static propTypes = {
    layoutActions: PropTypes.object.isRequired
  }

  constructor(props, context) {
    super(props, context)
    this.state = { url: props.specSelectors.url(), selectedIndex: 0 }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ url: nextProps.specSelectors.url() })
  }

  onUrlChange =(e)=> {
    let {target: {value}} = e
    this.setState({url: value})
  }

  loadSpec = (url) => {
    this.props.specActions.updateUrl(url)
    this.props.specActions.download(url)
  }

  onUrlSelect =(e)=> {
    let url = e.target.value || e.target.href
    this.loadSpec(url)
    this.setSelectedUrl(url)
    e.preventDefault()
  }

  downloadUrl = (e) => {
    this.loadSpec(this.state.url)
    e.preventDefault()
  }

  setSearch = (spec) => {
    let search = parseSearch()
    search["urls.primaryName"] = spec.name
    const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`
    if(window && window.history && window.history.pushState) {
      window.history.replaceState(null, "", `${newUrl}?${serializeSearch(search)}`)
    }
  }

  setSelectedUrl = (selectedUrl) => {
    const configs = this.props.getConfigs()
    const urls = configs.urls || []

    if(urls && urls.length) {
      if(selectedUrl)
      {
        urls.forEach((spec, i) => {
          if(spec.url === selectedUrl)
            {
              this.setState({selectedIndex: i})
              this.setSearch(spec)
            }
        })
      }
    }
  }

  componentWillMount() {
    // const configs = this.props.getConfigs()
    // const urls = configs.urls || []

    // if(urls && urls.length) {
    //   let primaryName = configs["urls.primaryName"]
    //   if(primaryName)
    //   {
    //     urls.forEach((spec, i) => {
    //       if(spec.name === primaryName)
    //         {
    //           this.setState({selectedIndex: i})
    //         }
    //     })
    //   }
    // }

    if (window.location.hash.includes("gateway")) {
      this.setState({selectedIndex: 2});
    } else if (window.location.hash.includes("faucet")) {
      this.setState({selectedIndex: 1});
    } else {
      this.setState({selectedIndex: 0});
    }
  }

  componentDidMount() {
    const urls = this.props.getConfigs().urls || []

    // console.log(urls, this.state.selectedIndex, window.location.hash.includes("gateway"))

    // if (window.location.hash == "#/gateway") {
    //   this.loadSpec("gateway.yaml");
    // }

    // if (window.location.hash == "#/faucet") {
    //   this.loadSpec("faucet.yaml");
    // }

    // if (window.location.hash == "#/openapi") {
    //   this.loadSpec("openapi.yaml");
    // }

    if(urls && urls.length) {
      this.loadSpec(urls[this.state.selectedIndex].url)
    }
  }

  changeAPI(e, apiName) {
    e.stopPropagation();
    e.preventDefault();
    this.loadSpec(apiName + ".yaml");
    window.history.replaceState(null, "", "/#/" + apiName);
  }

  onFilterChange =(e) => {
    let {target: {value}} = e
    this.props.layoutActions.updateFilter(value)
  }

  render() {
    let { getComponent, specSelectors, getConfigs } = this.props
    const Button = getComponent("Button")
    const Link = getComponent("Link")

    let isLoading = specSelectors.loadingStatus() === "loading"
    let isFailed = specSelectors.loadingStatus() === "failed"

    let inputStyle = {}
    if(isFailed) inputStyle.color = "red"
    if(isLoading) inputStyle.color = "#aaa"

    const { urls } = getConfigs()
    let control = []
    let formOnSubmit = null

    if(urls) {
      let rows = []
      urls.forEach((link, i) => {
        rows.push(<option key={i} value={link.url}>{link.name}</option>)
      })

      control.push(
        <label className="select-label" htmlFor="select"><span>Select a spec</span>
          <select id="select" disabled={isLoading} onChange={ this.onUrlSelect } value={urls[this.state.selectedIndex].url}>
            {rows}
          </select>
        </label>
      )
    }
    else {
      formOnSubmit = this.downloadUrl
      control.push(<input className="download-url-input" type="text" onChange={ this.onUrlChange } value={this.state.url} disabled={isLoading} style={inputStyle} />)
      control.push(<Button className="download-url-button" onClick={ this.downloadUrl }>Explore</Button>)
    }

    return (
      <div className="citadel-menu">
        <a className="citadel-logo" href="?urls.primaryName=openapi" onClick={ (e) => this.changeAPI(e, "openapi") }>
          <img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxOS4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHZpZXdCb3g9Ii0yODEgNDA0LjkgMzIgMzIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgLTI4MSA0MDQuOSAzMiAzMjsiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4NCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9DQo8L3N0eWxlPg0KPGc+DQoJPGc+DQoJCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0tMjU0LDQzNC40aC0yMi42bDguOS0yNi44aDQuN0wtMjU0LDQzNC40eiBNLTI3NS4yLDQzMy40aDE5LjhsLTguMy0yNC44aC0zLjNMLTI3NS4yLDQzMy40eiIvPg0KCTwvZz4NCjwvZz4NCjwvc3ZnPg0K"/>
        </a>
        <a href="?urls.primaryName=faucet" className="citadel-menu-item" onClick={ (e) => this.changeAPI(e, "faucet") }>Faucet</a>
        <a href="?urls.primaryName=gateway" className="citadel-menu-item" onClick={ (e) => this.changeAPI(e, "gateway") }>Gateway</a>
      </div>
    )
  }
}

Topbar.propTypes = {
  specSelectors: PropTypes.object.isRequired,
  specActions: PropTypes.object.isRequired,
  getComponent: PropTypes.func.isRequired,
  getConfigs: PropTypes.func.isRequired
}
