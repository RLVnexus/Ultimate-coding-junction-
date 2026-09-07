export const cheatsheets: Record<string, string> = {
  html: `🔥 THE COMPLETE HTML5 MASTER COURSE 🔥
=================================================
TABLE OF CONTENTS:
Chapter 1: Basics & Boilerplate
Chapter 2: Text & Formatting
Chapter 3: Links & Images
Chapter 4: Lists & Tables
Chapter 5: Forms & Inputs
Chapter 6: Multimedia (Audio/Video)
Chapter 7: Semantic HTML & Layout
Chapter 8: Head & Meta Tags (SEO)
=================================================

=================================================
CHAPTER 1: BASICS & BOILERPLATE
=================================================
Every HTML file needs a standard structure so the browser knows how to read it.

<!DOCTYPE html>                <- Declares this is an HTML5 document
<html lang="en">               <- Root element, 'en' means English
<head>                         <- Invisible metadata (settings, title, CSS)
  <meta charset="UTF-8">       <- Character encoding (supports emojis, symbols)
  <meta name="viewport" content="width=device-width, initial-scale=1.0"> <- Mobile responsive setup
  <title>Document Title</title><- Tab name in browser
</head>
<body>                         <- All visible content goes here!
  <h1>Hello World</h1>
</body>
</html>

=================================================
CHAPTER 2: TEXT & FORMATTING
=================================================
Headings:
<h1>Main Heading (Largest, use only once per page)</h1>
<h2>Subheading</h2>
... <h6>Smallest Heading</h6>

Paragraph & Formatting:
<p>This is a standard paragraph of text.</p>

<b>Bold Text (Old)</b> 
<strong>Important Bold Text (Modern)</strong>

<i>Italic Text (Old)</i> 
<em>Emphasis Italic Text (Modern)</em>

<u>Underline</u> | <s>Strikethrough</s> | <mark>Highlighted</mark>
<br> <- Line Break (forces text to next line)
<hr> <- Horizontal Rule (draws a line)

=================================================
CHAPTER 3: LINKS & IMAGES
=================================================
Links (Anchor tags):
<a href="https://google.com">Go to Google</a>
<a href="about.html">Go to About Page (Local file)</a>
<a href="https://google.com" target="_blank">Opens in New Tab</a>

Images:
<img src="cat.jpg" alt="Description of image for blind users" width="300">
- Always include 'alt'. It's for screen readers and broken links.
- 'src' can be a local path (img/cat.jpg) or a web URL (https://...).

=================================================
CHAPTER 4: LISTS & TABLES
=================================================
Unordered List (Bullet points):
<ul>
  <li>Apple</li>
  <li>Banana</li>
</ul>

Ordered List (Numbers):
<ol>
  <li>First step</li>
  <li>Second step</li>
</ol>

Tables (Rows and Columns):
<table>
  <thead>
    <tr>
      <th>Name</th>    <!-- Table Heading -->
      <th>Age</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John</td>    <!-- Table Data -->
      <td>25</td>
    </tr>
  </tbody>
</table>

=================================================
CHAPTER 5: FORMS & INPUTS
=================================================
Forms collect user data and send it to a server.

<form action="/submit" method="POST">
  <!-- Text Input -->
  <label for="user">Username:</label>
  <input type="text" id="user" name="user" placeholder="Enter name" required>
  
  <!-- Password -->
  <label for="pass">Password:</label>
  <input type="password" id="pass" name="pass" required>
  
  <!-- Radio Buttons (Only 1 choice allowed) -->
  <input type="radio" name="gender" value="male"> Male
  <input type="radio" name="gender" value="female"> Female
  
  <!-- Checkbox (Multiple choices) -->
  <input type="checkbox" name="agree"> I agree to terms
  
  <!-- Dropdown -->
  <select name="city">
    <option value="ny">New York</option>
    <option value="la">Los Angeles</option>
  </select>

  <!-- Submit Button -->
  <button type="submit">Submit Form</button>
</form>

=================================================
CHAPTER 6: MULTIMEDIA (AUDIO/VIDEO)
=================================================
Video Player:
<video width="640" controls autoplay muted loop poster="thumbnail.jpg">
  <source src="movie.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
- controls: play/pause/volume UI.
- muted: sound is off by default (needed for autoplay in most browsers).
- poster: image shown before playing.

Audio Player:
<audio controls>
  <source src="song.mp3" type="audio/mpeg">
</audio>

=================================================
CHAPTER 7: SEMANTIC HTML & LAYOUT
=================================================
Semantic tags tell the browser/search engine WHAT the content is, not just how it looks.
Don't just use <div> for everything!

<header>   <- Top of page (Logo, Nav)
<nav>      <- Navigation links menu
<main>     <- Main content of the document
<article>  <- Independent content (Blog post, news article)
<section>  <- Thematic grouping of content
<aside>    <- Sidebar (Links, ads)
<footer>   <- Bottom of page (Copyright, links)

=================================================
CHAPTER 8: HEAD & META TAGS (SEO)
=================================================
Meta tags live in the <head> and help Google and social media understand your site.

<meta name="description" content="Best coding tutorials online."> <- Shown in Google Search results
<meta name="keywords" content="HTML, CSS, JavaScript">
<meta name="author" content="Your Name">

<!-- Social Media Cards (Open Graph for Facebook/Twitter) -->
<meta property="og:title" content="My Website">
<meta property="og:image" content="https://mysite.com/banner.jpg">
`,
  css: `🔥 THE COMPLETE CSS3 MASTER COURSE 🔥
=================================================
TABLE OF CONTENTS:
Chapter 1: Intro, Syntax & Selectors
Chapter 2: Colors & Backgrounds
Chapter 3: The Box Model (Margin/Padding)
Chapter 4: Typography (Fonts & Text)
Chapter 5: Layout: Display & Position
Chapter 6: Flexbox (1D Layouts)
Chapter 7: CSS Grid (2D Layouts)
Chapter 8: Responsive Design (Media Queries)
Chapter 9: Animations & Transitions
=================================================

=================================================
CHAPTER 1: INTRO, SYNTAX & SELECTORS
=================================================
How to connect CSS to HTML (in <head>):
<link rel="stylesheet" href="style.css">

Syntax:
selector {
  property: value;
}

Selectors:
*         { margin: 0; }         /* Universal (Selects everything) */
body      { background: #fff; }  /* Element tag */
.my-class { color: red; }        /* Class (Uses a dot '.') */
#my-id    { color: blue; }       /* ID (Uses a hash '#') */
h1, h2    { font-weight: bold; } /* Grouping (Selects both) */
div p     { font-size: 16px; }   /* Descendant (Selects <p> inside <div>) */

Specificity (Who wins?):
ID (#) beats Class (.), Class beats Element (p).

=================================================
CHAPTER 2: COLORS & BACKGROUNDS
=================================================
color: red;                   /* Text color */
color: #ff0000;               /* Hex code */
color: rgb(255, 0, 0);        /* RGB */
color: rgba(255, 0, 0, 0.5);  /* RGBA (0.5 is 50% opacity/transparency) */

background-color: blue;
background-image: url('bg.jpg');
background-size: cover;       /* Fits image to cover whole container */
background-position: center;  /* Centers image */
background-repeat: no-repeat; /* Prevents tiling */

=================================================
CHAPTER 3: THE BOX MODEL
=================================================
EVERY element in CSS is a box. 
Box Size = Content + Padding + Border + Margin

.box {
  width: 200px;
  height: 200px;
  
  padding: 20px;       /* Inner space (pushes content inward) */
  border: 2px solid black; /* The outline */
  margin: 30px;        /* Outer space (pushes other boxes away) */
  
  box-sizing: border-box; /* IMPORTANT: Keeps width exactly 200px by absorbing padding/border into width */
}

=================================================
CHAPTER 4: TYPOGRAPHY
=================================================
font-family: 'Arial', sans-serif; /* Font type (with fallback) */
font-size: 24px;                  /* Size (can also use 'rem' or 'em') */
font-weight: bold;                /* Thickness (400=normal, 700=bold) */
font-style: italic;
text-align: center;               /* left, right, center, justify */
text-decoration: underline;       /* none, underline, line-through */
text-transform: uppercase;        /* lowercase, capitalize */
line-height: 1.5;                 /* Space between lines of text */
letter-spacing: 2px;              /* Space between letters */

=================================================
CHAPTER 5: LAYOUT: DISPLAY & POSITION
=================================================
DISPLAY:
display: block;        /* Takes full width (e.g. <div>, <h1>) */
display: inline;       /* Takes only needed width, no height/margin (e.g. <span>, <a>) */
display: inline-block; /* Inline, but allows height/margin */
display: none;         /* Completely hides element */

POSITION:
position: static;      /* Default */
position: relative;    /* Moves relative to its normal position (top/left/right/bottom) */
position: absolute;    /* Positioned relative to nearest 'relative' parent */
position: fixed;       /* Stays on screen even when scrolling (like a sticky navbar) */
position: sticky;      /* Acts normal until you scroll past it, then sticks */

=================================================
CHAPTER 6: FLEXBOX (1D LAYOUT)
=================================================
Used for laying things out in a ROW or a COLUMN.

.container {
  display: flex;
  flex-direction: row;      /* row, column, row-reverse */
  justify-content: center;  /* Main axis: center, space-between, space-around, flex-start */
  align-items: center;      /* Cross axis: center, stretch, flex-start, flex-end */
  flex-wrap: wrap;          /* Allows items to wrap to next line if screen is small */
}

/* Perfect Centering */
.center-div {
  display: flex;
  justify-content: center;
  align-items: center;
}

=================================================
CHAPTER 7: CSS GRID (2D LAYOUT)
=================================================
Used for full page layouts (Rows AND Columns).

.grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr; /* 3 equal columns */
  grid-template-rows: 100px 200px;    /* 2 rows */
  gap: 20px;                          /* Spacing between cells */
}

=================================================
CHAPTER 8: RESPONSIVE DESIGN (MEDIA QUERIES)
=================================================
Changes CSS based on screen size (Mobile Friendly).

/* Default CSS (Mobile First) */
.box { width: 100%; }

/* When screen is 768px or wider (Tablets/Desktops) */
@media (min-width: 768px) {
  .box { width: 50%; }
}

=================================================
CHAPTER 9: ANIMATIONS & TRANSITIONS
=================================================
TRANSITIONS (Smooth state changes like hover):
.btn {
  background: blue;
  transition: background 0.3s ease-in-out;
}
.btn:hover {
  background: red; /* Smoothly changes to red over 0.3s */
}

ANIMATIONS (Keyframes):
@keyframes bounce {
  0% { transform: translateY(0); }
  50% { transform: translateY(-50px); }
  100% { transform: translateY(0); }
}

.ball {
  animation: bounce 2s infinite;
}
`,
  js: `🔥 THE COMPLETE JAVASCRIPT MASTER COURSE 🔥
=================================================
TABLE OF CONTENTS:
Chapter 1: Basics (Variables, Output, Types)
Chapter 2: Operators & Logic (If/Else)
Chapter 3: Loops & Iteration
Chapter 4: Functions & Scope
Chapter 5: Arrays & Array Methods
Chapter 6: Objects & JSON
Chapter 7: The DOM (HTML Manipulation)
Chapter 8: Events & Listeners
Chapter 9: Asynchronous JS (Promises & Fetch)
Chapter 10: ES6+ Modern Features
=================================================

=================================================
CHAPTER 1: BASICS
=================================================
Variables:
var name = "Old";   // Avoid using var (causes scope bugs)
let age = 25;       // Can be reassigned
const pi = 3.1415;  // Cannot be reassigned (Use this by default!)

Data Types:
let text = "String";
let num = 100;
let bool = true;      // true or false
let notDefined;       // undefined (variable created but no value)
let empty = null;     // intentionally empty
let list = [1, 2, 3]; // Array
let person = { name: "John" }; // Object

Output:
console.log("Hello World!"); // Prints to developer console
alert("Warning!");           // Browser popup
prompt("What is your name?");// Browser input popup

=================================================
CHAPTER 2: OPERATORS & LOGIC
=================================================
Math: +, -, *, /, % (remainder), ** (power)
Comparison:
==   (Value equal, 5 == "5" is True)
===  (Value & Type equal, 5 === "5" is False) <- ALWAYS USE THIS!
!=, !==, >, <, >=, <=

Logic: && (AND), || (OR), ! (NOT)

If/Else:
if (age >= 18) {
  console.log("Adult");
} else if (age >= 13) {
  console.log("Teenager");
} else {
  console.log("Child");
}

Ternary (One-line if/else):
let status = (age >= 18) ? "Adult" : "Minor";

=================================================
CHAPTER 3: LOOPS
=================================================
For Loop:
for (let i = 0; i < 5; i++) {
  console.log(i); // Prints 0, 1, 2, 3, 4
}

While Loop:
let x = 0;
while (x < 5) {
  console.log(x);
  x++;
}

For-Of Loop (For Arrays):
let fruits = ["Apple", "Banana"];
for (let fruit of fruits) {
  console.log(fruit);
}

=================================================
CHAPTER 4: FUNCTIONS
=================================================
Standard Function:
function greet(name) {
  return "Hello " + name;
}

Arrow Function (Modern & Cleaner):
const greet = (name) => {
  return \`Hello \${name}\`; // Template literal
};

One-Liner Arrow Function:
const add = (a, b) => a + b;

=================================================
CHAPTER 5: ARRAYS & METHODS
=================================================
let arr = ["A", "B", "C"];

arr.push("D");    // Adds to end
arr.pop();        // Removes from end
arr.unshift("Z"); // Adds to beginning
arr.shift();      // Removes from beginning

Modern Array Iteration:
// 1. .map() - Creates a NEW array modified
let doubled = [1, 2, 3].map(n => n * 2); // [2, 4, 6]

// 2. .filter() - Keeps only true matches
let evens = [1, 2, 3, 4].filter(n => n % 2 === 0); // [2, 4]

// 3. .forEach() - Just loops, returns nothing
arr.forEach(item => console.log(item));

=================================================
CHAPTER 6: OBJECTS & JSON
=================================================
let user = {
  name: "Alice",
  age: 30,
  greet: function() { console.log("Hi!"); }
};

console.log(user.name); // "Alice"
user.city = "New York"; // Adds new property

JSON (JavaScript Object Notation):
// Convert Object to String (To send to server)
let jsonStr = JSON.stringify(user);
// Convert String back to Object
let obj = JSON.parse(jsonStr);

=================================================
CHAPTER 7 & 8: THE DOM & EVENTS
=================================================
Selecting Elements:
const title = document.getElementById("title-id");
const boxes = document.getElementsByClassName("box");
const btn = document.querySelector("#submit-btn"); // CSS Selector (Best)
const allBtn = document.querySelectorAll(".btn");

Modifying:
title.innerText = "New Title";
title.innerHTML = "<span>New Title</span>";
title.style.color = "red";
title.classList.add("active");
title.classList.remove("hidden");

Events:
btn.addEventListener("click", (event) => {
  console.log("Button Clicked!");
});

=================================================
CHAPTER 9: ASYNC JS (API FETCHING)
=================================================
JS runs top-to-bottom. Async code waits for internet responses.

Modern Async/Await Fetching:
async function getJoke() {
  try {
    let response = await fetch("https://api.chucknorris.io/jokes/random");
    let data = await response.json();
    console.log(data.value);
  } catch (error) {
    console.log("Error fetching data", error);
  }
}
getJoke();

=================================================
CHAPTER 10: ES6+ FEATURES
=================================================
Destructuring (Extracting object values easily):
const { name, age } = user;

Spread Operator (...):
let arr1 = [1, 2];
let arr2 = [...arr1, 3, 4]; // [1, 2, 3, 4]

let obj1 = { a: 1 };
let obj2 = { ...obj1, b: 2 }; // { a: 1, b: 2 }
`,
  python: `🔥 THE COMPLETE PYTHON MASTER COURSE 🔥
=================================================
TABLE OF CONTENTS:
Chapter 1: Basics, Variables & I/O
Chapter 2: Operators & Control Flow
Chapter 3: Loops (For & While)
Chapter 4: Data Structures (Lists, Tuples, Sets, Dicts)
Chapter 5: Functions & Modules
Chapter 6: File Handling
Chapter 7: Object-Oriented Programming (Classes)
Chapter 8: Advanced (Comprehensions, Exceptions)
=================================================

=================================================
CHAPTER 1: BASICS, VARIABLES & I/O
=================================================
Python relies on indentation (spaces), NOT curly braces {}.

Variables (No type declaration needed):
name = "John"     # str (String)
age = 25          # int (Integer)
height = 5.9      # float (Decimal)
is_active = True  # bool (True/False - Must be Capitalized!)

Input / Output:
print("Hello World")
print(f"My name is {name} and I am {age}") # f-string (Best formatting)

user_input = input("Enter your name: ") # Always returns a string
num_input = int(input("Enter age: "))   # Type casting to integer

=================================================
CHAPTER 2: OPERATORS & CONTROL FLOW
=================================================
Math: +, -, *, /, // (Floor division), % (Modulus), ** (Power)
Logical: and, or, not

If / Elif / Else:
if age >= 18:
    print("Adult")     # Indented with 4 spaces!
elif age >= 13:
    print("Teenager")
else:
    print("Child")

=================================================
CHAPTER 3: LOOPS
=================================================
For Loop (Iterating over sequences):
for i in range(5):        # 0, 1, 2, 3, 4
    print(i)

for i in range(2, 10, 2): # Start 2, Stop 10, Step 2 (2,4,6,8)
    print(i)

fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)

While Loop:
count = 0
while count < 5:
    print(count)
    count += 1    # Python does not have count++

Break and Continue:
- break: Stops the loop completely.
- continue: Skips the current iteration and goes to the next.

=================================================
CHAPTER 4: DATA STRUCTURES
=================================================
1. LIST [] -> Ordered, Mutable, allows duplicates.
arr = [1, 2, 3]
arr.append(4)     # Adds to end [1,2,3,4]
arr.insert(0, 9)  # Inserts 9 at index 0
arr.pop()         # Removes last item
print(arr[0])     # Access first item

2. TUPLE () -> Ordered, IMMUTABLE (cannot be changed). Faster.
coords = (10, 20)
# coords[0] = 15  <-- ERROR!

3. SET {} -> Unordered, NO DUPLICATES.
unique_nums = {1, 2, 2, 3, 3} # Becomes {1, 2, 3}

4. DICTIONARY {} -> Key-Value pairs. Mutable.
user = {
    "name": "Alice",
    "age": 30
}
print(user["name"])
user["city"] = "New York" # Add new key

=================================================
CHAPTER 5: FUNCTIONS & MODULES
=================================================
Functions (def):
def greet(name="Stranger"):  # Default parameter
    return f"Hello {name}"

print(greet("Bob"))
print(greet())

Modules (Importing):
import math
print(math.sqrt(16)) # 4.0

from random import randint
print(randint(1, 10)) # Random number 1-10

=================================================
CHAPTER 6: FILE HANDLING
=================================================
Always use 'with' - it automatically closes the file for you!

Writing to a file:
with open("test.txt", "w") as f:  # "w" overwrites, "a" appends
    f.write("Hello World!")

Reading a file:
with open("test.txt", "r") as f:
    content = f.read()
    print(content)

=================================================
CHAPTER 7: OBJECT-ORIENTED PROGRAMMING (CLASSES)
=================================================
Classes bundle data and functions together.

class Dog:
    # Constructor (__init__) runs when object is created
    def __init__(self, name, breed):
        self.name = name       # Instance variable
        self.breed = breed
        
    def bark(self):            # Instance method
        print(f"{self.name} says Woof!")

# Create an object (Instance)
my_dog = Dog("Rex", "German Shepherd")
my_dog.bark()

=================================================
CHAPTER 8: ADVANCED (COMPREHENSIONS & EXCEPTIONS)
=================================================
List Comprehension (One-line magic loop):
# Generate a list of squares for numbers 0 to 9
squares = [x**2 for x in range(10)]
print(squares) # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]

Exception Handling (Try/Except):
try:
    result = 10 / 0
except ZeroDivisionError:
    print("You can't divide by zero!")
finally:
    print("This runs no matter what.")
`
};
