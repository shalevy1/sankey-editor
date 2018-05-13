import React from 'react'
import * as d3 from 'd3'
import { sankeyDiagram } from 'd3-sankey-diagram'

const margin = { top: 10, left: 100, bottom: 10, right: 100 }

export default class Sankey extends React.Component {
  componentDidMount () {
    var color = d3.scaleOrdinal(d3.schemeCategory10)
    this.diagram = sankeyDiagram()
      .margins(margin)
      .linkColor(function (d) { return d.style.color || color(d.type) })
      .nodeTitle(function (d) { return d.title.label })

    this.svg = d3.select(this._rootNode)
  }

  updateSankey () {
    this.svg.datum(this.props.data)
      .transition().duration(1000).ease(d3.easeCubic)
      .call(this.diagram)

    const dragBehaviour =
      d3.drag()
        .subject(d => d)
        .on('start', moveToFront)
        .on('end', this.props.onDragEnd)
        .on('drag', this.dragmove.bind(this))

    this.svg
        .select('.nodes')
        .selectAll('.node')
        .call(dragBehaviour)
  }

  dragmove (d) {
    const {width, height} = this.props

    if (d3.event.sourceEvent.ctrlKey) {
      const dx = d.x1 - d.x0
      const newX = Math.max(0, Math.min(width - margin.left - margin.right - dx, d3.event.x))
      const delta = newX - d.x0
      d.x0 = newX
      d.x1 = d.x0 + dx
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

    // Need to include zero-duration transition to update starting point for
    // future transitions properly
    this.svg.transition().duration(0).call(this.diagram)
  }

  componentDidUpdate () {
    this.updateSankey()
  }

  _setRef (componentNode) {
    this._rootNode = componentNode
  }

  render () {
    const sankeyStyle = {
      margin: 20,
      padding: 20,
      border: '1px solid #DDD'
    }

    return (
      <svg width={this.props.width}
           height={this.props.height}
           style={sankeyStyle}
           className='sankey-container'
           ref={this._setRef.bind(this)} />
    )
  }
}


function moveToFront () {
  this.parentNode.appendChild(this)
}
