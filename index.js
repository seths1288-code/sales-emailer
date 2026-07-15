// ============================================================
// AI SALES EMAIL SEQUENCER — THE PHMP
// 6-touch sequence | 3-account rotation
// Account 1: seth@3markslc.com — Microsoft Graph (existing contacts)
// Account 2: Seth@uin.us.com — SMTP / Network Solutions
// Account 3: seth@eliteinsurancegroup.net — SMTP / Network Solutions
// New contacts auto-assigned to whichever account has capacity
// Each account sends up to 60/day — 180/day total capacity
//
// DELIVERABILITY UPDATE: bodies now render as lightweight inline
// styled HTML (SMTP accounts send text+html multipart, Graph sends
// HTML) instead of pure plain text, with a consistent signature
// appended in code rather than typed by the model. Prompt now also
// pushes for structural variation between contacts and forbids
// reusing example phrasing verbatim, since identical plain text
// blocks at volume is a recognizable spam pattern.
//
// COST UPDATE (v7): new contacts are no longer auto enrolled every
// run, enroll manually in HubSpot (see note above getActiveProspects).
// PHMP_BRIEFING now goes in the `system` param with cache_control so
// Claude reuses the cached prompt across back to back calls instead
// of paying full price for the same large static briefing on every
// single email, all day, for every contact.
//
// COST UPDATE (v8): three more cuts, none of which change what gets
// written or sent:
// 1. researchCompany() now runs on claude-haiku-4-5 instead of
//    claude-sonnet-4-6. It is only summarizing 2-3 sentences from a
//    web search, not writing the email, so the cheaper model is
//    plenty and costs a fraction as much per call.
// 2. researchCompany() max_tokens dropped 500 -> 150 to match what
//    it's actually asked to return.
// 3. The web_search tool is capped at max_uses: 1 per research call
//    so a single research call can't quietly rack up several search
//    queries before answering.
// 4. Added an in-run cache keyed by company name, so if two contacts
//    from the same company are processed in the same run, research
//    is only paid for once instead of once per contact.
//
// SEQUENCE UPDATE (v9): trimmed from 8 touches down to 6. Research on
// cold email cadence puts the reply-rate sweet spot at 4 to 7 touches,
// with 8+ touch sequences underperforming that range by roughly 41%,
// and spam/unsubscribe risk roughly tripling past touch 4. Cut the
// two weakest touches: the standalone "pattern interrupt" bump and
// the "warm close" that used to follow the breakup email. The breakup
// email now runs last, since ending on a genuine last touch performs
// better than tacking on one more low-stakes email after it. Fewer
// touches also means fewer Claude calls per contact, which stacks on
// top of the v7/v8 cost cuts.
//
// FIX (v10): contacts already mid sequence when this shrank from 8 to
// 6 touches can end up with a stored sequence_step (6 or 7) that is
// now past the end of the new, shorter SEQUENCE array. Previously the
// runner just silently skipped those contacts every run forever
// without ever flipping sequence_active to false, so they'd sit in
// HubSpot marked "active" indefinitely even though nothing further
// would ever be sent to them. Added markSequenceInactive() so any
// contact caught in that state gets properly closed out the first
// time the runner sees them, no email, just one HubSpot PATCH.
//
// DELIVERABILITY UPDATE (v11): the ORIGINALITY RULE already stopped
// Claude from reusing the same literal sentence across contacts, but
// bulk spam detection at Microsoft/Google doesn't only look for exact
// duplicate text, it also clusters on structural sameness: same word
// count, same sentence shape, same idea order, across many emails
// from one sender in a short window. Since email 1 picks the same
// hook angle for everyone sharing a job title, a batch of same-titled
// recipients could still look near identical in shape even with
// different words. Added a CROSS RECIPIENT STRUCTURAL VARIATION rule
// so the shape of the email varies (what leads, statement vs
// question opening, where the research detail lands) even when the
// underlying angle for that role stays the same.
// ============================================================

const Anthropic = require("@anthropic-ai/sdk");
const nodemailer = require("nodemailer");

