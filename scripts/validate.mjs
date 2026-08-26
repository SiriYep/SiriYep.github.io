// SPDX-FileCopyrightText: 2026 Yaoyao(Freax) Qian <limyoonaxi@gmail.com>
// SPDX-License-Identifier: GPL-3.0-only

/**
 * Validation script for the Terminal Portfolio Template.
 * Checks for common configuration issues before building.
 *
 * Usage: node scripts/validate.mjs
 */

import { readFileSync, existsSync, readdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import matter from 'gray-matter'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

let errors = 0
let warnings = 0

function pass(msg) {
  console.log(`\x1b[32m✓\x1b[0m ${msg}`)
}

function fail(msg) {
  errors++
  console.log(`\x1b[31m✗\x1b[0m ${msg}`)
}

function warn(msg) {
  warnings++
  console.log(`\x1b[33m⚠\x1b[0m ${msg}`)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readJson(relPath) {
  const abs = resolve(ROOT, relPath)
  if (!existsSync(abs)) return null
  try {
    return JSON.parse(readFileSync(abs, 'utf-8'))
  } catch (e) {
    fail(`${relPath} is not valid JSON: ${e.message}`)
    return null
  }
}

function collectIds(items, label, getId = item => item?.id) {
  if (!Array.isArray(items)) {
    fail(`${label} must be an array`)
    return new Set()
  }

  const ids = []
  const missing = []
  items.forEach((item, index) => {
    const id = getId(item)
    if (typeof id !== 'string' || id.trim() === '') {
      missing.push(index + 1)
    } else {
      ids.push(id.trim())
    }
  })

  if (missing.length > 0) {
    fail(`${label} missing stable ID(s) at item(s): ${missing.join(', ')}`)
  }

  const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))]
  if (duplicates.length > 0) {
    fail(`${label} has duplicate ID(s): ${duplicates.join(', ')}`)
  }

  return new Set(ids)
}

function readMarkdownRecords(relDir, label) {
  const absDir = resolve(ROOT, relDir)
  if (!existsSync(absDir)) {
    fail(`${relDir}/ not found`)
    return []
  }

  const entries = readdirSync(absDir).filter(file => file.endsWith('.md'))
  return entries.map(file => {
    try {
      const { data } = matter(readFileSync(resolve(absDir, file), 'utf-8'))
      return { file, data }
    } catch (error) {
      fail(`${relDir}/${file} has invalid frontmatter: ${error.message}`)
      return { file, data: {} }
    }
  })
}

function readMarkdownIds(relDir, label) {
  const records = readMarkdownRecords(relDir, label)
    .map(record => ({ file: record.file, id: record.data.id }))

  const ids = collectIds(records, label)
  const missingFiles = records.filter(record => !record.id).map(record => record.file)
  if (missingFiles.length > 0) {
    fail(`${label} missing id frontmatter in: ${missingFiles.join(', ')}`)
  }
  return ids
}

function compareIdSets(left, right, label) {
  const leftOnly = [...left].filter(id => !right.has(id))
  const rightOnly = [...right].filter(id => !left.has(id))
  if (leftOnly.length > 0 || rightOnly.length > 0) {
    fail(`${label} IDs differ between English and Chinese content`)
    if (leftOnly.length > 0) console.log(`  English only: ${leftOnly.join(', ')}`)
    if (rightOnly.length > 0) console.log(`  Chinese only: ${rightOnly.join(', ')}`)
  }
}

function isValidIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

// ---------------------------------------------------------------------------
// 1. content/site.json exists and is valid JSON
// ---------------------------------------------------------------------------

const site = readJson('content/site.json')
if (!site) {
  fail('content/site.json not found — run: npm run setup')
} else {
  pass('content/site.json found and valid')
}

// ---------------------------------------------------------------------------
// 2. Avatar file check
// ---------------------------------------------------------------------------

