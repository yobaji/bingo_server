function createCells() {
  var cells = [];
  for (var i = 1; i <= 25; i++) {
    cells.push({
      position: i,
      number: i
    });
  }
  return shuffle(cells);
}

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex].number;
    array[currentIndex].number = array[randomIndex].number;
    array[randomIndex].number = temporaryValue;
  }

  return array;
}

function differenceOf2Arrays(array1, array2) {
  var temp = [];
  array1 = array1.toString().split(',').map(Number);
  array2 = array2.toString().split(',').map(Number);

  for (var i in array1) {
    if (array2.indexOf(array1[i]) === -1) temp.push(array1[i]);
  }
  for (i in array2) {
    if (array1.indexOf(array2[i]) === -1) temp.push(array2[i]);
  }
  return temp.sort((a, b) => a - b);
}

function findRandomFromNonStriked(allStriked) {
  const allNumbers = [];
  for (let i = 1; i <= 25; i++)allNumbers.push(i);
  const nonStriked = differenceOf2Arrays(allNumbers, allStriked);
  if (!nonStriked.length) return 0;
  randomIndex = Math.floor(Math.random() * nonStriked.length);
  return nonStriked[randomIndex];
}

exports.array = {
  shuffle,
  createCells,
  differenceOf2Arrays,
  findRandomFromNonStriked
};
