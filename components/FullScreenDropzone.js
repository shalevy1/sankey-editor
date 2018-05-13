import Dropzone from 'react-dropzone'
import React from 'react'


export default class FullScreenDropzone extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      dropzoneActive: false,
    }
  }

  onDragEnter () {
    this.setState({
      dropzoneActive: true
    })
  }

  onDragLeave () {
    this.setState({
      dropzoneActive: false
    })
  }

  handleDrop (acceptedFiles, rejectedFiles) {
    this.setState({
      dropzoneActive: false
    })
    if (acceptedFiles.length >= 1) {
      const reader = new FileReader()
      reader.onload = () => {
        const sankeyData = JSON.parse(reader.result)
        console.log('loaded data', sankeyData, this)
        this.props.onData(sankeyData)
      }
      reader.onabort = () => console.log('file reading was aborted')
      reader.onerror = () => console.log('file reading has failed')
      reader.readAsBinaryString(acceptedFiles[0])
    }
  }

  render () {
    const { dropzoneActive } = this.state

    const overlayStyle = {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      padding: '2.5em 0',
      background: 'rgba(0,0,0,0.5)',
      textAlign: 'center',
      color: '#fff'
    }

    const accept = ''

    return (
      <Dropzone
        disableClick
        style={{position: "relative"}}
        accept={accept}
        onDrop={this.handleDrop.bind(this)}
        onDragEnter={this.onDragEnter.bind(this)}
        onDragLeave={this.onDragLeave.bind(this)}
        >
        { dropzoneActive && <div style={overlayStyle}>Drop files...</div> }
        {this.props.children}
      </Dropzone>
    )
  }
}