// -------------------------------------------------------------------
// PHMP PRODUCT BRIEFING
// -------------------------------------------------------------------
const PHMP_BRIEFING = `
You are a sales rep setting intro meetings for The PHMP (Proactive Health Management Plan).

======================================================================
CATEGORY POSITIONING
======================================================================

The PHMP is NOT a benefits plan, wellness program, or anything employers have seen before.
It is a TAX STRUCTURE built on IRS Section 125 that happens to deliver 23 new employee benefits.
You are in a category of one. Never compete in the benefits vendor category.

The positioning statement: "the only benefits plan that pays the employer and employees to offer it."

======================================================================
CRITICAL FRAMING
======================================================================

1. IT COSTS THE EMPLOYER NOTHING:
The PHMP uses IRS Section 125. Employees elect benefits pre-tax which reduces taxable wages.
The employer then pays less FICA payroll tax (7.65% of wages).
That FICA reduction = $321 to $450 per enrolled employee per year.
That savings covers the entire cost of the plan. Net employer cost = $0.
100 employees = $32,100 to $45,000 in annual FICA savings.
200 employees = $64,200 to $90,000 in annual FICA savings.
This is established IRS tax code. Not a gimmick. Has worked for decades.

2. NOTHING ABOUT THEIR CURRENT PLAN OR BROKER CHANGES:
Their existing health plan stays exactly as is. Untouched.
Their broker relationship stays intact. Broker keeps their commissions.
The PHMP snaps on top like an additional layer. Nothing changes below it.
We are NOT competition for brokers. We are additive.

3. EMPLOYEES GET MORE TAKE-HOME PAY WITHOUT A RAISE:
The pre-tax Section 125 structure increases every enrolled employee take-home pay.
$25k salary = roughly $684 more per year.
$60k salary = roughly $1,572 more per year.
Plus $625 per month indemnity payment for completing simple healthy activities.

4. 23 NEW BENEFITS ADDED FOR FREE:
24/7 family telemedicine at $0 co-pay
Family behavioral health at $0 co-pay
Personal health coaching and dietary counseling
Biometric and DNA screenings
Disease management for 27 chronic conditions with a personal Nurse Navigator
$625 per month indemnity for completing healthy activities
$7,500 per year potential in wellness incentives
Hospital confinement indemnity $100 per day
Prescription savings up to 80%
Medical price transparency on 500+ procedures

5. THE PROOF:
7 US patents
AHDI — 1.5M+ lives across 48 states
Companion Life — A+ rated by AM Best
5 independent studies 2006 to 2021 — 11 to 17% medical spend reduction every time
98% of clients see cost trend fall below the national average
RAND Corporation confirmed the ROI
Combined ROI over $681 per employee per year

6. THE MATH FOR 100 EMPLOYEES:
FICA savings: $32,100 to $45,000 per year
Medical spend reduction on $1M budget: $110,000 to $170,000 saved
Net cost to employer: $0

======================================================================
YOUR GOAL:
Get a 20 minute call. Not a sale. Curiosity about something that is hard to believe at first is your best hook. Keep the tone low pressure and easy to say no to, not hyped up.

TONE AND STYLE — NON NEGOTIABLE:
Write like a real person typing fast between meetings. Not a marketer.
Under 40 words in the body. Under 25 for most follow-ups. Email 3 can go up to 35 since it carries the one number that matters.
Shorter is better for replies. Vary your length naturally within that ceiling, and treat the ceiling as a hard cap, not a target to hit every time. Several emails should land well under it.
STRUCTURE VARIATION: Most emails should be one flowing paragraph with no line breaks. But roughly one in every three or four emails, it is fine and encouraged to break a short second line onto its own line, like a real afterthought or a one line PS. Do not apply the exact same shape to every contact. Real people do not format every email identically.
NO HYPHENS EVER. Not a single one. No em dashes, no en dashes, no hyphens between words, no dashes of any kind anywhere in the email. This is the most important formatting rule. If you are about to type a hyphen or dash, use a period or rewrite the sentence instead.
No bullet points, no bold, no colons for effect.
No symbols of any kind.
Do not capitalize the first word after the greeting.
Always capitalize "I" every single time. Never write lowercase "i" when referring to yourself.
Grammar is casual but not sloppy. Write like a sharp person firing off a quick email between meetings.
Contractions are fine: "that's" "you're" "I'll" "don't" "I've" "haven't" but always apostrophized correctly.
Never say: synergy, game changer, revolutionary, best in class, solution, leverage, streamline.
Never imply we replace anything. We sit alongside and add on top.
Do NOT add a sign off, name, or signature line at the end of the body. That is appended automatically after your text, so just stop after your last sentence.
Do NOT mention KBA.

ORIGINALITY RULE:
Every bracketed "Examples:" line anywhere in these instructions, including per email instructions below, is a style reference only. It shows you the register and the kind of unexpected line that works, nothing more. Never copy an example phrase word for word. You are writing to hundreds of different people, so if you reuse the same sentence verbatim across contacts it reads as an obvious template and gets caught as spam. Write an original sentence in that same spirit every single time, even when the underlying instruction is identical to one you've followed before.

CROSS RECIPIENT STRUCTURAL VARIATION:
Many recipients share the same job title, which means email 1 will often point them toward the same underlying hook angle. That targeting is intentional and should stay, the angle should match the role. But do not let every recipient with that role read as the same shape of email either. Vary which fact or number leads, vary whether the first line is phrased as a statement or a question, vary whether the research detail comes before or after the hook, vary sentence length and rhythm. Bulk spam detection systems at Microsoft and Google look for structural sameness across many emails from one sender, meaning same word count, same sentence order, same cadence, not only literally repeated sentences. Fresh wording alone is not enough if every email built on the same hook has the identical shape. Treat the hook angle as the one fixed thing and vary everything around it.

AVOID SPAM PATTERNING:
Never use these exact phrases, they are heavily weighted by spam filters and scam detection because they show up constantly in actual scam email: "too good to be true", "no catch", "risk free", "guaranteed", "act now", "limited time", "100% free", "click here", "double your income". If the underlying idea calls for that kind of surprise, say it conversationally instead, like "I get why this sounds hard to believe" or "this surprised me too the first time I saw the numbers." Also avoid stacking short punchy fragments separated only by periods, like "costs nothing. changes nothing. adds everything." That cadence reads as an ad headline, not a person typing. Write in full relaxed sentences instead.

NO COMMA STACKING:
Do not cram three or more separate observations into one sentence held together only by commas, like "take home pay goes up, healthcare costs trend down, net cost to you is zero." Each item there is really its own bullet point wearing a sentence's clothes, and it reads like a flattened list, not a person typing. Connect ideas with "and," "but," "so," or just split them into two sentences instead. If you notice yourself listing more than two things in a row separated only by commas, rewrite it.

WRITE LIKE IT WAS TYPED FAST ON A PHONE, NOT LIKE A DELIBERATELY MESSY BIT:
The goal is the natural looseness of someone typing quickly between meetings, not fake typos, not missing words, not text speak. Keep every hard rule above, correct apostrophes, capitalized "I", no dashes. Within those rules, let sentences run on a little and chain thoughts with "and" instead of polished connectors like "which is what covers" or "while." Prefer a vaguer, more conversational phrase over a precise one, "a tax thing" reads more human than "a tax structure," even if it is a little less exact. A small aside here and there, like "thats a lot to manage," reads more human than a perfectly constructed sentence. The bar is "did a real person actually type this in one go," not "is this the most polished way to say it."

CTA TYPE MATTERS MORE THAN CTA WORDING:
Every prospect in this sequence has not replied yet, meaning they are still cold, not in an active conversation. Data on cold outreach consistently shows interest based asks, like offering to send more detail or explain something, outperform direct time or calendar asks by a wide margin at this stage, since asking a stranger to commit to a meeting before they trust you or know if this is relevant triggers hesitation. Direct time asks work far better once someone has already replied, which is outside the scope of what you are writing. So do NOT default to "worth 20 minutes" as the closing ask. Instead close with something that invites a reply without asking for a calendar commitment, in the spirit of "want me to send over the numbers" or "want the specifics" or "curious how that actually works." Only use a direct time ask sparingly, if ever, and never as the only CTA style across the sequence.

DO NOT OVERUSE THE COMPANY NAME:
Repeating a prospect's own company name back to them over and over is one of the most common tells of an automated mail merge, prospects notice it immediately because nobody talks about your own company by name to you that often in a real email. Use the actual company name at most once across the whole thread, and only when it is tied to a real, specific research detail, never as a generic stand in for "you" or "your team." In every other email, and in follow ups especially, refer to them naturally, "you," "your team," "over there," rather than reinserting the company name.

WHAT MAKES THESE STAND OUT:
1. SPECIFICITY: Reference their actual company size, industry, or situation, in your own words rather than by restating their company name. If you have real research on their company, lead with it before anything else, that is the single biggest driver of a reply, more than any clever line. Specificity does not require saying the company name, it requires a detail nobody could have guessed from a template.
2. ONE UNEXPECTED LINE: Every email needs one original sentence nobody has said to them before, in the spirit of (but not copied from) lines like "it pays you to offer it" or "your broker doesnt lose anything" or "i get why this sounds made up, it did to me too at first."
3. CONFIDENT UNDERSTATEMENT: The less desperate the ask sounds the more they want to say yes.
4. EMPATHY BEFORE PITCH: Show you understand their world before you pitch anything.
5. NEVER EXPLAIN TOO MUCH: One point per email. Stop there.
6. EASY TO ANSWER: End on one specific, low commitment question they could reply to in a single line, not a generic scheduling request. Never lock into the exact same closing question across the whole campaign, vary the phrasing every time even when the underlying ask (a short call) stays the same.
7. ONE ASK ONLY: Never stack two questions or two asks in the same email. If you have already asked something, do not also ask a second thing.
`;

