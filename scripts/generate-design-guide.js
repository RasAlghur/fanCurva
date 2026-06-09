const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, LevelFormat, BorderStyle, WidthType,
  ShadingType, Header, Footer, TabStopType, TabStopPosition
} = require('docx')
const fs = require('fs')

const TEAL = "1D9E75"
const TEAL_LIGHT = "E1F5EE"
const TEAL_DARK = "085041"
const GRAY_LIGHT = "F5F5F3"
const GRAY_MID = "888780"
const BLACK = "2C2C2A"
const WHITE = "FFFFFF"
const AMBER = "BA7517"
const AMBER_LIGHT = "FEF3E2"
const SURFACE = "111111"
const BG = "0A0A0A"

const border = { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" }
const borders = { top: border, bottom: border, left: border, right: border }
const tealBorder = { style: BorderStyle.SINGLE, size: 1, color: TEAL }
const tealBorders = { top: tealBorder, bottom: tealBorder, left: tealBorder, right: tealBorder }

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 160 },
    children: [new TextRun({ text, bold: true, size: 44, color: BLACK, font: "Barlow Condensed" })]
  })
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: TEAL, space: 4 } },
    children: [new TextRun({ text, bold: true, size: 30, color: TEAL_DARK, font: "Arial" })]
  })
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 80 },
    children: [new TextRun({ text, bold: true, size: 24, color: BLACK, font: "Arial" })]
  })
}
function body(text) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    children: [new TextRun({ text, size: 22, color: BLACK, font: "Arial" })]
  })
}
function bodyBold(text) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    children: [new TextRun({ text, bold: true, size: 22, color: BLACK, font: "Arial" })]
  })
}
function bullet(text, bold_prefix) {
  const runs = []
  if (bold_prefix) {
    runs.push(new TextRun({ text: bold_prefix + " ", bold: true, size: 22, color: BLACK, font: "Arial" }))
    runs.push(new TextRun({ text, size: 22, color: BLACK, font: "Arial" }))
  } else {
    runs.push(new TextRun({ text, size: 22, color: BLACK, font: "Arial" }))
  }
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 60, after: 60 },
    children: runs
  })
}
function spacer(n) {
  n = n || 1
  return new Paragraph({ spacing: { before: 0, after: n * 80 }, children: [new TextRun("")] })
}
function pageBreak() {
  return new Paragraph({ pageBreakBefore: true, children: [new TextRun("")] })
}
function codeBlock(text) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [new TableRow({ children: [new TableCell({
      borders,
      shading: { fill: "1A1A1A", type: ShadingType.CLEAR },
      margins: { top: 160, bottom: 160, left: 200, right: 200 },
      children: [new Paragraph({
        children: [new TextRun({ text, size: 18, color: "9FE1CB", font: "Courier New" })]
      })]
    })] })]
  })
}
function colorSwatch(hex, name, usage) {
  return new TableRow({
    children: [
      new TableCell({
        borders: tealBorders,
        width: { size: 800, type: WidthType.DXA },
        shading: { fill: hex, type: ShadingType.CLEAR },
        children: [new Paragraph({ children: [new TextRun("")] })]
      }),
      new TableCell({
        borders,
        width: { size: 2000, type: WidthType.DXA },
        shading: { fill: GRAY_LIGHT, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: "#" + hex, bold: true, size: 20, font: "Courier New", color: BLACK })] })]
      }),
      new TableCell({
        borders,
        width: { size: 2200, type: WidthType.DXA },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: name, bold: true, size: 20, font: "Arial", color: BLACK })] })]
      }),
      new TableCell({
        borders,
        width: { size: 4360, type: WidthType.DXA },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: usage, size: 20, font: "Arial", color: BLACK })] })]
      }),
    ]
  })
}
function specTable(rows) {
  const dataRows = rows.map(function(r, i) {
    const bg = i % 2 === 0 ? WHITE : GRAY_LIGHT
    return new TableRow({ children: [
      new TableCell({
        borders, width: { size: 3200, type: WidthType.DXA },
        shading: { fill: bg, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 140, right: 140 },
        children: [new Paragraph({ children: [new TextRun({ text: r[0], bold: true, size: 21, color: BLACK, font: "Arial" })] })]
      }),
      new TableCell({
        borders, width: { size: 6160, type: WidthType.DXA },
        shading: { fill: bg, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 140, right: 140 },
        children: [new Paragraph({ children: [new TextRun({ text: r[1], size: 21, color: BLACK, font: "Arial" })] })]
      }),
    ]})
  })
  return new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [3200, 6160], rows: dataRows })
}
function sectionHeader(num, title) {
  return new Paragraph({
    spacing: { before: 400, after: 160 },
    shading: { fill: TEAL_DARK, type: ShadingType.CLEAR },
    children: [
      new TextRun({ text: "  " + num + ".  ", bold: true, size: 36, color: TEAL_LIGHT, font: "Arial" }),
      new TextRun({ text: title.toUpperCase(), bold: true, size: 36, color: WHITE, font: "Arial" }),
    ]
  })
}

const coverSection = {
  properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 0, right: 0, bottom: 0, left: 0 } } },
  children: [
    new Paragraph({
      spacing: { before: 0, after: 0 },
      shading: { fill: BG, type: ShadingType.CLEAR },
      children: [new TextRun("")]
    }),
    spacer(8),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40 },
      children: [new TextRun({ text: "FANCURVA", bold: true, size: 96, color: TEAL, font: "Arial" })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 80 },
      children: [new TextRun({ text: "Web & UI/UX Design Guide", size: 40, color: WHITE, font: "Arial" })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40 },
      children: [new TextRun({ text: "Version 1.0  \u2022  World Cup 2026", size: 24, color: GRAY_MID, font: "Arial" })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: TEAL, space: 4 } },
      spacing: { before: 80, after: 80 },
      children: [new TextRun("")]
    }),
    spacer(2),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 40 },
      children: [new TextRun({ text: "Your Passion. Your Journey.", size: 28, color: WHITE, font: "Arial", italics: true })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [new TextRun({ text: "Earn. Collect. Represent.", size: 22, color: GRAY_MID, font: "Arial" })]
    }),
    spacer(10),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [new TextRun({ text: "fancurva.com  \u2022  Design Team Internal Document", size: 18, color: GRAY_MID, font: "Arial" })]
    }),
  ]
}

