import Layout from '../components/MyLayout'
import Sankey from '../components/Sankey'
import Link from 'next/link'
import fetch from 'isomorphic-unfetch'
import Dropzone from '../components/FullScreenDropzone'
import React from 'react'

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

  getLayout () {
    const {width, height, scale} = this.state

    return sankey()
      .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
      .scale(scale)
      .linkValue(d => d.data.value)
  }

  newData (data) {
    if (data.dimensions) {
      this.setState({
        width: data.dimensions.pageWidth,
        height: data.dimensions.pageHeight
      })
    }

    const {width, height, scale} = this.state
    if (data && data.nodes.length > 0) {
      if (data.nodes[0].x0 !== undefined) {
        // Don't need to calculate layout
        console.log('not calculating layout', data.nodes[0])
        // this.layout.nodePosition(d => [d.x0, d.y0])
        // const result = this.layout(data)
      } else {
        // Do need to calculate layout
        console.log('calculating layout', data.nodes.length, data.nodes[0].y0)
        // const layout = sankey()
        //   .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
        //   .scale(scale)
        //   .linkValue(d => d.data.value)
        /* .nodePosition(function (d) { return [margin.left + d.x, margin.top + d.y] })*/

        const layout = this.getLayout()
        const result = layout(data)
        console.log('after layout', data.nodes.length, result.nodes.length, data.nodes[0].y0)
        this.setState({scale: layout.scale()})
        // this.layout.nodePosition(d => [d.x0, d.y0])
        /* 
         *       data.nodes.forEach(d => {
         *         d.x = d.x0
         *         d.y = d.y0
         *       })*/
      }
    }

    this.setState({
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