// -------------------------------------------------------------------
// SIGNATURE LOCATION
// CAN-SPAM requires a valid physical postal address in commercial
// email. TODO: replace this with your actual city and state (or a
// PO box) before running in production. Left blank/wrong, this does
// not satisfy the legal requirement.
// -------------------------------------------------------------------
const SIGNATURE_LOCATION = "REPLACE ME: City, State";

// -------------------------------------------------------------------
// 6-STEP SEQUENCE (trimmed from 8 — see SEQUENCE UPDATE note above)
// -------------------------------------------------------------------
const SEQUENCE = [
  {
    day: 0,
    subject: "PICK_BY_TITLE",
    research: true,
    goal: `Email 1 — THE HOOK. CHOOSE BASED ON JOB TITLE.

The PHMP positioning statement you can weave in naturally:
"the only benefits plan that pays the employer and employees to offer it."

ALWAYS open with one genuine research-led observation about their company first.
If no useful research reference a known challenge in their industry.
Then deliver the hook based on their job title:

IF TITLE IS CFO, VP FINANCE, CONTROLLER, FINANCE DIRECTOR or any finance role:
TAX AND MATH HOOK. Something like: "most people dont know theres a tax structure
that lets employers add 23 new employee benefits, increase every employees take-home pay,
and reduce their own taxes all at the same time. doesnt touch anything already in place.
want me to send over what the numbers would look like?"

IF TITLE IS HR DIRECTOR, HR MANAGER, BENEFITS MANAGER, PEOPLE OPERATIONS, CHRO:
BROKER AND RAISE HOOK. Something like: "this isnt something your broker sells or competes with.
it sits alongside whatever plan and broker you already have. nothing changes. it just adds
23 new benefits on top and gives every employee more take-home pay without a raise.
costs the company nothing. want the quick version of how it works?"

IF TITLE IS CEO, PRESIDENT, OWNER, FOUNDER, MANAGING DIRECTOR:
HARD TO BELIEVE HOOK. Something like: "im going to describe something that will
probably sound made up at first: 23 new employee benefits added on top of your current plan,
take-home pay goes up for every employee, healthcare costs go down, broker stays intact,
net cost to the company is zero. want me to explain how?"

IF TITLE IS UNKNOWN OR DOES NOT FIT ABOVE:
NEW CATEGORY HOOK. Something like: "this isnt a benefits plan or anything your broker
has probably shown you. its a tax structure that delivers 23 new employee benefits
at zero net cost to the employer. theres not really a name for it yet.
want a quick rundown of how it works?"

Do NOT explain HOW it costs nothing — that curiosity gets the reply.
Do NOT mention KBA. Do NOT mention Section 125 by name.
Under 40 words. One paragraph. Human and direct. Say less than you think you need to, the shorter this is the more likely it gets a reply.
Somewhere natural, not forced, and only if it fits in the word count, you can work in a brief low key line that gives them an easy out, like "no worries if this isnt relevant." Do not let this push the email over the word limit, cut it if it does not fit.`
  },
  {
    day: 3,
    subject: null,
    research: false,
    goal: `Email 2 — THE CATEGORY REFRAME.
FIRST LINE must stop them cold. Lead with the most counterintuitive thing.
Examples: "every other benefits conversation starts with a price tag. this one ends with savings."
Or: "this isnt a benefits plan. its a tax structure that happens to come with 23 new benefits."
Or: "most companies have never heard of this because its not sold through brokers."
Then: it sits on top of whatever they already have, nothing changes, costs nothing.
One soft question. Under 30 words total. Cut anything that is not essential.`
  },
  {
    day: 7,
    subject: null,
    research: false,
    goal: `Email 3 — THE FICA MATH.
FIRST LINE leads with a number so specific it stops them.
Examples: "a company with 100 employees typically sees $32,000 to $45,000 in annual tax savings just from the structure of this plan. thats what covers the cost."
Or: "5 independent studies. same result every time. 11 to 17% reduction in medical spending."
Include a short line acknowledging it sounds made up, phrased fresh each time, not copied.
End with a short, low commitment question inviting a reply, in the spirit of offering to send the exact numbers or explain how it works, not a meeting or time ask. Phrase it fresh, do not end every email with the identical question. Under 35 words total, this is the one email allowed to run slightly longer than the others because it carries a number, but do not pad it.`
  },
  {
    day: 14,
    subject: null,
    research: true,
    goal: `Email 4 — THE EMPLOYEE STORY.
FIRST LINE leads with the raise without the raise.
Examples: "you can give every employee more take-home pay this year without raising a single salary."
Or: "95% of employees who enroll see their spendable income go up. no raise required."
Then: at $60k salary thats $1,572 more per year. plus $625 a month for simple healthy activities. 24/7 telemedicine at $0.
Frame it briefly, in the spirit of a candidate's pay going up at no cost to the company.
Use research only if it is genuinely short and relevant. One question. Under 30 words total.`
  },
  {
    day: 21,
    subject: null,
    research: false,
    goal: `Email 5 — THE REFERRAL ASK.
FIRST LINE pivots away from asking for the meeting entirely.
Examples: "not trying to be a pain — if this doesnt sit with you is there a better person to reach out to?"
Or: "stopping the meeting ask. if benefits decisions sit with someone else id rather go straight to them."
Then: CFO, HR director, whoever handles the plan. Under 25 words total.`
  },
  {
    day: 28,
    subject: null,
    research: false,
    goal: `Email 6 — THE BREAKUP.
FIRST LINE is the most honest thing you can say. No warmup.
Examples: "should i stop reaching out?"
Or: "ive sent a few of these and havent heard back — completely fine if the timings off."
Then one short follow-up sentence at most, only if truly needed. Under 20 words total. The honesty and brevity are the point. This is the last email in the sequence, so let it read like a genuine last touch rather than one of several.`
  }
];

