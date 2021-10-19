// TODO
// add option to not sort alphabetically
// handle jr, III, II
// should probably auto cap first letters

const submitScheduleButton = document.getElementById("submitSchedule");
const rawScheduleInput = document.getElementById("rawSchedule");
const scheduleContainerDiv = document.getElementById("scheduleContainer");

const submitRosterButton = document.getElementById("submitRoster");
const submitRoster1Button = document.getElementById("submitRoster1");
const submitRoster2Button = document.getElementById("submitRoster2");

const rawRoster1Input = document.getElementById("rawRoster1");
const rawRoster2Input = document.getElementById("rawRoster2");

const team1NamesInput = document.getElementById("team1NameInput");
const team2NamesInput = document.getElementById("team2NameInput");

const suffixInput = document.getElementById("suffix-input");
let suffix = "prame";
const tranSlotsP = document.getElementById("tranSlots");

const venueInput = document.getElementById("venue-input");
const coaches1Input = document.getElementById("coaches1Input");
const coaches2Input = document.getElementById("coaches2Input");
const commentatorsInput = document.getElementById("commentatorsInput");
const officiatorsInput = document.getElementById("officiatorsInput");

const filename1Input = document.getElementById("filename1Input");
const filename2Input = document.getElementById("filename2Input");

const prepTime = 15;
let tranSlotNames = [];
let tranSlots;

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

