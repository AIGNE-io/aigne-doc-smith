import { rm } from 'node:fs/promises'
import { join } from 'node:path'
import { pathExists, resolveToAbsolute, toDisplayPath } from '../../utils/file-utils.mjs'
import { pathToFlatName, generateFileName, loadDocumentStructure } from '../../utils/docs-finder-utils.mjs'
import chooseDocs from '../utils/choose-docs.mjs'

export default async function clearGeneratedDocs(input = {}, options = {}) {
  const { docsDir, outputDir, locale, translateLanguages } = input

  if (!docsDir) {
    return {
      message: 'No generated documents directory specified',
    }
  }

  const generatedDocsPath = resolveToAbsolute(docsDir)
  const displayPath = toDisplayPath(generatedDocsPath)

  try {
    const dirExists = await pathExists(generatedDocsPath)
    if (!dirExists) {
      return {
        message: `Generated documents directory does not exist (${displayPath})`,
        cleared: false,
      }
    }

    const documentExecutionStructure = (await loadDocumentStructure(outputDir)) || []
    // select documents interactively
    const chooseResult = await chooseDocs(
      {
        docs: [], // Empty to trigger interactive selection
        documentExecutionStructure,
        docsDir: generatedDocsPath,
        locale: locale || 'en',
        isTranslate: false,
        title: 'Select documents to delete:',
        feedback: 'Skip feedback',
        requiredFeedback: false,
      },
      options,
    )

    if (!chooseResult?.selectedDocs || chooseResult.selectedDocs.length === 0) {
      return {
        message: 'No documents selected for deletion',
        cleared: false,
        path: displayPath,
      }
    }

    // Extract file names
    const filesToDelete = new Set()
    const allLanguages = [locale || 'en', ...(translateLanguages || [])]

    for (const selectedDoc of chooseResult.selectedDocs) {
      // Convert path to flat filename format using utility function
      const flatName = pathToFlatName(selectedDoc.path)

      // Generate file names for all languages
      for (const lang of allLanguages) {
        const fileName = generateFileName(flatName, lang)
        filesToDelete.add(fileName)
      }
    }

    if (filesToDelete.size === 0) {
      return {
        message: 'No documents were deleted.',
        cleared: false,
      }
    }

    // Delete selected files (including all language versions)
    const deletedFiles = []
    const failedFiles = []
    let hasError = false

    for (const file of filesToDelete) {
      try {
        const filePath = join(generatedDocsPath, file)
        await rm(filePath, { force: true })
        deletedFiles.push(file)
      } catch (error) {
        hasError = true
        failedFiles.push({ file, error: error.message })
      }
    }

    // Build result message
    const deletedCount = deletedFiles.length
    const failedCount = failedFiles.length

    let message = ''
    if (deletedCount > 0) {
      message = `Deleted ${deletedCount} document(s) in "${displayPath}":\n${deletedFiles
        .map((f) => `  ${f}`)
        .join('\n')}`
    }

    if (failedCount > 0) {
      message = `Failed to delete ${failedCount} document(s) in "${displayPath}":\n${failedFiles
        .map((f) => `  ${f.file}: ${f.error}`)
        .join('\n')}`
    }

    return {
      message,
      cleared: deletedCount > 0,
      error: hasError,
    }
  } catch (error) {
    return {
      message: `Failed to clear generated documents: ${error.message}`,
      error: true,
    }
  }
}

clearGeneratedDocs.input_schema = {
  type: 'object',
  properties: {
    docsDir: {
      type: 'string',
      description: 'The generated documents directory to clear',
    },
  },
  required: ['docsDir'],
}

clearGeneratedDocs.taskTitle = 'Clear generated documents'
clearGeneratedDocs.description = 'Select and delete specific generated documents from the docs directory'
