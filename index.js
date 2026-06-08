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
Write like a real person typing fast between meetings. Not a marketer.
Under 50 words in the body. Under 35 for follow-ups. Email 3 can go to 65.
One flowing paragraph. No line breaks between sentences.
No bullet points, no bold, no dashes, no hyphens, no colons for effect, no em dashes.
No symbols that make it look formatted or AI written.
Do not capitalize the first word after "Hi [Name],".
Loose contractions: "thats" "youre" "ill" "dont" "ive" "havent".
Never say: "synergy", "game changer", "revolutionary", "best in class", "solution", "leverage".
Never say: "I hope this finds you well", "I wanted to reach out", "please do not hesitate".
Never imply we replace anything. We sit alongside and add on top.
Sign off always exactly: Seth Christensen | The PHMP
Do NOT mention KBA.
`;

// -------------------------------------------------------------------
// 8-STEP SEQUENCE
// -------------------------------------------------------------------
const SEQUENCE = [
  {
    day: 0,
    subject: "something different",
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
Do not call this a benefits plan. Name what it actually is.
Something like: "this isnt a benefits plan or anything your broker has probably shown you.
its a tax structure built on IRS Section 125 that happens to come with 23 new employee benefits.
the reason it costs nothing is that your FICA payroll taxes go down when employees enroll
pre-tax and that savings covers the whole thing. most companies have never heard of this
because its not sold through brokers. it just sits on top of whatever they already have."
One soft question at the end. Under 55 words.`
  },
  {
    day: 7,
    subject: null,
    research: false,
    goal: `Email 3 — THE FICA MATH MADE REAL.
Make the numbers specific and impossible to ignore.
Something like: "to put a real number on it — a company with 100 employees typically sees
$32,000 to $45,000 in annual FICA tax savings. thats what covers the plan.
on top of that theres an 11 to 17% reduction in medical spending confirmed across 5 independent
studies. so a company spending $1M on healthcare could see $110,000 to $170,000 less in claims.
all without changing a single thing about their existing coverage or broker relationship.
i know this sounds too good to be true. every single client said the same thing before they
saw the math. worth 20 minutes?"
Under 65 words. This one can be slightly longer because the numbers need to land.`
  },
  {
    day: 14,
    subject: null,
    research: true,
    goal: `Email 4 — THE EMPLOYEE TAKE-HOME PAY STORY.
Flip to what this does for employees — the retention and recruitment angle.
Every enrolled employee sees their take-home pay increase without a raise.
At $60k thats roughly $1,572 more per year in their pocket just from the tax structure.
Plus $625 a month in indemnity payments for simple healthy activities.
Plus 24/7 family telemedicine at $0, behavioral health at $0, 23 new benefits total.
Frame it: "imagine telling a candidate their take-home pay goes up, they get 23 new benefits
added on top of the current plan, and it costs the company nothing to offer.
no raise required. thats the conversation were having with companies right now."
Use research if relevant to their workforce or growth. One question. Under 60 words.`
  },
  {
    day: 21,
    subject: null,
    research: false,
    goal: `Email 5 — PATTERN INTERRUPT.
Two sentences maximum. After four longer emails a short one stands out completely.
Something like: "still worth 20 minutes? i can show you exactly what the numbers
look like for your company. no pitch deck just the math."
Nothing else. Do not add anything.`
  },
  {
    day: 25,
    subject: null,
    research: false,
    goal: `Email 6 — THE REFERRAL ASK.
Stop asking for the meeting. Ask for the right person instead.
Something like: "if this kind of decision sits with someone else at your company
is there a better person for me to reach out to directly — CFO, HR director,
whoever handles benefits or payroll. happy to go straight to them so i stop
filling up your inbox."
Friendly not passive aggressive. Under 45 words.`
  },
  {
    day: 30,
    subject: null,
    research: false,
    goal: `Email 7 — THE BREAKUP.
Highest reply rate email. Short, honest, self-aware. No pitch whatsoever.
Something like: "ive reached out a few times and havent heard back which is
completely fine. should i stop reaching out? just want to make sure im not
being annoying if the timings just off."
One warm sentence max after that. Nothing else.`
  },
  {
    day: 35,
    subject: null,
    research: false,
    goal: `Email 8 — THE WARM CLOSE.
Final email. No pitch. No pressure. Genuinely warm.
Let them know you wont reach out again.
Something like: "whenever the benefits conversation does come up id genuinely
love to be a resource even if its just a sounding board. no agenda at all."
Best possible last impression. This is the one they remember when timing is right.`
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

    for (const contact of prospects) {
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
        const subject = fillTemplate(emailDef.subject, contact);

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
