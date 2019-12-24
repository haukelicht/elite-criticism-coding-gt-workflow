import React, { Component , useState } from 'react';

// React Bootstrap Components
import Card from 'react-bootstrap/Card'
import Tab from 'react-bootstrap/Tab'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Nav from 'react-bootstrap/Nav'
import ToggleButton from 'react-bootstrap/ToggleButton'
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Accordion from 'react-bootstrap/Accordion'

// HTML Parser
import ReactHtmlParser from 'react-html-parser'; 

// declare global constants
// const tweet = '#Petry: Merkel\u0027s stubbornness is hurting Germany &amp; Europe\\nhttps://t.co/7R3m0urvYp #AfD #Slowenien #Asylum chaos'
// const groupLabelings = JSON.parse('{"group_1": {"task1": "yes", "task2": "implicit", "task3": "general"}, "group_2": {"task1": "no"}}')
// const metaData = JSON.parse('{"key": "value"}')
// const shortInstructions = 'short Instructions text here'
// const tasksText = JSON.parse('{"task1": "Does this post contain or approve of an implicit or explicit criticism of the elite?", "task2": "Is it made explicit what actor(s) is/are being criticized?", "task3": "Is the criticism itself rather specific or rather general?"}')
// const answerCategories = JSON.parse('{"task1": ["yes", "no", "cannot-answer"], "task2": ["explicit", "implicit", "cannot-answer", "no-elite-criticism"], "task3": ["specific", "general", "cannot-answer", "no-elite-criticism"]}')

// parse tweet and split into rows
const tweet = document.querySelector('#tweet').innerText.trim();
let tweetLines = tweet.split('\\n').map ((item, i) => <p key={i}>{ReactHtmlParser(item)}</p> );

const groupLabelings = JSON.parse(document.querySelector('#labels').innerText.trim());
const tasksText = document.querySelector('#tasks');
const answerCategories = JSON.parse(document.querySelector('#answer_categories').innerText.trim())

// const shortInstructions = ReactHtmlParser(document.querySelector('#instructions_overview').innerHTML);

const metaData = JSON.parse(document.querySelector('#metadata').innerText.trim());

const allInstructions = document.querySelector("#instructions");

function Example(props) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <div>
      <a id={props.id + "_link"} href="#" onClick={handleShow}>{props.linkText}</a>

      <Modal 
        show={show} 
        onHide={handleClose}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{props.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{props.body}</Modal.Body>
      </Modal>
    </div>
  );
}

const examples = Array.prototype.map.call(
  allInstructions.querySelectorAll(".example"), 
  function(ex){
    return(
      <li>
        <Example 
          id={ex.id}
          title={ReactHtmlParser(ex.querySelector("header").innerText.trim())} 
          body={ReactHtmlParser(ex.querySelector("content").innerHTML)}
          linkText={ReactHtmlParser(ex.querySelector("header").innerText.trim())}
        />
      </li>
    );
  }
);


