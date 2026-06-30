// ============================================================
// AI SALES EMAIL SEQUENCER — THE PHMP
// 8-touch sequence | 3-account rotation
// Account 1: seth@3markslc.com — Microsoft Graph (existing contacts)
// Account 2: Seth@uin.us.com — SMTP / Network Solutions
// Account 3: seth@eliteinsurancegroup.net — SMTP / Network Solutions
// New contacts auto-assigned to whichever account has capacity
// Each account sends up to 60/day — 180/day total capacity
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
Get a 20 minute call. Not a sale. The too good to be true angle is your best hook.

TONE AND STYLE — NON NEGOTIABLE:
Write like a real person typing fast between meetings. Not a marketer.
Under 50 words in the body. Under 35 for follow-ups. Email 3 can go to 55.
One flowing paragraph. No line breaks between sentences whatsoever.
NO HYPHENS EVER. Not a single one. No em dashes, no en dashes, no hyphens between words, no dashes of any kind anywhere in the email. This is the most important formatting rule. If you are about to type a hyphen or dash, use a period or rewrite the sentence instead.
No bullet points, no bold, no colons for effect.
No symbols of any kind.
Do not capitalize the first word after "Hi [Name],".
Always capitalize "I" every single time. Never write lowercase "i" when referring to yourself.
Grammar is casual but not sloppy. Write like a sharp person firing off a quick email between meetings.
Contractions are fine: "that's" "you're" "I'll" "don't" "I've" "haven't" but always apostrophized correctly.
Never say: synergy, game changer, revolutionary, best in class, solution, leverage, streamline.
Never imply we replace anything. We sit alongside and add on top.
Sign off always exactly: Seth Christensen | The PHMP
Do NOT mention KBA.

WHAT MAKES THESE STAND OUT:
1. SPECIFICITY: Reference their actual company size, industry, or situation.
2. ONE UNEXPECTED LINE: Every email needs one sentence nobody has said to them before.
   Examples: "it pays you to offer it" / "your broker doesnt lose anything" /
   "theres no catch i just know how it sounds" / "i know this sounds made up"
3. CONFIDENT UNDERSTATEMENT: The less desperate the ask sounds the more they want to say yes.
4. EMPATHY BEFORE PITCH: Show you understand their world before you pitch anything.
5. NEVER EXPLAIN TOO MUCH: One point per email. Stop there.
`;

// -------------------------------------------------------------------
// 8-STEP SEQUENCE
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
worth 20 minutes to see what the numbers look like for your company?"

IF TITLE IS HR DIRECTOR, HR MANAGER, BENEFITS MANAGER, PEOPLE OPERATIONS, CHRO:
BROKER AND RAISE HOOK. Something like: "this isnt something your broker sells or competes with.
it sits alongside whatever plan and broker you already have. nothing changes. it just adds
23 new benefits on top and gives every employee more take-home pay without a raise.
costs the company nothing. worth 20 minutes?"

IF TITLE IS CEO, PRESIDENT, OWNER, FOUNDER, MANAGING DIRECTOR:
TOO GOOD TO BE TRUE HOOK. Something like: "im going to describe something that sounds
too good to be true: 23 new employee benefits added on top of your current plan,
take-home pay goes up for every employee, healthcare costs go down, broker stays intact,
net cost to the company is zero. worth 20 minutes to see how?"

IF TITLE IS UNKNOWN OR DOES NOT FIT ABOVE:
NEW CATEGORY HOOK. Something like: "this isnt a benefits plan or anything your broker
has probably shown you. its a tax structure that delivers 23 new employee benefits
at zero net cost to the employer. theres not really a name for it yet.
worth 20 minutes to see what it looks like for your company?"

Do NOT explain HOW it costs nothing — that curiosity gets the reply.
Do NOT mention KBA. Do NOT mention Section 125 by name.
Under 65 words. One paragraph. Human and direct.`
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
One soft question. Under 50 words.`
  },
  {
    day: 7,
    subject: null,
    research: false,
    goal: `Email 3 — THE FICA MATH.
