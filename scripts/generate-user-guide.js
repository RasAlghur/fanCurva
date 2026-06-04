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
const AMBER_LIGHT = "FAEEDA"
const AMBER_DARK = "412402"

const border = { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" }
const borders = { top: border, bottom: border, left: border, right: border }

function h1(text) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 140 },
        children: [new TextRun({ text, bold: true, size: 38, color: BLACK, font: "Arial" })]
    })
}
function h2(text) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 120 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: TEAL, space: 4 } },
        children: [new TextRun({ text, bold: true, size: 28, color: TEAL_DARK, font: "Arial" })]
    })
}
function h3(text) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_3, spacing: { before: 220, after: 80 },
        children: [new TextRun({ text, bold: true, size: 24, color: BLACK, font: "Arial" })]
    })
}
function body(text) {
    return new Paragraph({
        spacing: { before: 80, after: 80 },
        children: [new TextRun({ text, size: 22, color: BLACK, font: "Arial" })]
    })
}
function bullet(text) {
    return new Paragraph({
        numbering: { reference: "bullets", level: 0 }, spacing: { before: 60, after: 60 },
        children: [new TextRun({ text, size: 22, color: BLACK, font: "Arial" })]
    })
}
function numbered(text) {
    return new Paragraph({
        numbering: { reference: "numbers", level: 0 }, spacing: { before: 60, after: 60 },
        children: [new TextRun({ text, size: 22, color: BLACK, font: "Arial" })]
    })
}
function spacer(n) {
    n = n || 1
    return new Paragraph({ spacing: { before: 0, after: n * 80 }, children: [new TextRun("")] })
}
function pageBreak() {
    return new Paragraph({ pageBreakBefore: true, children: [new TextRun("")] })
}
function makeCallout(text, fillColor, labelText, labelColor) {
    const cell = new TableCell({
        borders, width: { size: 9360, type: WidthType.DXA },
        shading: { fill: fillColor, type: ShadingType.CLEAR },
        margins: { top: 120, bottom: 120, left: 160, right: 160 },
        children: [new Paragraph({
            children: [
                new TextRun({ text: labelText + "  ", bold: true, size: 20, color: labelColor, font: "Arial" }),
                new TextRun({ text, size: 20, color: labelColor, font: "Arial" })
            ]
        })]
    })
    return new Table({
        width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360],
        rows: [new TableRow({ children: [cell] })]
    })
}
function tip(text) { return makeCallout(text, TEAL_LIGHT, "\u2713  Tip:", TEAL_DARK) }
function note(text) { return makeCallout(text, AMBER_LIGHT, "!  Note:", AMBER_DARK) }

function stepTable(steps) {
    const rows = steps.map(function (s) {
        return new TableRow({
            children: [
                new TableCell({
                    borders, width: { size: 600, type: WidthType.DXA },
                    shading: { fill: TEAL, type: ShadingType.CLEAR },
                    margins: { top: 120, bottom: 120, left: 100, right: 100 },
                    children: [new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: String(s[0]), bold: true, size: 26, color: WHITE, font: "Arial" })]
                    })]
                }),
                new TableCell({
                    borders, width: { size: 2400, type: WidthType.DXA },
                    shading: { fill: GRAY_LIGHT, type: ShadingType.CLEAR },
                    margins: { top: 120, bottom: 120, left: 140, right: 140 },
                    children: [new Paragraph({ children: [new TextRun({ text: s[1], bold: true, size: 22, color: BLACK, font: "Arial" })] })]
                }),
                new TableCell({
                    borders, width: { size: 6360, type: WidthType.DXA },
                    margins: { top: 120, bottom: 120, left: 140, right: 140 },
                    children: [new Paragraph({ children: [new TextRun({ text: s[2], size: 22, color: BLACK, font: "Arial" })] })]
                }),
            ]
        })
    })
    return new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [600, 2400, 6360], rows })
}

