import {
  CHANGE_SECTION,
  CLOSE_MSG,
  DESELECT_CHARACTER,
  RECEIVE_CAN_UNDO,
  RECEIVE_CHARACTERS,
  RECEIVE_STORY,
  RECEIVE_UNDO,
  REQUEST_CAN_UNDO,
  REQUEST_CHARACTER,
  REQUEST_CHARACTERS,
  REQUEST_STORY,
  REQUEST_UNDO,
  SELECT_CHARACTER,
  SET_FILTER,
  SET_SAVING_TYPE,
  SHOW_ERROR_MSG,
  SHOW_MSG,
  SHOW_SUCCESS_MSG
} from "./action-types";
import {sendToModel} from "../../shared/commons/ipc";
import {
  CAN_UNDO_CHARACTER_CHANGE,
  CREATE_CHARACTER,
  FIND_CHARACTERS,
  UNDO_CHARACTER_CHANGE,
  UPDATE_CHARACTER
} from "../../shared/characters/ipc-channels";
import {CLOSE_STORY, CREATE_STORY, OPEN_STORY, OPEN_STORY_DIALOG} from "../../shared/stories/ipc-channels";
import ChangeType from "../../shared/characters/change-type";
import Sections from "../constants/sections";
import path from "path";
import {shell} from "electron";
import SavingType from "../constants/SavingType";

// Communication State
export function sectionIsLoading(trueOrFalse) {
  return {
    type: "TOGGLE_SECTION_LOADING",
    payload: trueOrFalse
  };
}

export function setSavingType(savingType) {
  return {
    type: SET_SAVING_TYPE,
    payload: savingType,
  };
}

// UI ACTIONS

export function showMessage(message) {
  return {
    type: SHOW_MSG,
    payload: {message}
  };
}

export function showErrorMessage(message = "Fehler") {
  return {
    type: SHOW_ERROR_MSG,
    payload: {message}
  };
}

export function showSuccessMessage(message = "Success", withAction = false) {
  return {
    type: SHOW_SUCCESS_MSG,
    payload: {
      message: message,
      withAction: withAction
    }
  };
}

export function closeMessage() {
  return {
    type: CLOSE_MSG
  };
}

// SECTIONS
export function changeSection(section) {
  return {
    type: CHANGE_SECTION,
    payload: section
  };
}

// CHARACTER
export function selectCharacter(character) {
  return {
    type: SELECT_CHARACTER,
    payload: character
  };
}

export function deselectCharacter() {
  return {
    type: DESELECT_CHARACTER,
    payload: {}
  };
}

export function setFilter(filter) {
  return {
    type: SET_FILTER,
    payload: filter
  };
}

export function requestCharacter(uuid = "") {
  return {
    type: REQUEST_CHARACTER,
    payload: uuid
  };
}

export function updateSelectedCharacter(character) {
  return {
    type: "UPDATE_CHARACTER",
    payload: character
  };
}

export function createCharacter() {
  return function (dispatch) {
    const defaultName = "";
    dispatch(requestCharacter());
    return sendToModel(CREATE_CHARACTER)
      .then(uuid => sendToModel(UPDATE_CHARACTER,
        {
          characterId: uuid,
          type: ChangeType.CHARACTER,
          typeId: uuid,
          changes: {
            name: defaultName
          }
        }))
      .then(uuid => {
        dispatch(showMessage("Charakter erfolgreich erstellt"));
        return Promise.resolve(uuid);
      })
      .then(uuid => {
        dispatch(findCharacters());
        return Promise.resolve(uuid);
      })
      .then(uuid => {
        dispatch(canUndoCharacterChange(uuid));
        return Promise.resolve(uuid);
      })
      .then(uuid => {
        dispatch(selectCharacter({id: uuid, name: defaultName}));
        return Promise.resolve(uuid);
      })
      .catch((error) => console.log(error));
  };
}

export function updateCharacter(characterId, changeType, typeId, name) {
  return function (dispatch) {
    dispatch(requestCharacter());
    dispatch(setSavingType(SavingType.ACTIVE));
    return sendToModel(UPDATE_CHARACTER,
      {
        characterId: characterId,
        type: changeType,
        typeId: typeId,
        changes: {
          name: name
        }
      })
      .then(typeId => (console.log("Typ erfolgreich geändert", typeId)))
      .then(() => dispatch(showMessage("Charakter erfolgreich geändert")))
      .then(() => dispatch(setSavingType(SavingType.SUCCESS)));
  };
}