FIRST LINE leads with a number so specific it stops them.
Examples: "a company with 100 employees typically sees $32,000 to $45,000 in annual tax savings just from the structure of this plan. thats what covers the cost."
Or: "5 independent studies. same result every time. 11 to 17% reduction in medical spending."
Include: "i know this sounds made up. every client said the same thing before they saw the math."
End: "worth 20 minutes?" Under 55 words.`
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
Frame it: "imagine telling a candidate their pay goes up and you didnt spend a dollar more."
Use research if relevant. One question. Under 50 words.`
  },
  {
    day: 21,
    subject: null,
    research: false,
    goal: `Email 5 — PATTERN INTERRUPT.
Two sentences maximum. The contrast after four longer emails is the hook.
Examples: "still worth 20 minutes? i can show you exactly what the numbers look like for your company. no pitch deck just the math."
Or: "genuinely curious if the timing is just off or if this got buried. worth a quick look?"
Do not add anything else.`
  },
  {
    day: 25,
    subject: null,
    research: false,
    goal: `Email 6 — THE REFERRAL ASK.
FIRST LINE pivots away from asking for the meeting entirely.
Examples: "not trying to be a pain — if this doesnt sit with you is there a better person to reach out to?"
Or: "stopping the meeting ask. if benefits decisions sit with someone else id rather go straight to them."
Then: CFO, HR director, whoever handles the plan. Under 40 words.`
  },
  {
    day: 30,
    subject: null,
    research: false,
    goal: `Email 7 — THE BREAKUP.
FIRST LINE is the most honest thing you can say. No warmup.
Examples: "should i stop reaching out?"
Or: "ive sent a few of these and havent heard back — completely fine if the timings off."
Then one short follow-up sentence at most. Under 30 words. The honesty is the point.`
  },
  {
    day: 35,
    subject: null,
    research: false,
    goal: `Email 8 — THE WARM CLOSE.
FIRST LINE signals this is genuinely the last one.
Examples: "last one from me — promise."
Or: "not going to keep showing up in your inbox after this."
Then: whenever the benefits conversation comes up id love to be a resource, no agenda.
Under 40 words.`
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
      "no catch. genuinely.",
      "costs nothing. adds 23 benefits.",
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
      "what if the benefits were free",
      "your current plan stays. this just adds on top.",
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
      "costs nothing. adds 23 benefits.",
      "sounds too good to be true",
      "the only plan that pays you to offer it",
      "this will sound made up",
      "no catch. genuinely.",
    ];
    return subjects[Math.floor(Math.random() * subjects.length)];
  }

  if (
    title.includes("operations") || title.includes("coo") ||
    title.includes("office manager") || title.includes("administrator") ||
    title.includes("director of ops")
  ) {
    const subjects = [
      "cuts costs. adds benefits. nothing changes.",
      "zero net cost employee benefits",
      "adds 23 benefits at no cost",
      "something worth 20 minutes",
      "the plan that runs itself",
    ];
    return subjects[Math.floor(Math.random() * subjects.length)];
  }

  const defaultSubjects = [
    "this will sound too good to be true",
    "honest question about your benefits",
    "the plan that pays for itself",
    "something your broker hasnt mentioned",
    "costs nothing. changes nothing. adds everything.",
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

// Pick the account with remaining capacity for new enrollments
// Existing contacts stay with whatever account they were assigned to
function pickAccountForNewContact() {
  for (const account of ACCOUNTS) {
    if (accountSentCount[account.id] < account.dailyCap) {
      return account;
    }
  }
  return null; // All accounts at cap
}

function getAccountById(id) {
  return ACCOUNTS.find((a) => a.id === parseInt(id)) || ACCOUNTS[0];
}

// -------------------------------------------------------------------
// STEP 1: Auto-enroll new contacts — assign to an available account
// -------------------------------------------------------------------
async function enrollNewContacts() {
  console.log("🔍 Checking for new contacts to enroll...");

  const ownerId = "161753897";

  const response = await fetch(
    "https://api.hubapi.com/crm/v3/objects/contacts/search",
    {
      method: "POST",
      headers: hubspotHeaders,
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              { propertyName: "hubspot_owner_id", operator: "EQ", value: ownerId },
              { propertyName: "sequence_active", operator: "NOT_HAS_PROPERTY" },
            ],
          },
        ],
        properties: ["firstname", "lastname", "email", "company"],
        limit: 100,
      }),
    }
  );

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    console.log("  No new contacts to enroll");
    return;
  }

  console.log(`  Found ${data.results.length} new contact(s) to enroll`);

  for (const contact of data.results) {
    if (!contact.properties.email) continue;

    // Assign to whichever account still has capacity today
    const assignedAccount = pickAccountForNewContact();
    const accountId = assignedAccount ? String(assignedAccount.id) : "1";

    await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contact.id}`, {
      method: "PATCH",
      headers: hubspotHeaders,
      body: JSON.stringify({
        properties: {
          sequence_active: "true",
          sequence_step: "0",
          sender_account: accountId,
        },
      }),
    });

    console.log(
      `  Enrolled: ${contact.properties.firstname || ""} ${contact.properties.lastname || ""} @ ${contact.properties.company || "unknown"} → Account ${accountId}`
    );
  }
}

// -------------------------------------------------------------------
// STEP 2: Fetch active prospects from HubSpot (paginated)
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
// -------------------------------------------------------------------
async function researchCompany(contact) {
  if (!contact.company) return "No company name available.";
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
        model: "claude-sonnet-4-6",
        max_tokens: 500,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
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

    console.log(`  ✅ Research: ${text.substring(0, 80)}...`);
    return text || "No notable recent news found.";
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
  console.log(`  ✍️  Writing email ${step + 1}/8 for ${contact.firstName}...`);

  const isReply = step > 0;
  const prompt = `${PHMP_BRIEFING}

