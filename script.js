"use strict";

window.addEventListener("DOMContentLoaded", init);

const allStudents = [];
let currentStudents = [];

function init() {
  allStudents.splice(0, allStudents.length);
  loadFrontEnd();
}

function loadFrontEnd() {
  document
    .querySelector("#sort_first")
    .addEventListener("click", clickedSortFirstname);
  document
    .querySelector("#sort_last")
    .addEventListener("click", clickedSortLastname);
  document
    .querySelector("#sort_house")
    .addEventListener("click", clickedSortHouse);
  document
    .querySelectorAll("#filters a")
    .forEach(element => element.addEventListener("click", clickedFilter));

  // register table clicks
  document
    .querySelector("table#studentlist")
    .addEventListener("click", clickedTable);
  fetchData();
}
function menuIcon(x) {
  x.classList.toggle("change");
  document.querySelector("nav").classList.toggle("hidden");
  document.querySelector("table").classList.toggle("fader");
}

function fetchData() {
  fetch("http://petlatkea.dk/2018/classlist1991/students.json")
    .then(function(response) {
      return response.json();
    })
    .then(function(jsondata) {
      buildList(jsondata);
      currentStudents = allStudents;
      displayList(currentStudents);
    });
}
const Student_prototype = {
  firstName: "",
  lastName: "",
  house: "",
  toString() {
    return this.firstName + " " + this.lastName;
  },
  splitName(fullName) {
    const firstSpace = fullName.indexOf(" ");
    this.firstName = fullName.substring(0, firstSpace);
    this.lastName = fullName.substring(firstSpace + 1);
  },
  setHouse(house) {
    this.house = house;
  }
};
function buildList(jsondata) {
  Object.keys(jsondata).forEach(house => {
    const houseStudentNames = jsondata[house];
    fillHouseWithStudents(house, houseStudentNames);
  });
  function fillHouseWithStudents(house, studentNames) {
    studentNames.forEach(createStudent);
    function createStudent(fullName) {
      const student = Object.create(Student_prototype);
      student.splitName(fullName);
      //student.setHouse(house);
      student.house = house;

      // assign this student a unique id
      student.id = generateUUID();
      allStudents.push(student);
    }
  }
}

