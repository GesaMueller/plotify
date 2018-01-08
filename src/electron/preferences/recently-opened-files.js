import {
  addOrUpdateRecentlyOpenedFile as _addOrUpdateRecentlyOpenedFile,
  getRecentlyOpenedFiles as _getRecentlyOpenedFiles
} from '../../backend/preferences/recently-opened-files'

import { app } from 'electron'
import { getPreferences } from './current'

export const getRecentlyOpenedFiles = async () => {
  return _getRecentlyOpenedFiles(getPreferences())
}

export const addOrUpdateRecentlyOpenedFile = async (file) => {
  await _addOrUpdateRecentlyOpenedFile(getPreferences(), file)
  app.addRecentDocument(file.path)
}
