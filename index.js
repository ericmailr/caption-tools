// TODO
//
// handle jr, III, II
// should probably auto cap first letters
// could make a scraper for sidearm grids, just grab player name class, coaches would be a little more annoying

// add a   check roster without downloading    button

const submitRosterButton = document.getElementById("submitRoster");
const submitRoster1Button = document.getElementById("submitRoster1");
const submitRoster2Button = document.getElementById("submitRoster2");

const rawRoster1Input = document.getElementById("rawRoster1");
const rawRoster2Input = document.getElementById("rawRoster2");

const team1NamesInput = document.getElementById("team1NameInput");
const team2NamesInput = document.getElementById("team2NameInput");

const processButtons = document.getElementsByClassName("process-buttons");
let height = processButtons[0].offsetHeight + 3;
processButtons[0].style.marginTop = `-${height}px`;
processButtons[1].style.marginTop = `-${height}px`;

processButtons[0].addEventListener("click", () => {
  saveInputs();
  let [r, w, t, playersOnlyRoster] = getRoster(
    team1NamesInput,
    rawRoster1Input,
    coaches1Input
  );
  rawRoster1Input.value = playersOnlyRoster;
});

processButtons[1].addEventListener("click", () => {
  saveInputs();
  let [r, w, t, playersOnlyRoster] = getRoster(
    team2NamesInput,
    rawRoster2Input,
    coaches2Input
  );
  rawRoster2Input.value = playersOnlyRoster;
});

const alphabetizeInput = document.getElementById("alphabetizeInput");
const suffixInput = document.getElementById("suffix-input");
let suffix = "prame";

const venueInput = document.getElementById("venue-input");
const coaches1Input = document.getElementById("coaches1Input");
const coaches2Input = document.getElementById("coaches2Input");
const commentatorsInput = document.getElementById("commentatorsInput");
const officiatorsInput = document.getElementById("officiatorsInput");

const tranPrefixInput = document.getElementById("prefix-input");

const filename1Input = document.getElementById("filename1Input");
const filename2Input = document.getElementById("filename2Input");

const playersColNumInput = document.getElementById("player-col-number");

const notes = document.getElementById("notes");
notes.style.display = "none";
const showNotesButton = document.getElementById("showNotesButton");
const toggleNotes = () => {
  notes.parentElement.style.width =
    notes.style.display === "none" ? "17%" : "0px";
  notes.style.display = notes.style.display === "flex" ? "none" : "flex";
};
showNotesButton.addEventListener("click", toggleNotes);
notes.addEventListener("click", toggleNotes);

const checkboxContainer = document.getElementById("checkbox-container");
checkboxContainer.addEventListener("click", (e) => {
  if (e.target.id !== "alphabetizeInput")
    alphabetizeInput.checked = alphabetizeInput.checked ? false : true;
});

if (typeof Storage !== "undefined") {
  team1NamesInput.value = localStorage.getItem("team1Names");
  team2NamesInput.value = localStorage.getItem("team2Names");
  coaches1Input.value = localStorage.getItem("coaches1");
  coaches2Input.value = localStorage.getItem("coaches2");
  rawRoster1Input.value = localStorage.getItem("roster1");
  rawRoster2Input.value = localStorage.getItem("roster2");
  playersColNumInput.value = !localStorage.getItem("playersColumn")
    ? 1
    : localStorage.getItem("playersColumn");
  suffixInput.value = !localStorage.getItem("suffix")
    ? "prame"
    : localStorage.getItem("suffix");
  tranPrefixInput.value = !localStorage.getItem("prefix")
    ? "tran"
    : localStorage.getItem("prefix");
  venueInput.value = localStorage.getItem("venue");
  officiatorsInput.value = localStorage.getItem("officials");
  commentatorsInput.value = localStorage.getItem("commentators");
}

const prepTime = 15;
let tranSlotNames = [];
let tranSlots;

const compareStrings = (a, b) => {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};

const compare = (a, b) => {
  a = a.toLowerCase();
  b = b.toLowerCase();
  const splitA = a.split(" ");
  const splitB = b.split(" ");
  const lastA = splitA[splitA.length - 1];
  const lastB = splitB[splitB.length - 1];
  return lastA === lastB
    ? compareStrings(splitA[0], splitB[0])
    : compareStrings(lastA, lastB);
};

