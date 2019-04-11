"use-strict";

var log = console.log;

class SortingAlgorithms {
  constructor() {
    this.algorithms = {
      "Bubble": {
        bubble: function*(arr) {
          let temp;
          for (let x = 0; x < arr.length - 1 ; x++) {
            for (let y = 0; y < arr.length - x - 1; y++) {
              if (arr[y] > arr[y + 1]) {
                temp = arr[y];
                arr[y] = arr[y + 1];
                arr[y + 1] = temp;
              }
              yield [arr, y, y+1];
            }
          }
        }},
      "Simple": {
        // credit: https://www.geeksforgeeks.org/insertion-sort/
        insertion: function*(arr) {
          let key, j;
          for (let i = 1; i < arr.length; i++) {
            key = arr[i];
            j = i -1;

            while (j >= 0 && arr[j] > key) { 
              arr[j + 1] = arr[j]; 
              j = j - 1; 
              yield [arr, j, j+1];
              // yield [arr, j+1, j];
            } 
            arr[j + 1] = key; 
            
            yield [arr, j, j+1];
            // yield [arr, j+1, j];
          }
        },
        // selection() {}
      },
      "Eficient": {
        // merge() {},
        // credit: https://www.w3resource.com/javascript-exercises/searching-and-sorting-algorithm/searching-and-sorting-algorithm-exercise-3.php
        heap: function*(input) {

          var array_length = input.length;
          let values; // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

          function swap(input, index_A, index_B) {
            var temp = input[index_A];
        
            input[index_A] = input[index_B];
            input[index_B] = temp;

            return [input, index_A, index_B]; // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
          }
          function heap_root(input, i) {
            var left = 2 * i + 1;
            var right = 2 * i + 2;
            var max = i;
            let values;  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

            if (left < array_length && input[left] > input[max]) {
              max = left;
            }

            if (right < array_length && input[right] > input[max]){
              max = right;
            }

            if (max != i) {
              values = swap(input, i, max);  // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
              heap_root(input, max);
            }
            
            
            if (values) {return values;} // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
          }



          for (var i = Math.floor(array_length / 2); i >= 0; i -= 1) {
              values = heap_root(input, i); // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
              if (values) {yield values;} // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
            }
      
          for (i = input.length - 1; i > 0; i--) {
            yield swap(input, 0, i);
            array_length--;
          
          
            values = heap_root(input, 0); // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
            if (values) {yield values;} // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
            
          }
        },
        // quick() {}
      }
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
    this.barFullWidth = undefined;
    this.barPreviousRed = undefined;

    // Options
    this.activeAlgorithm = undefined;
    this.arrLength = undefined;
    this.arrMaxValue = undefined;
    this.speed = undefined;

    // Constants
    this.ARR_LENGTH_MIM = 2;
    this.ARR_LENGTH_MAX = parseInt(this.elemVisualizer.width / 3.3);
    this.ARR_LENGTH_DEFAULT = this.ARR_LENGTH_MAX;
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
  // enforceValue(e, min, max) {
  //   let value = parseInt(e.target.value);
  //   if (!Number.isInteger(value)) {
  //     e.target.value = min;
  //   }
  //   else if (value < min) {
  //     e.target.value = min;
  //   }
  //   else if (value > max) {
  //     e.target.value = max;
  //   }
  // }

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
  getGenerator() {
    this.arrGenerator = this.algorithms[this.activeAlgorithm[0]][this.activeAlgorithm[1]](this.array);
  }
  drawLine(index, removeLine, marked, value=this.array[index]) {
    let lineYEnd;
    let increment = parseInt(index) + 1;

    if (removeLine) {
      this.canvasCtx.strokeStyle = "white";
      this.canvasCtx.lineWidth = this.barFullWidth;
      
      lineYEnd = 0;
    } else {
      this.canvasCtx.strokeStyle = "black";
      this.canvasCtx.lineWidth = this.barFullWidth / 2;

      lineYEnd = Math.ceil( this.elemVisualizer.height - (this.elemVisualizer.height * value / this.canvasArrMaxValue) );
    }
    if (marked) {this.canvasCtx.strokeStyle = "red";}

    this.canvasCtx.beginPath();
    this.canvasCtx.moveTo(increment * this.barFullWidth - this.barFullWidth/2, this.elemVisualizer.height);
    this.canvasCtx.lineTo(increment * this.barFullWidth - this.barFullWidth/2, lineYEnd);
    this.canvasCtx.stroke();
  }
  // Changes bar color from marked to default
  unmarkBar() {
    if (this.barPreviousRed) {
      this.drawLine(this.barPreviousRed[1], true, false,  this.barPreviousRed[0]);
      this.drawLine(this.barPreviousRed[1], false, false, this.barPreviousRed[0]);
      this.barPreviousRed = undefined;
    }
  }
  drawCanvas() {
    // Calculates line width
    this.barFullWidth = this.elemVisualizer.width / this.array.length;

    // Gets max value of array, for line height calculations
    this.canvasArrMaxValue = Math.max(...this.array);

    // Clear background
    this.canvasCtx.fillStyle = "white";
    this.canvasCtx.fillRect(0, 0, this.elemVisualizer.width, this.elemVisualizer.height);

    // Draw lines
    for (let n in this.array) {
      this.drawLine(n, false, false);
    }
  }
  updateCanvas(genValues) {
    // Delete previous red
    // Redraw previous red as black
    this.unmarkBar();

    // Delete swapped bars
    this.drawLine(genValues[1], true, false);
    this.drawLine(genValues[2], true, false);

    // Draw swapped bars
    this.drawLine(genValues[1], false, false);
    this.drawLine(genValues[2], false, true);

    // Save red bar value and index for changing color back to black on next cycle
    this.barPreviousRed = [this.array[genValues[2]], genValues[2]];
  }
  updateStateInHTML() {this.elemState.innerText = this.appState;}
  visualizerLoop() {
    let genValues = this.arrGenerator.next().value;
    if (genValues) {
      this.array = genValues[0];
      this.elemCycle.innerText = parseInt(this.elemCycle.innerText) + 1;
      // this.drawCanvas();
      this.updateCanvas(genValues);
    } else {
      this.appState = "finished";
      this.unmarkBar();
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
    this.unmarkBar();
    this.elemCycle.innerText = 0;
    this.appState = "reset";
    this.updateStateInHTML();
    this.getOptions();
    this.generateArray();
    this.getGenerator();
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
    this.elemAlgorythmList.addEventListener("input", () => {
      this.getOptions();
      if (this.appState == "finished" || this.appState == "reset") {
        this.getGenerator();
      }    
    });
    this.elemArrayLen.addEventListener("mouseup", () => {
      if (this.appState == "finished" || this.appState == "reset") {
        this.ApplyAndReset();
      }
    });
    this.elemMaxVal.addEventListener("mouseup", () => {
      if (this.appState == "finished" || this.appState == "reset") {
        this.ApplyAndReset();
      }
    });
    this.elemSpeed.addEventListener("input", (e) => {
      this.speed = e.target.value;
      if (this.appState == "running") {
        clearInterval(this.appInterval);
        this.setAppInterval();
      }
    });

    // Add event listeners for button elements
    this.elemBtnApplyAndReset.addEventListener("click", this.ApplyAndReset.bind(this));
    this.elemBtnSartStop.addEventListener("click", this.StartStop.bind(this));

    this.ApplyAndReset();
  }
}

var test = new SortingVisualizer();
