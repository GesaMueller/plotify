import {
  GET_RECENTLY_OPENED_FILES,
  PIN_RECENTLY_OPENED_FILE,
  REMOVE_RECENTLY_OPENED_FILE,
  UNPIN_RECENTLY_OPENED_FILE
} from '../../shared/preferences/requests'
import {
  getRecentlyOpenedFiles,
  pinRecentlyOpenedFile,
  removeRecentlyOpenedFile,
  unpinRecentlyOpenedFile
} from './recently-opened-files'

import { requestHandler } from '../shared/communication'
import store from '../store'

const handleGetRecentlyOpenedFiles = (resolve) => {
  resolve(getRecentlyOpenedFiles(store.getState()))
}

const handlePinRecentlyOpenedFile = (resolve, reject, _, path) => {
  store.dispatch(pinRecentlyOpenedFile(path))
    .then(() => resolve())
    .catch((error) => reject(error))
}

const handleUnpinRecentlyOpenedFile = (resolve, reject, _, path) => {
  store.dispatch(unpinRecentlyOpenedFile(path))
    .then(() => resolve())
    .catch((error) => reject(error))
}

const handleRemoveGetRecentlyOpenedFile = (resolve, reject, _, path) => {
  store.dispatch(removeRecentlyOpenedFile(path))
    .then(() => resolve())
    .catch((error) => reject(error))
}

const registerRequestHandlers = () => {
  requestHandler(GET_RECENTLY_OPENED_FILES, handleGetRecentlyOpenedFiles)
  requestHandler(PIN_RECENTLY_OPENED_FILE, handlePinRecentlyOpenedFile)
  requestHandler(UNPIN_RECENTLY_OPENED_FILE, handleUnpinRecentlyOpenedFile)
  requestHandler(REMOVE_RECENTLY_OPENED_FILE, handleRemoveGetRecentlyOpenedFile)
}

export default registerRequestHandlers
