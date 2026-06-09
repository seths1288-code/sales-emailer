// ============================================================
// AI SALES EMAIL SEQUENCER — THE PHMP
// 8-touch sequence | Microsoft Graph sending | HubSpot logging
// Auto-enrolls new contacts owned by Seth
// Runs automatically every morning via GitHub Actions
// ============================================================

const Anthropic = require("@anthropic-ai/sdk");

// -------------------------------------------------------------------
// PHMP PRODUCT BRIEFING
// -------------------------------------------------------------------
const PHMP_BRIEFING = `
You are a sales rep setting intro meetings for The PHMP (Proactive Health Management Plan).

======================================================================
CATEGORY POSITIONING — THIS IS HOW YOU THINK ABOUT THE PHMP
======================================================================

The PHMP is NOT a benefits plan, wellness program, or anything employers have seen before.
It is a TAX STRUCTURE built on IRS Section 125 that happens to deliver 23 new employee benefits.
Position it as a new category entirely. When they think benefits they think cost. 
The PHMP is the opposite — it generates savings while adding benefits.
Never compete in the "benefits vendor" category. You are in a category of one.

The one-line positioning: "The only plan that pays employers to offer better benefits."

======================================================================
CRITICAL FRAMING — GET EVERY ONE OF THESE RIGHT
======================================================================

1. IT COSTS THE EMPLOYER NOTHING — HERE IS EXACTLY WHY:
The PHMP is structured under IRS Section 125. Employees elect benefits pre-tax.
This reduces taxable wages. The employer then pays less FICA payroll tax (7.65% of wages).
That FICA reduction = $321 to $450 per enrolled employee per year.
That savings covers the entire cost of the plan. Net employer cost = $0.
100 employees = $32,100 to $45,000 in annual FICA savings.
200 employees = $64,200 to $90,000 in annual FICA savings.
Also saves on FUTA and often state unemployment taxes.
This is established IRS tax code. Not a gimmick. Has worked for decades.

2. NOTHING ABOUT THEIR CURRENT PLAN OR BROKER CHANGES:
Their existing health plan stays exactly as is. Untouched. Forever.
Their broker relationship stays intact. Broker keeps their commissions.
The PHMP snaps on top like an additional layer. Nothing changes below it.
Brokers sometimes think we are competition — we are NOT. We are additive.
Key line: "your current plan doesnt change, your broker doesnt change, we just add on top."

3. EMPLOYEES GET MORE TAKE-HOME PAY WITHOUT A RAISE:
The pre-tax Section 125 structure increases every enrolled employee's take-home pay.
$25k salary employee = roughly $684 more per year in their pocket.
$60k salary employee = roughly $1,572 more per year in their pocket.
Plus: $625/month indemnity payment for completing simple healthy activities.
Employer gives employees more money without paying them more. That's the retention story.

4. 23 NEW BENEFITS ADDED FOR FREE:
24/7 family telemedicine at $0 co-pay (unlimited, entire family)
Family behavioral health — therapists, PhDs, psychiatrists at $0 co-pay
Personal health coaching and dietary counseling
Health risk assessment
Biometric screening (catches diabetes, cardiovascular risk years early)
DNA screening (19 genes — diet, exercise, metabolism insights)
Disease management for 27 chronic conditions with a personal Nurse Navigator
$625/month indemnity for completing healthy activities
$7,500/year potential in wellness incentives
Hospital confinement indemnity $100/day
Prescription savings up to 80%
Medical price transparency on 500+ procedures
Immunizations and more

5. THE PROOF IS AIRTIGHT:
7 US patents — proprietary, not a copycat
AHDI — American Health Data Institute — 1.5M+ lives across 48 states
Companion Life — A+ rated by AM Best (Superior)
5 independent studies 2006 to 2021 — same result every time: 11 to 17% medical spend reduction
98% of clients see cost trend fall below the national average
RAND Corporation confirmed the ROI
Combined ROI over $681 per employee per year

6. THE MATH FOR A 100-PERSON COMPANY:
FICA savings: $32,100+ per year
Medical spend reduction on $1M healthcare budget: $110,000 to $170,000 saved
Employee take-home pay increase: no raises required
Net cost to employer: $0
This is the conversation a CFO has never had before.

======================================================================
WHO YOU ARE TARGETING:
HR Directors, CFOs, CEOs, Benefits Managers, Business Owners — 50+ employee companies.
People who feel completely trapped by rising costs with no good options left.
CFOs and finance people respond especially well to the FICA/tax angle.
HR directors respond to the employee take-home pay and recruitment angle.

YOUR GOAL:
Get a 20 minute call. Not a sale. Not an explanation.
The "too good to be true" angle is your best hook — lean into it.
The paradox stops people: something that adds benefits, costs nothing, and doesn't 
change anything they already have. That's counterintuitive enough to earn a reply.

======================================================================
TONE AND STYLE — NON NEGOTIABLE:
Write like a real person typing fast on their phone between meetings. Not a marketer ever.
Under 50 words maximum in the body. Under 35 for follow-ups. Email 3 can go to 55.
One flowing paragraph. No line breaks between sentences whatsoever.
No bullet points, no bold, no dashes, no hyphens, no colons for effect, no em dashes.
No symbols of any kind that make it look formatted or AI written.
Do not capitalize the first word after "Hi [Name],".
Loose contractions always: "thats" "youre" "ill" "dont" "ive" "havent" — no apostrophes ever.
Never say: "synergy", "game changer", "revolutionary", "best in class", "solution", "leverage", "streamline".
Never say: "I hope this finds you well", "I wanted to reach out", "please do not hesitate".
Never imply we replace anything. We sit alongside and add on top.
Sign off always exactly: Seth Christensen | The PHMP
Do NOT mention KBA.

WHAT MAKES THESE EMAILS STAND OUT — APPLY ALL OF THESE:
1. SPECIFICITY: Never say "healthcare costs." Say "what you spend keeping [X] employees covered"
   or "the cost of running benefits across [their industry]." Specific details feel personal.
2. CONFIDENT UNDERSTATEMENT: The less desperate the ask sounds the more they want to say yes.
   "worth 20 minutes?" not "I would love to connect and share our solution."
3. ONE UNEXPECTED LINE PER EMAIL: Every email needs one sentence nobody has said to them before.
   Examples: "it pays you to offer it" / "your broker doesnt lose anything" /
   "theres no catch i just know how it sounds" / "i know this sounds made up" /
   "every other benefits conversation starts with a price tag, this one ends with savings."
4. EMPATHY BEFORE PITCH: Show you understand their world before you say anything about the PHMP.
   One sentence that proves you get their situation. Then the hook.
5. NEVER EXPLAIN TOO MUCH: Say less than you want to. One point per email. Stop there.
   The goal is curiosity not comprehension. They dont need to understand it to take the meeting.
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

The PHMP positioning statement you can weave in naturally where it fits:
"the only benefits plan that pays the employer and employees to offer it."

ALWAYS open with one genuine research-led observation about their company first.
If no useful research was found reference a known challenge in their industry.
Then deliver the hook based on their job title:

IF TITLE IS CFO, VP FINANCE, CONTROLLER, FINANCE DIRECTOR or any finance role:
TAX AND MATH HOOK. Something like: "most people dont know theres an IRS tax structure
that lets employers add 23 new employee benefits, increase every employees take-home pay,
and reduce their own payroll taxes all at the same time. doesnt touch anything already in place.
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
NEW CATEGORY HOOK. Something like: "this isnt a benefits plan, a wellness program,
or anything your broker has probably shown you. its a tax structure that happens to deliver
23 new employee benefits at zero net cost to the employer. theres not really a name for it yet.
worth 20 minutes to see what it looks like for your company?"

FOR ALL HOOKS:
Do NOT explain HOW it costs nothing in this email — that curiosity is what gets the reply.
Do NOT mention KBA. Do NOT mention Section 125 by name in Email 1.
Under 65 words total. One paragraph. Human, direct, no hyphens, no symbols.`
  },
  {
    day: 3,
    subject: null,
    research: false,
    goal: `Email 2 — THE CATEGORY REFRAME.
FIRST LINE RULE: The first line must stop them mid-scroll. It shows in the inbox preview.
Lead with the most counterintuitive thing about the PHMP as the very first sentence.
Examples of strong first lines:
"every other benefits conversation starts with a price tag. this one ends with savings."
"this isnt a benefits plan. its a tax structure that happens to come with 23 new benefits."
"most companies have never heard of this because its not sold through brokers."
Pick the strongest one for this specific person based on their title and company.
Then: it sits on top of whatever they already have, nothing below it changes, costs nothing.
One soft question at the end. Under 50 words total.`
  },
  {
    day: 7,
    subject: null,
    research: false,
    goal: `Email 3 — THE FICA MATH.
FIRST LINE RULE: Lead with a number so specific it feels impossible to ignore.
Examples of strong first lines:
"a company with [their size] employees typically sees $32,000 to $45,000 in annual payroll tax savings from this. thats what covers the cost."
"5 independent studies. same result every time. 11 to 17% reduction in medical spending."
"i know this sounds made up. every single client said the same thing before they saw the math."
Then back it up with the proof: AHDI, 5 studies, A+ carrier, 7 patents.
End with: "worth 20 minutes?" Under 55 words total.`
  },
  {
    day: 14,
    subject: null,
    research: true,
    goal: `Email 4 — THE EMPLOYEE STORY.
FIRST LINE RULE: Lead with the most surprising employee benefit — the raise without the raise.
Examples of strong first lines:
"you can give every employee more take-home pay this year without raising a single salary."
"95% of employees who enroll see their spendable income go up. no raise required from the employer."
"at $60k salary thats roughly $1,572 more per year in their pocket just from the tax structure."
Then: plus $625 a month in indemnity payments, 24/7 family telemedicine at $0, 23 new benefits total.
Use research if there is something relevant about their workforce or hiring.
One question. Under 50 words total.`
  },
  {
    day: 21,
    subject: null,
    research: false,
    goal: `Email 5 — PATTERN INTERRUPT.
FIRST LINE RULE: After four longer emails make this one shockingly short.
The contrast IS the hook. Two sentences maximum total.
Examples:
"still worth 20 minutes? i can show you exactly what the numbers look like for your company. no pitch deck just the math."
"genuinely curious if the timing is just off or if this got buried. worth a quick look?"
Do not add anything else. The brevity is the point.`
  },
  {
    day: 25,
    subject: null,
    research: false,
    goal: `Email 6 — THE REFERRAL ASK.
FIRST LINE RULE: Open by stopping the ask entirely — pivot to finding the right person.
Examples of strong first lines:
"not trying to be a pain — if this doesnt sit with you is there a better person to reach out to directly?"
"stopping the meeting ask. if benefits decisions sit with someone else at your company id rather go straight to them."
Then: CFO, HR director, whoever handles the plan. happy to reach out directly.
Under 40 words total.`
  },
  {
    day: 30,
    subject: null,
    research: false,
    goal: `Email 7 — THE BREAKUP.
FIRST LINE RULE: The most honest first line wins. No warmup. No preamble. Just the truth.
Examples:
"should i stop reaching out?"
"ive sent a few of these and havent heard back — completely fine if the timings off."
"this is probably my last one."
That IS the first line. Then one short follow-up sentence at most.
Under 30 words total. The honesty and brevity is what makes people reply.`
  },
  {
    day: 35,
    subject: null,
    research: false,
    goal: `Email 8 — THE WARM CLOSE.
FIRST LINE RULE: Open with genuine warmth that signals this is truly the last one.
Examples:
"last one from me — promise."
"not going to keep showing up in your inbox after this."
"this is it from my end."
Then: whenever the benefits conversation comes up id genuinely love to be a resource,
even just a sounding board, no agenda at all.
Leave the best possible last impression. Under 40 words total.`
  }
];