const initTranSlots = () => {
  let prefix = tranPrefixInput.value === "" ? "tran" : tranPrefixInput.value;
  let tranArray = [];
  for (let i = 0; i < 35; i++) {
    if (i < 9) {
      tranArray.push(`${prefix}0${i + 1}|`);
    } else {
      tranArray.push(`${prefix}${i + 1}|`);
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
  let prefix = tranPrefixInput.value === "" ? "tran" : tranPrefixInput.value;
  tranSlots = initTranSlots();
  let commentatorNames = getProcessedGroupArray(commentatorsInput.value);
  tranSlots[5] =
    commentatorNames.length > 0
      ? `${prefix}06|${commentatorNames[0]}`
      : `${prefix}06|`;
  tranSlots[6] =
    commentatorNames.length > 1
      ? `${prefix}07|${commentatorNames[1]}`
      : `${prefix}07|`;
  tranSlots[7] =
    commentatorNames.length > 2
      ? `${prefix}|${commentatorNames[2]}`
      : `${prefix}08|`;
  let alphabeticalTranSlotNames = alphabetizeInput.checked
    ? tranSlotNames.sort(compare).slice(0, 10)
    : tranSlotNames.slice(0, 10);

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

  tranSlots[0] =
    team1Names.length > 0 ? `${prefix}01|${team1Names[0]}` : `${prefix}01|`;
  tranSlots[1] =
    team2Names.length > 0 ? `${prefix}02|${team2Names[0]}` : `${prefix}02|`;
  tranSlots[2] =
    team1Names.length > 1 ? `${prefix}03|${team1Names[1]}` : `${prefix}03|`;
  tranSlots[3] =
    team2Names.length > 1 ? `${prefix}04|${team2Names[1]}` : `${prefix}04|`;
  tranSlots[4] = venueInput.value
    ? `${prefix}05|${getProcessedGroupArray(venueInput.value)[0]}`
    : `${prefix}05|`;

  let coaches1 = getProcessedGroupArray(coaches1Input.value);
  let coaches2 = getProcessedGroupArray(coaches2Input.value);
  tranSlots[31] =
    coaches1.length > 0 ? `${prefix}32|${coaches1[0]}` : `${prefix}32|`;
  tranSlots[33] =
    coaches2.length > 0 ? `${prefix}34|${coaches2[0]}` : `${prefix}34|`;

  return tranSlots;
};

tranSlots = initTranSlots();

const printTranSlots = (tranSlots) => {
  let tranSlotsString = "";
  tranSlots.forEach((slot) => {
    tranSlotsString += `${slot}\n`;
  });
  return tranSlotsString;
};

// remove white space, special characters. Return barebones fullname and lastname, only - and . allowed.
const getNameAsArray = (fullName) => {
  let lastName = "";
  fullName = fullName.trim();
  fullName = fullName.normalize("NFD").replace(/[\u0300-\u036f]|[0-9]/g, "");
  fullName = fullName.replace(/ *\([^)]*\) */g, "");
  if (fullName.includes("Hear how to pronounce")) {
    fullName = fullName.split("Hear how to pronounce");
    fullName = fullName[0];
  }
  if (fullName.includes("\t")) {
    let col = playersColNumInput.value ? playersColNumInput.value : 1;
    fullName = fullName.split("\t");
    fullName = fullName[col - 1].trim();
  }
  if (fullName != "") {
    fullName = fullName.trim();
    if (fullName.includes(",")) {
      let names = fullName.split(",");
      lastName = names[0].trim();
      fullName = names[1].trim() + " " + names[0];
    } else {
      let names = fullName.split(" ");
      lastName = names.length > 1 ? names[1].trim() : fullName;
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
    entries += `${entry}\\${entry} ${suffix}\n`;
  }
  return entries;
};

const processRawArray = (rawArray) => {
  let rosterArray = [];
  rawArray.forEach((fullName) => {
    if (fullName !== "") {
      [fullName, lastName] = getNameAsArray(fullName);
      if (!rosterArray.includes(fullName)) {
        rosterArray.push(fullName);
      }
    }
  });
  let alphabeticalRosterArray = alphabetizeInput.checked
    ? rosterArray.sort(compare)
    : rosterArray;
  let prevLastNameFirstLetter = "a";
  alphabeticalRosterArray.forEach((fullName, i) => {
    let names = fullName.split(" ");
    lastName = names.at(-1);
    if (lastName === "`" || lastName === "*") {
      lastName = names.at(-2);
    }
    if (
      alphabetizeInput.checked &&
      prevLastNameFirstLetter < lastName.charAt(0).toLowerCase()
    ) {
      prevLastNameFirstLetter = lastName.charAt(0).toLowerCase();
      alphabeticalRosterArray[i] = "\n" + alphabeticalRosterArray[i];
    }
  });
  return alphabeticalRosterArray;
};

const saveInputs = () => {
  if (typeof Storage !== "undefined") {
    localStorage.setItem("team1Names", `${team1NamesInput.value}`);
    localStorage.setItem("team2Names", `${team2NamesInput.value}`);
    localStorage.setItem("coaches1", `${coaches1Input.value}`);
    localStorage.setItem("coaches2", `${coaches2Input.value}`);
    localStorage.setItem("roster1", `${rawRoster1Input.value}`);
    localStorage.setItem("roster2", `${rawRoster2Input.value}`);
    localStorage.setItem("playersColumn", `${playersColNumInput.value}`);
    localStorage.setItem("suffix", `${suffixInput.value}`);
    localStorage.setItem("prefix", `${tranPrefixInput.value}`);
    localStorage.setItem("venue", `${venueInput.value}`);
    localStorage.setItem("officials", `${officiatorsInput.value}`);
    localStorage.setItem("commentators", `${commentatorsInput.value}`);
  }
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
  rosterArray = [...new Set(rosterArray)];
  let coaches = getProcessedGroupArray(coachesInput.value);
  let venueNames = getProcessedGroupArray(venueInput.value);
  let venueName = venueNames[0];
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

  let playersOnlyRoster = "";
  rosterArray.forEach((playerName) => {
    wordList += getVocabEntries(playerName);
    roster += playerName + "\n";
    playersOnlyRoster += playerName + "\n";
  });

  wordList += "\n";
  roster += "\nCoaches:\n";
  coaches.forEach((coachName) => {
    wordList += getVocabEntries(coachName, true);
    roster += coachName + "\n";
  });

  let playersOnlyWordList = wordList;
  venueNames.forEach((name) => {
    wordList += "\n" + getVocabEntries(name, false, false) + "\n";
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
  return [roster, wordList, tranSlots, playersOnlyRoster, playersOnlyWordList];
};

const getBigRoster = () => {
  saveInputs();
  tranSlotNames = [];
  let [r1, w1, t1, playersOnlyRoster1, playersOnlyWordList] = getRoster(
    team1NamesInput,
    rawRoster1Input,
    coaches1Input
  );
  rawRoster1Input.value = playersOnlyRoster1;
  let tranSlotNames1 = tranSlotNames;
  let [r2, w2, t2, playersOnlyRoster2] = getRoster(
    team2NamesInput,
    rawRoster2Input,
    coaches2Input,
    tranSlotNames1
  );
  rawRoster2Input.value = playersOnlyRoster2;

  let teamNamesArray = getProcessedGroupArray(team1NamesInput.value).concat(
    getProcessedGroupArray(team2NamesInput.value)
  );
  teamNamesArray = alphabetizeInput.checked
    ? teamNamesArray.sort(compare)
    : teamNamesArray;
  let rosterArray = processRawArray(rawRoster1Input.value.split("\n")).concat(
    processRawArray(rawRoster2Input.value.split("\n"))
  );
  rosterArray = alphabetizeInput.checked
    ? rosterArray.sort(compare)
    : rosterArray;
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
    } else {
      rosterArray[i] = fullName.trim();
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
  let filename1 = getProcessedGroupArray(team1NamesInput.value)[0];
  let filename2 = getProcessedGroupArray(team2NamesInput.value)[0];
  rosterLink.download = `roster-${filename1}/${filename2}.txt`;
  wordListLink.download = `word list-${filename1}/${filename2}.txt`;
  subListLink.download = `sub list-${filename1}.txt`;
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

submitRosterButton.addEventListener("click", getBigRoster);
submitRoster1Button.addEventListener("click", () => {
  //added last
  tranSlotNames = [];
  let [r, w, t, playersOnlyRoster] = getRoster(
    team1NamesInput,
    rawRoster1Input,
    coaches1Input,
    tranSlots
  );
  rawRoster1Input.value = playersOnlyRoster;
  saveInputs();
  downloadFiles(r, w, t);
});

submitRoster2Button.addEventListener("click", () => {
  //added last
  tranSlotNames = [];
  let [r, w, t, playersOnlyRoster] = getRoster(
    team2NamesInput,
    rawRoster2Input,
    coaches2Input
  );
  rawRoster2Input.value = playersOnlyRoster;
  saveInputs();
  downloadFiles(r, w, t);
});