// -------------------------------------------------------------------
// SUBJECT LINE SELECTION
// -------------------------------------------------------------------
function pickSubjectLine(contact) {
  const title = (contact.jobTitle || "").toLowerCase();

  if (
    title.includes("cfo") || title.includes("chief financial") ||
    title.includes("finance director") || title.includes("controller") ||
    title.includes("vp finance") || title.includes("treasurer") ||
    title.includes("accounting")
  ) {
    const subjects = [
      "this will sound made up",
      "something your accountant might not know",
      "the tax structure nobody talks about",
      "a tax detail your accountant missed",
      "the math surprised me too",
    ];
    return subjects[Math.floor(Math.random() * subjects.length)];
  }

  if (
    title.includes("hr ") || title.includes("human resource") ||
    title.includes("benefits") || title.includes("people ops") ||
    title.includes("chro") || title.includes("talent") ||
    title.includes("workforce") || title.includes("hris") ||
    title.includes("compensation")
  ) {
    const subjects = [
      "your employees take-home pay",
      "23 benefits your broker cant offer",
      "the benefits conversation nobody is having",
      "a benefit upgrade your broker doesnt sell",
      "your current plan stays, this just adds on top",
    ];
    return subjects[Math.floor(Math.random() * subjects.length)];
  }

  if (
    title.includes("ceo") || title.includes("president") ||
    title.includes("owner") || title.includes("founder") ||
    title.includes("principal") || title.includes("managing director") ||
    title.includes("chief executive") || title.includes("partner")
  ) {
    const subjects = [
      "a benefits plan that pays you to offer it",
      "this will probably sound made up",
      "the only plan that pays you to offer it",
      "something worth hearing out",
      "a quick one that surprised me too",
    ];
    return subjects[Math.floor(Math.random() * subjects.length)];
  }

  if (
    title.includes("operations") || title.includes("coo") ||
    title.includes("office manager") || title.includes("administrator") ||
    title.includes("director of ops")
  ) {
    const subjects = [
      "cuts costs, adds benefits, nothing changes",
      "a benefits add on with no net cost",
      "adds 23 benefits at no cost",
      "a quick one worth hearing",
      "the plan that runs itself",
    ];
    return subjects[Math.floor(Math.random() * subjects.length)];
  }

  const defaultSubjects = [
    "this will probably sound made up",
    "honest question about your benefits",
    "the plan that pays for itself",
    "something your broker hasnt mentioned",
    "a new category of benefit, not a new vendor",
  ];
  return defaultSubjects[Math.floor(Math.random() * defaultSubjects.length)];
}

// -------------------------------------------------------------------
// SENDER ACCOUNTS
// Account 1 uses Microsoft Graph. Accounts 2 and 3 use SMTP.
// -------------------------------------------------------------------
const ACCOUNTS = [
  {
    id: 1,
    email: process.env.SENDER_EMAIL,           // seth@3markslc.com
    type: "graph",
    hubspotField: "sender_account",
    dailyCap: 60,
  },
  {
    id: 2,
    email: process.env.SMTP_EMAIL_2,           // Seth@uin.us.com
    type: "smtp",
    hubspotField: "sender_account",
    dailyCap: 20,
  },
  {
    id: 3,
    email: process.env.SMTP_EMAIL_3,           // seth@eliteinsurancegroup.net
    type: "smtp",
    hubspotField: "sender_account",
    dailyCap: 20,
  },
];

// Track sends per account this run
const accountSentCount = { 1: 0, 2: 0, 3: 0 };

