import {sortingAlgorithms} from './sortingAlgorythms.js';

"use-strict";


// var log = console.log;


class SortingVisualizer {
  constructor() {
    this.App();
  }

  settings(visualizer) {
    const settingsOb = {
      // App variables
      array: undefined,
      appState: undefined, // possible states: "running", "finished", "paused", "reset". Used to make in function decisions and to inform user of what is happening;
      arrGenerator: undefined,
      appInterval: undefined,
      //
      // Options
      activeAlgorithm: undefined,
      arrLength: undefined,
      arrMaxValue: undefined,
      speed: undefined,
      //
      // Constants
      ARR_LENGTH_MIM: 2,
      ARR_LENGTH_MAX: parseInt(visualizer.width / 3.3),
      ARR_LENGTH_DEFAULT: undefined,
      //
      SPEED_MIN: 1,
      SPEED_MAX: 60,
      SPEED_DEFAULT: undefined,
      //
      ARR_MAX_VALUE_MIN: 2,
      ARR_MAX_VALUE_MAX: 1000, 
      ARR_MAX_VALUE_DEFAULT: undefined, 
      //
      // Canvas variables
      canvasCtx:visualizer.getContext('2d', { alpha: false }),
      canvasLineWidth: undefined,
      canvasArrMaxValue: undefined,
      barFullWidth: undefined,
      barPreviousRed: undefined,
      canvasColorBackground: "rgb(75, 75, 75)",
      canvasColorBar: "orange",
      canvasColorBarMarked: "rgb(0, 232, 255)",

      setOptions: function(options) {
        this.activeAlgorithm = options.activeAlgorithm;
        this.arrLength = options.arrLength;
        this.arrMaxValue = options.arrMaxValue;
        this.speed = options.speed;
      },

      setCanvasVariables: function() {
        // Calculates line width
        this.barFullWidth = visualizer.width / this.array.length;
    
        // Gets max value of array, for line height calculations
        this.canvasArrMaxValue = Math.max(...this.array);
      }
    }
    settingsOb.ARR_LENGTH_DEFAULT = settingsOb.ARR_LENGTH_MAX;
    settingsOb.SPEED_DEFAULT = settingsOb.SPEED_MAX;
    settingsOb.ARR_MAX_VALUE_DEFAULT = settingsOb.ARR_MAX_VALUE_MAX;

    return settingsOb;
  }

  UIcontroller() {

    // === PRIVATE ===
    // 
    // 
    // 
    // 
    function recalcToExp(value, min, max) {
      // convert linear range to exponential
      // https://stackoverflow.com/questions/846221/logarithmic-slider
      
      let minLog, maxLog, scale, expValue;
      minLog = Math.log(min);
      maxLog = Math.log(max);
  
      scale = (maxLog - minLog) / (max - min);
  
      expValue = Math.ceil(Math.exp( (value - min) * scale + minLog ));
      return expValue;
    }




    // === PUBLICK ===
    //
    //
    //
    //
    let elements = {
      state: document.querySelector('.state-name-js'),
      cycle: document.querySelector('.cycle-no-js'),

      visualizer: document.querySelector('.visualizer'),

      optionsContainer: document.querySelector('.options-ontainer-js'),

      algorythmList: document.querySelector('.options__algorythm-js'),
      arrayLen: document.querySelector('.options__array-length-js'),
      maxVal: document.querySelector('.options__max-value-js'),
      speed: document.querySelector('.options__speed-js'),

      btnSartStop: document.querySelector('.btn-start-stop-js'),
      btnApplyAndReset: document.querySelector('.btn-apply-changes-js'),
      
      curValArrLen: document.querySelector('.options__current-value-arr-len-js'),
      curValMaxVal: document.querySelector('.options__current-value-max-val-js'),
      curValSpeed: document.querySelector('.options__current-value-speed-js')
    }

    function populateAlgorithmList(algorithms, algorythmList) {
      /** 
       * Loops over sorting algorithms.
       * Builds select drop down list.
       */
      for (let algGroup in algorithms) {
      
        let optGroup = document.createElement("optgroup");
        optGroup.label = algGroup;
  
        for (let alg in algorithms[algGroup]) {
        
          let option = document.createElement("option");
          option.innerText = alg; //algorithms[algGroup][alg].name;
          option.value = `${algGroup},${alg}`;
  
          optGroup.appendChild(option);
        }
  
        algorythmList.appendChild(optGroup);
      }
    }

    function getOptions(settings) {
      return {
        activeAlgorithm: elements.algorythmList.value.split(","),
        arrLength: elements.arrayLen.value,
        arrMaxValue: recalcToExp(elements.maxVal.value, settings.ARR_MAX_VALUE_MIN, settings.ARR_MAX_VALUE_MAX),
        speed: recalcToExp(elements.speed.value, settings.SPEED_MIN, settings.SPEED_MAX)
      }
    }

    function setupOptionElements(settings) {
      elements.arrayLen.min = settings.ARR_LENGTH_MIM;
      elements.arrayLen.max = settings.ARR_LENGTH_MAX;
      elements.arrayLen.value = settings.ARR_LENGTH_DEFAULT;
      //
      elements.maxVal.min = settings.ARR_MAX_VALUE_MIN;
      elements.maxVal.max = settings.ARR_MAX_VALUE_MAX;
      elements.maxVal.value = settings.ARR_MAX_VALUE_DEFAULT;
      //
      elements.speed.min =  settings.SPEED_MIN;
      elements.speed.max = settings.SPEED_MAX;
      elements.speed.value = settings.SPEED_DEFAULT;
    }

    function updateCurValueDisplayElements(settings) {
      elements.curValArrLen.innerText = elements.arrayLen.value;
      elements.curValMaxVal.innerText = recalcToExp(elements.maxVal.value, settings.ARR_MAX_VALUE_MIN, settings.ARR_MAX_VALUE_MAX);
      elements.curValSpeed.innerText = `${parseInt(1000 / recalcToExp(elements.speed.value, settings.SPEED_MIN, settings.SPEED_MAX))} ms`
    }

    function updateStateInHTML(state) {elements.state.innerText = state;}

    function startBtnRenameToStart() {elements.btnSartStop.textContent = 'Start';}
    function startBtnRenameToPause() {elements.btnSartStop.textContent = 'Pause';}

    return {
      elements,
      populateAlgorithmList,
      getOptions,
      setupOptionElements,
      updateCurValueDisplayElements,
      updateStateInHTML,
      startBtnRenameToStart,
      startBtnRenameToPause
    }
  }

