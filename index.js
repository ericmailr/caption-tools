// TODO
// add option to not sort alphabetically
// sort and group the word list too. easier to find and edit.

const submitScheduleButton = document.getElementById("submitSchedule");
const rawScheduleInput = document.getElementById("rawSchedule");
const submitRosterButton = document.getElementById("submitRoster");
const rawRosterInput = document.getElementById("rawRoster");
const scheduleContainerDiv = document.getElementById("scheduleContainer");
const filenameInput = document.getElementById("roster-filename-input");
const suffixInput = document.getElementById("suffix-input");
const suffix = suffixInput.value === "" ? "prame" : suffixInput.value;
const tranSlotsP = document.getElementById("tranSlots");

const teamNameInput = document.getElementById("teamNameInput");
const venueInput = document.getElementById("venueInput");
const coachesInput = document.getElementById("coachesInput");
const commentatorsInput = document.getElementById("commentatorsInput");

const prepTime = 15;

const getScheduleFileSuffix = () => {
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

const getTranSlots = () => {
  let tranArray = [];
  for (let i = 0; i < 35; i++) {
    if (i < 9) {
      tranArray.push(`tran0${i + 1}|`);
    } else {
      tranArray.push(`tran${i + 1}|`);
    }
  }
  return tranArray;
};

const getRoster = () => {
  let wordList = "";
  let roster = "";
  let tranSlotNames = [];
  // remove white space, special characters. Return barebones fullname and lastname, only - and . allowed.
  const processName = (fullName) => {
    let lastName = "";
    fullName = fullName.trim();
    fullName = fullName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (fullName != "") {
      if (fullName.includes(",")) {
        let names = fullName.split(",");
        lastName = names[0].trim();
        fullName = names[1].trim() + " " + names[0];
      } else {
        let names = fullName.split(" ");
        lastName = names.at(-1);
      }
      fullName = fullName.replace(/[^a-zA-Z ` '\-\.\*]/g, "");
      if (fullName.includes("*") || fullName.includes("`")) {
        fullName = fullName.replace(/`|\*/g, "");
        tranSlotNames.push(fullName);
      }
    }
    return [fullName, lastName];
  };

  const addEntryToWordList = (entry, isCoach = false) => {
    let [fullName, lastName] = processName(entry);
    wordList += `${fullName}\n${fullName}\\${fullName
      .replace(/\./g, "")
      .replace(/-/g, " ")} ${suffix}\n`;
    if (fullName !== lastName) {
      wordList += `${lastName}\n${lastName}\\${lastName
        .replace(/\./g, "")
        .replace(/-/g, " ")} ${suffix}\n`;
      if (isCoach) {
        wordList += "Coach " + fullName + "\n";
        wordList += "Coach " + lastName + "\n";
      }
    } else {
      if (isCoach) {
        wordList += "Coach " + lastName + "\n";
      }
    }
  };

  const addInput = (input, isFullName = true, isCoach = false) => {
    if (input !== "") {
      let subArray = [];
      let inputArray = input.split("\n");
      inputArray.forEach((vocabEntry) => {
        //get rid of leading/trailing white space, and empty lines
        vocabEntry = vocabEntry.trim().replace(/^\s*\n/gm, "");
        if (vocabEntry !== "") {
          subArray.push(vocabEntry);
          roster += isCoach
            ? "Coach " + vocabEntry + "\n"
            : processName(vocabEntry)[0] + "\n";
          if (isFullName) {
            addEntryToWordList(vocabEntry, isCoach);
          } else {
            wordList += vocabEntry + "\n";
          }
        }
      });
      return subArray;
    }
  };

  let teamNames = addInput(teamNameInput.value, false);
  let venueNames = addInput(venueInput.value, false);
  roster += "\n";

  let rawRoster = rawRosterInput.value;
  let inputArray = rawRoster.split("\n");
  let rosterArray = [];
  inputArray.forEach((fullName) => {
    if (fullName !== "") {
      [fullName, lastName] = processName(fullName);
      addEntryToWordList(fullName);
      rosterArray.push(fullName);
    }
  });
  let alphabeticalRoster = rosterArray.sort(compare);
  let prevLastNameFirstLetter = "a";
  alphabeticalRoster.forEach((fullName) => {
    let names = fullName.split(" ");
    lastName = names.at(-1);
    if (prevLastNameFirstLetter < lastName.charAt(0).toLowerCase()) {
      prevLastNameFirstLetter = lastName.charAt(0).toLowerCase();
      roster += "\n";
    }
    roster += fullName + "\n";
  });
  roster += "\n";
  let coachNames = addInput(coachesInput.value, true, true);
  let commentatorNames = addInput(commentatorsInput.value);

  console.log("roster: \n" + roster);
  console.log("wordList: \n" + wordList);

  let tranSlots = getTranSlots();
  tranSlots[2] = teamNames ? `tran03|${teamNames[0]}` : "tran03|";
  tranSlots[4] = venueNames ? `tran05|${venueNames[0]}` : "tran05|";
  tranSlots[5] = commentatorNames ? `tran06|${commentatorNames[0]}` : "tran06|";
  tranSlots[6] =
    commentatorNames && commentatorNames[1]
      ? `tran07|${commentatorNames[1]}`
      : "tran07|";
  tranSlots[31] = coachNames ? `tran32|${coachNames[0]}` : "tran32|";
  tranSlots[33] =
    coachNames && coachNames[1] ? `tran34|${coachNames[1]}` : "tran32|";
  let spee01FirstName = "";
  let spee02FirstName = "";
  let spee03FirstName = "";
  if (commentatorNames) {
    spee01FirstName = commentatorNames[0].split(" ")[0].trim();
    spee01FirstName =
      spee01FirstName.charAt(0).toUpperCase() + spee01FirstName.slice(1);
    tranSlots.push(`spee01|>> ${spee01FirstName}:`);
    if (commentatorNames[1]) {
      spee02FirstName = commentatorNames[1].split(" ")[0].trim();
      spee02FirstName =
        spee02FirstName.charAt(0).toUpperCase() + spee02FirstName.slice(1);
      tranSlots.push(`spee02|>> ${spee02FirstName}:`);
    }
    if (commentatorNames[2]) {
      spee03FirstName = commentatorNames[2].split(" ")[0].trim();
      spee03FirstName =
        spee03FirstName.charAt(0).toUpperCase() + spee03FirstName.slice(1);
      tranSlots.push(`spee03|>> ${spee03FirstName}:`);
    }
  }

  let teamType = document.querySelector("input[name=teamType]:checked").value;
  slotNumber = teamType === "Both" ? 10 : 5;

  let alphabeticalTranSlotNames = tranSlotNames
    .sort(compare)
    .slice(0, slotNumber);

  let firstIndex = teamType === "Home" || teamType === "Both" ? 10 : 20;
  alphabeticalTranSlotNames.forEach((name, index) => {
    tranSlots[2 * index + firstIndex] = `tran${
      2 * index + (firstIndex + 1)
    }|${name}`;
  });

  let tranSlotsString = "";
  tranSlots.forEach((slot) => {
    tranSlotsString += `${slot}\n`;
  });
  console.log(tranSlotsString);
  tranSlotsP.innerHTML = tranSlotsString;

  window.URL = window.webkitURL || window.URL;
  var contentType = "text/plain";
  var rosterFile = new Blob([roster], { type: contentType });
  var wordListFile = new Blob([wordList], { type: contentType });
  var a1 = document.createElement("a");
  var a2 = document.createElement("a");
  let filename = filenameInput.value;
  a1.download = `${filename} roster.txt`;
  a2.download = `${filename} word list.txt`;
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
    a.download = `work-schedule-${getScheduleFileSuffix()}.csv`;
    a.href = window.URL.createObjectURL(csvFile);
    a.dataset.downloadurl = [contentType, a.download, a.href].join(":");
    document.body.appendChild(a);
    a.click();
  }
};

submitScheduleButton.addEventListener("click", getCSV);
