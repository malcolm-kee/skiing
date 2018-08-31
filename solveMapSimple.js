/**
4 8 7 3 
2 5 9 3 
6 3 2 5 
4 4 1 6
 * Answer: 9-5-3-2-1
 * Length: 5
 * Drop: 8 (9-1)
 */

const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: fs.createReadStream('mapSimple.txt'),
  crlfDelay: Infinity
});

const lines = [];

rl.on('line', line => {
  lines.push(line);
}).on('close', () => {
  const map = lines.map(line => line.trim().split(' '));
  console.log({
    map,
    longest: getMapLongestRoute(map),
    answer: getMapLongestAndSteepestRoute(map)
  });
});

function Point(x, y, map) {
  this.value = map[y][x];
  var rowNumbers = [y, y - 1, y + 1];
  var adjacents = rowNumbers
    .filter(rowNum => rowNum >= 0 && rowNum < map.length)
    .reduce(
      (result, rowNum) =>
        rowNum === y
          ? result.concat([
              { value: map[rowNum][x + 1], y: rowNum, x: x + 1 },
              { value: map[rowNum][x - 1], y: rowNum, x: x - 1 }
            ])
          : result.concat({ value: map[rowNum][x], y: rowNum, x: x }),
      []
    );
  this.children = adjacents
    .filter(
      adjacent => adjacent.value !== undefined && adjacent.value < this.value
    )
    .map(adjacent => new Point(adjacent.x, adjacent.y, map));
}

Point.prototype.getMaxLength = function() {
  return this.children.length === 0
    ? 1
    : Math.max(...this.children.map(child => child.getMaxLength())) + 1;
};

// return Array<number[]>
Point.prototype.getLongestBranches = function() {
  if (this.children.length === 0) return [[this.value]];

  var longestLength = this.getMaxLength();

  return this.children
    .filter(child => child.getMaxLength() + 1 === longestLength) // only get child branches that is longest
    .reduce(
      (result, child) =>
        result.concat(
          child
            .getLongestBranches()
            .map(grandchildren => [this.value, ...grandchildren])
        ),
      []
    );
};

/**
 *
 * @param {number} x
 * @param {number} y
 */
function getLongestRoute(x, y, map) {
  const point = new Point(x, y, map);
  return point.getMaxLength();
}

function getLongestRouteDetail(x, y, map) {
  const point = new Point(x, y, map);
  return point.getLongestBranches();
}

function getMapLongestRoute(map) {
  var maxLength = 0;
  for (var y = 0; y < map.length; y++) {
    var row = map[y];
    for (var x = 0; x < row.length; x++) {
      var routeLength = getLongestRoute(x, y, map);
      if (routeLength > maxLength) {
        maxLength = routeLength;
      }
    }
  }
  return maxLength;
}

function getMapLongestAndSteepestRoute(map) {
  var maxLength = 0;
  var maxDiff = 0;
  for (var y = 0; y < map.length; y++) {
    var row = map[y];
    for (var x = 0; x < row.length; x++) {
      var routes = getLongestRouteDetail(x, y, map);
      routes.forEach(route => {
        const diff = Math.max(...route) - Math.min(...route);

        if (route.length > maxLength) {
          maxLength = route.length;
          maxDiff = diff;
        } else if (route.length === maxLength && diff > maxDiff) {
          maxDiff = diff;
        }
      });
    }
  }
  return {
    maxLength,
    maxDiff
  };
}
