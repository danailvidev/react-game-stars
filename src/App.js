import React, { Component } from 'react';
import * as _ from 'lodash';
import './App.css';

const Stars = (props) => {
    return (
      <div className="col-5">
        {_.range(props.numberOfStars).map(i => 
          <i key={i} className="fa fa-star"></i>
        )}
      </div>
    )
  }
  
const Button = (props) => {
  let button;
  switch(props.answerIsCorrect) {
    case true:
      button = <button className="btn btn-success" onClick={props.acceptAnswer}><i className="fa fa-check"></i></button>
    break;
    case false:
      button = <button className="btn btn-danger"><i className="fa fa-times"></i></button>
    break;
    default:
      button = <button className="btn" onClick={() => {props.checkAnswer(); props.startTimer()}} disabled={props.selectedNumbers.length === 0}>=</button>
    break;
  };

  return (
    <div className="col-2 text-center mt-2">
        {button}
      <div>
        <button className="btn btn-warning btn-sm mt-2" onClick={props.redraw} title="Refresh stars" disabled={props.redraws === 0}>
          <i className="fa fa-refresh"></i>  {props.redraws}
        </button>
      </div>
    </div>
  )
}
  
const Answer = (props) => {
  return (
    <div className="col-5">
      {props.selectedNumbers.map((number,i) => 
      <span key={i} onClick={() => props.unselectNumber(number)}> {number} </span>
    )}
    </div>
  )
}
  
const Numbers = (props) => {
  const numberClassName = (number) => {
    if (props.usedNumbers.indexOf(number) >= 0) {
      return 'used'
    }
    if (props.selectedNumbers.indexOf(number) >= 0) {
      return 'selected'
    }
  };
  return (
    <div className="card text-center">
      <div>
        {Numbers.list.map((number, i) => 
          <span key={i} className={numberClassName(number)} onClick={() => props.selectNumber(number)}>{number}</span>
        )}
      </div>
    </div>
  )
}
Numbers.list = _.range(1,10);

const DoneFrame = (props) => {
  return (
    <div className="text-center ">
      <h2>{props.doneStatus}</h2>
      <button className="btn btn-secondary" onClick={props.resetGame}>Play Again</button>
    </div>
  )
}

const Timer = (props) => {
  return (
    <div className="text-center" hidden={props.timeLeft < 1 }>Time Left: {props.timeLeft}</div>
  )
}
  
class Game extends Component {
  static randomNumber = () => Math.floor(Math.random()*9) + 1;
  static initialState = () => ({
    selectedNumbers: [],
    randomNumberOfStars: Game.randomNumber(),
    answerIsCorrect: null,
    usedNumbers: [],
    redraws: 5,
    doneStatus: null,
    timeLeft: 60,
    interval: null
  });
  state = Game.initialState();

  selectNumber = (clickedNumber) => {
    if (this.state.selectedNumbers.indexOf(clickedNumber) >= 0 || this.state.usedNumbers.indexOf(clickedNumber) >= 0) {
      return;
    }
    this.setState(prevState => ({
      answerIsCorrect: null,
      selectedNumbers: prevState.selectedNumbers.concat(clickedNumber)
    }))
  };

  unselectNumber = (clickedNumber) => {
    this.setState(prevState => ({
      answerIsCorrect: null,
      selectedNumbers: prevState.selectedNumbers.filter(number => number !== clickedNumber)
    }));
  };

  checkAnswer = () => {
    this.setState(prevState => ({
      answerIsCorrect: prevState.randomNumberOfStars === prevState.selectedNumbers.reduce((acc, n) => acc + n, 0)
    }))
  };

  acceptAnswer = () => {
    this.setState(prevState => ({
      usedNumbers: prevState.usedNumbers.concat(prevState.selectedNumbers),
      selectedNumbers: [],
      answerIsCorrect: null,
      randomNumberOfStars: Game.randomNumber()
    }), this.updateDoneStatus)
  };

  redraw = () => {
    if (this.state.redraws === 0) {
      return;
    }
    this.setState(prevState => ({
      randomNumberOfStars: Game.randomNumber(),
      selectedNumbers: [],
      answerIsCorrect: null,
      redraws: prevState.redraws - 1
    }), this.updateDoneStatus)
  };

  possibleSolutions = ({randomNumberOfStars, usedNumbers}) => {
    const possibleNumbers = _.range(1,10).filter(number => usedNumbers.indexOf(number) === -1);
    return this.possibleCombinationSum(possibleNumbers, randomNumberOfStars);
  };

  possibleCombinationSum = (arr, n) => {
    if (arr.indexOf(n) >= 0) { return true; }
    if (arr[0] > n) { return false; }
    if (arr[arr.length - 1] > n) {
      arr.pop();
      return this.possibleCombinationSum(arr, n);
    }
    var listSize = arr.length, combinationsCount = (1 << listSize)
    for (var i = 1; i < combinationsCount ; i++ ) {
      var combinationSum = 0;
      for (var j=0 ; j < listSize ; j++) {
        if (i & (1 << j)) { combinationSum += arr[j]; }
      }
      if (n === combinationSum) { return true; }
    }
    return false;
  };

  updateDoneStatus = () => {
    this.setState(prevState => {
      if (prevState.usedNumbers.length === 9) {
        return { doneStatus: 'Done! You Won!'}
      }
      if (prevState.redraws === 0 && !this.possibleSolutions(prevState)) {
        return { doneStatus: 'Game Over! ;('}
      }
    })
  };

  resetGame = () => this.setState(Game.initialState());

  startTimer = () => {
    this.setState({interval: setInterval( this.tick, 1000 )})
  };

  tick = () => {
    const { timeLeft, interval } = this.state
    console.log(timeLeft);
    if (timeLeft < 1) {
      this.setState({
        doneStatus: 'Time Left ;(',
        interval: clearInterval(interval)
      })
    } else {
      this.setState({timeLeft:  timeLeft - 1 })
    }
  }

  render() {
    const { selectedNumbers, randomNumberOfStars, answerIsCorrect, usedNumbers, redraws, doneStatus, timeLeft} = this.state;
    return (
        <div  className="container">
          <h3>Play Nine</h3>
          <hr/>
          <div className="row">
            <Stars numberOfStars={randomNumberOfStars} />
            <Button 
              selectedNumbers={selectedNumbers} 
              checkAnswer={this.checkAnswer} 
              answerIsCorrect={answerIsCorrect}
              acceptAnswer={this.acceptAnswer}
              redraw={this.redraw}
              redraws={redraws}
              startTimer={this.startTimer}
            />
            <Answer selectedNumbers={selectedNumbers} unselectNumber={this.unselectNumber} />
          </div>
          <br />
          { doneStatus 
          ? <DoneFrame doneStatus={doneStatus} resetGame={this.resetGame}/> 
          : <Numbers selectedNumbers={selectedNumbers} selectNumber={this.selectNumber} usedNumbers={usedNumbers}/>
          }
          <Timer timeLeft={timeLeft}/>
        </div>
      )
    }
}

class App extends Component {
  render() {
    return (
        <div>
          <Game />
        </div>
      )
    }
}

export default App;
