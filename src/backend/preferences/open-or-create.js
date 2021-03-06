import { create, createSchema } from './create'
import { mode, open } from '../shared/sqlite'

import { pathExists } from 'fs-extra'
import { validatePath } from '../shared/validation'

const openOrCreate = async (path) => {
  validatePath(path)
  if (await pathExists(path)) {
    const database = await open(path, mode.OPEN_READWRITE)
    await checkSchemaVersion(database)
    return database
  } else {
    return create(path)
  }
}

const schemaVersionSql = 'PRAGMA user_version'

const checkSchemaVersion = async (database) => {
  const result = await database.get(schemaVersionSql)
  const schemaVersion = result['user_version']
  switch (schemaVersion) {
    case 1:
      await updateSchemaV1(database)
      break
    case 2:
      break
    default:
      throw new Error('Unsupported preferences version: ' + schemaVersion)
  }
}

const deleteRecentlyOpenedFilesTableSql = 'DROP TABLE IF EXISTS recently_opened_files'

const updateSchemaV1 = async (database) => {
  await database.run(deleteRecentlyOpenedFilesTableSql)
  await createSchema(database)
}

export default openOrCreate