function faqTable(items) {
    const header = new TableRow({
        children: [
            new TableCell({
                borders, width: { size: 3800, type: WidthType.DXA },
                shading: { fill: TEAL_DARK, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 140, right: 140 },
                children: [new Paragraph({ children: [new TextRun({ text: "Question", bold: true, size: 22, color: WHITE, font: "Arial" })] })]
            }),
            new TableCell({
                borders, width: { size: 5560, type: WidthType.DXA },
                shading: { fill: TEAL_DARK, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 140, right: 140 },
                children: [new Paragraph({ children: [new TextRun({ text: "Answer", bold: true, size: 22, color: WHITE, font: "Arial" })] })]
            }),
        ]
    })
    const rows = items.map(function (item, i) {
        const bg = i % 2 === 0 ? WHITE : GRAY_LIGHT
        return new TableRow({
            children: [
                new TableCell({
                    borders, width: { size: 3800, type: WidthType.DXA }, shading: { fill: bg, type: ShadingType.CLEAR },
                    margins: { top: 100, bottom: 100, left: 140, right: 140 },
                    children: [new Paragraph({ children: [new TextRun({ text: item[0], bold: true, size: 21, color: BLACK, font: "Arial" })] })]
                }),
                new TableCell({
                    borders, width: { size: 5560, type: WidthType.DXA }, shading: { fill: bg, type: ShadingType.CLEAR },
                    margins: { top: 100, bottom: 100, left: 140, right: 140 },
                    children: [new Paragraph({ children: [new TextRun({ text: item[1], size: 21, color: BLACK, font: "Arial" })] })]
                }),
            ]
        })
    })
    return new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [3800, 5560], rows: [header].concat(rows) })
}

function twoCol(items, h1text, h2text, w1, w2) {
    w1 = w1 || 3200; w2 = w2 || 6160
    const header = new TableRow({
        children: [
            new TableCell({
                borders, width: { size: w1, type: WidthType.DXA }, shading: { fill: TEAL_DARK, type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 140, right: 140 },
                children: [new Paragraph({ children: [new TextRun({ text: h1text, bold: true, size: 22, color: WHITE, font: "Arial" })] })]
            }),
            new TableCell({
                borders, width: { size: w2, type: WidthType.DXA }, shading: { fill: TEAL_DARK, type: ShadingType.CLEAR },
                margins: { top: 100, bottom: 100, left: 140, right: 140 },
                children: [new Paragraph({ children: [new TextRun({ text: h2text, bold: true, size: 22, color: WHITE, font: "Arial" })] })]
            }),
        ]
    })
    const rows = items.map(function (item, i) {
        const bg = i % 2 === 0 ? WHITE : GRAY_LIGHT
        return new TableRow({
            children: [
                new TableCell({
                    borders, width: { size: w1, type: WidthType.DXA }, shading: { fill: bg, type: ShadingType.CLEAR },
                    margins: { top: 90, bottom: 90, left: 140, right: 140 },
                    children: [new Paragraph({ children: [new TextRun({ text: item[0], bold: true, size: 21, color: BLACK, font: "Arial" })] })]
                }),
                new TableCell({
                    borders, width: { size: w2, type: WidthType.DXA }, shading: { fill: bg, type: ShadingType.CLEAR },
                    margins: { top: 90, bottom: 90, left: 140, right: 140 },
                    children: [new Paragraph({ children: [new TextRun({ text: item[1], size: 21, color: BLACK, font: "Arial" })] })]
                }),
            ]
        })
    })
    return new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: [w1, w2], rows: [header].concat(rows) })
}

const coverSection = {
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    children: [
        spacer(5),
        new Paragraph({
            alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 },
            children: [new TextRun({ text: "FANCURVA", bold: true, size: 72, color: TEAL_DARK, font: "Arial" })]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER, spacing: { before: 0, after: 200 },
            children: [new TextRun({ text: "Complete User Guide", size: 36, color: GRAY_MID, font: "Arial" })]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: TEAL, space: 4 } },
            spacing: { before: 0, after: 300 }, children: [new TextRun("")]
        }),
        spacer(2),
        new Paragraph({
            alignment: AlignmentType.CENTER, spacing: { before: 0, after: 100 },
            children: [new TextRun({ text: "Your digital companion for the world\u2019s biggest football tournament.", size: 26, color: BLACK, font: "Arial", italics: true })]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 },
            children: [new TextRun({ text: "Collect badges. Complete missions. Represent your team.", size: 24, color: GRAY_MID, font: "Arial" })]
        }),
        spacer(8),
        new Paragraph({
            alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 },
            children: [new TextRun({ text: "World Cup 2026  \u2022  June 11 \u2013 July 19", size: 22, color: GRAY_MID, font: "Arial" })]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 },
            children: [new TextRun({ text: "USA  \u2022  Canada  \u2022  Mexico", size: 20, color: GRAY_MID, font: "Arial" })]
        }),
    ]
}

