import childProcess from 'node:child_process'
import fs from 'node:fs'
import fsPromises from 'node:fs/promises'
import path from 'node:path'
import { EOL } from 'node:os'

/**
 * Checks if a command is available in the system's PATH
 */
function isCommandAvailable(command) {
  return new Promise((resolve) => {
    const checkCommand = process.platform === 'win32' ? 'where' : 'command'
    const checkArgs = process.platform === 'win32' ? [command] : ['-v', command]

    try {
      const child = childProcess.spawn(checkCommand, checkArgs, {
        stdio: 'ignore',
        shell: process.platform === 'win32',
      })
      child.on('close', (code) => resolve(code === 0))
      child.on('error', () => resolve(false))
    } catch {
      resolve(false)
    }
  })
}

/**
 * Checks if a directory is a git repository
 */
function isGitRepository(dir) {
  try {
    const gitDir = path.join(dir, '.git')
    return fs.existsSync(gitDir)
  } catch {
    return false
  }
}

/**
 * Parses grep output in format: filePath:lineNumber:lineContent
 */
function parseGrepOutput(output, basePath) {
  const results = []
  if (!output) return results

  const lines = output.split(EOL)

  for (const line of lines) {
    if (!line.trim()) continue

    const firstColonIndex = line.indexOf(':')
    if (firstColonIndex === -1) continue

    const secondColonIndex = line.indexOf(':', firstColonIndex + 1)
    if (secondColonIndex === -1) continue

    const filePathRaw = line.substring(0, firstColonIndex)
    const lineNumberStr = line.substring(firstColonIndex + 1, secondColonIndex)
    const lineContent = line.substring(secondColonIndex + 1)

    const lineNumber = parseInt(lineNumberStr, 10)
    if (!isNaN(lineNumber)) {
      const relativePath = path.relative(basePath, path.resolve(basePath, filePathRaw))
      results.push({
        filePath: relativePath || path.basename(filePathRaw),
        lineNumber,
        line: lineContent,
      })
    }
  }
  return results
}

/**
 * Performs grep search using multiple strategies
 */
async function performGrepSearch({ pattern, include }) {
  const absolutePath = path.resolve('.')

  // Strategy 1: git grep
  const isGit = isGitRepository(absolutePath)
  const gitAvailable = isGit && (await isCommandAvailable('git'))

  if (gitAvailable) {
    try {
      const gitArgs = ['grep', '--untracked', '-n', '-E', '--ignore-case', pattern]
      if (include) {
        gitArgs.push('--', include)
      }

      const output = await new Promise((resolve, reject) => {
        const child = childProcess.spawn('git', gitArgs, {
          cwd: absolutePath,
          windowsHide: true,
        })

        let stdout = ''
        let stderr = ''

        child.stdout.on('data', (chunk) => stdout += chunk)
        child.stderr.on('data', (chunk) => stderr += chunk)
        child.on('error', (err) => reject(new Error(`Failed to start git grep: ${err.message}`)))
        child.on('close', (code) => {
          if (code === 0) resolve(stdout)
          else if (code === 1) resolve('') // No matches
          else reject(new Error(`git grep exited with code ${code}: ${stderr}`))
        })
      })

      return parseGrepOutput(output, absolutePath)
    } catch (gitError) {
      console.debug(`git grep failed: ${gitError.message}. Falling back...`)
    }
  }

  // Strategy 2: System grep
  const grepAvailable = await isCommandAvailable('grep')
  if (grepAvailable) {
    try {
      const grepArgs = ['-r', '-n', '-H', '-E', '-i', '--exclude-dir=node_modules', '--exclude-dir=.git']
      if (include) {
        grepArgs.push(`--include=${include}`)
      }
      grepArgs.push(pattern, '.')

      const output = await new Promise((resolve, reject) => {
        const child = childProcess.spawn('grep', grepArgs, {
          cwd: absolutePath,
          windowsHide: true,
        })

        let stdout = ''
        let stderr = ''

        child.stdout.on('data', (chunk) => stdout += chunk)
        child.stderr.on('data', (chunk) => {
          const stderrStr = chunk.toString()
          // Suppress common harmless stderr messages
          if (!stderrStr.includes('Permission denied') &&
              !/grep:.*: Is a directory/i.test(stderrStr)) {
            stderr += chunk
          }
        })
        child.on('error', (err) => reject(new Error(`Failed to start system grep: ${err.message}`)))
        child.on('close', (code) => {
          if (code === 0) resolve(stdout)
          else if (code === 1) resolve('') // No matches
          else {
            if (stderr.trim()) reject(new Error(`System grep exited with code ${code}: ${stderr}`))
            else resolve('') // Exit code > 1 but no stderr, likely just suppressed errors
          }
        })
      })

      return parseGrepOutput(output, absolutePath)
    } catch (grepError) {
      console.debug(`System grep failed: ${grepError.message}. Falling back...`)
    }
  }

  // Strategy 3: JavaScript fallback
  console.debug('Falling back to JavaScript grep implementation.')
  const matches = []

  try {
    const regex = new RegExp(pattern, 'i')

    async function searchDirectory(dir) {
      const entries = await fsPromises.readdir(dir, { withFileTypes: true })

      for (const entry of entries) {
        if (entry.name.startsWith('.') && entry.name !== '.') continue
        if (entry.name === 'node_modules') continue

        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
          await searchDirectory(fullPath)
        } else if (entry.isFile()) {
          // Apply include filter if specified
          if (include) {
            const includePattern = '^' + include.replace(/\./g, '\\.').replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
            if (!new RegExp(includePattern).test(entry.name)) {
              continue
            }
          }

          try {
            const content = await fsPromises.readFile(fullPath, 'utf8')
            const lines = content.split(/\r?\n/)

            lines.forEach((line, index) => {
              if (regex.test(line)) {
                matches.push({
                  filePath: path.relative(absolutePath, fullPath),
                  lineNumber: index + 1,
                  line,
                })
              }
            })
          } catch (readError) {
            // Ignore read errors (binary files, permissions, etc.)
          }
        }
      }
    }

    await searchDirectory(absolutePath)
    return matches
  } catch (error) {
    throw new Error(`JavaScript fallback failed: ${error.message}`)
  }
}

