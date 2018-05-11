import React from 'react'
import * as d3 from 'd3'
import { sankey, sankeyDiagram } from 'd3-sankey-diagram'

const margin = { top: 10, left: 100, bottom: 10, right: 100 }

export default class Sankey extends React.Component {
  componentDidMount () {
    console.log('start d3', this._rootNode)

    const width = this.props.width
    const height = this.props.height

    this.layout = sankey()
        .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
    /* .scale(10)*/
        .linkValue(d => d.data.value)
    /* .nodePosition(function (d) { return [margin.left + d.x, margin.top + d.y] })*/

    // Render
    var color = d3.scaleOrdinal(d3.schemeCategory10)
    this.diagram = sankeyDiagram()
      .margins(margin)
      .linkColor(function (d) { return color(d.type) })
      .nodeTitle(function(d) { return d.title.label })
  }

  updateSankey () {
    const data = this.props.data

    if (!data || data.nodes.length === 0) return
    if (data.nodes[0].x0 !== undefined) {
      // Don't need to calculate layout
      console.log('not calculating layout', data.nodes[0])
      this.layout.nodePosition(d => [d.x0, d.y0])
    } else {
      // Do need to calculate layout
      console.log('calculating layout', data.nodes.length, data.nodes[0].y0)
      this.layout.nodePosition(null)
      const result = this.layout(data)
      console.log('after layout', data.nodes.length, result.nodes.length, data.nodes[0].y0)
      this.layout.nodePosition(d => [d.x0, d.y0])
      /* 
       *       data.nodes.forEach(d => {
       *         d.x = d.x0
       *         d.y = d.y0
       *       })*/
    }

    console.log('updateSankey', data)
    const svg = d3.select(this._rootNode)

    const width = this.props.width
    const height = this.props.height

    svg
    /* .datum(this.layout(data))*/
                       .datum(data)
      .transition().duration(1000).ease(d3.easeCubic)
      .call(this.diagram)

    svg.select('.nodes').selectAll('.node')
      .call(d3.drag()
            .subject(function (d) {
              console.log('subject', d)
              return d
            })
            .on('start', function () {
              this.parentNode.appendChild(this)
            })
            .on('drag', dragmove.bind(this)))

    function dragmove (d) {
      if (d3.event.sourceEvent.ctrlKey) {
        const newX = Math.max(0, Math.min(width - margin.left - margin.right - this.layout.nodeWidth(), d3.event.x))
        const delta = newX - d.x0
        d.x0 = newX
        d.x1 = d.x0 + this.layout.nodeWidth()
        d.incoming.forEach(link => {
          const p = link.points[link.points.length - 1]
          p.x += delta
        })
        d.outgoing.forEach(link => {
          const p = link.points[0]
          p.x += delta
        })
      } else {
        const newY = Math.max(0, Math.min(height - margin.top - margin.bottom - d.dy, d3.event.y))
        const delta = newY - d.y0
        d.y0 = newY
        d.y1 = d.y0 + d.dy
        d.incoming.forEach(link => {
          const p = link.points[link.points.length - 1]
          p.y += delta
        })
        d.outgoing.forEach(link => {
          const p = link.points[0]
          p.y += delta
        })
      }
      console.log('dragged', d, data)
      /* this.layout(data)*/
      svg.call(this.diagram)
    }
  }

  componentDidUpdate () {
    console.log('did update', arguments)
    this.updateSankey()
  }

  // shouldComponentUpdate() {
  //   // Prevents component re-rendering
  //   return false;
  // }

  // willReceiveProps(props) {
  //   console.log('new props', props)
  // }

  _setRef (componentNode) {
    this._rootNode = componentNode
  }

  render () {
    return <svg width={this.props.width} height={this.props.height} className='sankey-container' ref={this._setRef.bind(this)} />
  }
}
