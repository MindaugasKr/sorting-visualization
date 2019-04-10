"use-strict";

var log = console.log;

class SortingAlgorithms {
  constructor() {
    this.algorithms = {
      "Bubble": {bubble: function*(arr) {
        let temp;
        for (let x = 0; x < arr.length - 1 ; x++) {
          for (let y = 0; y < arr.length - x - 1; y++) {
            if (arr[y] > arr[y + 1]) {
              temp = arr[y];
              arr[y] = arr[y + 1];
              arr[y + 1] = temp;
            }
            yield arr;
          }
        }
      }},
      "Simple": {insertions() {}, selection() {}},
      "Eficient": {merge() {}, heap() {}, quick() {}}
    }
  }
}

class SortingVisualizer extends SortingAlgorithms {
  constructor(elemNameState = ".state-name-js",
              elemNameCycle = ".cycle-no-js",
              elemNameVisualizer = ".visualizer",

              elemNameAlgorythmList = ".options__algorythm-js",
              elemNameArrayLen = ".options__array-length-js",
              elemNameMaxVal = ".options__max-value-js",
              elemNameSpeed = ".options__speed-js",
              
              elemNameBtnSartStop = ".btn-start-stop-js",
              elemNameBtnApplyAndReset = ".btn-apply-changes-js") {
    super();

    // DOM elements
    this.elemState = document.querySelector(elemNameState);
    this.elemCycle = document.querySelector(elemNameCycle);

    this.elemVisualizer = document.querySelector(elemNameVisualizer);

    this.elemAlgorythmList = document.querySelector(elemNameAlgorythmList);
    this.elemArrayLen = document.querySelector(elemNameArrayLen);
    this.elemMaxVal = document.querySelector(elemNameMaxVal);
    this.elemSpeed = document.querySelector(elemNameSpeed);

    this.elemBtnSartStop = document.querySelector(elemNameBtnSartStop);
    this.elemBtnApplyAndReset = document.querySelector(elemNameBtnApplyAndReset);


    // App variables
    this.array = undefined;
    this.appState = undefined; // possible states: "running", "finished", "paused", "reset". Used to make in function decisions and to inform user of what is happening;
    this.arrGenerator = undefined;
    this.appInterval = undefined;

    // Options
    this.activeAlgorithm = undefined;
    this.arrLength = undefined;
    this.arrMaxValue = undefined;
    this.speed = undefined;

    // Constants
    this.ARR_LENGTH_MIM = 2;
    this.ARR_LENGTH_MAX = this.elemVisualizer.width; // with max elements bar width is 1px;
    this.ARR_LENGTH_DEFAULT = this.elemVisualizer.width;
    //
    this.SPEED_MIN = 1;
    this.SPEED_MAX = 1000;
    this.SPEED_DEFAULT = 1000;
    //
    this.ARR_MAX_VALUE_MIN = 2;
    this.ARR_MAX_VALUE_MAX = 1000; 
    this.ARR_MAX_VALUE_DEFAULT = 100; 

    // Canvas variables
    this.canvasCtx = this.elemVisualizer.getContext('2d', { alpha: false });
    this.canvasLineWidth = undefined;
    this.canvasArrMaxValue = undefined;
 

    this.__init__();
  }

  // for initialization
  populateAlgorithmList() {
    /** 
     * Loops over sorting algorithms.
     * Builds select drop down list.
     */
    for (let algGroup in this.algorithms) {

      let optGroup = document.createElement("optgroup");
      optGroup.label = algGroup;

      for (let alg in this.algorithms[algGroup]) {

        let option = document.createElement("option");
        option.innerText = this.algorithms[algGroup][alg].name;
        option.value = `${algGroup},${alg}`;

        optGroup.appendChild(option);
      }

      this.elemAlgorythmList.appendChild(optGroup);
    }
  }


  // Check if values are within bounds
  // Used through event listener
  enforceValue(e, min, max) {
    let value = parseInt(e.target.value);
    if (!Number.isInteger(value)) {
      e.target.value = min;
    }
    else if (value < min) {
      e.target.value = min;
    }
    else if (value > max) {
      e.target.value = max;
    }
  }