export default async function grep({ pattern, include }) {
  let result = ''
  let error = null

  try {
    // Validate pattern parameter (allow empty string but not undefined/null)
    if (pattern === undefined || pattern === null) {
      throw new Error('Pattern parameter is required')
    }

    // Validate regex pattern
    try {
      new RegExp(pattern)
    } catch (regexError) {
      throw new Error(`Invalid regular expression pattern: ${pattern}. ${regexError.message}`)
    }

    const matches = await performGrepSearch({ pattern, include })

    if (matches.length === 0) {
      result = `No matches found for pattern "${pattern}"${include ? ` (filter: "${include}")` : ''}.`
    } else {
      // Group matches by file
      const matchesByFile = matches.reduce((acc, match) => {
        if (!acc[match.filePath]) {
          acc[match.filePath] = []
        }
        acc[match.filePath].push(match)
        acc[match.filePath].sort((a, b) => a.lineNumber - b.lineNumber)
        return acc
      }, {})

      const matchCount = matches.length
      const matchTerm = matchCount === 1 ? 'match' : 'matches'

      result = `Found ${matchCount} ${matchTerm} for pattern "${pattern}"${include ? ` (filter: "${include}")` : ''}:\n---\n`

      for (const filePath in matchesByFile) {
        result += `File: ${filePath}\n`
        matchesByFile[filePath].forEach((match) => {
          const trimmedLine = match.line.trim()
          result += `L${match.lineNumber}: ${trimmedLine}\n`
        })
        result += '---\n'
      }

      result = result.trim()
    }
  } catch(e) {
    error = e
    result = `Error during grep search: ${e.message}`
  }

  return {
    command: 'grep',
    arguments: { pattern, include },
    result,
    error: error && { message: error.message }
  }
}

grep.input_schema = {
  type: 'object',
  properties: {
    pattern: {
      type: 'string',
      description: 'The regular expression pattern to search for in file contents'
    },
    include: {
      type: 'string',
      description: 'Optional: File pattern to include in search (e.g. "*.js", "*.{ts,tsx}")'
    },
  },
  required: ['pattern'],
}