  canvasController(settings, visualizer) {

    // === PRIVATE ===
    // 
    // 
    // 
    // 
    function drawLine(index, removeLine, marked, value = settings.array[index]) {
      let lineYEnd;
      let increment = parseInt(index) + 1;
  
      if (removeLine) {
        settings.canvasCtx.strokeStyle = settings.canvasColorBackground;
        settings.canvasCtx.lineWidth = settings.barFullWidth;
        
        lineYEnd = 0;
      } else {
        if (marked) {
          settings.canvasCtx.strokeStyle = settings.canvasColorBarMarked;
        } else {
          settings.canvasCtx.strokeStyle = settings.canvasColorBar;
        }
        settings.canvasCtx.lineWidth = settings.barFullWidth / 2;
  
        lineYEnd = Math.ceil( visualizer.height - (visualizer.height * value / settings.canvasArrMaxValue) );
      }
      
      settings.canvasCtx.beginPath();
      settings.canvasCtx.moveTo(increment * settings.barFullWidth - settings.barFullWidth/2, visualizer.height);
      settings.canvasCtx.lineTo(increment * settings.barFullWidth - settings.barFullWidth/2, lineYEnd);
      settings.canvasCtx.stroke();
    }






    // === PUBLICK ===
    //
    //
    //
    //
    function drawCanvas() {

      // Clear background
      settings.canvasCtx.fillStyle = settings.canvasColorBackground;
      settings.canvasCtx.fillRect(0, 0, visualizer.width, visualizer.height);
  
      // Draw lines
      for (let n in settings.array) {
        drawLine(n, false, false);
      }
    }

    function updateCanvas(genValues) {
      // Delete previous red
      // Redraw previous red as black
      unmarkBar();
  
      // Delete swapped bars
      drawLine(genValues[1], true, false);
      drawLine(genValues[2], true, false);
  
      // Draw swapped bars
      drawLine(genValues[1], false, true);
      drawLine(genValues[2], false, true);
  
      // Save red bar value and index for changing color back to black on next cycle
      settings.barPreviousRed = [[settings.array[genValues[2]], genValues[2]], [settings.array[genValues[1]], genValues[1]]];
    }

    // Changes bar color from marked to default
    function unmarkBar() {
      if (settings.barPreviousRed) {
        //log(this.barPreviousRed);
        drawLine(settings.barPreviousRed[0][1], true, false,  settings.barPreviousRed[0][0]);
        drawLine(settings.barPreviousRed[0][1], false, false, settings.barPreviousRed[0][0]);
        drawLine(settings.barPreviousRed[1][1], true, false,  settings.barPreviousRed[1][0]);
        drawLine(settings.barPreviousRed[1][1], false, false, settings.barPreviousRed[1][0]);
        settings.barPreviousRed = undefined;
      }
    }
        
    return {
      drawCanvas,
      updateCanvas,
      unmarkBar
    }
  }