// In-run cache of company research, keyed by lowercased company name.
// If two contacts in the same run belong to the same company, the
// second one reuses the first result instead of paying for a second
// web search + summarization call.
const companyResearchCache = {};

// -------------------------------------------------------------------
// SMTP TRANSPORTER (shared config, different auth per account)
// -------------------------------------------------------------------
function createSmtpTransporter(accountId) {
  const auth =
    accountId === 2
      ? { user: process.env.SMTP_EMAIL_2, pass: process.env.SMTP_PASSWORD_2 }
      : { user: process.env.SMTP_EMAIL_3, pass: process.env.SMTP_PASSWORD_3 };

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,        // STARTTLS
    auth,
    tls: { rejectUnauthorized: true },
  });
}

// -------------------------------------------------------------------
// CLIENTS
// -------------------------------------------------------------------
const hubspotHeaders = {
  Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
  "Content-Type": "application/json",
};

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// -------------------------------------------------------------------
// HELPERS
// -------------------------------------------------------------------
function daysSince(dateString) {
  if (!dateString) return 999;
  const dateOnly = dateString.split("T")[0];
  const then = new Date(dateOnly);
  const now = new Date();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

function fillTemplate(template, contact) {
  if (!template) return null;
  return template
    .replace(/{{company}}/g, contact.company || "your company")
    .replace(/{{firstName}}/g, contact.firstName || "there");
}

// -------------------------------------------------------------------
// Lightweight HTML wrapping — plain text bodies still look plain
// text, which combined with volume is a recognizable spam pattern.
// This wraps Claude's plain text body in minimal inline styled HTML
// with a simple signature, no images, no links, no tracking pixels.
// -------------------------------------------------------------------
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildHtmlBody(plainText) {
  const paragraphs = String(plainText)
    .split(/\n\s*\n|\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const paragraphHtml = paragraphs
    .map((p) => `<p style="margin:0 0 12px 0;">${escapeHtml(p)}</p>`)
    .join("\n    ");

  return `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1a1a1a;line-height:1.5;">
    ${paragraphHtml}
    <p style="margin:18px 0 0 0;">
      Seth Christensen<br>
      <span style="color:#666666;font-size:13px;">The PHMP</span><br>
      <span style="color:#999999;font-size:12px;">${escapeHtml(SIGNATURE_LOCATION)}</span>
    </p>
  </div>`;
}

function getAccountById(id) {
  return ACCOUNTS.find((a) => a.id === parseInt(id)) || ACCOUNTS[0];
}

// -------------------------------------------------------------------
// STEP 2: Fetch active prospects from HubSpot (paginated)
// New contacts are no longer auto-enrolled to save on unnecessary
// daily HubSpot calls. Enroll a contact by setting these 3 properties
// manually in HubSpot: sequence_active = true, sequence_step = 0,
// sender_account = 1, 2, or 3 (omit sender_account to default to 1).
// -------------------------------------------------------------------
async function getActiveProspects() {
  console.log("📋 Fetching active prospects from HubSpot...");

  const allContacts = [];
  let after = undefined;

  while (true) {
    const body = {
      filterGroups: [
        {
          filters: [
            { propertyName: "sequence_active", operator: "EQ", value: "true" },
          ],
        },
      ],
      properties: [
        "firstname", "lastname", "email", "company",
        "jobtitle", "industry", "city", "state",
        "numberofemployees", "sequence_step", "sequence_active",
        "last_email_sent", "thread_id", "thread_subject",
        "sender_account",
      ],
      limit: 200,
    };

    if (after) body.after = after;

    const response = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts/search",
      {
        method: "POST",
        headers: hubspotHeaders,
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!data.results) {
      console.log("  HubSpot error:", JSON.stringify(data));
      break;
    }

    allContacts.push(...data.results);

    if (data.paging && data.paging.next && data.paging.next.after) {
      after = data.paging.next.after;
      console.log(`  Fetched ${allContacts.length} so far, getting more...`);
    } else {
      break;
    }
  }

  console.log(`  Total active contacts fetched: ${allContacts.length}`);

  return allContacts.map((c) => ({
    id: c.id,
    firstName: c.properties.firstname || "",
    lastName: c.properties.lastname || "",
    email: c.properties.email || "",
    company: c.properties.company || "",
    jobTitle: c.properties.jobtitle || "",
    industry: c.properties.industry || "",
    city: c.properties.city || "",
    state: c.properties.state || "",
    employeeCount: c.properties.numberofemployees || "",
    sequenceStep: parseInt(c.properties.sequence_step || "0"),
    lastEmailSent: c.properties.last_email_sent || null,
    threadId: c.properties.thread_id || null,
    threadSubject: c.properties.thread_subject || null,
    // Default to account 1 for any existing contacts without sender_account set
    senderAccountId: parseInt(c.properties.sender_account || "1"),
  }));
}

// -------------------------------------------------------------------
// STEP 3: Research the prospect's company
// v8: cheaper model (haiku instead of sonnet), smaller max_tokens,
// capped web_search max_uses, and an in-run cache per company name
// so contacts sharing a company don't each pay for their own search.
// -------------------------------------------------------------------
async function researchCompany(contact) {
  if (!contact.company) return "No company name available.";

  const cacheKey = contact.company.trim().toLowerCase();
  if (companyResearchCache[cacheKey]) {
    console.log(`  🔁 Using cached research for ${contact.company}`);
    return companyResearchCache[cacheKey];
  }

  console.log(`  🔍 Researching ${contact.company}...`);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 150,
        tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 1 }],
        messages: [{
          role: "user",
          content: `Search for recent news about "${contact.company}" located in ${contact.city || ""} ${contact.state || ""} industry ${contact.industry || "unknown"}. Find recent news expansions hiring funding leadership changes or anything relevant to an HR or benefits conversation. Return ONLY 2 to 3 sentences of plain text. If nothing useful return: No notable recent news found.`,
        }],
      }),
    });

    const data = await response.json();
    if (!data.content || !Array.isArray(data.content)) return "No notable recent news found.";

    const text = data.content
      .filter((b) => b && b.type === "text")
      .map((b) => b.text)
      .join(" ")
      .trim();

    const result = text || "No notable recent news found.";
    console.log(`  ✅ Research: ${result.substring(0, 80)}...`);

    companyResearchCache[cacheKey] = result;
    return result;
  } catch (err) {
    console.log(`  ⚠️  Research failed: ${err.message}`);
    return "No notable recent news found.";
  }
}