PROSPECT DETAILS:
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
- Start with: "Hi ${contact.firstName},"
- Write the entire body as one single paragraph. no line breaks between sentences.
- End with exactly: Seth Christensen | The PHMP
- No subject line, no bullet points, no bold, no symbols
- ABSOLUTELY NO HYPHENS OR DASHES OF ANY KIND. Not em dashes, not en dashes, not hyphens between words. Use a period or rewrite instead.
- Always capitalize "I". Contractions are fine but apostrophized correctly: "that's" "you're" "I'll" "don't"`;

  const response = await claude.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 400,
    messages: [{ role: "user", content: prompt }],
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
          body: { contentType: "Text", content: body },
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
          body: { contentType: "Text", content: body },
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
            body: { contentType: "Text", content: body },
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

  const isManualRun = process.env.GITHUB_EVENT_NAME === "workflow_dispatch";
  if (!isManualRun) {
    const randomStartDelay = Math.floor(Math.random() * 30 * 60 * 1000);
    const startMins = Math.round(randomStartDelay / 60000);
    console.log(`⏱  Random start delay: ${startMins}m\n`);
    await new Promise((r) => setTimeout(r, randomStartDelay));
  } else {
    console.log("Manual run detected — skipping random delay\n");
  }

  try {
    // Pre-auth Microsoft Graph for account 1
    console.log("🔑 Authenticating with Outlook (Account 1)...");
    let graphToken = await getOutlookToken();
    console.log("  ✅ Connected\n");

    await loadTodaySentCounts();
    await enrollNewContacts();
    console.log("");

    await new Promise((r) => setTimeout(r, 5000));

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
      console.log(`   Email ${step + 1}/8 (Day ${emailDef.day}) | Account ${account.id} (${account.email})`);

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