/* TaskTab function
  
  Parameters:
   task (str): string specifying taks in ['task1', 'task2', 'task3']
   reviewHandler: event handler recording reviews 
   labelHandler: event handler recording any deviating labels 

  Returns a Tab.Pane division that is rendered in the App's Tab.Container 

*/
function TaskTab(props) {

  // get labels for current task 
  var labels = [];
  for (var key in groupLabelings) { 
    if (groupLabelings[key].hasOwnProperty(props.task)) { 
      labels[labels.length] = groupLabelings[key][props.task]
    } else {
      labels[labels.length] = ""
    };
  }

  // get all categories for current task
  const allCats = answerCategories[props.task];
  // assign categories that are not in labels to theseCats array
  var theseCats = [];
  var c;
  for (c = 0; c < allCats.length; c++) {
    if (! labels.includes(allCats[c])) {
      var a = allCats[c].replace("-", " ")
      theseCats[theseCats.length] = a.charAt(0).toUpperCase() + a.substring(1)
    }
  }

  // check whether labels disagree
  let uniqueLabels = labels.filter((item, i, ar) => ar.indexOf(item) === i);

  // create answer buttons list elements
  if (uniqueLabels.length === 1) {

    var buttons = [
      <ToggleButton variant="outline-dark" value="agrees">Yes, I agree</ToggleButton>,
      <ToggleButton variant="outline-dark" value="disagrees">No, I disagree</ToggleButton>
    ]
      
    uniqueLabels[0] = uniqueLabels[0].charAt(0).toUpperCase() + uniqueLabels[0].substring(1)
  } else {
    var labelingsList = []
    var buttons = []
    var i;
    var nr;
    for (i = 0; i < labels.length; i++) {
      
      var label = labels[i].replace(/-/g, " ")
      label = label.charAt(0).toUpperCase() + label.substring(1)
      
      // format for HTML rendering
      if (label.length === 0) {
        // replace if empty label
        label = <span style={{color: 'gray', fontWeight: 100,}}><em>None</em></span>
      } else {
        label = <b>&lsquo;{label}&rsquo;</b>
      }
      // add labeling to labelingList array 
      var nr = i+1;
      labelingsList[i] = <li>Label {nr.toString()}: {label}</li>
      
      // create buttons from labeling
      buttons[i] = 
        <ToggleButton 
          variant="outline-dark" 
          value={`labeling${nr}-${labels[i]}`}
        >
          Label {nr.toString()}: {label}
        </ToggleButton>
    }
    // add 'Neither' button to buttons array
    buttons[buttons.length] = 
      <ToggleButton 
        className="na-btn" 
        variant="outline-dark" 
        value="neither"
      >
        Neither of both
      </ToggleButton>
  }

  // create (and update) HTML code recording deviating expert labels 
  // display only if 'Neither' button is selected and there are more than one available categories
  if (
    theseCats.length > 1 &&
    (
      props.state === "neither" && uniqueLabels.length > 1 
      || 
      props.state === "disagrees" && uniqueLabels.length === 1)
  ) {
    
    var expertRating = [
      <hr></hr>,
      <p><b>Please indicate what you think is the correct label.</b></p>,
      <center>
      <ToggleButtonGroup 
        size="sm"
        type="radio" 
        name="task1_expert" 
        onChange={props.labelHandler}
      >
        {
          theseCats.map(
            cat => (
              <ToggleButton variant="outline-dark" value={`${cat.toLowerCase().replace(/\s/g, "-")}`}>{cat}</ToggleButton>
            ),
          )
        }
      </ToggleButtonGroup>
      </center>
    ];
  } else {
    var expertRating = [];
  };
  
  if (uniqueLabels.length > 1) {
    var tabPane = (
      <div>
        <p>The two groups disagree.</p>
        <p><b>Please compare the two labels below. Which one is correct (if any)?</b></p>
        <center>
        <ToggleButtonGroup 
          // style={{marginBottom: '18px',}}
          type="radio" 
          name={props.task}
          onChange={props.reviewHandler}
        >
          {buttons}
        </ToggleButtonGroup>
        </center>
        {expertRating}
      </div>
    );
  } else {
    var tabPane = (
      <div>
        <p>Both groups agree in saying that the correct answer to this question is <b>&lsquo;{uniqueLabels[0]}&rsquo;</b>.</p>
        <p><b>Do you agree or disagree with this judgment?</b></p>
        <center>
        <ToggleButtonGroup 
          type="radio" 
          name={props.task}
          onChange={props.reviewHandler}
        >
          {buttons}
        </ToggleButtonGroup>
        </center>
        {expertRating}
      </div>
    );
  }
  // return the complete HTML code
  return (
    <Tab.Pane eventKey={props.task}>
      <div className="tab-pane-inner">
        <p>Given the post above, two groups of coders were asked to answer the following question: <em><b>{props.taskText}</b></em></p>
        {tabPane}
      </div>
    </Tab.Pane>
  );
}

// main App
class App extends Component {
  // constructor
  constructor(props) {
    super(props);

    // initialize state object
    this.state = {
       metadata: metaData,
       task1: null, 
       task1_expert: null,
       task2: null, 
       task2_expert: null,
       task3: null, 
       task3_expert: null,
       note: null,
    };

    // bind review handlers
    this.handleInputChangeTask1 = this.handleInputChangeTask1.bind(this);
    this.handleInputChangeTask2 = this.handleInputChangeTask2.bind(this);
    this.handleInputChangeTask3 = this.handleInputChangeTask3.bind(this);

    // bind expert label handlers
    this.handleInputChangeTask1Expert = this.handleInputChangeTask1Expert.bind(this);
    this.handleInputChangeTask2Expert = this.handleInputChangeTask2Expert.bind(this);
    this.handleInputChangeTask3Expert = this.handleInputChangeTask3Expert.bind(this);
  }

  // review handlers
  handleInputChangeTask1(val) { this.setState({task1: val, task1_expert: null}); }
  handleInputChangeTask2(val) { this.setState({task2: val, task2_expert: null}); }
  handleInputChangeTask3(val) { this.setState({task3: val, task3_expert: null}); }

