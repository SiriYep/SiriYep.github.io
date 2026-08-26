---
id: obsidian-image-converter-default-alignment
title: 'Obsidian Image Converter'
projectType: community
category: tooling
tags:
  - Obsidian
  - TypeScript
  - Plugin Development
  - Image Alignment
link: https://github.com/xRyul/obsidian-image-converter
extraLinks:
  - label: 'Pull Request #379'
    url: https://github.com/xRyul/obsidian-image-converter/pull/379
  - label: 'Release v1.3.20'
    url: https://github.com/xRyul/obsidian-image-converter/releases/tag/1.3.20
isOpenSource: true
role: contributor
featured: false
badge: 'PR #379 · Merged'
starsFallback: "819"
date: "2026-01"
---

Added configurable default alignment (None / Left / Center / Right) for newly inserted images in Obsidian; merged upstream and released in v1.3.20.

## Highlights

- Introduced a four-state default-alignment setting in the plugin settings UI, replacing the previous boolean toggle.
- Updated image-insertion and alignment-management paths so newly pasted or dropped images receive the configured alignment tag.
- The maintainer added backward-compatibility refinements and integration tests before merging PR #379; the v1.3.20 release notes explicitly credit @SiriYep for the contribution.