  utilities() {

    function generateArray(settings) {
      let arr = new Array(parseInt(settings.arrLength))
        .fill(settings.arrMaxValue)
        .map( num => Math.ceil(Math.random()*num) );

      return arr;
    }

    function getGenerator(genLib, address, arr) {
      return genLib[address[0]][address[1]](arr);
    }

    return {
      generateArray,
      getGenerator
    }
  }

  App() {

    const IE = (!!navigator.userAgent.match(/Trident/g) || !!navigator.userAgent.match(/MSIE/g)) ? true : false;

    // modules
    const UI = this.UIcontroller();
    const util = this.utilities();
    const settings = this.settings(UI.elements.visualizer);
    const canvas = this.canvasController(settings, UI.elements.visualizer);




    function visualizerLoop() {
      let genValues = settings.arrGenerator.next().value;
      //log(genValues);
      if (genValues) {
        settings.array = genValues[0];
        UI.elements.cycle.innerText = parseInt(UI.elements.cycle.innerText) + 1;
        //this.drawCanvas();
        canvas.updateCanvas(genValues);
      } else {
        settings.appState = 'finished';
        canvas.unmarkBar();
        UI.updateStateInHTML(settings.appState);
        UI.startBtnRenameToStart();
        clearInterval(settings.appInterval);
      }
    }

    function setAppInterval() {
      settings.appInterval = setInterval(visualizerLoop, 1000/settings.speed);
    }
  
    function startApp() {
      if (settings.appState === 'finished') {
        applyAndReset();
      }
      if (IE && (settings.appState === 'finished' || settings.appState === 'reset')) {
        let options = UI.getOptions(settings);
        settings.setOptions(options);
        settings.arrGenerator = util.getGenerator(sortingAlgorithms, settings.activeAlgorithm, settings.array);
      }
      settings.appState = 'running';
      UI.startBtnRenameToPause();
      UI.updateStateInHTML(settings.appState);
      setAppInterval();
    }
    function stopApp() {
      settings.appState = "paused";
      UI.startBtnRenameToStart();
      UI.updateStateInHTML(settings.appState);
      clearInterval(settings.appInterval);
    }

    function applyAndReset() {
      if (settings.appState === "running") {
        stopApp()}

      // this.unmarkBar(); ???

      UI.elements.cycle.innerText = 0;
      settings.appState = 'reset';
      UI.startBtnRenameToStart();
      UI.updateStateInHTML(settings.appState);      
      settings.array = util.generateArray(settings);
      settings.arrGenerator = util.getGenerator(sortingAlgorithms, settings.activeAlgorithm, settings.array);
      settings.setCanvasVariables();
      canvas.drawCanvas();
    }




    // initialization
    UI.populateAlgorithmList(sortingAlgorithms, UI.elements.algorythmList);
    UI.setupOptionElements(settings);
    UI.updateCurValueDisplayElements(settings);
    let options = UI.getOptions(settings);
    settings.setOptions(options);
    applyAndReset();




    // Button functionality
    UI.elements.btnSartStop.addEventListener('click', () => {
      settings.appState === 'running' ? stopApp() : startApp();})
    UI.elements.btnApplyAndReset.addEventListener('click', applyAndReset)




    // Options input functionality  
    function updateSpeed(e) {
      if (e.target === UI.elements.speed && settings.appState === 'running') {
        settings.speed = UI.elements.speed.value;
        clearInterval(settings.appInterval);
        setAppInterval();
      }
    }
    UI.elements.optionsContainer.addEventListener("input", (e) => {
      // Update value display elements if options changed
      if (
        e.target === UI.elements.arrayLen ||
        e.target === UI.elements.maxVal ||
        e.target === UI.elements.speed) {
          UI.updateCurValueDisplayElements(settings);
        }
      // Update app speed if options changed
      updateSpeed(e);
      // Update algorithm selection if options changed && update generator
      if (e.target === UI.elements.algorythmList) {
          let options = UI.getOptions(settings);
          settings.setOptions(options);
          if (settings.appState === 'finished' || settings.appState === 'reset') {
            settings.arrGenerator = util.getGenerator(sortingAlgorithms, settings.activeAlgorithm, settings.array);
          }
        }
    })
    // Update settings and canvas if some options changed
    UI.elements.optionsContainer.addEventListener("mouseup", (e) => {
      if (
        e.target === UI.elements.arrayLen ||
        e.target === UI.elements.maxVal ||
        e.target === UI.elements.speed) {
          let options = UI.getOptions(settings);
          settings.setOptions(options);

          if ((settings.appState === 'finished' || settings.appState === 'reset') && e.target !== UI.elements.speed) {
            applyAndReset();
          }

          if (IE) {UI.updateCurValueDisplayElements(settings);}
          // Update app speed on the fly if options changed - IE support
          if (IE && e.target === UI.elements.speed) {updateSpeed(e);}
        }
    })


  }
}


new SortingVisualizer();
