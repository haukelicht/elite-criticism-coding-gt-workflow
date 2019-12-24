import React, { Component , useState } from 'react';

import ToggleButton from 'react-bootstrap/ToggleButton'
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup'
import Button from 'react-bootstrap/Button'


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

export default TaskTab;