const initTranSlots = () => {
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

const getProcessedGroupArray = (input) => {
  let subArray = [];
  if (input !== "") {
    let inputArray = input.split("\n");
    inputArray.forEach((vocabEntry) => {
      //get rid of leading/trailing white space, and empty lines
      vocabEntry = vocabEntry.trim().replace(/^\s*\n/gm, "");
      if (vocabEntry !== "") {
        subArray.push(vocabEntry);
      }
    });
  }
  return subArray;
};

const getTranSlots = () => {
  tranSlots = initTranSlots();
  let commentatorNames = getProcessedGroupArray(commentatorsInput.value);
  tranSlots[5] =
    commentatorNames.length > 0 ? `tran06|${commentatorNames[0]}` : "tran06|";
  tranSlots[6] =
    commentatorNames.length > 1 ? `tran07|${commentatorNames[1]}` : "tran07|";
  tranSlots[7] =
    commentatorNames.length > 2 ? `tran07|${commentatorNames[2]}` : "tran08|";
  let alphabeticalTranSlotNames = tranSlotNames.sort(compare).slice(0, 10);

  let firstIndex = 10;
  alphabeticalTranSlotNames.forEach((name, index) => {
    tranSlots[2 * index + firstIndex] = `tran${
      2 * index + (firstIndex + 1)
    }|${name}`;
  });

  commentatorNames.forEach((name, i) => {
    let tempName = name.split(" ")[0].trim();
    tempName = tempName.charAt(0).toUpperCase() + tempName.slice(1);
    tranSlots.push(`spee0${i + 1}|>> ${tempName}:`);
  });

  let team1Names = getProcessedGroupArray(team1NamesInput.value);
  let team2Names = getProcessedGroupArray(team2NamesInput.value);

  tranSlots[0] = team1Names.length > 0 ? `tran01|${team1Names[0]}` : "tran01|";
  tranSlots[1] = team2Names.length > 0 ? `tran02|${team2Names[0]}` : "tran02|";
  tranSlots[2] = team1Names.length > 1 ? `tran03|${team1Names[1]}` : `tran03|`;
  tranSlots[3] = team2Names.length > 1 ? `tran04|${team2Names[1]}` : `tran04|`;
  tranSlots[4] = venueInput.value
    ? `tran05|${getProcessedGroupArray(venueInput.value)[0]}`
    : "tran05|";

  let coaches1 = getProcessedGroupArray(coaches1Input.value);
  let coaches2 = getProcessedGroupArray(coaches2Input.value);
  tranSlots[31] = coaches1.length > 0 ? `tran32|${coaches1[0]}` : "tran32|";
  tranSlots[33] = coaches2.length > 0 ? `tran34|${coaches2[0]}` : "tran34|";

  return tranSlots;
};

tranSlots = initTranSlots();

const printTranSlots = (tranSlots) => {
  let tranSlotsString = "";
  tranSlots.forEach((slot) => {
    tranSlotsString += `${slot}\n`;
  });
  tranSlotsP.innerHTML = tranSlotsString;
  return tranSlotsString;
};

// remove white space, special characters. Return barebones fullname and lastname, only - and . allowed.
const getNameAsArray = (fullName) => {
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

const getVocabEntries = (entry, isCoach = false, isName = true) => {
  let entries = "";
  if (!entry || entry === "") {
    return "";
  }
  entry = entry.trim().replace(/^\s*\n/gm, "");
  if (isName) {
    let [fullName, lastName] = getNameAsArray(entry);
    entries = "";
    entries += `${fullName}\n${fullName}\\${fullName
      .replace(/\./g, "")
      .replace(/-/g, " ")} ${suffix}\n`;
    if (fullName !== lastName) {
      entries += `${lastName}\n${lastName}\\${lastName
        .replace(/\./g, "")
        .replace(/-/g, " ")} ${suffix}\n`;
      if (isCoach) {
        entries += "Coach " + fullName + "\n";
        entries += "Coach " + lastName + "\n";
      }
    } else {
      if (isCoach) {
        entries += "Coach " + lastName + "\n";
      }
    }
  } else {
    entries = "";
    entries += entry + "\n";
    entries += `${entry}\\${entry}`;
  }
  return entries;
};

const processRawArray = (rawArray) => {
  let rosterArray = [];
  rawArray.forEach((fullName) => {
    if (fullName !== "") {
      [fullName, lastName] = getNameAsArray(fullName);
      rosterArray.push(fullName);
    }
  });
  let alphabeticalRosterArray = rosterArray.sort(compare);
  let prevLastNameFirstLetter = "a";
  alphabeticalRosterArray.forEach((fullName, i) => {
    let names = fullName.split(" ");
    lastName = names.at(-1);
    if (prevLastNameFirstLetter < lastName.charAt(0).toLowerCase()) {
      prevLastNameFirstLetter = lastName.charAt(0).toLowerCase();
      alphabeticalRosterArray[i] = "\n" + alphabeticalRosterArray[i];
    }
  });
  return alphabeticalRosterArray;
};

const getRoster = (
  teamNamesInput,
  rawRosterInput,
  coachesInput,
  tranSlotNames = []
) => {
  suffix = suffixInput.value === "" ? "prame" : suffixInput.value;
  let teamNamesArray = getProcessedGroupArray(teamNamesInput.value);
  let rosterArray = processRawArray(rawRosterInput.value.split("\n"));
  let coaches = getProcessedGroupArray(coachesInput.value);
  let venueName = getProcessedGroupArray(venueInput.value)[0];
  venueName = venueName === undefined ? "" : venueName;
  let commentators = getProcessedGroupArray(commentatorsInput.value);
  let officiators = getProcessedGroupArray(officiatorsInput.value);
  let roster = "";
  let wordList = "";

  teamNamesArray.forEach((teamName) => {
    roster += teamName + "\n";
    wordList += getVocabEntries(teamName, false, false);
  });
  wordList += "\n" + getVocabEntries(venueName, false, false) + "\n";
  roster += venueName + "\n";

  rosterArray.forEach((playerName) => {
    wordList += getVocabEntries(playerName);
    roster += playerName + "\n";
  });
  let playersOnlyWordList = wordList;

  wordList += "\n";
  roster += "\nCoaches:\n";
  coaches.forEach((coachName) => {
    wordList += getVocabEntries(coachName, true);
    roster += coachName + "\n";
  });

  wordList.replace("\n\n\n", "\n");
  wordList += "\n";
  roster += "\nCommentators:\n";
  commentators.forEach((commentatorName) => {
    wordList += getVocabEntries(commentatorName);
    roster += commentatorName + "\n";
  });
  wordList += "\n";
  roster += "\nOfficials:\n";
  officiators.forEach((officiatorName) => {
    wordList += getVocabEntries(officiatorName);
    roster += officiatorName + "\n";
  });

  tranSlots = getTranSlots();
  return [roster, wordList, tranSlots, playersOnlyWordList];
};

const getBigRoster = () => {
  tranSlotNames = [];
  let [r1, w1, t1, playersOnlyWordList] = getRoster(
    team1NamesInput,
    rawRoster1Input,
    coaches1Input
  );
  let tranSlotNames1 = tranSlotNames;
  let [r2, w2, t2] = getRoster(
    team2NamesInput,
    rawRoster2Input,
    coaches2Input,
    tranSlotNames1
  );

  let teamNamesArray = getProcessedGroupArray(team1NamesInput.value)
    .concat(getProcessedGroupArray(team2NamesInput.value))
    .sort(compare);
  let rosterArray = processRawArray(rawRoster1Input.value.split("\n"))
    .concat(processRawArray(rawRoster2Input.value.split("\n")))
    .sort(compare);
  let coaches = getProcessedGroupArray(coaches1Input.value).concat(
    getProcessedGroupArray(coaches2Input.value)
  );
  let officials = getProcessedGroupArray(officiatorsInput.value);

  let prevLastNameFirstLetter = "a";
  rosterArray.forEach((fullName, i) => {
    fullName = fullName.replace("\n", "");
    let names = fullName.split(" ");
    lastName = names.at(-1);
    if (prevLastNameFirstLetter < lastName.charAt(0).toLowerCase()) {
      prevLastNameFirstLetter = lastName.charAt(0).toLowerCase();
      rosterArray[i] = "\n" + fullName.trim();
    }
  });

  roster = "";
  teamNamesArray.forEach((name) => {
    if (name.trim() !== "") {
      roster += name + "\n";
    }
  });
  roster += "\n";
  rosterArray.forEach((name) => {
    name = name.replace("\n", "");
    if (name.trim() !== "") {
      roster += name + "\n";
    }
  });
  roster += "\nCoaches:\n";
  coaches.forEach((name) => {
    if (name.trim() !== "") {
      roster += name + "\n";
    }
  });
  roster += "\nOfficials:\n";
  officials.forEach((name) => {
    if (name.trim() !== "") {
      roster += name + "\n";
    }
  });
  downloadFiles(roster, playersOnlyWordList + "\n" + w2, t2);
};

const downloadFiles = (roster, wordList, tranSlots) => {
  window.URL = window.webkitURL || window.URL;
  let contentType = "text/plain";

  let rosterFile = new Blob([roster], { type: contentType });
  let wordListFile = new Blob([wordList], { type: contentType });
  let subListFile = new Blob([printTranSlots(tranSlots)], {
    type: contentType,
  });
  let rosterLink = document.createElement("a");
  let wordListLink = document.createElement("a");
  let subListLink = document.createElement("a");
  let filename1 = filename1Input.value;
  let filename2 = filename2Input.value;
  if (filename2 === "") {
    rosterLink.download = `${filename1} roster.txt`;
    wordListLink.download = `${filename1} word list.txt`;
  } else {
    rosterLink.download = `${filename1}/${filename2} roster.txt`;
    wordListLink.download = `${filename1}/${filename2} word list.txt`;
  }
  subListLink.download = `${filename1} sub list ${getScheduleFileSuffix()}.txt`;
  rosterLink.href = window.URL.createObjectURL(rosterFile);
  wordListLink.href = window.URL.createObjectURL(wordListFile);
  subListLink.href = window.URL.createObjectURL(subListFile);
  rosterLink.dataset.downloadurl = [
    contentType,
    rosterLink.download,
    rosterLink.href,
  ].join(":");
  wordListLink.dataset.downloadurl = [
    contentType,
    wordListLink.download,
    wordListLink.href,
  ].join(":");
  subListLink.dataset.downloadurl = [
    contentType,
    subListLink.download,
    subListLink.href,
  ].join(":");
  document.body.appendChild(rosterLink);
  document.body.appendChild(wordListLink);
  console.log("roster:\n" + roster);
  console.log("wordList:\n" + wordList);
  console.log("subList:\n" + printTranSlots(tranSlots));
  rosterLink.click();
  wordListLink.click();
  subListLink.click();
};

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

submitRosterButton.addEventListener("click", getBigRoster);
submitRoster1Button.addEventListener("click", () => {
  //added last
  tranSlotNames = [];
  let [r, w, t] = getRoster(
    team1NamesInput,
    rawRoster1Input,
    coaches1Input,
    tranSlots
  );
  downloadFiles(r, w, t);
});

submitRoster2Button.addEventListener("click", () => {
  //added last
  tranSlotNames = [];
  let [r, w, t] = getRoster(team2NamesInput, rawRoster2Input, coaches2Input);
  downloadFiles(r, w, t);
});