// -------------------------------------------------------------------
// STEP 4: Write email with Claude
// -------------------------------------------------------------------
async function writeEmail(contact, step, companyResearch) {
  const emailDef = SEQUENCE[step];
  console.log(`  ✍️  Writing email ${step + 1}/${SEQUENCE.length} for ${contact.firstName}...`);

  const isReply = step > 0;

  // PHMP_BRIEFING is identical on every single call, all day, across every
  // contact and every account. It used to be re-sent as plain text inside
  // the user turn on every request, meaning its full token cost was paid
  // over and over. Moving it into `system` with cache_control lets Claude
  // reuse the cached version across calls (cache lasts a few minutes and
  // gets refreshed on each hit), which cuts the token cost of this large
  // static block dramatically since sends are spaced 30 to 60 seconds
  // apart, well within the cache window. Only the per contact details
  // below are sent as fresh, uncached user content.
  const userPrompt = `PROSPECT DETAILS:
- Name: ${contact.firstName} ${contact.lastName}
- Title: ${contact.jobTitle || "unknown"}
- Company: ${contact.company}
- Industry: ${contact.industry || "unknown"}
- Location: ${contact.city || ""} ${contact.state || ""}
- Company size: ${contact.employeeCount ? contact.employeeCount + " employees" : "unknown"}

RECENT COMPANY RESEARCH (use only if genuinely relevant):
${companyResearch}

CONTEXT:
${isReply
    ? `This is email ${step + 1} in an ongoing thread. You have sent ${step} previous email(s) with no reply. Do NOT re-introduce yourself. Write naturally as though continuing a real conversation.`
    : `This is the very first email. Introduce yourself briefly and naturally.`
  }

YOUR TASK:
${fillTemplate(emailDef.goal, contact)}

FORMATTING:
- Address ${contact.firstName} naturally in the first line. Vary the exact greeting between contacts, for example "Hi ${contact.firstName}," or "${contact.firstName}," or "Hey ${contact.firstName}," rather than always using the identical greeting.
- Mostly write the body as one flowing paragraph with no line breaks. On roughly one in three or four emails it is fine to drop a short second line, like an afterthought. Do not make every email look identical in shape.
- Do NOT add a sign off, name, or signature line. Stop after your last sentence. A signature is appended automatically after your text.
- No subject line, no bullet points, no bold, no symbols
- ABSOLUTELY NO HYPHENS OR DASHES OF ANY KIND. Not em dashes, not en dashes, not hyphens between words. Use a period or rewrite instead.
- Always capitalize "I". Contractions are fine but apostrophized correctly: "that's" "you're" "I'll" "don't"
- Do not reuse example phrasing from your instructions word for word. Write it fresh.`;

  const response = await claude.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 150,
    system: [
      {
        type: "text",
        text: PHMP_BRIEFING,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userPrompt }],
  });

  return response.content[0].text;
}

// -------------------------------------------------------------------
// MICROSOFT GRAPH — get token
// -------------------------------------------------------------------
async function getOutlookToken() {
  const url = `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID,
    client_secret: process.env.MICROSOFT_CLIENT_SECRET,
    scope: "https://graph.microsoft.com/.default",
    grant_type: "client_credentials",
  });

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = await res.json();
  if (!data.access_token) {
    throw new Error("Outlook auth failed: " + JSON.stringify(data));
  }
  return data.access_token;
}

// -------------------------------------------------------------------
// MICROSOFT GRAPH — send first email (new thread)
// -------------------------------------------------------------------
async function sendFirstEmailGraph(token, contact, subject, body) {
  const senderEmail = process.env.SENDER_EMAIL;

  const sendRes = await fetch(
    `https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: {
          subject,
          body: { contentType: "HTML", content: buildHtmlBody(body) },
          toRecipients: [{ emailAddress: { address: contact.email } }],
        },
        saveToSentItems: true,
      }),
    }
  );

  if (sendRes.status !== 202) {
    throw new Error(`Graph send failed: ${await sendRes.text()}`);
  }

  await new Promise((r) => setTimeout(r, 3000));

  const searchRes = await fetch(
    `https://graph.microsoft.com/v1.0/users/${senderEmail}/mailFolders/SentItems/messages?$filter=subject eq '${encodeURIComponent(subject)}'&$orderby=sentDateTime desc&$top=1&$select=id,internetMessageId`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const searchData = await searchRes.json();
  const sentMsg = searchData.value?.[0];

  if (!sentMsg) {
    console.log("  ⚠️  Could not retrieve Message-ID — threading may not work");
    return null;
  }

  console.log(`  📧 Email 1 sent via Graph | Thread ID captured`);
  return sentMsg.internetMessageId;
}

