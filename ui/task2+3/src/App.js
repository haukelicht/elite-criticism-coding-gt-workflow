import React, { Component } from 'react';
import ToggleButton from 'react-bootstrap/ToggleButton'
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'
import ReactHtmlParser from 'react-html-parser'; 


const TWEET = document.querySelector('#tweet').innerText.trim();
// const TWEET = 'A Tweet'
const METADATA = document.querySelector('#metadata').innerText.trim();
// const METADATA = '{"key": "value"}'

const INSTRUCTIONS = document.querySelector('#instructions').innerHTML;
// const INSTRUCTIONS = '<h3>Instructions</h3>'
const TASK1 = document.querySelector('#task1').innerHTML;
// const TASK1 = '<h5>1. question</h5>'
const TASK2 = document.querySelector('#task2').innerHTML;
// const TASK2 = '<h5>2. question</h5>'

const Card = ({ children }) => (
  <div
    style={{
      boxShadow: '0 2px 4px rgba(0,0,0,.3)',
      borderRadius: '10px',
      margin: 6,
      maxWidth: 1000,
      padding: 16,
    }}
  >
    {children}
  </div>
)

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
       metadata: METADATA,
    };

    this.handleInputChangeTask1 = this.handleInputChangeTask1.bind(this);
    this.handleInputChangeTask2 = this.handleInputChangeTask2.bind(this);
  }
  
  handleInputChangeTask1(val) { this.setState({task1: val}); }
  handleInputChangeTask2(val) { this.setState({task2: val}); }

  handleNotes = e => { this.setState({ notes: e.target.value }); }

  render() {
    return (
      <div style={{ padding: 10, fontFamily: 'sans-serif' }}>
        <Card>
          <div className="form-row justify-content-md-left">
            <div className="col">
              {ReactHtmlParser(INSTRUCTIONS)}
            </div>
          </div>
        </Card>
        <Card>
          <div className="form-row justify-content-md-left">
            <div className="col">
              <blockquote> {TWEET} </blockquote>
              <cite>posted on Twitter</cite>
            </div>
          </div>
        </Card>
        <Card name="task1">
          <div className="form-row justify-content-md-left" style={{ marginBottom: 6 }}>
            <div className="col">
              {ReactHtmlParser(TASK1)}
            </div>
            <div className="w-100"></div>
            <ToggleButtonGroup 
             type="radio" 
             name="task1" 
             onChange={this.handleInputChangeTask1}
            >
              <ToggleButton variant="outline-dark" value={"explicit"}>Yes, it's made explicit</ToggleButton>
              <ToggleButton variant="outline-dark" value={"implicit"}>No, it's left implicit</ToggleButton>
              <ToggleButton className="na-btn" variant="outline-dark" value={"cannot-answer"}>Cannot answer</ToggleButton>
            </ToggleButtonGroup>
          </div>
        </Card>
        <Card name="task2">
          <div className="form-row justify-content-md-left" style={{ marginBottom: 6 }}>
            <div className="col">
              {ReactHtmlParser(TASK2)}
            </div>
            <div className="w-100"></div>
            <ToggleButtonGroup 
             type="radio" 
             name="task2" 
             onChange={this.handleInputChangeTask2}
            >
              <ToggleButton variant="outline-dark" value={"specific"}>Specific</ToggleButton>
              <ToggleButton variant="outline-dark" value={"general"}>General</ToggleButton>
              <ToggleButton className="na-btn" variant="outline-dark" value={"cannot-answer"}>Cannot answer</ToggleButton>
            </ToggleButtonGroup>
          </div>
        </Card>
        <Card>
          <div className="form-row">
            <div className="col">
                <p>Please enter any comments you have regarding the task or the post below:</p>
                <textarea
                    className="form-control"
                    rows="2"
                    cols="80%"
                    onChange={this.handleNotes}
                    defaultValue=''
                    name="notes" 
                    maxLength="500"
                    placeholder="Put your comments here"
                >
                </textarea>
            </div>
          </div>
        </Card>
        <pre hidden>{JSON.stringify(this.state, null, 2)}</pre>
      </div>
    )
  }
}

export default App;