  // used by other methods
  getOptions() {
    this.activeAlgorithm = this.elemAlgorythmList.value.split(",");
    this.arrLength = this.elemArrayLen.value;
    this.arrMaxValue = this.elemMaxVal.value;
    this.speed = this.elemSpeed.value;
  }
  generateArray() {
    this.array = new Array(parseInt(this.arrLength))
      .fill(this.arrMaxValue)
      .map( num => Math.ceil(Math.random()*num) );
  }
  drawCanvas() {
    let canvasLineWidth, canvasLineWidthHalf, lineYEnd;

    // Calculates line width
    canvasLineWidth = Math.floor( this.elemVisualizer.width / this.array.length );
    if (canvasLineWidth < 1) { canvasLineWidth = 1;}
    // Calculate half of canvasLineWidth, for loop calculations
    canvasLineWidthHalf = Math.floor(canvasLineWidth / 2);

    // Gets max value of array, for line height calculations
    this.canvasArrMaxValue = Math.max(...this.array);

    // Canvas setup
    this.canvasCtx.fillStyle = "white";
    this.canvasCtx.fillRect(0, 0, this.elemVisualizer.width, this.elemVisualizer.height);
    //
    this.canvasCtx.fillStyle = "black";
    this.canvasCtx.lineWidth = canvasLineWidth;

    // Draw lines
    for (let n in this.array) {
      this.canvasCtx.beginPath();
      this.canvasCtx.moveTo(n*canvasLineWidth + canvasLineWidthHalf, this.elemVisualizer.height);
      lineYEnd = Math.ceil( this.elemVisualizer.height - (this.elemVisualizer.height * this.array[n] / this.canvasArrMaxValue) );
      this.canvasCtx.lineTo(n*canvasLineWidth + canvasLineWidthHalf, lineYEnd);
      this.canvasCtx.stroke();
    }
  }
  updateCanvas() {}
  updateStateInHTML() {this.elemState.innerText = this.appState;}
  visualizerLoop() {
    this.array = this.arrGenerator.next().value;
    if (this.array) {
      this.elemCycle.innerText = parseInt(this.elemCycle.innerText) + 1;
      this.drawCanvas();
    } else {
      this.appState = "finished";
      this.updateStateInHTML();
      clearInterval(this.appInterval);
    }
  }
  setAppInterval() {
    this.appInterval = setInterval(this.visualizerLoop.bind(this), 1000/this.speed);
  }

  // Start / stop
  startApp() {
    if (this.appState == "finished") {
      this.ApplyAndReset();
    }
    // will run on states finished, paused, reset
    this.appState = "running";
    this.updateStateInHTML();
    this.setAppInterval();
  }
  stopApp() {
    this.appState = "paused";
    this.updateStateInHTML();
    clearInterval(this.appInterval);
  }

  // in app button functionality
  StartStop() {
    if (this.appState == "running") {
      this.stopApp();
    // on states paused, reset, finished
    } else {
      this.startApp();
    }
   
  }
  ApplyAndReset() {
    if (this.appState == "running") {
      this.stopApp()}
    this.elemCycle.innerText = 0;
    this.appState = "reset";
    this.updateStateInHTML();
    this.getOptions();
    this.generateArray();
    this.arrGenerator = this.algorithms[this.activeAlgorithm[0]][this.activeAlgorithm[1]](this.array);
    this.drawCanvas();
  }

  __init__() {
    this.populateAlgorithmList();

    // Set input min, max, values.
    this.elemArrayLen.min = this.ARR_LENGTH_MIM;
    this.elemArrayLen.max = this.ARR_LENGTH_MAX;
    this.elemArrayLen.value = this.ARR_LENGTH_DEFAULT;
    //
    this.elemMaxVal.min = this.ARR_MAX_VALUE_MIN;
    this.elemMaxVal.max = this.ARR_MAX_VALUE_MAX;
    this.elemMaxVal.value = this.ARR_MAX_VALUE_DEFAULT;
    //
    this.elemSpeed.min =  this.SPEED_MIN;
    this.elemSpeed.max = this.SPEED_MAX;
    this.elemSpeed.value = this.SPEED_DEFAULT;

    // Add event listeners for input elements
    this.elemSpeed.addEventListener("input", (e) => {
      this.speed = e.target.value;
      clearInterval(this.appInterval);
      this.setAppInterval();
    } );

    // Add event listeners for button elements
    this.elemBtnApplyAndReset.addEventListener("click", this.ApplyAndReset.bind(this));
    this.elemBtnSartStop.addEventListener("click", this.StartStop.bind(this));

    this.ApplyAndReset();
  }
}

var test = new SortingVisualizer();