// -------------------------------------------------------------------
// MICROSOFT GRAPH — send reply in existing thread
// -------------------------------------------------------------------
async function sendReplyEmailGraph(token, contact, body, threadInternetMessageId, threadSubject) {
  const senderEmail = process.env.SENDER_EMAIL;

  const findRes = await fetch(
    `https://graph.microsoft.com/v1.0/users/${senderEmail}/messages?$filter=internetMessageId eq '${encodeURIComponent(threadInternetMessageId)}'&$select=id`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const findData = await findRes.json();
  const originalMsg = findData.value?.[0];

  if (originalMsg) {
    const replyRes = await fetch(
      `https://graph.microsoft.com/v1.0/users/${senderEmail}/messages/${originalMsg.id}/createReply`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }
    );

    const replyMsg = await replyRes.json();
    if (!replyMsg.id) throw new Error("Could not create reply draft");

    await fetch(
      `https://graph.microsoft.com/v1.0/users/${senderEmail}/messages/${replyMsg.id}`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          body: { contentType: "HTML", content: buildHtmlBody(body) },
          toRecipients: [{ emailAddress: { address: contact.email } }],
        }),
      }
    );

    await fetch(
      `https://graph.microsoft.com/v1.0/users/${senderEmail}/messages/${replyMsg.id}/send`,
      { method: "POST", headers: { Authorization: `Bearer ${token}` } }
    );

    console.log(`  📧 Reply sent in thread via Graph`);
  } else {
    // Fallback: send as new email with Re: subject
    const reSubject = threadSubject?.startsWith("Re: ") ? threadSubject : `Re: ${threadSubject}`;
    const fallbackRes = await fetch(
      `https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          message: {
            subject: reSubject,
            body: { contentType: "HTML", content: buildHtmlBody(body) },
            toRecipients: [{ emailAddress: { address: contact.email } }],
          },
          saveToSentItems: true,
        }),
      }
    );

    if (fallbackRes.status !== 202) throw new Error(`Graph fallback send failed: ${await fallbackRes.text()}`);
    console.log(`  📧 Reply sent via Graph (fallback)`);
  }
}

// -------------------------------------------------------------------
// SMTP — send first email (new thread)
// Returns the Message-ID for threading
// -------------------------------------------------------------------
async function sendFirstEmailSmtp(accountId, contact, subject, body) {
  const transporter = createSmtpTransporter(accountId);
  const fromEmail = accountId === 2 ? process.env.SMTP_EMAIL_2 : process.env.SMTP_EMAIL_3;

  const info = await transporter.sendMail({
    from: `Seth Christensen <${fromEmail}>`,
    to: contact.email,
    subject,
    text: body,
    html: buildHtmlBody(body),
  });

  console.log(`  📧 Email 1 sent via SMTP (Account ${accountId}) | Message-ID: ${info.messageId}`);
  return info.messageId;
}

// -------------------------------------------------------------------
// SMTP — send reply (thread by In-Reply-To header)
// -------------------------------------------------------------------
async function sendReplyEmailSmtp(accountId, contact, body, threadMessageId, threadSubject) {
  const transporter = createSmtpTransporter(accountId);
  const fromEmail = accountId === 2 ? process.env.SMTP_EMAIL_2 : process.env.SMTP_EMAIL_3;
  const reSubject = threadSubject?.startsWith("Re: ") ? threadSubject : `Re: ${threadSubject}`;

  const info = await transporter.sendMail({
    from: `Seth Christensen <${fromEmail}>`,
    to: contact.email,
    subject: reSubject,
    text: body,
    html: buildHtmlBody(body),
    inReplyTo: threadMessageId,
    references: threadMessageId,
  });

  console.log(`  📧 Reply sent via SMTP (Account ${accountId})`);
  return info.messageId;
}

// -------------------------------------------------------------------
// STEP 7: Update HubSpot
// -------------------------------------------------------------------
async function updateHubSpot(contact, emailBody, subject, newStep, threadId, threadSubject) {
  const now = new Date().toISOString().split("T")[0];
  const isComplete = newStep >= SEQUENCE.length;

  const updates = {
    sequence_step: String(newStep),
    last_email_sent: now,
    sequence_active: isComplete ? "false" : "true",
  };

  // Save thread ID and subject after email 1 (step becomes 1)
  if (newStep === 1 && threadId) {
    updates.thread_id = threadId;
    updates.thread_subject = subject;
  }

  await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contact.id}`, {
    method: "PATCH",
    headers: hubspotHeaders,
    body: JSON.stringify({ properties: updates }),
  });

  await fetch("https://api.hubapi.com/crm/v3/objects/emails", {
    method: "POST",
    headers: hubspotHeaders,
    body: JSON.stringify({
      properties: {
        hs_email_direction: "EMAIL",
        hs_email_status: "SENT",
        hs_email_subject: subject || `Follow-up #${newStep}`,
        hs_email_text: emailBody,
        hs_timestamp: Date.now(),
      },
      associations: [{
        to: { id: contact.id },
        types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 198 }],
      }],
    }),
  });

  console.log(`  ✅ HubSpot updated (step ${newStep}${isComplete ? " — sequence complete" : ""})`);
}