const mainSection = {
  properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1440, bottom: 1080, left: 1440 } } },
  headers: {
    default: new Header({ children: [new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: TEAL, space: 4 } },
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      children: [
        new TextRun({ text: "FanCurva \u2014 Web & UI/UX Design Guide", size: 18, color: GRAY_MID, font: "Arial" }),
        new TextRun({ text: "\tv1.0", size: 18, color: TEAL, font: "Arial" }),
      ]
    })] })
  },
  footers: {
    default: new Footer({ children: [new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: TEAL, space: 4 } },
      tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
      children: [
        new TextRun({ text: "Page ", size: 18, color: GRAY_MID, font: "Arial" }),
        new TextRun({ children: ["PAGE"], size: 18, color: GRAY_MID, font: "Arial" }),
        new TextRun({ text: "\t\u00A9 2026 FanCurva. Internal use only.", size: 18, color: GRAY_MID, font: "Arial" }),
      ]
    })] })
  },
  children: [

    // ── 1. BRAND OVERVIEW ─────────────────────────────────────────────────────
    sectionHeader("1", "Brand Overview"),
    spacer(),
    body("FanCurva is a blockchain-powered fan engagement platform for the 2026 FIFA World Cup. The brand must communicate earned identity, football passion, and premium digital ownership. Every design decision should reinforce one idea: this is something fans earn, not something they buy."),
    spacer(),
    h3("Brand personality"),
    bullet("Earned — rewards come from genuine participation, never purchases"),
    bullet("Passionate — deep football culture, not casual sports entertainment"),
    bullet("Premium — dark, bold, and confident. Stadium at night energy"),
    bullet("Accessible — no crypto jargon, no wallet friction, just football"),
    bullet("Community — the curva is where the real fans sit"),
    spacer(),
    h3("Brand voice"),
    bullet("Direct and bold — short sentences, strong verbs"),
    bullet("Football-native — use terms fans already know (curva, ultras, terrace, tifo)"),
    bullet("Never corporate — no buzzwords, no startup clichés"),
    bullet("Urgent where needed — match-day quests expire, create genuine FOMO"),
    spacer(),

    // ── 2. LOGO SYSTEM ────────────────────────────────────────────────────────
    pageBreak(),
    sectionHeader("2", "Logo System"),
    spacer(),
    body("The FanCurva logo consists of the WiFi-arc icon mark and the FanCurva wordmark. The icon references the curva crowd wave — the arc of fans rising in a stadium stand — without being literal."),
    spacer(),
    h3("Logo variants"),
    spacer(),
    specTable([
      ["Primary (horizontal)", "Icon + wordmark side by side. Default for headers, navigation, and most contexts."],
      ["Stacked", "Icon above wordmark. Use when horizontal space is limited."],
      ["Icon only", "WiFi arc mark alone. Use for favicon, app icon, loading states, and small spaces under 40px."],
      ["Light background", "Same mark on white. Use for documents, print, and light UI contexts."],
    ]),
    spacer(),
    h3("Logo colour rules"),
    bullet("On dark backgrounds: Icon in #1D9E75, 'Fan' in #FFFFFF, 'Curva' in #1D9E75"),
    bullet("On light backgrounds: Icon in #1D9E75, 'Fan' in #0A0A0A, 'Curva' in #1D9E75"),
    bullet("Never use the logo in any other colour combination"),
    bullet("Never stretch, rotate, or add effects to the logo"),
    bullet("Never place the logo on a busy photographic background without a dark overlay"),
    spacer(),
    h3("Clear space"),
    body("The logo must always have clear space equal to the height of the 'C' in FanCurva on all four sides. Never crowd the logo with other elements."),
    spacer(),
    h3("Minimum sizes"),
    specTable([
      ["Primary horizontal", "Minimum 120px wide in digital, 30mm in print"],
      ["Icon only", "Minimum 24px, ideal 32px for UI, 512px for app store"],
      ["Favicon", "16px, 32px, 48px — use simplified 2-arc version at 16px"],
    ]),
    spacer(),

    // ── 3. COLOR PALETTE ──────────────────────────────────────────────────────
    pageBreak(),
    sectionHeader("3", "Colour Palette"),
    spacer(),
    body("The palette is built around the primary teal-green on near-black. The dark backgrounds reference the atmosphere of a night match. The green is the signal in the dark — active, alive, earning."),
    spacer(),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: [800, 2000, 2200, 4360],
      rows: [
        new TableRow({ children: [
          new TableCell({ borders, shading: { fill: TEAL_DARK, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Swatch", bold: true, size: 20, color: WHITE, font: "Arial" })] })] }),
          new TableCell({ borders, shading: { fill: TEAL_DARK, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Hex", bold: true, size: 20, color: WHITE, font: "Arial" })] })] }),
          new TableCell({ borders, shading: { fill: TEAL_DARK, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Name", bold: true, size: 20, color: WHITE, font: "Arial" })] })] }),
          new TableCell({ borders, shading: { fill: TEAL_DARK, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Usage", bold: true, size: 20, color: WHITE, font: "Arial" })] })] }),
        ]}),
        colorSwatch("1D9E75", "Primary Green", "CTAs, highlights, active states, brand accent, points"),
        colorSwatch("085041", "Dark Green", "Passport background, section headers, deep accents"),
        colorSwatch("9FE1CB", "Mid Green", "Subtle text on dark green, secondary highlights"),
        colorSwatch("E1F5EE", "Light Green", "Tip callouts, success backgrounds, hover states"),
        colorSwatch("0A0A0A", "Background", "Page background — near black, not pure black"),
        colorSwatch("111111", "Surface", "Cards, panels, modals, input backgrounds"),
        colorSwatch("1A1A1A", "Border", "Subtle dividers, card borders, input borders"),
        colorSwatch("2C2C2A", "Text Primary Dark", "Body text on light backgrounds"),
        colorSwatch("FFFFFF", "White", "Primary text on dark backgrounds"),
        colorSwatch("888780", "Text Secondary", "Captions, metadata, placeholder text"),
        colorSwatch("444441", "Text Muted", "Disabled states, very secondary information"),
        colorSwatch("BA7517", "Amber", "Warnings, notes, sponsored quest labels"),
        colorSwatch("FAEEDA", "Amber Light", "Warning callout backgrounds"),
        colorSwatch("FFD700", "Gold", "Champion badge, Legend tier, top 3 leaderboard"),
        colorSwatch("C084FC", "Purple", "Ultras tier accent"),
        colorSwatch("4A9EFF", "Blue", "True Fan tier accent"),
      ]
    }),
    spacer(),
    h3("Colour usage rules"),
    bullet("Primary Green (#1D9E75) is reserved for CTAs, active states, and brand moments. Do not overuse it."),
    bullet("Background (#0A0A0A) and Surface (#111111) create the dark depth. Never use pure black (#000000)."),
    bullet("Gold (#FFD700) is exclusively for Champion badge, Legend tier, and top 3 leaderboard positions. Do not use it decoratively."),
    bullet("Amber (#BA7517) is for warnings and sponsored content only. Never use it for positive states."),
    bullet("Status tier colours are fixed: Supporter grey, True Fan blue, Ultras purple, Legend gold."),
    spacer(),

    // ── 4. TYPOGRAPHY ─────────────────────────────────────────────────────────
    pageBreak(),
    sectionHeader("4", "Typography"),
    spacer(),
    body("Two typefaces only. Barlow Condensed for all headings and display text. Inter for all body copy, UI labels, and data. This combination is athletic, readable, and works at every size from mobile to stadium screen."),
    spacer(),
    h3("Barlow Condensed — headings and display"),
    specTable([
      ["Weight", "700 (Bold) and 800 (ExtraBold) only"],
      ["Transform", "Uppercase always for headings"],
      ["Letter spacing", "0.02em standard, 0.05em for all-caps labels"],
      ["Google Fonts", "fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800"],
      ["Usage", "Page titles, section headings, badge names, passport name, status tiers, CTA buttons, navigation"],
    ]),
    spacer(),
    h3("Inter — body and UI"),
    specTable([
      ["Weights", "400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)"],
      ["Transform", "Sentence case for body, UPPERCASE for micro-labels only"],
      ["Google Fonts", "fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700"],
      ["Usage", "Body copy, descriptions, form inputs, table data, timestamps, metadata"],
    ]),
    spacer(),
    h3("Type scale"),
    specTable([
      ["Display / Hero", "Barlow Condensed 800, 72-96px, uppercase"],
      ["H1 — Page title", "Barlow Condensed 800, 48px, uppercase"],
      ["H2 — Section title", "Barlow Condensed 700, 36px, uppercase"],
      ["H3 — Card title", "Barlow Condensed 700, 24px, uppercase"],
      ["Body Large", "Inter 400, 18px, 1.6 line height"],
      ["Body Default", "Inter 400, 16px, 1.6 line height"],
      ["Body Small", "Inter 400, 14px, 1.5 line height"],
      ["Caption / Metadata", "Inter 400, 12px, #888780"],
      ["Micro label", "Inter 600, 11px, uppercase, letter-spacing 0.08em"],
      ["Points / Numbers", "Barlow Condensed 800, size varies, #1D9E75"],
    ]),
    spacer(),
    h3("CSS variables"),
    codeBlock(
      "--font-heading: 'Barlow Condensed', sans-serif;\n" +
      "--font-body: 'Inter', sans-serif;\n" +
      "--text-display: 800 72px/1 var(--font-heading);\n" +
      "--text-h1: 800 48px/1.1 var(--font-heading);\n" +
      "--text-h2: 700 36px/1.1 var(--font-heading);\n" +
      "--text-h3: 700 24px/1.2 var(--font-heading);\n" +
      "--text-body-lg: 400 18px/1.6 var(--font-body);\n" +
      "--text-body: 400 16px/1.6 var(--font-body);\n" +
      "--text-sm: 400 14px/1.5 var(--font-body);\n" +
      "--text-xs: 400 12px/1.4 var(--font-body);\n" +
      "--text-micro: 600 11px/1 var(--font-body);"
    ),
    spacer(),

    // ── 5. SPACING AND LAYOUT ─────────────────────────────────────────────────
    pageBreak(),
    sectionHeader("5", "Spacing and Layout"),
    spacer(),
    body("The spacing system is based on an 8px grid. All spacing values are multiples of 8. This creates visual rhythm and makes the layout feel intentional and consistent."),
    spacer(),
    h3("Spacing scale"),
    specTable([
      ["4px  (0.25rem)", "xs — icon padding, tight inline gaps"],
      ["8px  (0.5rem)", "sm — internal component padding"],
      ["12px (0.75rem)", "md-sm — badge padding, compact rows"],
      ["16px (1rem)", "md — standard component padding, gaps between related elements"],
      ["24px (1.5rem)", "lg — section padding, card padding"],
      ["32px (2rem)", "xl — between major sections"],
      ["48px (3rem)", "2xl — hero section padding"],
      ["64px (4rem)", "3xl — page-level vertical spacing"],
    ]),
    spacer(),
    h3("Layout grid"),
    specTable([
      ["Mobile (< 768px)", "Single column, 16px horizontal padding"],
      ["Tablet (768px-1024px)", "12-column grid, 24px gutters, 32px margins"],
      ["Desktop (> 1024px)", "12-column grid, 24px gutters, max-width 1280px, centered"],
      ["Wide (> 1440px)", "Content capped at 1280px, background fills full width"],
    ]),
    spacer(),
    h3("Page structure"),
    bullet("Global nav — fixed top, 64px height, background #0A0A0A with bottom border #1A1A1A"),
    bullet("Page content — starts below nav, max-width 1280px, centered, 24px horizontal padding on desktop"),
    bullet("Cards — 24px padding, border-radius 12px, background #111111, border 1px solid #1A1A1A"),
    bullet("Section spacing — 48px between major sections on desktop, 32px on mobile"),
    spacer(),
    h3("Border radius"),
    specTable([
      ["4px", "Badges, tags, micro elements"],
      ["8px", "Buttons, inputs, small cards"],
      ["12px", "Standard cards, panels, modals"],
      ["16px", "Large cards, passport card"],
      ["24px", "Hero sections, featured cards"],
      ["50%", "Avatar, circular icons"],
    ]),
    spacer(),

    // ── 6. COMPONENT LIBRARY ──────────────────────────────────────────────────
    pageBreak(),
    sectionHeader("6", "Component Library"),
    spacer(),
    body("All components follow the same dark-first design principle. Components are built with CSS variables so team variants (colour accents) can be applied systematically."),
    spacer(),

    h2("Buttons"),
    spacer(),
    specTable([
      ["Primary", "Background #1D9E75, text white, Barlow Condensed 700, uppercase, 16px, 12px 24px padding, border-radius 8px"],
      ["Primary Hover", "Background #1D9E75 at 90% brightness, subtle scale 1.02"],
      ["Secondary", "Background transparent, border 1px solid #1D9E75, text #1D9E75, same dimensions"],
      ["Ghost", "Background transparent, no border, text #888780, hover text white"],
      ["Danger", "Background #E55, text white — for destructive actions only"],
      ["Disabled", "Background #333, text #555, cursor not-allowed, no hover effect"],
      ["Loading", "Primary style with spinner, text replaced with '...' or spinner only"],
      ["Icon button", "40px square, border-radius 8px, background #1A1A1A, icon centered"],
    ]),
    spacer(),
    h3("Button sizes"),
    specTable([
      ["Large", "16px font, 14px 32px padding — hero CTAs, onboarding"],
      ["Default", "15px font, 12px 24px padding — standard actions"],
      ["Small", "13px font, 8px 16px padding — card actions, secondary"],
      ["Micro", "11px font, 6px 12px padding — table actions, tags"],
    ]),
    spacer(),

    h2("Cards"),
    spacer(),
    specTable([
      ["Quest card", "Background #111, border #1A1A1A, 24px padding, 12px radius. Title (Barlow 700 20px), description (Inter 14px #888), points badge (green, right-aligned), Complete button"],
      ["Badge card", "140px minimum width, centered. Badge image 80px, badge name (Barlow 700 14px uppercase), badge type (Inter 11px #666). Border highlights on hover."],
      ["Passport card", "Full-width, gradient background from #0F3D2E to #085041, border #1D9E75. Fan name (Barlow 800 32px), team, tier badge, points, badge count."],
      ["Leaderboard row", "Rank number (gold if top 3), display name, team, points (green), tier colour label. Highlighted row for current user."],
      ["Watch party card", "Party name, match, type badge (in-person/online), attendee count, host name, Check In button."],
      ["Stat card", "Small card, label (Inter 12px uppercase #888), value (Barlow 800 32px white or green), used in dashboard header."],
    ]),
    spacer(),

    h2("Form Inputs"),
    spacer(),
    specTable([
      ["Text input", "Background #111, border 1px #1A1A1A, 14px 16px padding, border-radius 8px, Inter 16px white. Focus: border #1D9E75, no outline."],
      ["Input label", "Inter 12px uppercase #888780, letter-spacing 0.08em, 8px margin-bottom"],
      ["Input error", "Border #E55, error message Inter 12px #E55 below input"],
      ["Input success", "Border #1D9E75"],
      ["Select / Dropdown", "Same as text input, custom arrow icon in #888780"],
      ["Search input", "Same as text input with search icon prefix in #888780"],
      ["Checkbox", "Custom styled, unchecked: border #333, checked: background #1D9E75, tick white"],
    ]),
    spacer(),

    h2("Navigation"),
    spacer(),
    specTable([
      ["Global nav height", "64px desktop, 56px mobile"],
      ["Nav background", "Background #0A0A0A, border-bottom 1px #1A1A1A"],
      ["Logo", "Left-aligned, FanCurva primary horizontal logo"],
      ["Nav links", "Inter 500 14px uppercase #888780, hover #FFFFFF, active #1D9E75"],
      ["Mobile nav", "Hamburger menu, full-screen overlay, links stacked 48px apart, Barlow Condensed 700 24px"],
      ["User avatar", "Right-aligned, 36px circle, initials or image, background #1D9E75"],
    ]),
    spacer(),

    h2("Badges"),
    spacer(),
    specTable([
      ["Shape", "Hexagonal. All badge NFTs use consistent hexagonal frame."],
      ["Size in grid", "80px in badge collection grid, 48px in passport summary, 120px in badge detail"],
      ["Locked state", "Greyscale, 40% opacity, lock icon overlay — for badges not yet earned"],
      ["Earned state", "Full colour, subtle glow effect in badge accent colour"],
      ["New badge", "Pulsing green ring animation for 24 hours after earning"],
      ["Soulbound indicator", "Small chain icon, tooltip 'This badge is permanently yours'"],
      ["Transferable indicator", "Small arrow icon, tooltip 'This badge can be traded'"],
    ]),
    spacer(),

    h2("Status Tier Badges"),
    spacer(),
    specTable([
      ["Supporter", "Background #333, text #888780, Inter 600 11px uppercase"],
      ["True Fan", "Background #1A2E4A, text #4A9EFF, border 1px #4A9EFF"],
      ["Ultras", "Background #2A1A3A, text #C084FC, border 1px #C084FC"],
      ["Legend", "Background #2A2200, text #FFD700, border 1px #FFD700, subtle gold shimmer"],
    ]),
    spacer(),

    h2("Leaderboard"),
    spacer(),
    specTable([
      ["Rank 1", "Gold (#FFD700) rank number, subtle gold left border on row"],
      ["Rank 2", "Silver (#C0C0C0) rank number"],
      ["Rank 3", "Bronze (#CD7F32) rank number"],
      ["Rank 4+", "Muted (#444) rank number"],
      ["Current user row", "Background #0F3D2E, border #1D9E75, 'you' label appended to name"],
      ["Points", "Barlow Condensed 700, #1D9E75"],
    ]),
    spacer(),

    h2("Notifications and Feedback"),
    spacer(),
    specTable([
      ["Success toast", "Background #0F3D2E, border-left 4px #1D9E75, text white, auto-dismiss 4s"],
      ["Error toast", "Background #3D0F0F, border-left 4px #E55, text white"],
      ["Warning toast", "Background #3D2A0A, border-left 4px #BA7517, text white"],
      ["Points earned popup", "Large animated '+50 pts' in green, fades up and out over 2s"],
      ["Quest complete", "Full-width success banner, confetti animation, badge preview if applicable"],
      ["Loading skeleton", "Background #1A1A1A, animated shimmer from #222 to #333"],
    ]),
    spacer(),

    // ── 7. PAGES ──────────────────────────────────────────────────────────────
    pageBreak(),
    sectionHeader("7", "Page Designs"),
    spacer(),

    h2("Landing Page"),
    specTable([
      ["Hero", "Full viewport height. Background: dark stadium image with #0A0A0A overlay at 70%. FanCurva logo centred, large display headline 'YOUR PASSION. YOUR JOURNEY.', subline, single CTA button 'Get Your Passport'."],
      ["Social proof", "Below hero: fan count, match count, badge count in stat cards. Animate numbers on scroll."],
      ["How it works", "3-step explainer: Join, Earn, Own. Icon + title + 1-line description. Horizontal on desktop, stacked on mobile."],
      ["Badge preview", "Scrolling horizontal strip of badge NFT images. Auto-scrolling, no interaction needed."],
      ["CTA banner", "Full-width #085041 background, 'World Cup 2026 starts June 11' countdown, single CTA."],
      ["Footer", "Logo, nav links, social icons, legal. Background #0A0A0A, border-top #1A1A1A."],
    ]),
    spacer(),

    h2("Login / Sign Up"),
    specTable([
      ["Layout", "Centred card on dark background. Card: #111, border #1A1A1A, 400px max-width, 40px padding."],
      ["Logo", "FanCurva logo centred at top of card."],
      ["Headline", "Barlow Condensed 700 32px 'CLAIM YOUR PASSPORT'"],
      ["CTA", "Single large button 'Sign In / Sign Up'. Privy modal handles the rest."],
      ["Note", "Small Inter 13px text below: 'No wallet required. Sign in with email.'"],
      ["Referral note", "If ?ref= in URL, show green callout: 'You were invited by a fan. You will receive 50 bonus points on signup.'"],
    ]),
    spacer(),

    h2("Onboarding"),
    specTable([
      ["Step 1 — Name", "Progress indicator (1 of 2). Input for display name. Continue button."],
      ["Step 2 — Team", "Progress indicator (2 of 2). Grid of team cards (flag + name). Selected state: green border, dark green bg. Confirm button."],
      ["Team warning", "Below grid: 'This cannot be changed after you confirm.' in amber."],
      ["Minting state", "Button text changes to 'Minting your passport...' with spinner. Disable button."],
      ["Success", "Passport card animation slides in. 'Your passport is ready' message. Points awarded. Continue to dashboard."],
    ]),
    spacer(),

    h2("Dashboard"),
    specTable([
      ["Header stats", "Row of 4 stat cards: Total Points, Rank, Badges, Status Tier. Below the nav."],
      ["Quest feed", "Left column (desktop) or full width (mobile). Active quests sorted by expiry soonest first. Each quest shows timer countdown."],
      ["Quick actions", "Right column (desktop): Match today card, Leaderboard preview (top 3), Referral link shortcut."],
      ["Points animation", "When a quest is completed, points animate up from the quest card to the header stat."],
      ["Empty quest state", "Illustration + 'No active quests right now. Next match: [date and time].'"],
    ]),
    spacer(),

    h2("Passport Page"),
    specTable([
      ["Passport card", "Full-width hero card. Green gradient background. Fan name (large), team, tier, points. Passport number bottom left. 'WORLD CUP 2026' top label."],
      ["Referral section", "Referral URL with copy button. Stats: referrals converted, points earned, next referral worth X pts."],
      ["Badge collection", "Grid layout. 3 columns mobile, 5 columns desktop. Locked badges shown greyed out. Filter by badge type."],
      ["Quest history", "Collapsible section. List of completed quests with date and points earned."],
    ]),
    spacer(),

    h2("Leaderboard"),
    specTable([
      ["Scope tabs", "Overall / Team / Host Country / Top Inviters. Tab underline in green on active."],
      ["Table", "Rank, Avatar initial, Name, Team, Points, Tier. Current user highlighted."],
      ["My rank callout", "Fixed at bottom of screen: 'Your rank: #42 — 280 pts to next position'. Sticky."],
      ["Team filter", "When Team tab selected, show team picker dropdown."],
    ]),
    spacer(),

    h2("Quest Detail"),
    specTable([
      ["Layout", "Modal or full page. Quest title (large), description, points reward badge, expiry countdown, quest type label."],
      ["Match quests", "Show match details: teams, kickoff time, stadium."],
      ["Completion state", "Green checkmark, 'Quest Complete', points awarded, badge preview if applicable."],
      ["Expired state", "Grey overlay, 'This quest has expired', no action possible."],
    ]),
    spacer(),

    h2("Watch Parties"),
    specTable([
      ["List view", "Cards grid. Party name, match, type, attendee count, distance (if location permitted)."],
      ["Host button", "Floating green button bottom right on mobile, top right on desktop."],
      ["Host form", "Modal: party name, match selector, type toggle (in-person/online), optional location/stream URL, max attendees."],
      ["Check-in flow", "Enter host code → confirm → success animation → 30 pts awarded."],
    ]),
    spacer(),

    // ── 8. PASSPORT NFT DESIGN SPEC ───────────────────────────────────────────
    pageBreak(),
    sectionHeader("8", "Passport NFT Design Spec"),
    spacer(),
    body("The passport NFT is the hero collectible. Every design decision should make it feel like something worth owning and showing off."),
    spacer(),
    h3("Front face (display card)"),
    specTable([
      ["Dimensions", "600px x 400px — standard card ratio 3:2"],
      ["Background", "Dark gradient — team-specific accent colour fades from left edge"],
      ["Top left", "FanCurva logo (small, white)"],
      ["Top right", "'WORLD CUP 2026' label (Inter 11px uppercase, #9FE1CB)"],
      ["Center left", "Fan display name (Barlow Condensed 800, 40px, white)"],
      ["Below name", "PASSPORT TYPE label (Inter 12px uppercase, #9FE1CB), value (Barlow 700 18px, white)"],
      ["Below type", "TEAM label + value (Barlow 700 18px, white) + team flag emoji or small flag image"],
      ["Status tier", "Hexagonal badge with tier name — Supporter / True Fan / Ultras / Legend"],
      ["Bottom left", "POINTS (Barlow 800 28px, #1D9E75) + 'PASSPORT NO.' + code"],
      ["Bottom right", "ISSUED date + 'VALID FOR WORLD CUP 2026'"],
      ["Background pattern", "Subtle curva crowd silhouette or stadium seat pattern at 8% opacity"],
      ["Left accent strip", "4px solid line in team primary colour"],
    ]),
    spacer(),
    h3("Back face (passport booklet cover)"),
    specTable([
      ["Background", "Deep green #085041 with leather texture at low opacity"],
      ["Center", "FanCurva logo (large, #1D9E75)"],
      ["Below logo", "'WORLD CUP 2026' (Barlow 700, white)"],
      ["Bottom center", "'FAN PASSPORT' (Barlow 800, uppercase, #9FE1CB)"],
      ["Bottom tagline", "'YOUR PASSION. YOUR JOURNEY.' (Inter 13px italic, #9FE1CB)"],
      ["Passport symbol", "Stylised globe or football icon centered, very subtle"],
    ]),
    spacer(),
    h3("Team colour accent system"),
    body("Each team passport uses the team's primary colour as the left accent strip and background gradient source. A selection of key teams:"),
    spacer(),
    specTable([
      ["Brazil", "Accent #009C3B (green), secondary #FFDF00 (gold)"],
      ["Argentina", "Accent #74ACDF (sky blue), secondary #FFFFFF"],
      ["England", "Accent #CF081F (red), secondary #FFFFFF"],
      ["France", "Accent #002395 (blue), secondary #ED2939 (red)"],
      ["Spain", "Accent #AA151B (red), secondary #F1BF00 (gold)"],
      ["Nigeria", "Accent #008751 (green), secondary #FFFFFF"],
      ["Ghana", "Accent #006B3F (green), secondary #FCD116 (gold)"],
      ["USA", "Accent #B22234 (red), secondary #3C3B6E (blue)"],
      ["Mexico", "Accent #006847 (green), secondary #CE1126 (red)"],
      ["Default / Tournament", "Accent #1D9E75 (FanCurva green), secondary #085041"],
    ]),
    spacer(),

    // ── 9. BADGE NFT DESIGN SPEC ──────────────────────────────────────────────
    pageBreak(),
    sectionHeader("9", "Badge NFT Design Spec"),
    spacer(),
    body("Badges are the collectible layer. They should feel like a genuine set — consistent shape and style, distinct per type, with escalating premium quality as badges get rarer."),
    spacer(),
    h3("Badge frame"),
    specTable([
      ["Shape", "Hexagonal — all badges use the same hexagonal outer frame"],
      ["Dimensions", "500px x 580px for the source asset, displays at various sizes"],
      ["Frame", "Double hexagonal border — outer thin line, inner thicker line, colour varies by rarity"],
      ["Background", "Dark radial gradient (#111 to #0A0A0A) inside the hex"],
      ["Badge name", "Barlow Condensed 700 uppercase, bottom center of hex"],
      ["Rarity indicator", "Star(s) top right corner of hex: 1 star common, 2 uncommon, 3 rare, 4 legendary"],
    ]),
    spacer(),
    h3("Badge type specifications"),
    specTable([
      ["Team badge", "Frame: team primary colour. Center: large team flag. Bottom: 'TEAM' label + team name. Rarity: 1 star."],
      ["Starter badge", "Frame: #1D9E75. Center: football boot icon. Badge name: 'FIRST STEP'. Rarity: 1 star."],
      ["Match-day badge", "Frame: #4A9EFF. Center: match teams (e.g. 'BRA vs ARG') + date. Rarity: 1 star. Unique per match."],
      ["City badge — USA", "Frame: #B22234. Center: Statue of Liberty silhouette. Name: 'USA'. Rarity: 1 star."],
      ["City badge — Canada", "Frame: #FF0000. Center: maple leaf. Name: 'CANADA'. Rarity: 1 star."],
      ["City badge — Mexico", "Frame: #006847. Center: eagle icon. Name: 'MEXICO'. Rarity: 1 star."],
      ["Round of 16 badge", "Frame: #4A9EFF. Center: 16 shield icon. Rarity: 2 stars."],
      ["Quarter Final badge", "Frame: #C084FC. Center: trophy cup (partial fill). Rarity: 2 stars."],
      ["Semi Final badge", "Frame: #C084FC, brighter. Center: trophy cup (half fill). Rarity: 3 stars."],
      ["Finals badge", "Frame: gold gradient. Center: stadium at night, 'FINALS' text. Rarity: 3 stars."],
      ["Champion badge", "Frame: gold shimmer gradient. Center: World Cup trophy. Name: 'CHAMPION'. Rarity: 4 stars. Gold glow effect."],
      ["Trivia streak badge", "Frame: #4A9EFF. Center: lightning bolt or brain icon + streak number. Rarity: varies by streak length."],
      ["Referral badge", "Frame: #9FE1CB. Center: people/crowd icon + number referred. Name: 'REFERRAL'. Rarity: 1 star."],
      ["Watch party badge", "Frame: #1D9E75. Center: screen/crowd icon. Name: 'WATCH PARTY'. Rarity: 1 star."],
      ["Legend badge", "Frame: gold. Center: crown. Name: 'LEGEND'. Awarded on reaching Legend tier. Rarity: 3 stars."],
    ]),
    spacer(),

    // ── 10. ANIMATIONS ────────────────────────────────────────────────────────
    pageBreak(),
    sectionHeader("10", "Motion and Animation"),
    spacer(),
    body("Animations should feel earned and meaningful. Use motion to communicate that something happened — a quest completed, points earned, a badge unlocked. Never animate for decoration alone."),
    spacer(),
    h3("Principles"),
    bullet("Fast and purposeful — transitions under 300ms for UI, 600ms for celebrations"),
    bullet("Ease out for entrances — things arrive confidently, decelerate to rest"),
    bullet("Ease in for exits — things leave quickly, do not linger"),
    bullet("Spring physics for badges and cards — slight bounce on entrance"),
    spacer(),
    h3("Key animations"),
    specTable([
      ["Points earned", "+50 pts text animates from quest card to header stat counter. Green, Barlow Condensed 700, scales from 1 to 1.5 then fades. Duration: 800ms."],
      ["Quest complete", "Card border flashes green, checkmark icon appears, card fades slightly. Duration: 400ms."],
      ["Badge unlock", "Badge scales from 0 to 1.1 then settles at 1. Golden ring radiates outward. Duration: 600ms with spring."],
      ["Passport mint", "Card flips from blank to fan passport (3D card flip). Duration: 1200ms."],
      ["Leaderboard rank change", "Row slides to new position, rank number counts up/down. Duration: 500ms."],
      ["Status tier upgrade", "Full-screen flash of tier colour, tier badge animates in with new colour. Duration: 1000ms."],
      ["Loading states", "Skeleton screens with shimmer animation from left to right. Duration: 1500ms loop."],
      ["Page transitions", "Fade in on mount, 200ms. No slide transitions — keep it fast."],
      ["Toast notifications", "Slide in from top right, auto-dismiss after 4s with progress bar."],
      ["Loading logo", "FanCurva icon arcs draw on sequentially. Loop while loading."],
    ]),
    spacer(),

    // ── 11. MOBILE DESIGN ─────────────────────────────────────────────────────
    pageBreak(),
    sectionHeader("11", "Mobile Design"),
    spacer(),
    body("Most fans will use FanCurva on their phone during matches. Mobile is the primary design target, not an afterthought."),
    spacer(),
    h3("Mobile-first rules"),
    bullet("Design for 375px width minimum (iPhone SE). Test at 390px (iPhone 14) and 414px (Plus models)."),
    bullet("Touch targets minimum 44x44px — never make tappable elements smaller"),
    bullet("Bottom navigation bar for primary pages — fans use their thumb, not the top of the screen"),
    bullet("Quest check-in button must be reachable with one thumb — bottom center of screen"),
    bullet("Passport card scales to full viewport width on mobile — it is the hero element"),
    bullet("No horizontal scrolling — ever"),
    spacer(),
    h3("Bottom navigation (mobile only)"),
    specTable([
      ["Items", "Home (dashboard), Quests, Passport, Leaderboard, Menu"],
      ["Height", "64px safe area — account for iPhone home indicator"],
      ["Active state", "Icon fills green, label turns #1D9E75"],
      ["Badge notification", "Red dot with count on Quests icon when new quests available"],
      ["Background", "#0A0A0A with top border #1A1A1A"],
    ]),
    spacer(),
    h3("Match-day mobile experience"),
    bullet("Full-screen match check-in overlay when a match is live — large 'CHECK IN' button, match details, countdown"),
    bullet("Persistent match banner at top of screen when a tracked match is live"),
    bullet("Half-time quest pop-up — appears automatically at half time, 15-minute timer visible"),
    bullet("Haptic feedback on quest completion (iOS/Android native — implement via Capacitor if building native)"),
    spacer(),

    // ── 12. ACCESSIBILITY ─────────────────────────────────────────────────────
    pageBreak(),
    sectionHeader("12", "Accessibility"),
    spacer(),
    specTable([
      ["Colour contrast", "All text on dark backgrounds must meet WCAG AA minimum (4.5:1 for body, 3:1 for large text). Primary green #1D9E75 on #0A0A0A = 5.2:1 — passes AA."],
      ["Focus states", "All interactive elements have visible focus ring: 2px solid #1D9E75, 2px offset. Never remove outline entirely."],
      ["Alt text", "All badge images, passport images, and team flags must have descriptive alt text."],
      ["Font sizes", "Minimum 14px for any readable text. Never go below 12px even for captions."],
      ["Reduced motion", "Respect prefers-reduced-motion media query. Disable non-essential animations, keep functional transitions."],
      ["Keyboard navigation", "All pages must be fully navigable by keyboard. Quests completable without mouse."],
      ["Screen readers", "Use semantic HTML. Leaderboard as a proper table element. Badges as list items with aria-labels."],
    ]),
    spacer(),

    // ── 13. ASSET EXPORT SPECS ────────────────────────────────────────────────
    pageBreak(),
    sectionHeader("13", "Asset Export Specifications"),
    spacer(),
    specTable([
      ["Logo (primary horizontal)", "SVG (vector, scalable). Also PNG at 2x: 400x80px and 800x160px."],
      ["Logo (icon only)", "SVG. Also PNG: 32x32, 64x64, 128x128, 512x512."],
      ["Favicon", "favicon.ico (16, 32, 48px multi-size). favicon.svg. apple-touch-icon.png 180x180."],
      ["OG image", "og-image.jpg, 1200x630px, under 200KB. Shows logo, tagline, dark background."],
      ["App icon", "icon-512.png, 512x512px, rounded corners for app stores."],
      ["Passport NFT", "PNG, 600x400px per variant (one per team). Also WebP for web display."],
      ["Badge NFTs", "PNG, 500x580px per badge. Transparent background inside hex frame. WebP for web."],
      ["Empty state illustrations", "SVG preferred. Three states: no badges, no quests, no watch parties."],
      ["Loading animation", "Lottie JSON (preferred) or CSS animation. FanCurva icon arcs drawing on."],
    ]),
    spacer(),
    h3("File naming convention"),
    codeBlock(
      "logo-horizontal.svg\n" +
      "logo-icon.svg\n" +
      "logo-stacked.svg\n" +
      "logo-light-bg.svg\n" +
      "favicon.svg\n" +
      "favicon.ico\n" +
      "apple-touch-icon.png\n" +
      "og-image.jpg\n" +
      "icon-512.png\n" +
      "passport-brazil.png\n" +
      "passport-nigeria.png\n" +
      "passport-default.png\n" +
      "badge-team.png\n" +
      "badge-starter.png\n" +
      "badge-match-day.png\n" +
      "badge-city-usa.png\n" +
      "badge-city-canada.png\n" +
      "badge-city-mexico.png\n" +
      "badge-round-of-16.png\n" +
      "badge-quarter-final.png\n" +
      "badge-semi-final.png\n" +
      "badge-finals.png\n" +
      "badge-champion.png\n" +
      "badge-trivia-streak.png\n" +
      "badge-referral.png\n" +
      "badge-watch-party.png\n" +
      "badge-legend.png\n" +
      "empty-no-badges.svg\n" +
      "empty-no-quests.svg\n" +
      "empty-no-parties.svg"
    ),
    spacer(),

    // ── 14. IMPLEMENTATION NOTES ──────────────────────────────────────────────
    pageBreak(),
    sectionHeader("14", "Implementation Notes for Developers"),
    spacer(),
    body("These notes are for the frontend developers implementing this design system in the Vite + React + TypeScript codebase."),
    spacer(),
    h3("CSS setup"),
    body("Add Google Fonts to apps/web/index.html:"),
    codeBlock('<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />'),
    spacer(),
    body("Replace apps/web/src/index.css with:"),
    codeBlock(
      "*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }\n\n" +
      ":root {\n" +
      "  --color-primary:       #1D9E75;\n" +
      "  --color-primary-dark:  #085041;\n" +
      "  --color-primary-mid:   #9FE1CB;\n" +
      "  --color-primary-light: #E1F5EE;\n" +
      "  --color-bg:            #0A0A0A;\n" +
      "  --color-surface:       #111111;\n" +
      "  --color-border:        #1A1A1A;\n" +
      "  --color-text:          #FFFFFF;\n" +
      "  --color-text-secondary:#888780;\n" +
      "  --color-text-muted:    #444441;\n" +
      "  --color-amber:         #BA7517;\n" +
      "  --color-gold:          #FFD700;\n" +
      "  --color-error:         #E55;\n" +
      "  --font-heading:        'Barlow Condensed', sans-serif;\n" +
      "  --font-body:           'Inter', sans-serif;\n" +
      "  --radius-sm:           4px;\n" +
      "  --radius-md:           8px;\n" +
      "  --radius-lg:           12px;\n" +
      "  --radius-xl:           16px;\n" +
      "  --radius-2xl:          24px;\n" +
      "}\n\n" +
      "body {\n" +
      "  background: var(--color-bg);\n" +
      "  color: var(--color-text);\n" +
      "  font-family: var(--font-body);\n" +
      "  font-size: 16px;\n" +
      "  line-height: 1.6;\n" +
      "  -webkit-font-smoothing: antialiased;\n" +
      "}\n\n" +
      "h1, h2, h3, h4, h5, h6 {\n" +
      "  font-family: var(--font-heading);\n" +
      "  font-weight: 800;\n" +
      "  text-transform: uppercase;\n" +
      "  letter-spacing: 0.02em;\n" +
      "  line-height: 1.1;\n" +
      "}\n\n" +
      "a { color: var(--color-primary); text-decoration: none; }\n" +
      "a:hover { text-decoration: underline; }\n\n" +
      "button { cursor: pointer; font-family: var(--font-body); }\n\n" +
      ":focus-visible {\n" +
      "  outline: 2px solid var(--color-primary);\n" +
      "  outline-offset: 2px;\n" +
      "}\n\n" +
      "@media (prefers-reduced-motion: reduce) {\n" +
      "  *, *::before, *::after {\n" +
      "    animation-duration: 0.01ms !important;\n" +
      "    transition-duration: 0.01ms !important;\n" +
      "  }\n" +
      "}"
    ),
    spacer(),
    h3("Component folder structure"),
    codeBlock(
      "apps/web/src/\n" +
      "  components/\n" +
      "    ui/\n" +
      "      Button.tsx        -- Primary, Secondary, Ghost variants\n" +
      "      Card.tsx          -- Base card component\n" +
      "      Input.tsx         -- Text input with label and error\n" +
      "      Badge.tsx         -- Status tier badge\n" +
      "      Toast.tsx         -- Notification toasts\n" +
      "      Skeleton.tsx      -- Loading skeleton\n" +
      "    passport/\n" +
      "      PassportCard.tsx  -- Full passport NFT display\n" +
      "      BadgeGrid.tsx     -- Badge collection grid\n" +
      "      BadgeItem.tsx     -- Single badge with locked/earned states\n" +
      "    quests/\n" +
      "      QuestCard.tsx     -- Quest with timer and complete button\n" +
      "      QuestFeed.tsx     -- Sorted quest list\n" +
      "      QuestTimer.tsx    -- Countdown display\n" +
      "    leaderboard/\n" +
      "      LeaderboardRow.tsx\n" +
      "      LeaderboardTable.tsx\n" +
      "    shared/\n" +
      "      Nav.tsx           -- Global navigation\n" +
      "      BottomNav.tsx     -- Mobile bottom navigation\n" +
      "      TeamPicker.tsx    -- Team selection grid\n" +
      "      MatchBanner.tsx   -- Live match top banner\n" +
      "      EmptyState.tsx    -- Reusable empty state"
    ),
    spacer(),
    h3("Tailwind note"),
    body("The current codebase uses inline styles. When refactoring to use the design system, either adopt Tailwind CSS with a custom config matching these tokens, or use CSS Modules with the CSS variables defined above. Do not mix both approaches."),
    spacer(),
    h3("Image handling"),
    bullet("All NFT images served from Supabase Storage or IPFS via NFT.Storage"),
    bullet("Use lazy loading for badge grids — badges below fold should not block page load"),
    bullet("Always provide width and height attributes on img tags to prevent layout shift"),
    bullet("Use WebP format for all badge and passport images in the browser"),
    spacer(2),

    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { top: { style: BorderStyle.SINGLE, size: 6, color: TEAL, space: 8 } },
      spacing: { before: 240, after: 100 },
      children: [new TextRun({ text: "FanCurva  \u2022  Web & UI/UX Design Guide  \u2022  v1.0  \u2022  World Cup 2026", size: 18, color: GRAY_MID, font: "Arial", italics: true })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [new TextRun({ text: "Your Passion. Your Journey.", size: 22, bold: true, color: TEAL_DARK, font: "Arial" })]
    }),
  ]
}

const doc = new Document({
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 44, bold: true, font: "Arial", color: BLACK }, paragraph: { spacing: { before: 480, after: 160 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 30, bold: true, font: "Arial", color: TEAL_DARK }, paragraph: { spacing: { before: 320, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 24, bold: true, font: "Arial", color: BLACK }, paragraph: { spacing: { before: 240, after: 80 }, outlineLevel: 2 } },
    ]
  },
  sections: [coverSection, mainSection]
})

Packer.toBuffer(doc).then(function(buffer) {
  fs.writeFileSync("FanCurva_DesignGuide_v1.docx", buffer)
  console.log("Written: FanCurva_DesignGuide_v1.docx")
})