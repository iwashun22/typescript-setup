
type consoleMessage<Type> = (str: Type) => void;

const consoleText: consoleMessage<String> = (str) => {
  console.log(str);
}

const consoleItems: consoleMessage<Array<any>> = (arr) => {
  arr.forEach((value, index) => {
    console.log(`${index}: ${value}`);
  })
}

export {
  consoleText,
  consoleItems
};