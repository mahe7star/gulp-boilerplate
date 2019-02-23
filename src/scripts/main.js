export class Rectangle {
  constructor(array1, array2) {
    this.array1 = array1;
    this.array2 = array2;
  }
  // Getter
  get finalArray() {
    return this.combineArray();
  }

  combineArray() {
    return [...this.array1, ...this.array2];
  }

  
}

