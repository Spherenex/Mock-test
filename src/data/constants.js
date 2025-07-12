export const DEFAULT_CREDENTIALS = {
  admin: { username: 'admin', password: 'admin@123' },
  employees: [
    { username: 'addakulasunilvarma@gmail.com', password: 'Sunil@123', name: 'Addakula Sunil' },
    { username: 'ahmedr8912@gmail.com', password: 'Ahmed@123', name: 'Ahmed Raza' },
    { username: 'togowrimenon@gmail.com', password: 'Gowri@123', name: 'Gowri Menon' },
    { username: 'painenipraveen12@gmail.com', password: 'Praveen@123', name: 'Paineni Praveen Kumar' },
    { username: 'pk617522@gmail.com', password: 'Venkatesan@123', name: 'Praveenkumar Venkatesan' },
    { username: 'rahulsdodwad@gmail.com', password: 'Rahul@123', name: 'Rahul Dodawad' },
    { username: 'shreyavm11@gmail.com', password: 'Shreya@123', name: 'Shreya Metkar' },
    { username: 'sournima000@gmail.com', password: 'Sournima@123', name: 'Sournima P T' },
    { username: 'vamsikrishnapallegunta@gmail.com', password: 'Vamsi@123', name: 'Vamsi Krishna P' },
    { username: 'kakarlayuvashri@gmail.com', password: 'Yuvashri@123', name: 'Yuvashri' },
    { username: 'Test', password: 'test123', name: 'Test' },
  ],
};