if (site?.avatar) {
  const avatarPath = `content/images/${site.avatar}`
  if (existsSync(resolve(ROOT, avatarPath))) {
    pass(`Avatar file found: ${avatarPath}`)
  } else {
    const baseName = site.avatar.replace(/\.[^.]+$/, '')
    const altExts = ['jpg', 'jpeg', 'png', 'svg', 'webp']
    const found = altExts.find((ext) =>
      existsSync(resolve(ROOT, `content/images/${baseName}.${ext}`))
    )
    if (found) {
      warn(
        `Avatar configured as "${site.avatar}" but found "${baseName}.${found}" — update content/site.json or rename the file`
      )
    } else {
      fail(`Avatar file missing: ${avatarPath} — place your avatar image in content/images/`)
    }
  }
}

// ---------------------------------------------------------------------------
// 3. .env file check
// ---------------------------------------------------------------------------

if (existsSync(resolve(ROOT, '.env'))) {
  pass('.env file found')
} else {
  warn('.env file missing — run: cp .env.example .env')
}

// ---------------------------------------------------------------------------
// 4. Example data check
// ---------------------------------------------------------------------------

if (site) {
  const siteStr = JSON.stringify(site)
  const examplePatterns = ['Alex Chen', 'example.com', 'example.edu']
  const found = examplePatterns.filter((p) => siteStr.includes(p))
  if (found.length > 0) {
    warn(`content/site.json still contains example data (${found.join(', ')})`)
  } else {
    pass('content/site.json has been personalized')
  }
}

// ---------------------------------------------------------------------------
// 5. All content JSON files are valid
// ---------------------------------------------------------------------------

const jsonFiles = [
  'experience.json', 'news.json',
  'awards.json', 'research.json', 'logos.json',
]

let validCount = 0
for (const file of jsonFiles) {
  const data = readJson(`content/${file}`)
  if (data !== null) validCount++
}

// Check that Markdown directories have content
const mdDirs = ['publications', 'projects', 'articles']
let mdCount = 0
for (const dir of mdDirs) {
  const dirPath = resolve(ROOT, 'content', dir)
  if (existsSync(dirPath)) mdCount++
}

const aboutMd = existsSync(resolve(ROOT, 'content', 'about.md'))
if (aboutMd) mdCount++

const totalExpected = jsonFiles.length + mdDirs.length + 1
const totalFound = validCount + mdCount

if (totalFound === totalExpected) {
  pass(`All ${totalExpected} content files/directories found`)
} else {
  // Individual errors already reported
}

// ---------------------------------------------------------------------------
// 6. Institution logo files check
// ---------------------------------------------------------------------------