export function requestCharacters() {
  return {
    type: REQUEST_CHARACTERS,
    payload: {}
  };
}

export function receiveCharacters(characters) {
  return {
    type: RECEIVE_CHARACTERS,
    payload: characters
  };
}

export function findCharacters(filter = "") {
  return function (dispatch) {
    dispatch(requestCharacters());
    return sendToModel(FIND_CHARACTERS, {deleted: false, filter})
      .then(characters => dispatch(receiveCharacters(characters)))
      .catch(error => console.log("Could not find characters: ", error));
  };
}

export function requestCanUndo() {
  console.log("REQUESTING: UNDO ");
  return {
    type: REQUEST_CAN_UNDO,
  };
}

export function receiveCanUndo(canUndo) {
  return {
    type: RECEIVE_CAN_UNDO,
    payload: canUndo
  };
}

export function canUndoCharacterChange(id = "") {
  return function (dispatch) {
    dispatch(requestCanUndo());
    return sendToModel(CAN_UNDO_CHARACTER_CHANGE, id)
      .then(canUndo => dispatch(receiveCanUndo(canUndo)))
      .then(canUndo => console.log("can undo?", canUndo, "for", id));
  };
}

export function requestUndo() {
  return {
    type: REQUEST_UNDO
  };
}

export function receiveUndo(changes) {
  return {
    type: RECEIVE_UNDO,
    payload: changes,
  };
}

export function undoCharacterChange(id = "") {
  console.log("UNDOING CHANGES FOR ", id);
  return (dispatch) => {
    dispatch(requestUndo());
    return sendToModel(UNDO_CHARACTER_CHANGE, id)
      .then(changes => dispatch(updateSelectedCharacter(changes)))
      .then(changes => dispatch(canUndoCharacterChange(id)))
      .then(changes => dispatch(receiveUndo(changes)))
      .catch(error => console.log("error undoing", error));
  };
}

// STORIES
export function requestStory(file = "") {
  return {
    type: REQUEST_STORY,
    payload: file,
  };
}

export function receiveStory(file) {
  return {
    type: RECEIVE_STORY,
    payload: file,
  };
}

export function createStory() {
  return function (dispatch) {
    dispatch(sectionIsLoading(true));
    dispatch(requestStory());
    return sendToModel(CREATE_STORY)
      .then(file => {
        console.log("Story created", file);
        const scsMessage = "Deine Geschichte wurde erfolgreich erstellt. ";
        dispatch(showSuccessMessage(scsMessage, true));
        dispatch(openStory(file))
          .then(() => console.log("Opened and character created."))
          .then(() => dispatch(findCharacters()))
          .then(() => dispatch(changeSection(Sections.CHARACTER)))
          .then(() => dispatch(sectionIsLoading(false)));
      });
  };
}

export function openStory(file) {
  return function (dispatch) {
    dispatch(requestStory(file));
    dispatch(deselectCharacter());
    return sendToModel(CLOSE_STORY)
      .then(() => sendToModel(OPEN_STORY, file))
      .then((file) => {
        dispatch(receiveStory(file));
        /* jslint browser: true */
        document.title = path.basename(file, ".story") + " - Plotify";
      })
      .catch(error => {
        dispatch(sectionIsLoading(false));
        const message = "Could not create or open story: " + error;
        dispatch(showMessage(message));
      });
  };
}

export function openStoryDialog() {
  return function (dispatch) {
    dispatch(sectionIsLoading(true));
    return sendToModel(OPEN_STORY_DIALOG)
      .then((file) => {
        dispatch(openStory(file))
          .then(() => dispatch(findCharacters()))
          .then(() => dispatch(changeSection(Sections.CHARACTER)))
          .then(dispatch(sectionIsLoading(false)));
      })
      .catch(error => {
        dispatch(sectionIsLoading(false));
        let message;
        if (error.name === "UnsupportedFileVersionError") {
          message = "Unsupported file version!";
        } else if (error.name === "NoStoryChosenError") {
          message = "No story chosen. Ignore this.";
        } else {
          message = "Could not open story: " + error.name;
        }
        console.log(message);
        dispatch(showMessage(message));
      });
  };
}

export function openStoryFileLocation() {
  return (dispatch, getState) => {
    shell.showItemInFolder(getState().story);
  };
}