  // expert label handlers
  handleInputChangeTask1Expert(val) { this.setState({task1_expert: val}); }
  handleInputChangeTask2Expert(val) { this.setState({task2_expert: val}); }
  handleInputChangeTask3Expert(val) { this.setState({task3_expert: val}); }
  
  // notes/comments handler
  handleNotes = e => { this.setState({ notes: e.target.value }); }

  // render App
  render() {
    return (
      <div style={{ padding: 10, fontFamily: 'sans-serif' }}>
        <Row>
        <Col sm={4}>
          <Accordion defaultActiveKey="0">
            <Card>
              <Card.Header>
                <Accordion.Toggle as={"h4"} eventKey="0">
                  {allInstructions.querySelector("#task_description").querySelector("h5").innerText.trim()}
                </Accordion.Toggle>
              </Card.Header>
              <Accordion.Collapse eventKey="0">
                <Card.Body>
                  <Card.Text>
                    {ReactHtmlParser(allInstructions.querySelector("#task_description").querySelector("content").innerHTML)}
                  </Card.Text>
                </Card.Body>
              </Accordion.Collapse>
            </Card>
            <Card>
              <Card.Header>
                <Accordion.Toggle as={"h4"} eventKey="2">
                  {allInstructions.querySelector("#task_instructions").querySelector("h5").innerText.trim()}
                </Accordion.Toggle>
              </Card.Header>
              <Accordion.Collapse eventKey="2">
                <Card.Body>
                  <Card.Text>
                    {ReactHtmlParser(allInstructions.querySelector("#task_instructions").querySelector("content").innerHTML)}
                    <ul>{examples}</ul>
                  </Card.Text>
                </Card.Body>
              </Accordion.Collapse>
            </Card>
            <Card>
              <Card.Header>
                <Accordion.Toggle as={"h4"} eventKey="1">
                  {allInstructions.querySelector("#task_background").querySelector("h5").innerText.trim()}
                </Accordion.Toggle>
              </Card.Header>
              <Accordion.Collapse eventKey="1">
                <Card.Body>
                  <Card.Text>
                    {ReactHtmlParser(allInstructions.querySelector("#task_background").querySelector("content").innerHTML)}
                  </Card.Text>
                </Card.Body>
              </Accordion.Collapse>
            </Card>
          </Accordion>
        </Col>
        <Col sm={8}>
        <Card>
          <Card.Header as="h4">The post</Card.Header>
          <Card.Body>
            <blockquote>
              <p className="blockquote-text">{tweetLines}</p>
              <footer className="blockquote-footer">
                Posted on <cite>Twitter</cite>
              </footer>
            </blockquote>
          <hr></hr>
          <textarea
              className="form-control"
              rows="2"
              cols="80%"
              onChange={this.handleNotes}
              defaultValue=""
              name="notes" 
              maxLength="500"
              placeholder="Please enter any comments you have regarding the post here"
            >
            </textarea>
          </Card.Body>
        </Card>
        <Card>
          <Card.Header as="h4">Label Review</Card.Header>
          <Card.Body>
            <Tab.Container id="task-tabs" defaultActiveKey="task1">
              <Nav fill variant="pills">
                <Nav.Item><Nav.Link eventKey="task1">Question 1</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link eventKey="task2">Question 2</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link eventKey="task3">Question 3</Nav.Link></Nav.Item>
              </Nav>
              <hr style={{marginTop: "0px",}}></hr>
              <Tab.Content>
                <TaskTab 
                  task="task1" 
                  taskText={tasksText.querySelector("#task1").innerText.trim()}
                  reviewHandler={this.handleInputChangeTask1}
                  labelHandler={this.handleInputChangeTask1Expert}
                  state={this.state.task1}
                />
                <TaskTab 
                  task="task2" 
                  taskText={tasksText.querySelector("#task2").innerText.trim()}
                  reviewHandler={this.handleInputChangeTask2}
                  labelHandler={this.handleInputChangeTask2Expert}
                  state={this.state.task2}
                />
                <TaskTab 
                  task="task3" 
                  taskText={tasksText.querySelector("#task3").innerText.trim()}
                  reviewHandler={this.handleInputChangeTask3}
                  labelHandler={this.handleInputChangeTask3Expert}
                  state={this.state.task3}
                />
              </Tab.Content>
            </Tab.Container>
          </Card.Body>
        </Card>
        <pre hidden>{JSON.stringify(this.state, null, 2)}</pre>
        </Col>
        </Row>
      </div>
    )
  }
}

export default App;
