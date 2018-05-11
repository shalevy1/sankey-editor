import Layout from '../components/MyLayout'
import Sankey from '../components/Sankey'
import Link from 'next/link'
import fetch from 'isomorphic-unfetch'
import Dropzone from 'react-dropzone'
import React from 'react'

export default class Index extends React.Component {
  constructor (props) {
    super(props)
    this.state = {sankeyData: null}
  }

  handleDrop (acceptedFiles, rejectedFiles) {
    if (acceptedFiles.length >= 1) {
      const reader = new FileReader()
      reader.onload = () => {
        const sankeyData = JSON.parse(reader.result)
        // do whatever you want with the file content
        console.log('loaded data', sankeyData, this)
        this.setState({ sankeyData: sankeyData })
      }
      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.readAsBinaryString(acceptedFiles[0])
    }
  }

  render () {
    const styles = { border: '1px solid black', width: 600, color: 'black', padding: 20 }
    console.log('render', this.state)

    return (
      <Layout>
        <h1>Sankey editor</h1>
        <div id="react-file-drop-demo" style={{styles}}>
        <Dropzone onDrop={this.handleDrop.bind(this)}>
            Drop some files here!
          </Dropzone>
        <Sankey data={this.state.sankeyData} width={1000} height={500}/>
        </div>
      </Layout>
    )
  }
    // <ul>
    //   {props.shows.map(({show}) => (
    //     <li key={show.id}>
    //       <Link as={`/p/${show.id}`} href={`/post?id=${show.id}`}>
    //         <a>{show.name}</a>
    //       </Link>
    //     </li>
    //   ))}
    // </ul>
}

// Index.getInitialProps = async function () {
//   const res = await fetch('https://api.tvmaze.com/search/shows?q=batman')
//   const data = await res.json()

//   console.log(`Show data fetched. Count: ${data.length}`)

//   return {
//     shows: data
//   }
// }

// export default Index
