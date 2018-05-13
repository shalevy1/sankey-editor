import Layout from '../components/MyLayout'
import Sankey from '../components/Sankey'
import Link from 'next/link'
import fetch from 'isomorphic-unfetch'
import Dropzone from '../components/FullScreenDropzone'
import React from 'react'
import download from '../lib/download'
import serialiseSankeyData from '../lib/serialiseSankeyData'

import { sankey } from 'd3-sankey-diagram'

import initialData from '../quickstart.json'
console.log('initialData', initialData)
const margin = { top: 10, left: 100, bottom: 10, right: 100 }

class Index extends React.Component {
  constructor (props) {
    super(props)
    console.log('props', props)
    this.state = {
      sankeyData: props.initialData,
      width: 1000,
      height: 600,
      scale: null
    }
    // this.newData(props.initialData)
  }

  componentDidMount() {
    this.newData(this.state.sankeyData)
  }

  getLayout (state = this.state) {
    const {width, height, scale} = state

    return sankey()
      .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
      .scale(scale)
      .linkValue(d => d.data.value)
  }

  newData (data) {
    let {width, height, scale} = this.state

    if (data.dimensions) {
      width = data.dimensions.pageWidth
      height = data.dimensions.pageHeight
    }

    const s = data.metadata ? data.metadata.scale : scale
    if (s > 0 && isFinite(s)) {
      scale = s
    }

    const layout = this.getLayout({ width, height, scale })

    if (data && data.nodes.length > 0) {
      if (data.nodes[0].geometry !== undefined) {
        // Don't need to calculate layout
        console.log('not calculating layout', data.nodes[0])
        layout.nodePosition(d => [d.geometry.x, d.geometry.y])
        const result = layout(data)
      } else {
        // Do need to calculate layout
        console.log('calculating layout', data.nodes.length, data.nodes[0].y0)
        // const layout = sankey()
        //   .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
        //   .scale(scale)
        //   .linkValue(d => d.data.value)
        /* .nodePosition(function (d) { return [margin.left + d.x, margin.top + d.y] })*/

        const result = layout(data)
        console.log('after layout', data.nodes.length, result.nodes.length, data.nodes[0].y0)
        scale = layout.scale()
        // this.layout.nodePosition(d => [d.x0, d.y0])
        /* 
         *       data.nodes.forEach(d => {
         *         d.x = d.x0
         *         d.y = d.y0
         *       })*/
      }
    }

    this.setState({
      width: width,
      height: height,
      scale: scale,
      sankeyData: data
    })
  }

  onWidthChanged (event) {
    this.setState({ width: event.target.value })
  }

  onHeightChanged (event) {
    this.setState({ height: event.target.value })
  }

  onScaleChanged (event) {
    const scale = event.target.valueAsNumber
    const layout = this.getLayout()
          .scale(scale)
          .nodePosition(d => [d.x0, d.y0])

    layout(this.state.sankeyData)
    this.setState({ sankeyData: this.state.sankeyData, scale: scale })
  }

  onRelayout (event) {
    const layout = this.getLayout()
    layout(this.state.sankeyData)
    this.setState({ sankeyData: this.state.sankeyData })
  }

  onDragEnd (d) {
    const layout = this.getLayout()
    layout.update(this.state.sankeyData)
    this.setState({ sankeyData: this.state.sankeyData })
  }

  onDownload (d) {
    const jsonData = serialiseSankeyData(this.state.sankeyData, this.state.scale)
    download(jsonData, 'sankey.json')
  }

  render () {
    const { width, height, scale } = this.state

    return (
      <Layout>
        <Dropzone onData={this.newData.bind(this)}>
          <h1>Sankey editor</h1>
          <input type="number" onChange={this.onWidthChanged.bind(this)} value={width}/>
          <input type="number" onChange={this.onHeightChanged.bind(this)} value={height}/>
          <button onClick={this.onRelayout.bind(this)}>Re-layout</button>
          <input type="number" onChange={this.onScaleChanged.bind(this)} min="0" value={scale || ''}/>
          <button onClick={this.onDownload.bind(this)}>Download JSON</button>
          <Sankey width={width} height={height} data={this.state.sankeyData} onDragEnd={this.onDragEnd.bind(this)}/>
        </Dropzone>
      </Layout>
    )
  }
}

Index.getInitialProps = function () {
  return { initialData: initialData }
}

export default Index