// from: https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript/8809472#8809472
function generateUUID() {
  // Public Domain/MIT
  var d = new Date().getTime();
  if (
    typeof performance !== "undefined" &&
    typeof performance.now === "function"
  ) {
    d += performance.now(); //use high-precision timer if available
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function deleteStudent(studentId) {
  // find the index of the student with studentId
  const index = allStudents.findIndex(findStudent);
  console.log("found index: " + index);
  allStudents.splice(index, 1);

  // function that returns true when student.id == studentId
  function findStudent(student) {
    if (student.id === studentId) {
      return true;
    } else {
      return false;
    }
  }
}

function sortByFirstName() {
  currentStudents.sort(byFirstName);
  function byFirstName(a, b) {
    if (a.firstName < b.firstName) {
      return -1;
    } else if (a.firstName > b.firstName) {
      return 1;
    } else {
      return 0;
    }
  }
  resetMenu();
}

function sortByLastName() {
  currentStudents.sort(byLastName);
  function byLastName(a, b) {
    if (a.lastName < b.lastName) {
      return -1;
    } else {
      return 1;
    }
  }
  resetMenu();
}

function sortByHouse() {
  currentStudents.sort(byHouseAndFirstName);
  function byHouseAndFirstName(a, b) {
    // first sort by house, but if house is the same, sort by first name
    if (a.house < b.house) {
      return -1;
    } else if (a.house > b.house) {
      return 1;
    } else {
      if (a.firstName < b.firstName) {
        return -1;
      } else {
        return 1;
      }
    }
  }
  resetMenu();
}

function filterByHouse(house) {
  resetMenu();
  const filteredStudents = allStudents.filter(byHouse);
  function byHouse(student) {
    if (student.house === house) {
      return true;
    } else {
      return false;
    }
  }
  return filteredStudents;
}

function listOfStudents() {
  let str = "";
  allStudents.forEach(student => (str += student + "\n"));
  return str;
}

function clickedTable(event) {
  const clicked = event.target;
  if (clicked.tagName.toLowerCase() === "button") {
    clickedDelete(clicked);
  } else {
    showModal(clicked);
  }
}

function clickedDelete(deleteButton) {
  console.log(deleteButton);
  //    console.log(deleteButton);
  // find the parent <tr> that has this deleteButton inside it
  let tr = deleteButton.parentElement;
  while (tr.tagName !== "TR") {
    tr = tr.parentElement;
  }
  const studentId = tr.dataset.studentId;
  deleteStudent(studentId);
  animateDelete(tr);
}
function showModal(event) {
  document.querySelector("#modal").style.display = "block";
  document.querySelector("table").classList.toggle("fader");
  console.log(event);
  document.querySelector(".closeModal").addEventListener("click", closeModal);
  document.querySelector("#modal").addEventListener("click", closeModal);
}
function closeModal(clicked) {
  document.querySelector("#modal").style.display = "none";
  document.querySelector("table").classList.remove("fader");
}
function animateDelete(tr) {
  tr.style.transform = "translateX(-105%)";
  tr.style.transition = "transform 1s";

  // tr.classList.add("fly-out");
  const rect = tr.getBoundingClientRect();

  tr.addEventListener("transitionend", function() {
    // find the nextSibling (the tr below this)
    let nextSibling = tr.nextElementSibling;

    if (nextSibling !== null) {
      nextSibling.addEventListener("transitionend", function() {
        console.log("transition end");

        // reset all the translateY!
        let nextTr = tr.nextElementSibling;
        while (nextTr !== null) {
          nextTr.style.transform = "translateY(0)";
          nextTr.style.transition = "transform 0s";
          nextTr = nextTr.nextElementSibling;
        }

        // remove that <tr>
        tr.remove();
      });

      while (nextSibling !== null) {
        nextSibling.style.transform = "translateY(-" + rect.height + "px)";
        nextSibling.style.transition = "transform 0.5s";
        nextSibling = nextSibling.nextElementSibling;
      }
    } else {
      // no next sibling - just remove!
      tr.remove();
    }
  });
}

function clickedSortFirstname() {
  console.log("clickedSortFirstname");
  sortByFirstName();
  displayList(currentStudents);
}

function clickedSortLastname() {
  console.log("clickedSortLastname");
  sortByLastName();
  displayList(currentStudents);
}

function clickedSortHouse() {
  console.log("clickedSortHouse");
  sortByHouse();
  displayList(currentStudents);
}

function clickedFilter(event) {
  const filter = this.dataset.filter; // references data-filter="____"
  event.preventDefault();

  // create a list of filtered students by house

  // if filter === all, let the list be all students
  if (filter === "all") {
    currentStudents = allStudents;
    displayList(currentStudents);
  } else {
    currentStudents = filterByHouse(filter);
    displayList(currentStudents);
  }
}

function displayList(listOfStudents) {
  console.log("Display list");
  // clear the table
  document.querySelector("table#studentlist tbody").innerHTML = "";

  // foreach student in listOfStudents
  listOfStudents.forEach(function(student) {
    // clone a table-row for student
    const clone = document
      .querySelector("#student_template")
      .content.cloneNode(true);

    // fill in the clone with data
    clone.querySelector("[data-firstname]").textContent = student.firstName;
    clone.querySelector("[data-lastname]").textContent = student.lastName;
    clone.querySelector("[data-house]").textContent = student.house;

    // add the studentId to the <tr>
    clone.querySelector("tr").dataset.studentId = student.id;

    // append clone to table
    document.querySelector("table#studentlist tbody").appendChild(clone);
  });
}
function resetMenu() {
  document.querySelector("nav").classList.add("hidden");
  document.querySelector(".container").classList.toggle("change");
  document.querySelector("table").classList.remove("fader");
}