export const QUESTIONS = [
  // Basic HTML - Questions 1-10
  {
    id: 1,
    question: 'What does HTML stand for?',
    options: [
      'Hyper Text Markup Language',
      'High Text Markup Language',
      'Hyper Tabular Markup Language',
      'Home Tool Markup Language',
    ],
    correctAnswer: 0,
  },
  {
    id: 2,
    question: 'Which tag is used to create a hyperlink in HTML?',
    options: ['<link>', '<a>', '<href>', '<url>'],
    correctAnswer: 1,
  },
  {
    id: 3,
    question: 'What is the correct HTML tag for the largest heading?',
    options: ['<h6>', '<h1>', '<heading>', '<header>'],
    correctAnswer: 1,
  },
  {
    id: 4,
    question: 'Which HTML tag is used to display an image?',
    options: ['<img>', '<picture>', '<image>', '<src>'],
    correctAnswer: 0,
  },
  {
    id: 5,
    question: 'What attribute specifies the URL of an image in HTML?',
    options: ['href', 'src', 'alt', 'link'],
    correctAnswer: 1,
  },
  {
    id: 6,
    question: 'Which HTML tag is used to create an unordered list?',
    options: ['<ol>', '<ul>', '<li>', '<list>'],
    correctAnswer: 1,
  },
  {
    id: 7,
    question: 'What is the purpose of the <br> tag in HTML?',
    options: [
      'Bold text',
      'Line break',
      'Blockquote',
      'Background reset',
    ],
    correctAnswer: 1,
  },
  {
    id: 8,
    question: 'Which HTML tag defines the main content of a webpage?',
    options: ['<main>', '<body>', '<section>', '<div>'],
    correctAnswer: 0,
  },
  {
    id: 9,
    question: 'What attribute is used to provide a unique identifier to an HTML element?',
    options: ['class', 'id', 'name', 'type'],
    correctAnswer: 1,
  },
  {
    id: 10,
    question: 'Which HTML tag is used to include an external JavaScript file?',
    options: ['<script>', '<link>', '<js>', '<code>'],
    correctAnswer: 0,
  },

  // Basic CSS - Questions 11-20
  {
    id: 11,
    question: 'Which CSS property changes the text color of an element?',
    options: ['color', 'font-color', 'text-color', 'background-color'],
    correctAnswer: 0,
  },
  {
    id: 12,
    question: 'How do you apply a CSS style to all <p> elements?',
    options: ['#p', '.p', 'p', '*p'],
    correctAnswer: 2,
  },
  {
    id: 13,
    question: 'Which CSS property sets the background color?',
    options: [
      'color',
      'background-color',
      'bg-color',
      'background-style',
    ],
    correctAnswer: 1,
  },
  {
    id: 14,
    question: 'How do you center text horizontally in CSS?',
    options: [
      'text-align: center;',
      'align: center;',
      'center: text;',
      'text-position: center;',
    ],
    correctAnswer: 0,
  },
  {
    id: 15,
    question: 'Which CSS property controls the space between elements?',
    options: ['padding', 'margin', 'border', 'spacing'],
    correctAnswer: 1,
  },
  {
    id: 16,
    question: 'What does the CSS "display: block;" property do?',
    options: [
      'Hides the element',
      'Makes it inline',
      'Takes full width',
      'Floats the element',
    ],
    correctAnswer: 2,
  },
  {
    id: 17,
    question: 'How do you select elements with a specific class in CSS?',
    options: ['#class', '.class', 'class', '*class'],
    correctAnswer: 1,
  },
  {
    id: 18,
    question: 'Which CSS unit represents a percentage of the parent element?',
    options: ['px', 'em', '%', 'vw'],
    correctAnswer: 2,
  },
  {
    id: 19,
    question: 'What property sets the font family in CSS?',
    options: [
      'font-family',
      'font-style',
      'font-type',
      'text-family',
    ],
    correctAnswer: 0,
  },
  {
    id: 20,
    question: 'How do you make an element invisible in CSS?',
    options: [
      'visibility: hidden;',
      'display: none;',
      'opacity: 0;',
      'All of the above',
    ],
    correctAnswer: 3,
  },

  // Basic JavaScript - Questions 21-30
  {
    id: 21,
    question: 'How do you write a comment in JavaScript?',
    options: [
      '<!-- Comment -->',
      '// Comment',
      '# Comment',
      '/* Comment */',
    ],
    correctAnswer: 1,
  },
  {
    id: 22,
    question: 'Which keyword declares a variable in JavaScript?',
    options: ['var', 'int', 'string', 'declare'],
    correctAnswer: 0,
  },
  {
    id: 23,
    question: 'What is the output of console.log(5 + "5");?',
    options: ['10', '55', '5', 'Error'],
    correctAnswer: 1,
  },
  {
    id: 24,
    question: 'How do you check the length of a string in JavaScript?',
    options: ['str.length', 'str.size', 'str.count', 'str.len'],
    correctAnswer: 0,
  },
  {
    id: 25,
    question: 'Which operator checks for equality in value and type in JavaScript?',
    options: ['=', '==', '===', '!='],
    correctAnswer: 2,
  },
  {
    id: 26,
    question: 'What is the correct syntax for an if statement in JavaScript?',
    options: [
      'if (x > 5) { }',
      'if x > 5 { }',
      'if (x > 5) then { }',
      'if {x > 5}',
    ],
    correctAnswer: 0,
  },
  {
    id: 27,
    question: 'How do you create a function in JavaScript?',
    options: [
      'function myFunc() { }',
      'func myFunc() { }',
      'myFunc() { }',
      'function: myFunc() { }',
    ],
    correctAnswer: 0,
  },
  {
    id: 28,
    question: 'What method adds an element to the end of an array in JavaScript?',
    options: ['push()', 'pop()', 'shift()', 'unshift()'],
    correctAnswer: 0,
  },
  {
    id: 29,
    question: 'How do you access the first element of an array in JavaScript?',
    options: ['array[0]', 'array[1]', 'array.first', 'array.start'],
    correctAnswer: 0,
  },
  {
    id: 30,
    question: 'What will console.log(typeof "hello"); return?',
    options: ['number', 'string', 'boolean', 'object'],
    correctAnswer: 1,
  },

  // Basic Web Concepts (HTML/CSS/JS Mix) - Questions 31-40
  {
    id: 31,
    question: 'Which tag embeds CSS directly in an HTML file?',
    options: ['<style>', '<css>', '<script>', '<link>'],
    correctAnswer: 0,
  },
  {
    id: 32,
    question: 'How do you change an element’s text in JavaScript?',
    options: [
      'element.innerHTML',
      'element.text',
      'element.value',
      'element.content',
    ],
    correctAnswer: 0,
  },
  {
    id: 33,
    question: 'What CSS property adds space inside an element?',
    options: ['margin', 'padding', 'border', 'gap'],
    correctAnswer: 1,
  },
  {
    id: 34,
    question: 'Which HTML attribute specifies a text description for an image?',
    options: ['src', 'alt', 'title', 'desc'],
    correctAnswer: 1,
  },
  {
    id: 35,
    question: 'What JavaScript method displays a popup with a message?',
    options: ['alert()', 'prompt()', 'confirm()', 'log()'],
    correctAnswer: 0,
  },
  {
    id: 36,
    question: 'Which CSS property aligns items vertically?',
    options: [
      'vertical-align',
      'align-items',
      'text-align',
      'position',
    ],
    correctAnswer: 0,
  },
  {
    id: 37,
    question: 'How do you get an element by its ID in JavaScript?',
    options: [
      'document.getElementById()',
      'document.querySelector()',
      'document.getElementsByClass()',
      'document.id()',
    ],
    correctAnswer: 0,
  },
  {
    id: 38,
    question: 'Which HTML tag creates a table row?',
    options: ['<tr>', '<td>', '<th>', '<table>'],
    correctAnswer: 0,
  },
  {
    id: 39,
    question: 'What CSS value makes text italic?',
    options: [
      'font-style: italic;',
      'font-weight: italic;',
      'text-style: italic;',
      'style: italic;',
    ],
    correctAnswer: 0,
  },
  {
    id: 40,
    question: 'What will console.log(10 > 5); return in JavaScript?',
    options: ['true', 'false', '10', '5'],
    correctAnswer: 0,
  },
];