const mainSection = {
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, right: 1440, bottom: 1080, left: 1440 } } },
    headers: {
        default: new Header({
            children: [new Paragraph({
                border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: TEAL, space: 4 } },
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                children: [
                    new TextRun({ text: "FanCurva \u2014 User Guide", size: 18, color: GRAY_MID, font: "Arial" }),
                    new TextRun({ text: "\tfancurva.com", size: 18, color: TEAL, font: "Arial" }),
                ]
            })]
        })
    },
    footers: {
        default: new Footer({
            children: [new Paragraph({
                border: { top: { style: BorderStyle.SINGLE, size: 4, color: TEAL, space: 4 } },
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                children: [
                    new TextRun({ text: "Page ", size: 18, color: GRAY_MID, font: "Arial" }),
                    new TextRun({ text: "PAGE", size: 18, color: GRAY_MID, font: "Arial" }),
                    new TextRun({ text: "\t\u00A9 2026 FanCurva. All rights reserved.", size: 18, color: GRAY_MID, font: "Arial" }),
                ]
            })]
        })
    },
    children: [
        h1("1. Welcome to FanCurva"),
        body("FanCurva is your digital companion for the entire 2026 FIFA World Cup. It is a fan engagement platform that rewards you for doing what you already love: following matches, supporting your team, and sharing your passion with friends."),
        body("Every time you participate \u2014 watch a match, answer trivia, invite a friend, or collect a badge \u2014 you earn rewards that are yours to keep permanently."),
        spacer(),
        h3("Do I need crypto or a wallet?"),
        body("No. Sign up with your email address. FanCurva creates a secure digital wallet for you automatically behind the scenes. You never need to touch a wallet, buy cryptocurrency, or understand blockchain to use the platform."),
        spacer(),

        pageBreak(),
        h1("2. Getting Started"),
        spacer(),
        stepTable([
            [1, "Create account", "Visit fancurva.com or download the app. Sign up with your email address."],
            [2, "Verify email", "Click the verification link in your inbox. Check spam if it does not arrive."],
            [3, "Choose a name", "Pick a display name that appears on leaderboards and your passport."],
            [4, "Pick your team", "Select the national team you will be supporting. Read section 4 before choosing \u2014 this cannot be changed."],
            [5, "Mint your passport", "Your free FanCurva passport is created. This is your identity for the tournament."],
            [6, "First quest", "Complete your first quest to earn your starter badge and appear on the leaderboard."],
        ]),
        spacer(),
        tip("Sign up takes under 2 minutes. No wallet, no crypto, no technical knowledge needed."),
        spacer(),

        pageBreak(),
        h1("3. Your Fan Passport"),
        body("Your passport is a digital collectible that acts as your identity on FanCurva. It stores your badges, points, status, and participation history for the entire tournament \u2014 and beyond."),
        spacer(),
        twoCol([
            ["Team Passport", "Aligned to one of the 48 qualified national teams. Most popular option."],
            ["Host City Passport", "Aligned to USA, Canada, or Mexico. Great for fans attending matches in person."],
            ["Tournament Passport", "No team affiliation. For fans who support football generally or whose team did not qualify."],
            ["Creator Passport", "Issued by fan communities and influencers. Available by invitation from a creator."],
        ], "Type", "Description"),
        spacer(),
        h3("What happens to my passport after the World Cup?"),
        body("Your passport and all earned badges remain yours permanently. They are stored on the blockchain and cannot be deleted or taken away. Think of it as a permanent digital record of your 2026 World Cup participation."),
        spacer(),
        h3("Can I have more than one passport?"),
        body("No. One passport per account. This keeps leaderboards fair and your fan identity genuine."),
        spacer(),

        pageBreak(),
        h1("4. Team Selection"),
        body("Choosing your team is one of the most important steps. Read this section carefully before confirming."),
        spacer(),
        h3("Which teams are available?"),
        body("Only the 48 national teams that have officially qualified for the 2026 FIFA World Cup are available. The full list is shown in the app once all qualification spots are confirmed."),
        spacer(),
        note("2026 is the first World Cup with 48 teams (up from 32). More countries are represented than ever before."),
        spacer(),
        h3("Can I change my team after picking?"),
        body("No. Your team selection is locked permanently once you confirm and mint your passport. This is intentional \u2014 it keeps leaderboards fair. Choose carefully."),
        spacer(),
        tip("Take your time. You can browse all 48 teams and see how many fans have already picked each one before you confirm."),
        spacer(),
        h3("What if my team did not qualify?"),
        body("Select a Tournament Passport (no team) or choose another national team to support. Both options give you full access to all platform features."),
        spacer(),

        pageBreak(),
        h1("5. When Your Team Is Eliminated"),
        body("This is one of the most common questions fans ask. The short answer: FanCurva keeps you fully engaged even after your team goes home."),
        spacer(),
        twoCol([
            ["Your passport and badges", "Stay exactly as they are. Everything earned is yours permanently."],
            ["Team quests", "End when your team is knocked out."],
            ["Tournament-wide quests", "Continue for all fans regardless of which teams are still playing."],
            ["General leaderboard", "You remain on it and can still climb through continued activity."],
            ["Neutral fan mode", "Unlocks automatically when your team is eliminated. New quests to follow the rest of the tournament."],
            ["Collector quests", "Finals badges, golden boot tracking, and host city collectibles are open to everyone."],
        ], "Feature", "After your team is eliminated"),
        spacer(),
        h3("What is neutral fan mode?"),
        bullet("Pick an underdog to follow through the knockouts"),
        bullet("Back a golden boot contender and earn points if they score"),
        bullet("Predict the finalist from each side of the bracket"),
        bullet("Collect semi-final and final badges regardless of who is playing"),
        spacer(),
        tip("Fans whose teams exit early often end up with more total badges. The full tournament is yours to explore."),
        spacer(),
        h3("Tournament stages"),
        spacer(),
        twoCol([
            ["Group stage", "June 11 \u2013 June 27. 3 matches per team. Bottom 2 in each group eliminated."],
            ["Round of 32", "June 28 \u2013 July 1. Third-placed teams play off."],
            ["Round of 16", "July 2 \u2013 July 5."],
            ["Quarter-finals", "July 8 \u2013 July 9."],
            ["Semi-finals", "July 14 \u2013 July 15."],
            ["Final", "July 19. A fan whose team exits in the group stage still has 4+ weeks of tournament content."],
        ], "Stage", "Dates"),
        spacer(),

        pageBreak(),
        h1("6. Quests"),
        body("Quests are the main way to earn points and badges. New quests appear throughout the tournament tied to matches, social activity, and special events."),
        spacer(),
        h3("Match-day quests"),
        bullet("Check in during a live match \u2014 open FanCurva while the game is on"),
        bullet("Live trivia \u2014 answer football questions during the match"),
        bullet("Outcome prediction \u2014 predict the result before kick-off (not gambling, no money involved)"),
        bullet("Match reaction \u2014 post your reaction after full time"),
        bullet("Half-time challenge \u2014 a timed quest during the break only"),
        spacer(),
        h3("Social quests"),
        bullet("Invite a friend \u2014 earn rewards for each friend who joins through your link"),
        bullet("Join a watch party \u2014 check in at an official event"),
        bullet("Host a watch party \u2014 register your own event and earn host rewards"),
        spacer(),
        h3("Collector quests"),
        bullet("Collect a match badge for a specific game"),
        bullet("Complete a full group stage badge set"),
        bullet("Knockout round badges as teams progress"),
        spacer(),
        h3("Quest timing"),
        spacer(),
        twoCol([
            ["Match-day quests", "Expire at full time. Miss the match, miss the quest."],
            ["Half-time quest", "15 minutes only during the break."],
            ["Social quests", "Open throughout the tournament."],
            ["Collector quests", "Usually 24\u201348 hours after the match. Check the quest card."],
        ], "Type", "Availability"),
        spacer(),
        tip("Enable push notifications to get alerted before quests expire. Match-day quests close at full time."),
        spacer(),

        pageBreak(),
        h1("7. Badges"),
        body("Badges are digital collectibles earned through quests. They live on your passport permanently."),
        spacer(),
        h3("Types of badges"),
        spacer(),
        twoCol([
            ["Team badge", "Awarded when you pick your team."],
            ["Starter badge", "Earned on your first quest completion."],
            ["Match-day badge", "One unique badge per match you check in to."],
            ["City badge", "Earned for host city (USA, Canada, Mexico) engagement."],
            ["Knockout badge", "Awarded as your team progresses."],
            ["Trivia streak badge", "5 correct answers in a row."],
            ["Referral badge", "One per friend who joins and completes their first quest."],
            ["Watch party badge", "For attending or hosting a watch party."],
            ["Neutral fan badge", "Awarded when neutral fan mode activates."],
            ["Finals badge", "For participating during finals week."],
            ["Champion badge", "Rare. Awarded to fans whose team wins the World Cup."],
            ["Rare commemorative NFT", "Limited-edition collectibles for major moments. Transferable."],
        ], "Badge", "How to earn it"),
        spacer(),
        h3("Soulbound vs transferable"),
        body("Most badges are soulbound \u2014 they are permanently attached to your passport and cannot be sold or transferred. This means they represent genuine fan participation and cannot be bought. Rare commemorative collectibles are transferable and can be traded with other fans."),
        spacer(),

        pageBreak(),
        h1("8. Points and Leaderboards"),
        spacer(),
        twoCol([
            ["Mint passport", "100 pts"],
            ["Match check-in", "20 pts per match"],
            ["Correct trivia", "10 pts per question"],
            ["Trivia streak (5+)", "+50 pts bonus"],
            ["Match reaction", "15 pts"],
            ["Correct prediction", "30 pts"],
            ["Collect match badge", "25 pts"],
            ["Join watch party", "30 pts"],
            ["Host watch party", "60 pts"],
            ["Successful referral", "Up to 185 pts (see section 9)"],
        ], "Action", "Points"),
        spacer(),
        h3("Status tiers"),
        spacer(),
        twoCol([
            ["Supporter  (0\u2013499)", "Entry level. All standard quests available."],
            ["True Fan  (500\u20131,499)", "Bonus daily quests and early quest notifications."],
            ["Ultras  (1,500\u20133,499)", "Priority access to limited-edition drops."],
            ["Legend  (3,500+)", "Exclusive finals badge, champion access pass."],
        ], "Tier", "Perks"),
        spacer(),
        h3("Leaderboards"),
        bullet("Overall \u2014 all fans by total points"),
        bullet("Team \u2014 fans within your team community"),
        bullet("Host country \u2014 fans by USA, Canada, or Mexico"),
        bullet("Top inviters \u2014 by successful referrals"),
        spacer(),

        pageBreak(),
        h1("9. Referring Friends"),
        body("Inviting friends is one of the most rewarding activities on FanCurva. The referral system is designed to reward genuine engagement \u2014 not follower count."),
        spacer(),
        h3("How it works"),
        numbered("Go to your passport page and copy your referral link."),
        numbered("Share it via WhatsApp, social media, or directly with friends."),
        numbered("When your friend signs up using your link, the referral is converted automatically."),
        numbered("You earn points immediately. More points unlock as your friend stays active."),
        spacer(),
        h3("Point structure"),
        body("Points decrease the more referrals you make. This prevents influencers from dominating the leaderboard over regular fans."),
        spacer(),
        twoCol([
            ["1st to 3rd referral", "75 pts base each"],
            ["4th to 7th referral", "40 pts base each"],
            ["8th to 15th referral", "15 pts base each"],
            ["16th+ referral", "5 pts base each"],
        ], "Referral number", "Base points"),
        spacer(),
        h3("Quality bonuses"),
        body("You also earn bonus points as your referred friend becomes more active. These fire automatically \u2014 no action needed from you."),
        spacer(),
        twoCol([
            ["Friend signs up", "+10 pts to you"],
            ["Friend mints passport", "+20 pts to you"],
            ["Friend completes 5 quests", "+30 pts to you"],
            ["Friend reaches True Fan tier", "+50 pts to you"],
        ], "Milestone", "Bonus to referrer"),
        spacer(),
        body("Maximum you can earn from a single highly active referral: 185 pts (75 base + 10 + 20 + 30 + 50)."),
        spacer(),
        h3("Your friend gets"),
        body("Every friend who joins through your link receives a 50 point welcome bonus, regardless of which tier your referral is on. This is fixed and never changes."),
        spacer(),
        note("Referral points decrease as you refer more people. A regular fan who genuinely convinces 3 active friends earns more per referral than an influencer who drives hundreds of inactive signups."),
        spacer(),

        pageBreak(),
        h1("10. Watch Parties"),
        body("Watch parties let you earn bonus points by watching matches with other fans \u2014 in person or online."),
        spacer(),
        h3("Joining a watch party"),
        numbered("Find a listed watch party in the Watch Parties tab."),
        numbered("Tap Join to register in advance."),
        numbered("On match day, check in using the host code provided by the organiser."),
        numbered("Earn 30 pts and a watch party badge automatically."),
        spacer(),
        h3("Hosting a watch party"),
        numbered("Go to Watch Parties > Host an Event."),
        numbered("Enter the details: match, venue or streaming link, date and time."),
        numbered("Your event is listed publicly. Share your host code with attendees."),
        numbered("Earn 60 pts after the event."),
        spacer(),
        tip("Online watch parties count. Host a video call for friends anywhere in the world and everyone earns rewards."),
        spacer(),

        pageBreak(),
        h1("11. Wallet and Account"),
        spacer(),
        twoCol([
            ["Email login (default)", "We create and manage a secure wallet for you. Recommended for most fans. Your badges are still fully owned by you."],
            ["Wallet login", "Connect MetaMask, Coinbase Wallet, or any WalletConnect wallet. Full self-custody. Best for fans who want to trade collectibles externally."],
        ], "Account type", "How it works"),
        spacer(),
        h3("Can I switch from email to my own wallet?"),
        body("Yes. Go to Account Settings > Wallet > Connect at any time. Your passport, badges, and points transfer automatically."),
        spacer(),
        h3("What if I lose access to my account?"),
        bullet("Email login: use Forgot Password or contact support@fancurva.com"),
        bullet("Wallet login: use your wallet provider's recovery process. We cannot recover a wallet we do not control."),
        spacer(),

        pageBreak(),
        h1("12. Frequently Asked Questions"),
        spacer(),
        h3("Account"),
        spacer(),
        faqTable([
            ["Is FanCurva free?", "Yes. Signing up and minting your passport is free. Some limited-edition collectibles may have a small fee."],
            ["Do I need crypto?", "No. Email signup is all you need. A wallet is created for you automatically."],
            ["Can I change my username?", "Yes. Account Settings > Profile > Display Name."],
            ["Can I have two accounts?", "No. One account per person. Multiple accounts may be suspended."],
            ["Minimum age?", "13 years old. Under 18 requires parental consent."],
        ]),
        spacer(),
        h3("Team and passport"),
        spacer(),
        faqTable([
            ["Can I change my team?", "No. Team selection is permanent once your passport is minted."],
            ["My team did not qualify. What do I do?", "Choose a Tournament Passport or pick another team to follow. All features are available."],
            ["What happens after the tournament?", "Your passport and badges remain yours permanently on the blockchain."],
        ]),
        spacer(),
        h3("Elimination"),
        spacer(),
        faqTable([
            ["My team is out. Is the app still useful?", "Yes. Neutral fan mode, tournament-wide quests, collector quests, and the general leaderboard all continue. If your team exits in the group stage you still have 4+ weeks of content."],
            ["When does neutral fan mode unlock?", "Automatically and immediately when your team is knocked out."],
            ["Do I keep my badges and points?", "Yes. Everything earned stays on your passport permanently."],
        ]),
        spacer(),
        h3("Referrals"),
        spacer(),
        faqTable([
            ["Why do I earn fewer points for each extra referral?", "The system rewards genuine fan engagement, not follower count. Points decrease after your 3rd referral so regular fans are not disadvantaged against influencers with large audiences."],
            ["Is there a cap on referrals?", "No cap on the number of referrals. But points decrease per tier. Quality depth bonuses still apply at any tier."],
            ["What does my friend get?", "A fixed 50 point welcome bonus, always, regardless of your tier."],
        ]),
        spacer(),
        h3("Quests and badges"),
        spacer(),
        faqTable([
            ["I missed a match-day quest. Can I still complete it?", "No. Match-day quests expire at full time. Enable notifications so you never miss one."],
            ["Can I buy badges I missed?", "Soulbound badges cannot be bought under any circumstances. Some transferable rare collectibles may be available from other fans on secondary marketplaces."],
            ["How many badges can I earn total?", "Over 200 badges across the full tournament if you check in to every match."],
        ]),
        spacer(),

        pageBreak(),
        h1("13. Troubleshooting"),
        spacer(),
        faqTable([
            ["Verification email not received", "Check spam. Click Resend on the login page. Contact support if not resolved in 5 minutes."],
            ["Quest not registering", "Check your internet connection. Restart the app. For check-in quests, ensure location permissions are on. Contact support with a screenshot."],
            ["Badge not appearing", "Badges can take up to 5 minutes due to blockchain processing. Restart app after 10 minutes. Contact support if still missing after 30 minutes."],
            ["App slow during a match", "High traffic on popular match days can cause slowdowns. Check-ins are timestamped at the moment you tapped, so they register correctly even if the response is delayed."],
            ["Referral not credited", "Ensure your friend signed up through your exact link. Contact support if not credited after they complete their first quest."],
        ]),
        spacer(),

        pageBreak(),
        h1("14. Contact and Support"),
        spacer(),
        twoCol([
            ["In-app help", "Tap the \u2753 icon in the bottom navigation."],
            ["Email", "support@fancurva.com \u2014 response within 24 hours (4 hours on match days)."],
            ["Discord", "discord.gg/fancurva \u2014 community support moderated by our team."],
            ["Twitter / X", "@fancurva"],
            ["Help centre", "fancurva.com/help"],
        ], "Channel", "Details"),
        spacer(2),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            border: { top: { style: BorderStyle.SINGLE, size: 6, color: TEAL, space: 8 } },
            spacing: { before: 240, after: 100 },
            children: [new TextRun({ text: "World Cup 2026  \u2022  June 11 \u2013 July 19  \u2022  USA  \u2022  Canada  \u2022  Mexico", size: 20, color: GRAY_MID, font: "Arial", italics: true })]
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 },
            children: [new TextRun({ text: "Be part of it. Not just a spectator.", size: 24, bold: true, color: TEAL_DARK, font: "Arial" })]
        }),
    ]
}

const doc = new Document({
    numbering: {
        config: [
            { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
            { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
        ]
    },
    styles: {
        default: { document: { run: { font: "Arial", size: 22 } } },
        paragraphStyles: [
            { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 38, bold: true, font: "Arial", color: BLACK }, paragraph: { spacing: { before: 400, after: 140 }, outlineLevel: 0 } },
            { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 28, bold: true, font: "Arial", color: TEAL_DARK }, paragraph: { spacing: { before: 300, after: 120 }, outlineLevel: 1 } },
            { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 24, bold: true, font: "Arial", color: BLACK }, paragraph: { spacing: { before: 220, after: 80 }, outlineLevel: 2 } },
        ]
    },
    sections: [coverSection, mainSection]
})

Packer.toBuffer(doc).then(function (buffer) {
    fs.writeFileSync("FanCurva_UserGuide_v3.docx", buffer)
    console.log("Written: FanCurva_UserGuide_v3.docx")
})