//const sdv = require("sportsdataverse");
//const gameId = 401260281;
//const rresult = await sdv.cbb.getPlayByPlay(gameId);
//console.log(rresult);
//my api key tt9oNaqdbwWc

const submitScheduleButton = document.getElementById("submitSchedule");
const rawScheduleInput = document.getElementById("rawSchedule");
const submitRosterButton = document.getElementById("submitRoster");
const rawRosterInput = document.getElementById("rawRoster");
const scheduleContainerDiv = document.getElementById("scheduleContainer");
const teamNameInput = document.getElementById("team-name-input");
const suffixInput = document.getElementById("suffix-input");

const prepTime = 15;

const getFileSuffix = () => {
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();
  var hh = today.getHours();
  var m = today.getMinutes();

  return `${mm}${dd}${yyyy}${hh}${m}`;
};

const compareStrings = (a, b) => {
  if (a < b) return -1;
  if (a > b) return 1;

  return 0;
};

const compare = (a, b) => {
  const splitA = a.split(" ");
  const splitB = b.split(" ");
  const lastA = splitA[splitA.length - 1];
  const lastB = splitB[splitB.length - 1];

  return lastA === lastB
    ? compareStrings(splitA[0], splitB[0])
    : compareStrings(lastA, lastB);
};

const getRoster = () => {
  let wordList = "";
  let roster = "";
  let suffix = suffixInput.value === "" ? "prame" : suffixInput.value;
  let rawRoster = rawRosterInput.value;
  let prevLastNameFirstLetter = "a";
  let inputArray = rawRoster.split("\n");
  let fullNamesArray = [];
  inputArray.forEach((fullName) => {
    fullName = fullName.trim();
    fullName = fullName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    fullName = fullName.replace(/[^a-zA-Z '\-]/g, "");
    if (fullName != "") {
      let lastName = "";
      if (fullName.includes(",")) {
        let names = fullName.split(", ");
        lastName = names[0];
        fullName = names[1] + " " + names[0];
      } else {
        let names = fullName.split(" ");
        lastName = names.at(-1);
      }
      fullNamesArray.push(fullName);

      wordList += `${fullName}\n${fullName}\\${fullName} ${suffix}\n${lastName}\n${lastName}\\${lastName} ${suffix}\n`;
    }
  });
  console.log(wordList);
  let alphabeticalRoster = fullNamesArray.sort(compare);
  console.log(alphabeticalRoster);
  alphabeticalRoster.forEach((fullName) => {
    let names = fullName.split(" ");
    lastName = names.at(-1);
    if (prevLastNameFirstLetter < lastName.charAt(0).toLowerCase()) {
      prevLastNameFirstLetter = lastName.charAt(0).toLowerCase();
      roster += "\n";
    }
    roster += fullName + "\n";
  });
  console.log(roster);

  window.URL = window.webkitURL || window.URL;
  var contentType = "text/plain";
  var rosterFile = new Blob([roster], { type: contentType });
  var wordListFile = new Blob([wordList], { type: contentType });
  var a1 = document.createElement("a");
  var a2 = document.createElement("a");
  let teamName = teamNameInput.value;
  a1.download = `${teamName} roster.txt`;
  a2.download = `${teamName} word list.txt`;
  a1.href = window.URL.createObjectURL(rosterFile);
  a2.href = window.URL.createObjectURL(wordListFile);
  a1.dataset.downloadurl = [contentType, a1.download, a1.href].join(":");
  a2.dataset.downloadurl = [contentType, a2.download, a2.href].join(":");
  document.body.appendChild(a1);
  document.body.appendChild(a2);
  a1.click();
  a2.click();
};

submitRosterButton.addEventListener("click", getRoster);

Date.prototype.addDays = function (days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

var date = new Date();

const formatDate = (dateObject) => {
  let month = dateObject.getMonth() + 1;
  let day = dateObject.getDate();
  let year = dateObject.getFullYear();
  return `${month}/${day}/${year}`;
};

const getCSV = () => {
  const rawSchedule = rawScheduleInput.value;
  if (rawSchedule != "") {
    let dates = rawSchedule.match(/((\d\d)|(\d))\/((\d\d)|(\d))\/20\d\d/g);
    let times = rawSchedule.match(/((\d\d)|(\d)):\d\d(A|P)M/g);
    let descriptions = rawSchedule.match(/Description: .*/g);

    if (descriptions) {
      descriptions = descriptions.map((d) => d.substring(13, d.length));
    }

    const militarizeTime = (time) => {
      let hour = parseInt(time.substring(0, 2));
      let minutes = time.substring(3, 5);
      if (time.charAt(time.length - 2) === "A") {
        return hour == 12 ? "00" + ":" + minutes : time.substring(0, 5);
      } else {
        let newHour = hour < 12 ? hour + 12 : 12;
        let newTime = newHour + ":" + time.substring(3, 5);
        return newTime;
      }
    };

    dates.forEach((date, i) => {
      dates[i] = new Date(dates[i]);
    });

    times.forEach((t, i) => {
      times[i] = militarizeTime(t);
    });

    let endDates = JSON.parse(JSON.stringify(dates));

    times.forEach((t, i) => {
      // add prep time
      if (i % 2 === 0) {
        let hour = parseInt(t.substring(0, 2));
        let minutes = parseInt(t.substring(3, 5));
        if (minutes < prepTime) {
          let newHour = hour - 1;
          if (hour == 0) {
            newHour = 23;

            let tempDate = new Date(dates[i / 2]);
            tempDate.setDate(tempDate.getDate() - 1);
            dates[i / 2] = tempDate;
          }
          if (newHour < 10) {
            newHour = "0" + newHour;
          }
          let newMinutes = (60 - (prepTime - minutes)) % 60;
          if (newMinutes < 10) {
            newMinutes = "0" + newMinutes;
          }
          times[i] = newHour + ":" + newMinutes;
        } else {
          let newMinutes = minutes - prepTime;
          if (newMinutes < 10) {
            newMinutes = "0" + newMinutes;
          }
          if (hour < 10) {
            hour = "0" + hour;
          }
          times[i] = hour + ":" + newMinutes;
        }
      }

      if (i % 2 == 1) {
        if (times[i].substring(0, 2) == "00") {
          let endDate = new Date(dates[(i - 1) / 2]);
          endDate.setDate(endDate.getDate() + 1);
          endDates[(i - 1) / 2] = formatDate(endDate);
        }
      }
    });

    dates.forEach((date, i) => {
      dates[i] = formatDate(new Date(dates[i]));
      endDates[i] = formatDate(new Date(endDates[i]));
    });

    let csvContent = "";
    csvContent +=
      "Subject, Start Date, Start Time, End Date, End Time, All Day Event, Description, Private,\n";

    dates.forEach((date, i) => {
      csvContent += `Work, ${dates[i]}, ${times[2 * i]}, ${endDates[i]}, ${
        times[2 * i + 1]
      }, false, ${descriptions?.[i]}, true,\n`;
    });
    console.log(csvContent);

    window.URL = window.webkitURL || window.URL;
    var contentType = "text/csv";
    var csvFile = new Blob([csvContent], { type: contentType });
    var a = document.createElement("a");
    a.download = `work-schedule-${getFileSuffix()}.csv`;
    a.href = window.URL.createObjectURL(csvFile);
    a.dataset.downloadurl = [contentType, a.download, a.href].join(":");
    document.body.appendChild(a);
    a.click();
  }
};

submitScheduleButton.addEventListener("click", getCSV);
