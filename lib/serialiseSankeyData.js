export default function serialiseSankeyData (data, scale) {
  const result = {
    format: {major: 0, minor: 1},
    metadata: {
      title: 'A Sankey diagram',
      authors: [],
      scale: scale
      // layers: n.ordering,
    },
    nodes: data.nodes.map(serialiseNode),
    links: data.links.map(serialiseLink)
    // groups: n.groups,
  }

  return JSON.stringify(result, null, 2)
}

function serialiseNode (n) {
  return {
    id: n.id,
    title: n.title,
    style: n.style,
    geometry: {
      x: n.x0,
      y: n.y0,
      w: n.x1 - n.x0,
      h: n.y1 - n.y0
    }
  }
}

function serialiseLink (l) {
  return {
    source: l.source.id,
    target: l.target.id,
    type: l.type || '',
    // title: l.title,
    // time: l.time,
    data: l.data,
    style: l.style
  }
}