// -------------------------------------------------------------------
// CONFIG
// -------------------------------------------------------------------
const CONFIG = {
  senderName: process.env.SENDER_NAME || "Seth Christensen",
  senderCompany: process.env.SENDER_COMPANY || "The PHMP",
};

// -------------------------------------------------------------------
// CLIENTS
// -------------------------------------------------------------------
const hubspotHeaders = {
  Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}`,
  "Content-Type": "application/json",
};

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// -------------------------------------------------------------------
// SUBJECT LINE SELECTION — picks best subject by job title
// -------------------------------------------------------------------
function pickSubjectLine(contact) {
  const title = (contact.jobTitle || "").toLowerCase();

  // CFO / Finance titles — tax and money angle
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

  // HR / Benefits / People titles — employee and benefits angle
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

  // CEO / Owner / President titles — big picture angle
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

  // Operations / Admin titles
  if (
    title.includes("operations") || title.includes("coo") ||
    title.includes("office manager") || title.includes("administrator") ||
    title.includes("director of ops")
  ) {
    const subjects = [
      "cuts costs. adds benefits. nothing changes.",
      "the plan that runs itself",
      "zero net cost employee benefits",
      "something worth 20 minutes",
      "adds 23 benefits at no cost",
    ];
    return subjects[Math.floor(Math.random() * subjects.length)];
  }

  // Default — curiosity gap subjects for unknown titles
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
// HELPERS
// -------------------------------------------------------------------
function daysSince(dateString) {
  if (!dateString) return 999;
  const then = new Date(dateString);
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
// STEP 1: Auto-enroll new contacts owned by Seth
// -------------------------------------------------------------------
async function enrollNewApolloContacts() {
  console.log("🔍 Checking for new contacts owned by Seth to enroll...");

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
        properties: ["firstname", "lastname", "email", "company", "sequence_active"],
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

    await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contact.id}`, {
      method: "PATCH",
      headers: hubspotHeaders,
      body: JSON.stringify({
        properties: { sequence_active: "true", sequence_step: "0" },
      }),
    });

    console.log(`  Enrolled: ${contact.properties.firstname || ""} ${contact.properties.lastname || ""} @ ${contact.properties.company || "unknown"}`);
  }
}