const logos = readJson('content/logos.json')
if (logos) {
  const entries = Object.entries(logos)
  const missing = []

  for (const [name, logoPath] of entries) {
    if (logoPath === '/images/logos/placeholder.png' || logoPath === '/images/logos/placeholder.svg') {
      missing.push(name)
      continue
    }
    const absPath = resolve(ROOT, 'content', logoPath.replace(/^\//, ''))
    if (!existsSync(absPath)) {
      missing.push(name)
    }
  }

  if (missing.length === 0) {
    pass('All institution logos have matching files')
  } else if (missing.length === entries.length) {
    warn(`All ${missing.length} institutions use placeholder logos`)
  } else {
    warn(`${missing.length} institution(s) missing logo files (using placeholder)`)
  }
}

// ---------------------------------------------------------------------------
// 7. Selected publication IDs check
// ---------------------------------------------------------------------------

if (site?.selectedPublicationIds?.length > 0) {
  const pubDir = resolve(ROOT, 'content', 'publications')
  if (!existsSync(pubDir)) {
    warn('content/publications/ not found — skipping publication ID check')
  } else {
    const allIds = readMarkdownIds('content/publications', 'en publications')

    const invalid = site.selectedPublicationIds.filter((id) => !allIds.has(id))

    if (invalid.length === 0) {
      pass(`All ${site.selectedPublicationIds.length} selected publication ID(s) valid`)
    } else {
      fail(
        `Invalid selectedPublicationIds: ${invalid.join(', ')}\n  Available IDs: ${[...allIds].join(', ')}`
      )
    }
  }
} else {
  pass('No selectedPublicationIds configured (none to validate)')
}

// ---------------------------------------------------------------------------
// 8. Stable IDs and skill evidence references
// ---------------------------------------------------------------------------

const localeIndexes = {}
for (const [locale, baseDir] of [['en', 'content'], ['zh', 'content/zh']]) {
  const localeStartErrors = errors
  const localeSite = locale === 'en' ? site : readJson(`${baseDir}/site.json`)
  const localeExperience = readJson(`${baseDir}/experience.json`)
  const skills = localeSite?.terminal?.skills ?? []
  const timeline = localeExperience?.timeline ?? []

  const skillIds = collectIds(
    skills,
    `${locale} skills`,
    skill => typeof skill === 'string' ? skill : skill?.id
  )
  const experienceIds = collectIds(timeline, `${locale} experience timeline`)
  const engagementTypes = new Set(['internship', 'collaboration', 'employment', 'visiting'])

  timeline.forEach((entry, entryIndex) => {
    const entryLabel = `${locale} experience ${entry?.id ?? entryIndex + 1}`
    if (entry?.emphasis != null) {
      if (!Array.isArray(entry.emphasis)) {
        fail(`${entryLabel} emphasis must be an array`)
      } else {
        const prose = [entry.summary, ...(Array.isArray(entry.highlights) ? entry.highlights : [])]
          .filter(value => typeof value === 'string')
          .join('\n')
        const terms = entry.emphasis
          .filter(term => typeof term === 'string')
          .map(term => term.trim())
        const invalidTerms = entry.emphasis.filter(term => typeof term !== 'string' || term.trim() === '')
        const duplicateTerms = [...new Set(terms.filter((term, index) => terms.indexOf(term) !== index))]
        const missingTerms = terms.filter(term => !prose.includes(term))

        if (invalidTerms.length > 0) {
          fail(`${entryLabel} emphasis contains an empty or non-string term`)
        }
        if (duplicateTerms.length > 0) {
          fail(`${entryLabel} emphasis has duplicate term(s): ${duplicateTerms.join(', ')}`)
        }
        if (missingTerms.length > 0) {
          fail(`${entryLabel} emphasis term(s) not found in its prose: ${missingTerms.join(', ')}`)
        }
      }
    }

    if (!Array.isArray(entry?.roles) || entry.roles.length === 0) {
      fail(`${entryLabel} must define at least one role phase`)
      return
    }

    const phaseIds = collectIds(entry.roles, `${entryLabel} role phases`)
    const anchorId = entry.timelineAnchorRoleId
    if (typeof anchorId !== 'string' || !phaseIds.has(anchorId)) {
      fail(`${entryLabel} timelineAnchorRoleId must reference one of its role phases`)
    }

    const openPhases = entry.roles.filter(phase => phase?.end == null || phase.end === 'present')
    if (openPhases.length > 1) {
      fail(`${entryLabel} has more than one ongoing role phase`)
    }

    entry.roles.forEach((phase, phaseIndex) => {
      const phaseLabel = `${entryLabel} role ${phase?.id ?? phaseIndex + 1}`
      if (!engagementTypes.has(phase?.engagementType)) {
        fail(`${phaseLabel} has invalid engagementType: ${phase?.engagementType ?? '(missing)'}`)
      }
      if (!isValidIsoDate(phase?.start)) {
        fail(`${phaseLabel} has invalid start date: ${phase?.start ?? '(missing)'}`)
      }
      if (phase?.end != null && phase.end !== 'present' && !isValidIsoDate(phase.end)) {
        fail(`${phaseLabel} has invalid end date: ${phase.end}`)
      }
      if (isValidIsoDate(phase?.start) && isValidIsoDate(phase?.end)
        && new Date(phase.end).getTime() < new Date(phase.start).getTime()) {
        fail(`${phaseLabel} ends before it starts`)
      }
    })
  })

  const projectIds = readMarkdownIds(`${baseDir}/projects`, `${locale} projects`)
  const publicationIds = readMarkdownIds(`${baseDir}/publications`, `${locale} publications`)
  const projectRecords = readMarkdownRecords(`${baseDir}/projects`, `${locale} projects`)
  const publicationRecords = readMarkdownRecords(`${baseDir}/publications`, `${locale} publications`)
  const publicationsById = new Map(
    publicationRecords
      .filter(record => typeof record.data.id === 'string')
      .map(record => [record.data.id, record.data])
  )
  const projectTypes = new Set(['paper', 'original', 'community'])
  const projectCategories = new Set(['robotics', 'nlp', 'web-app', 'data', 'tooling', 'healthcare', 'ai-for-science', 'resources', 'agent'])
  const projectRoles = new Set(['independent', 'lead', 'tech-lead', 'maintainer', 'contributor', 'coauthor'])
  const githubRepoPattern = /^https:\/\/github\.com\/[^/]+\/[^/]+\/?$/
  const paperProjectCounts = new Map()
  const projectMetadata = new Map()

  projectRecords.forEach(({ file, data }) => {
    const projectLabel = `${locale} project ${data.id ?? file}`
    if (!projectTypes.has(data.projectType)) {
      fail(`${projectLabel} has invalid projectType: ${data.projectType ?? '(missing)'}`)
      return
    }
    if (!projectCategories.has(data.category)) {
      fail(`${projectLabel} has invalid category: ${data.category ?? '(missing)'}`)
    }
    if (data.role != null && !projectRoles.has(data.role)) {
      fail(`${projectLabel} has invalid role: ${data.role}`)
    }
    if (!Array.isArray(data.tags)) {
      fail(`${projectLabel} tags must be an array`)
    } else if (data.tags.some(tag => typeof tag !== 'string' || tag.trim() === '')) {
      fail(`${projectLabel} tags must contain only non-empty strings`)
    }

    if (data.projectType === 'paper') {
      if (typeof data.publicationId !== 'string' || data.publicationId.trim() === '') {
        fail(`${projectLabel} must define publicationId`)
      } else if (!publicationIds.has(data.publicationId)) {
        fail(`${projectLabel} references unknown publicationId: ${data.publicationId}`)
      }
      if (typeof data.link !== 'string' || !githubRepoPattern.test(data.link)) {
        fail(`${projectLabel} must link to a concrete GitHub repository`)
      }
      const publicationCode = publicationsById.get(data.publicationId)?.links?.code
      if (typeof publicationCode !== 'string' || publicationCode.trim() === '') {
        fail(`${projectLabel} references a publication without a code URL`)
      } else if (data.link !== publicationCode) {
        fail(`${projectLabel} link must match publication ${data.publicationId} code URL`)
      }
      if (typeof data.publicationId === 'string') {
        paperProjectCounts.set(data.publicationId, (paperProjectCounts.get(data.publicationId) ?? 0) + 1)
      }
    } else if (data.publicationId != null) {
      fail(`${projectLabel} must not define publicationId when projectType is not "paper"`)
    }

    if (typeof data.id === 'string') {
      projectMetadata.set(data.id, {
        projectType: data.projectType,
        publicationId: data.publicationId ?? null,
        link: data.link ?? null,
        category: data.category ?? null,
        role: data.role ?? 'independent',
      })
    }
  })

  publicationRecords.forEach(({ file, data }) => {
    const codeUrl = data.links?.code
    if (codeUrl == null) return
    if (typeof codeUrl !== 'string' || codeUrl.trim() === '') {
      fail(`${locale} publication ${data.id ?? file} has an invalid code URL`)
      return
    }
    let codeHost
    try {
      codeHost = new URL(codeUrl).hostname
    } catch {
      fail(`${locale} publication ${data.id ?? file} has an invalid code URL: ${codeUrl}`)
      return
    }
    if (codeHost !== 'github.com') return
    if (!githubRepoPattern.test(codeUrl)) {
      fail(`${locale} publication ${data.id ?? file} code must link to a concrete GitHub repository`)
      return
    }
    const count = paperProjectCounts.get(data.id) ?? 0
    if (count !== 1) {
      fail(`${locale} publication ${data.id ?? file} with GitHub code must map to exactly one paper project (found ${count})`)
    }
  })
  const evidenceIndexes = {
    experience: experienceIds,
    project: projectIds,
    publication: publicationIds,
  }

  skills.forEach((skill, skillIndex) => {
    if (typeof skill === 'string') return
    if (typeof skill?.name !== 'string' || skill.name.trim() === '') {
      fail(`${locale} skill ${skill?.id ?? skillIndex + 1} is missing name`)
    }
    const evidence = skill?.evidence ?? []
    if (!Array.isArray(evidence)) {
      fail(`${locale} skill ${skill?.id ?? skillIndex + 1} evidence must be an array`)
      return
    }
    if (evidence.length > 2) {
      fail(`${locale} skill ${skill?.id ?? skillIndex + 1} has ${evidence.length} evidence items; maximum is 2`)
    }

    const evidenceKeys = evidence
      .filter(item => item && typeof item.kind === 'string' && typeof item.ref === 'string')
      .map(item => `${item.kind}:${item.ref}`)
    const duplicateEvidence = [...new Set(evidenceKeys.filter((key, index) => evidenceKeys.indexOf(key) !== index))]
    if (duplicateEvidence.length > 0) {
      fail(`${locale} skill ${skill?.id ?? skillIndex + 1} has duplicate evidence: ${duplicateEvidence.join(', ')}`)
    }

    evidence.forEach((item, evidenceIndex) => {
      const prefix = `${locale} skill ${skill?.id ?? skillIndex + 1} evidence ${evidenceIndex + 1}`
      if (!item || !Object.hasOwn(evidenceIndexes, item.kind)) {
        fail(`${prefix} has invalid kind: ${item?.kind ?? '(missing)'}`)
        return
      }
      if (typeof item.ref !== 'string' || item.ref.trim() === '') {
        fail(`${prefix} is missing ref`)
        return
      }
      if (!evidenceIndexes[item.kind].has(item.ref)) {
        fail(`${prefix} references unknown ${item.kind} ID: ${item.ref}`)
      }
    })
  })

  localeIndexes[locale] = { skillIds, experienceIds, projectIds, publicationIds, projectMetadata }
  if (errors === localeStartErrors) {
    pass(`${locale} skill IDs and evidence references valid`)
  }
}

if (localeIndexes.en && localeIndexes.zh) {
  compareIdSets(localeIndexes.en.skillIds, localeIndexes.zh.skillIds, 'Skill')
  compareIdSets(localeIndexes.en.experienceIds, localeIndexes.zh.experienceIds, 'Experience')
  compareIdSets(localeIndexes.en.projectIds, localeIndexes.zh.projectIds, 'Project')
  compareIdSets(localeIndexes.en.publicationIds, localeIndexes.zh.publicationIds, 'Publication')
  for (const [id, enMetadata] of localeIndexes.en.projectMetadata) {
    const zhMetadata = localeIndexes.zh.projectMetadata.get(id)
    if (zhMetadata && JSON.stringify(enMetadata) !== JSON.stringify(zhMetadata)) {
      fail(`Project ${id} classification differs between English and Chinese content`)
    }
  }
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log('')
if (errors > 0) {
  console.log(`\x1b[31mValidation failed with ${errors} error(s) and ${warnings} warning(s)\x1b[0m`)
  process.exit(1)
} else if (warnings > 0) {
  console.log(`\x1b[33mValidation passed with ${warnings} warning(s)\x1b[0m`)
  process.exit(0)
} else {
  console.log(`\x1b[32mAll checks passed!\x1b[0m`)
  process.exit(0)
}