// -------------------------------------------------------------------
// v10: Close out contacts whose sequence_step already sits at or past
// the current sequence length (this happens right after trimming the
// sequence from 8 touches to 6 — contacts that were on old step 6 or
// 7 land here). No email gets sent, this just flips sequence_active
// to false so HubSpot correctly shows them as done instead of sitting
// forever marked "active" with no further sends ever happening. Cheap:
// a single HubSpot PATCH, no Claude call.
// -------------------------------------------------------------------
async function markSequenceInactive(contact) {
  await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contact.id}`, {
    method: "PATCH",
    headers: hubspotHeaders,
    body: JSON.stringify({ properties: { sequence_active: "false" } }),
  });
  console.log(`  ✅ HubSpot updated — marked inactive (was already past the end of the sequence)`);
}


// -------------------------------------------------------------------
// Check how many emails have already been sent today per account
// This makes the daily cap true across multiple runs in the same day
// -------------------------------------------------------------------
async function loadTodaySentCounts() {
  const today = new Date().toISOString().split("T")[0];
  console.log("📊 Checking today's send counts from HubSpot...");

  for (const account of ACCOUNTS) {
    let count = 0;
    let after = undefined;

    while (true) {
      const body = {
        filterGroups: [{
          filters: [
            { propertyName: "last_email_sent", operator: "EQ", value: today },
            { propertyName: "sender_account", operator: "EQ", value: String(account.id) },
          ],
        }],
        properties: ["email"],
        limit: 200,
      };

      if (after) body.after = after;

      const response = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
        method: "POST",
        headers: hubspotHeaders,
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!data.results) break;

      count += data.results.length;

      if (data.paging && data.paging.next && data.paging.next.after) {
        after = data.paging.next.after;
      } else {
        break;
      }
    }

    accountSentCount[account.id] = count;
    console.log(`  Account ${account.id}: ${count} already sent today (cap: ${account.dailyCap})`);
  }
  console.log("");
}

// -------------------------------------------------------------------
// MAIN
// -------------------------------------------------------------------
async function main() {
  console.log("\n🚀 PHMP Sales Email Sequencer — 3-Account Rotation\n");
  console.log(`📅 ${new Date().toDateString()}\n`);

  console.log("Starting immediately\n");

  try {
    // Pre-auth Microsoft Graph for account 1
    console.log("🔑 Authenticating with Outlook (Account 1)...");
    let graphToken = await getOutlookToken();
    console.log("  ✅ Connected\n");

    await loadTodaySentCounts();

    const prospects = await getActiveProspects();
    console.log(`  Found ${prospects.length} active prospect(s)\n`);

    if (prospects.length === 0) {
      console.log("No prospects to email today.");
      return;
    }

    // Sort prospects by account so we can batch sends cleanly
    // (not strictly required but keeps logs readable)
    prospects.sort((a, b) => a.senderAccountId - b.senderAccountId);

    let totalSent = 0;
    let totalSkipped = 0;

    for (const contact of prospects) {
      const account = getAccountById(contact.senderAccountId);

      // Check this account's daily cap
      if (accountSentCount[account.id] >= account.dailyCap) {
        console.log(`⏭️  ${contact.firstName} ${contact.lastName} — Account ${account.id} at daily cap`);
        totalSkipped++;
        continue;
      }

      const step = contact.sequenceStep;

      if (step >= SEQUENCE.length) {
        console.log(`⏭️  ${contact.firstName} ${contact.lastName} — sequence complete`);
        try {
          await markSequenceInactive(contact);
        } catch (err) {
          console.error(`  ❌ Could not mark ${contact.firstName} inactive: ${err.message}`);
        }
        totalSkipped++;
        continue;
      }

      const emailDef = SEQUENCE[step];

      if (step > 0) {
        const daysWaited = daysSince(contact.lastEmailSent);
        const daysNeeded = emailDef.day - SEQUENCE[step - 1].day;
        if (daysWaited < daysNeeded) {
          console.log(`⏳ ${contact.firstName} ${contact.lastName} — waiting (${daysWaited}/${daysNeeded} days until email ${step + 1})`);
          totalSkipped++;
          continue;
        }
      }

      console.log(`\n👤 ${contact.firstName} ${contact.lastName} @ ${contact.company}`);
      console.log(`   Email ${step + 1}/${SEQUENCE.length} (Day ${emailDef.day}) | Account ${account.id} (${account.email})`);

      try {
        let research = "No research for this step.";
        if (emailDef.research) research = await researchCompany(contact);

        const body = await writeEmail(contact, step, research);

        // Email 1 gets a fresh subject line picked by title.
        // All follow-ups use the stored threadSubject (Re: original subject).
        // NEVER allow null as a subject under any circumstances.
        let subject;
        if (step === 0) {
          subject = pickSubjectLine(contact);
        } else {
          const base = contact.threadSubject || pickSubjectLine(contact);
          subject = base.startsWith("Re: ") ? base : `Re: ${base}`;
        }

        if (!subject || subject.trim() === "" || subject === "null") {
          subject = "Re: following up";
        }

        if (account.type === "graph") {
          // Refresh token occasionally (long runs)
          graphToken = await getOutlookToken();

          if (step === 0) {
            const threadId = await sendFirstEmailGraph(graphToken, contact, subject, body);
            await updateHubSpot(contact, body, subject, step + 1, threadId, subject);
          } else {
            await sendReplyEmailGraph(graphToken, contact, body, contact.threadId, subject);
            await updateHubSpot(contact, body, subject, step + 1, null, null);
          }
        } else {
          // SMTP accounts 2 or 3
          if (step === 0) {
            const messageId = await sendFirstEmailSmtp(account.id, contact, subject, body);
            await updateHubSpot(contact, body, subject, step + 1, messageId, subject);
          } else {
            await sendReplyEmailSmtp(account.id, contact, body, contact.threadId, subject);
            await updateHubSpot(contact, body, subject, step + 1, null, null);
          }
        }

        accountSentCount[account.id]++;
        totalSent++;

        // 30-60 second gap between sends
        const randomDelay = Math.floor(Math.random() * (60 - 30 + 1) + 30) * 1000;
        console.log(`  ⏱  Waiting ${Math.round(randomDelay / 1000)}s before next email...`);
        await new Promise((r) => setTimeout(r, randomDelay));

      } catch (err) {
        console.error(`  ❌ Error for ${contact.firstName}: ${err.message}`);
      }
    }

    console.log("\n✅ Done!");
    console.log(`   Total sent: ${totalSent} | Total skipped: ${totalSkipped}`);
    console.log(`   Account 1 (Graph):  ${accountSentCount[1]} sent`);
    console.log(`   Account 2 (SMTP):   ${accountSentCount[2]} sent`);
    console.log(`   Account 3 (SMTP):   ${accountSentCount[3]} sent`);

  } catch (err) {
    console.error("Fatal error:", err);
    process.exit(1);
  }
}

main();
