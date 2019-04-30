const sortingAlgorithms = {

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
    },
  },

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
        } 
        arr[j + 1] = key; 
        
        yield [arr, i, j+1];
      }
    },
    // selection() {}
  },

  "Eficient": {
    // credit: https://www.w3resource.com/javascript-exercises/searching-and-sorting-algorithm/searching-and-sorting-algorithm-exercise-3.php
    heap: function*(input) {


      var array_length = input.length;
      let gen, values;


      function swap(input, index_A, index_B) {
        var temp = input[index_A];
    
        input[index_A] = input[index_B];
        input[index_B] = temp;

        return [input, index_A, index_B];
      }


      function* heap_root(input, i) {
        var left = 2 * i + 1;
        var right = 2 * i + 2;
        var max = i;

        let values, gen;

        if (left < array_length && input[left] > input[max]) {
          max = left;
        }

        if (right < array_length && input[right] > input[max]){
          max = right;
        }

        if (max != i) {
          yield swap(input, i, max);

          gen = heap_root(input, max);
          values = true;
          while (values) {
            values = gen.next().value;
            if (values) {
              yield values;
            }
          }
        }
      }


      for (var i = Math.floor(array_length / 2); i >= 0; i -= 1) {
          gen = heap_root(input, i);
          values = true;
          while (values) {
            values = gen.next().value;
            if (values) {
              yield values;
            }
          }
        }
  

      for (i = input.length - 1; i > 0; i--) {
        yield swap(input, 0, i);
        array_length--;
    
        gen = heap_root(input, 0);
        values = true;
        while (values) {
          values = gen.next().value;
          if (values) {
            yield values;
          }
        }
      }


    }
  }
}


export {sortingAlgorithms};