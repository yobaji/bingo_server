class PlayerLogic {
    constructor(state, allStrikedCells) {
        this.state = state;
        this.allStrikedCells = allStrikedCells;
    }
    get Diagonal_1() {
        var positions = [1, 7, 13, 19, 25],
            strikedCells = this.allStrikedCells;
        var allStriked = true;
        positions.forEach(position => {
            if (
                strikedCells.indexOf(
                    this.state.cellArray[position - 1].number
                ) < 0
            ) {
                allStriked = false;
            }
        });
        return allStriked;
    }
    get Diagonal_2() {
        var positions = [5, 9, 13, 17, 21],
            strikedCells = this.allStrikedCells;
        var allStriked = true;
        positions.forEach(position => {
            if (
                strikedCells.indexOf(
                    this.state.cellArray[position - 1].number
                ) < 0
            ) {
                allStriked = false;
            }
        });
        return allStriked;
    }
    get Vertical_1() {
        var positions = [1, 6, 11, 16, 21],
            strikedCells = this.allStrikedCells;
        var allStriked = true;
        positions.forEach(position => {
            if (
                strikedCells.indexOf(
                    this.state.cellArray[position - 1].number
                ) < 0
            ) {
                allStriked = false;
            }
        });
        return allStriked;
    }
    get Vertical_2() {
        var positions = [2, 7, 12, 17, 22],
            strikedCells = this.allStrikedCells;
        var allStriked = true;
        positions.forEach(position => {
            if (
                strikedCells.indexOf(
                    this.state.cellArray[position - 1].number
                ) < 0
            ) {
                allStriked = false;
            }
        });
        return allStriked;
    }
    get Vertical_3() {
        var positions = [3, 8, 13, 18, 23],
            strikedCells = this.allStrikedCells;
        var allStriked = true;
        positions.forEach(position => {
            if (
                strikedCells.indexOf(
                    this.state.cellArray[position - 1].number
                ) < 0
            ) {
                allStriked = false;
            }
        });
        return allStriked;
    }
    get Vertical_4() {
        var positions = [4, 9, 14, 19, 24],
            strikedCells = this.allStrikedCells;
        var allStriked = true;
        positions.forEach(position => {
            if (
                strikedCells.indexOf(
                    this.state.cellArray[position - 1].number
                ) < 0
            ) {
                allStriked = false;
            }
        });
        return allStriked;
    }
    get Vertical_5() {
        var positions = [5, 10, 15, 20, 25],
            strikedCells = this.allStrikedCells;
        var allStriked = true;
        positions.forEach(position => {
            if (
                strikedCells.indexOf(
                    this.state.cellArray[position - 1].number
                ) < 0
            ) {
                allStriked = false;
            }
        });
        return allStriked;
    }
    get Horizontal_1() {
        var positions = [1, 2, 3, 4, 5],
            strikedCells = this.allStrikedCells;
        var allStriked = true;
        positions.forEach(position => {
            if (
                strikedCells.indexOf(
                    this.state.cellArray[position - 1].number
                ) < 0
            ) {
                allStriked = false;
            }
        });
        return allStriked;
    }
    get Horizontal_2() {
        var positions = [6, 7, 8, 9, 10],
            strikedCells = this.allStrikedCells;
        var allStriked = true;
        positions.forEach(position => {
            if (
                strikedCells.indexOf(
                    this.state.cellArray[position - 1].number
                ) < 0
            ) {
                allStriked = false;
            }
        });
        return allStriked;
    }
    get Horizontal_3() {
        var positions = [11, 12, 13, 14, 15],
            strikedCells = this.allStrikedCells;
        var allStriked = true;
        positions.forEach(position => {
            if (
                strikedCells.indexOf(
                    this.state.cellArray[position - 1].number
                ) < 0
            ) {
                allStriked = false;
            }
        });
        return allStriked;
    }
    get Horizontal_4() {
        var positions = [16, 17, 18, 19, 20],
            strikedCells = this.allStrikedCells;
        var allStriked = true;
        positions.forEach(position => {
            if (
                strikedCells.indexOf(
                    this.state.cellArray[position - 1].number
                ) < 0
            ) {
                allStriked = false;
            }
        });
        return allStriked;
    }
    get Horizontal_5() {
        var positions = [21, 22, 23, 24, 25],
            strikedCells = this.allStrikedCells;
        var allStriked = true;
        positions.forEach(position => {
            if (
                strikedCells.indexOf(
                    this.state.cellArray[position - 1].number
                ) < 0
            ) {
                allStriked = false;
            }
        });
        return allStriked;
    }
    get VerticalStrikes() {
        return {
            Vertical_1: this.Vertical_1,
            Vertical_2: this.Vertical_2,
            Vertical_3: this.Vertical_3,
            Vertical_4: this.Vertical_4,
            Vertical_5: this.Vertical_5
        };
    }
    get HorizontalStrikes() {
        return {
            Horizontal_1: this.Horizontal_1,
            Horizontal_2: this.Horizontal_2,
            Horizontal_3: this.Horizontal_3,
            Horizontal_4: this.Horizontal_4,
            Horizontal_5: this.Horizontal_5
        };
    }
    get BingoValue() {
        var value = 0;
        for (var i = 1; i <= 2; i++) {
            if (this["Diagonal_" + i]) value++;
        }
        for (var i = 1; i <= 5; i++) {
            if (this["Vertical_" + i]) value++;
        }
        for (var i = 1; i <= 5; i++) {
            if (this["Horizontal_" + i]) value++;
        }
        if (value >= 5) return 5;
        return value;
    }
    get isWon() {
        return (this.BingoValue >= 5);
    }
}

module.exports = PlayerLogic;