// -------------------------------------------------------------------
// STEP 2: Fetch active prospects from HubSpot
// -------------------------------------------------------------------
async function getActiveProspects() {
  console.log("📋 Fetching active prospects from HubSpot...");

  const response = await fetch(
    "https://api.hubapi.com/crm/v3/objects/contacts/search",
    {
      method: "POST",
      headers: hubspotHeaders,
      body: JSON.stringify({
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
        ],
        limit: 100,
      }),
    }
  );

  const data = await response.json();
  if (!data.results) return [];

  return data.results.map((c) => ({
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
- No subject line, no bullet points, no bold, no dashes, no hyphens, no symbols
- Loose contractions: "thats" "youre" "ill" "dont"`;

  const response = await claude.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 400,
    messages: [{ role: "user", content: prompt }],
  });

  return response.content[0].text;
}

// -------------------------------------------------------------------
// STEP 5: Get Microsoft Outlook token
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
// STEP 6a: Send Email 1 — fresh thread
// -------------------------------------------------------------------
async function sendFirstEmail(token, contact, subject, body) {
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
    throw new Error(`Send failed: ${await sendRes.text()}`);
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

  console.log(`  📧 Email 1 sent | Thread ID captured`);
  return sentMsg.internetMessageId;
}

// -------------------------------------------------------------------
// STEP 6b: Send follow-up — reply in existing thread
// -------------------------------------------------------------------
async function sendReplyEmail(token, contact, body, threadInternetMessageId, threadSubject) {
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

    console.log(`  📧 Reply sent in thread`);
  } else {
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

    if (fallbackRes.status !== 202) throw new Error(`Fallback send failed: ${await fallbackRes.text()}`);
    console.log(`  📧 Reply sent (fallback)`);
  }
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
// MAIN
// -------------------------------------------------------------------
async function main() {
  console.log("\n🚀 PHMP Sales Email Sequencer\n");
  console.log(`📅 ${new Date().toDateString()}\n`);

  const isManualRun = process.env.GITHUB_EVENT_NAME === "workflow_dispatch";
  if (!isManualRun) {
    const randomStartDelay = Math.floor(Math.random() * 3 * 60 * 60 * 1000);
    const startMins = Math.round(randomStartDelay / 60000);
    console.log(`⏱  Random start delay: ${Math.floor(startMins / 60)}h ${startMins % 60}m\n`);
    await new Promise((r) => setTimeout(r, randomStartDelay));
  } else {
    console.log("Manual run detected — skipping random delay\n");
  }

  try {
    console.log("🔑 Authenticating with Outlook...");
    const initialToken = await getOutlookToken();
    console.log("  ✅ Connected\n");

    await enrollNewApolloContacts();
    console.log("");

    await new Promise((r) => setTimeout(r, 5000));

    const prospects = await getActiveProspects();
    console.log(`  Found ${prospects.length} active prospect(s)\n`);

    if (prospects.length === 0) {
      console.log("No prospects to email today.");
      return;
    }

    let sent = 0;
    let skipped = 0;
    const DAILY_SEND_CAP = 60;

    for (const contact of prospects) {
      // Stop for the day once we hit the daily cap
      if (sent >= DAILY_SEND_CAP) {
        console.log(`\n📨 Daily send cap of ${DAILY_SEND_CAP} reached — remaining contacts will be picked up tomorrow`);
        break;
      }

      const step = contact.sequenceStep;

      if (step >= SEQUENCE.length) {
        console.log(`⏭️  ${contact.firstName} ${contact.lastName} — sequence complete`);
        skipped++;
        continue;
      }

      // Never send more than one email to the same person on the same day
      const today = new Date().toISOString().split("T")[0];
      if (contact.lastEmailSent === today) {
        console.log(`⏭️  ${contact.firstName} ${contact.lastName} — already emailed today`);
        skipped++;
        continue;
      }

      const emailDef = SEQUENCE[step];

      if (step > 0) {
        const daysWaited = daysSince(contact.lastEmailSent);
        const daysNeeded = emailDef.day - SEQUENCE[step - 1].day;
        if (daysWaited < daysNeeded) {
          console.log(`⏳ ${contact.firstName} ${contact.lastName} — waiting (${daysWaited}/${daysNeeded} days until email ${step + 1})`);
          skipped++;
          continue;
        }
      }

      console.log(`\n👤 ${contact.firstName} ${contact.lastName} @ ${contact.company}`);
      console.log(`   Email ${step + 1}/8 (Day ${emailDef.day})`);

      try {
        let research = "No research for this step.";
        if (emailDef.research) research = await researchCompany(contact);

        const body = await writeEmail(contact, step, research);
        // For Email 1 pick the best subject based on job title
        // For follow-ups keep the Re: thread subject
        const subject = (step === 0)
          ? pickSubjectLine(contact)
          : fillTemplate(emailDef.subject, contact);

        // Fresh token before each send to prevent expiry on long runs
        const token = await getOutlookToken();

        if (step === 0) {
          const threadId = await sendFirstEmail(token, contact, subject, body);
          await updateHubSpot(contact, body, subject, step + 1, threadId, subject);
        } else {
          const threadSubject = contact.threadSubject || `something different`;
          await sendReplyEmail(token, contact, body, contact.threadId, threadSubject);
          await updateHubSpot(contact, body, null, step + 1, null, null);
        }

        sent++;

        const randomDelay = Math.floor(Math.random() * (7 - 3 + 1) + 3) * 60 * 1000;
        console.log(`  ⏱  Waiting ${Math.round(randomDelay / 60000)} min before next email...`);
        await new Promise((r) => setTimeout(r, randomDelay));
      } catch (err) {
        console.error(`  ❌ Error for ${contact.firstName}: ${err.message}`);
      }
    }

    console.log("\n✅ Done!");
    console.log(`   Sent: ${sent} | Skipped: ${skipped}`);
  } catch (err) {
    console.error("Fatal error:", err);
    process.exit(1);
  }
}

main();
