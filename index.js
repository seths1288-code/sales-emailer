// ============================================================
// AI SALES EMAIL SEQUENCER — THE PHMP
// 8-touch sequence | Outlook threading | HubSpot logging
// Runs automatically every morning via GitHub Actions
// ============================================================

const Anthropic = require("@anthropic-ai/sdk");

// -------------------------------------------------------------------
// PHMP PRODUCT BRIEFING — Claude reads this before every email
// -------------------------------------------------------------------
const PHMP_BRIEFING = `
You are a sales rep setting intro meetings for The PHMP (Proactive Health Management Plan).

WHAT THE PHMP IS:
The PHMP is a supplemental employee health benefits plan that layers on top of a company's 
existing major medical plan. It combines fully-insured indemnity benefits, preventive care 
services, and patented chronic disease management — at little to no net cost to the employer.

THE CORE PAIN YOU ARE SOLVING FOR EMPLOYERS:
- Health insurance premiums have risen 71% since 2010
- Average family deductibles are up 123% 
- 40% of employees delay or skip needed care because of cost
- The chronically ill are a minority but drive the MAJORITY of claims
- Employers feel trapped — raising deductibles or absorbing costs every year
- Productivity and absenteeism suffer when employees can't afford to get healthy

HOW THE PHMP WORKS (EMPLOYER SIDE):
- No net cost to the employer — largely pays for itself through FICA/payroll tax savings
- Employers save $330–$450 per enrolled employee per year in payroll tax reduction alone
- Proven 11–17% reduction in overall medical spending (5 independent studies 2006–2021)
- Combined ROI of over $681 per employee per year
- Enhances the benefit package to attract and retain talent
- Reduces absenteeism, improves productivity
- No disruption — layers onto whatever plan they already have

HOW THE PHMP WORKS (EMPLOYEE SIDE):
- 95% of employees see an increase in spendable take-home income just for participating
- $625/month indemnity payment for completing simple healthy activities
- $7,500/year potential in wellness incentives
- 24/7 family telemedicine at $0 co-pay
- Family behavioral health (therapists, PhDs, psychiatrists) at $0 co-pay
- Personalized health coaching and dietary counseling
- Biometric and DNA screenings
- Disease management for 27 chronic conditions with a personal Nurse Navigator
- Hospital confinement indemnity benefit ($100/day)
- Prescription savings tool (up to 80% savings)
- Medical price transparency tool across 500+ procedures

KEY PROOF POINTS:
- 7 U.S. patents — this is not a generic wellness program
- Backed by the American Health Data Institute (AHDI), the largest population health 
  database in the US — data from 1.5M+ lives across 48 states
- Fully insured by an A+ rated insurance carrier
- 98% of clients see their cost trend line fall BELOW the national average
- Confirmed ROI across RAND Corporation and AHDI studies

WHO YOU ARE TARGETING:
HR Directors, CFOs, CEOs, Benefits Managers, and Business Owners at companies with 
50+ employees who are frustrated by rising healthcare costs and want to improve their 
benefits package without increasing spend.

YOUR GOAL:
You are NOT trying to close a sale in an email. You are trying to get a 20-minute intro 
call. Be curious, not pushy. Focus on their pain — not our features.
Only hint at the solution — save the details for the call.

TONE AND STYLE RULES — these are non negotiable:
Write like a real person typing fast between meetings, not like a marketer.
Keep every email under 60 words in the body. Under 40 is even better for follow ups.
Write the entire body as one flowing paragraph with no line breaks between thoughts.
No bullet points, no bold, no dashes, no hyphens, no colons used for effect, no em dashes.
No symbols of any kind that make it look formatted or AI written.
Do not capitalize the first word after the greeting. Sentences can start lowercase.
Use loose contractions like "thats" "youre" "ill" "dont" "ive" "havent" instead of "that's" "you're" etc.
Never use words like "synergy", "game changer", "revolutionary", "best in class", "solution", "leverage", "streamline".
Never use phrases like "I hope this finds you well" or "I wanted to reach out" or "please do not hesitate".
The sign off is always exactly: Seth Christensen | The PHMP
Do NOT mention KBA by name.
`;

// -------------------------------------------------------------------
// THE 8-STEP SEQUENCE
// subject: used only on Email 1 (all others reply in thread)
// goal: instructions passed to Claude for each step
// research: whether to run web search before writing
// -------------------------------------------------------------------
const SEQUENCE = [
  {
    day: 0,
    subject: "quick question — {{company}}",
    research: true,
    goal: `Email 1 — THE HOOK (research-led opener).
Open with one genuine, specific observation about their company from the research below 
(recent news, expansion, hiring, funding — whatever is most relevant to a benefits conversation).
If research found nothing useful, reference a specific challenge common in their industry instead.
Connect it naturally to a single soft question about their employee benefits or healthcare costs.
End with a gentle ask for a 20-minute call. Do NOT name the PHMP yet.
This is the first email — make it feel like it came from a real human who did their homework.`
  },
  {
    day: 3,
    subject: null,
    research: false,
    goal: `Email 2 — THE COST ANGLE (reply in thread, different approach from email 1).
Open by acknowledging you're following up without being apologetic about it.
Lead with a striking, specific stat about rising healthcare costs — premiums up 71% since 2010, 
or deductibles up 123%, or 40% of employees skipping care because of cost.
Mention that you've helped similar companies dramatically improve their benefits 
without it costing the employer anything net. One question at the end.
Do not repeat anything from email 1. Different angle entirely.`
  },
  {
    day: 7,
    subject: null,
    research: false,
    goal: `Email 3 — THE EMPLOYEE ANGLE (reply in thread, flip to employee perspective).
Most benefits pitches focus on employer savings. Flip it.
Open with the human cost: 40% of employees delay care, 6 in 10 can't cover a $500 medical bill,
employees making $95k/year choosing between treatment and paying rent.
Then pivot: there's a way to put real money back in their employees' pockets — 
95% of participants see an increase in take-home pay — just for participating in a health program.
One question asking if that's something worth a quick conversation.`
  },
  {
    day: 14,
    subject: null,
    research: true,
    goal: `Email 4 — THE PROOF (reply in thread, drop the credibility).
Reference the company from the research if there's anything relevant (growth, hiring, 
cost pressure) — otherwise stay general.
Lead with the hard proof: 11–17% reduction in medical spending, confirmed across 5 independent 
studies. 98% of the companies we work with see their healthcare cost trend line fall below 
the national average within year one. 7 US patents. A+ rated carrier.
Frame it as "thought this might be worth sharing given what you're dealing with at {{company}}."
Soft ask for a call.`
  },
  {
    day: 21,
    subject: null,
    research: false,
    goal: `Email 5 — PATTERN INTERRUPT (reply in thread, one-liner).
This email should be extremely short — 2-3 sentences maximum. 
After four substantive emails, a jarring change in length and tone gets noticed.
Something like: "Still worth 20 minutes? I can show you exactly how this would work 
at a company your size — no pitch deck, just numbers." 
That's it. Nothing else. No stats, no recap, no apology for following up.`
  },
  {
    day: 25,
    subject: null,
    research: false,
    goal: `Email 6 — THE REFERRAL ASK (reply in thread, change tactic entirely).
Stop asking them for a meeting. Ask for the RIGHT person instead.
Something like: if benefits decisions don't sit with them, who should you be talking to —
the CFO, the HR director, the benefits manager? 
Frame it as: you don't want to keep interrupting their day if there's a better person to speak with.
Friendly, not passive-aggressive. This often gets routed to the decision-maker 
even when the original prospect wasn't.`
  },
  {
    day: 30,
    subject: null,
    research: false,
    goal: `Email 7 — THE BREAKUP (reply in thread — this is your highest reply-rate email).
This is the most important email in the sequence. Write it carefully.
It should feel genuinely human and slightly self-aware. 
Something like: "I've reached out a few times now and haven't heard back — 
totally understand if the timing is off or this just isn't a priority right now.
Should I stop reaching out?"
That's essentially it. Maybe one warm sentence at the end leaving the door open.
Do NOT be passive-aggressive. Do NOT list your features again. Do NOT apologize excessively.
The power of this email is its honesty and brevity. People feel compelled to respond.`
  },
  {
    day: 35,
    subject: null,
    research: false,
    goal: `Email 8 — THE WARM CLOSE (reply in thread, final email).
Final email — warm, no pressure, genuinely respectful of their time.
Let them know you won't keep reaching out after this.
Something like: whenever the benefits conversation does come up at {{company}}, 
you'd love to be a resource — even if it's just a sounding board.
Leave a door genuinely open without any expectation.
This is your last impression. Make it a good one.`
  }
];

// -------------------------------------------------------------------
// CONFIGURATION
// -------------------------------------------------------------------
const CONFIG = {
  senderName: process.env.SENDER_NAME || "Your Name",
  senderCompany: process.env.SENDER_COMPANY || "Your Company",
  senderTitle: process.env.SENDER_TITLE || "Your Title",
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
// HELPER: Days since a date
// -------------------------------------------------------------------
function daysSince(dateString) {
  if (!dateString) return 999;
  const then = new Date(dateString);
  const now = new Date();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

// -------------------------------------------------------------------
// HELPER: Fill subject line placeholders
// -------------------------------------------------------------------
function fillTemplate(template, contact) {
  if (!template) return null;
  return template
    .replace(/{{company}}/g, contact.company || "your company")
    .replace(/{{firstName}}/g, contact.firstName || "there");
}

// -------------------------------------------------------------------
// STEP 1a: Find new contacts synced from Apollo in the last 24 hours
// and auto-enroll them into the sequence (sets sequence_active = true)
// Apollo contacts come in with hs_analytics_source = "OTHER" and
// hs_analytics_source_data_1 containing "apollo" — we also catch any
// contact created in the last 24hrs with no sequence_active set yet.
// -------------------------------------------------------------------
async function enrollNewApolloContacts() {
  console.log("🔍 Checking for new contacts owned by Seth to enroll...");

  // Step 1: Get Seth's HubSpot owner ID from his email
  const ownerRes = await fetch(
    `https://api.hubapi.com/crm/v3/owners?email=${encodeURIComponent(process.env.SENDER_EMAIL)}&limit=1`,
    { headers: hubspotHeaders }
  );

  const ownerData = await ownerRes.json();

  if (!ownerData.results || ownerData.results.length === 0) {
    console.log(`  Could not find HubSpot owner for ${process.env.SENDER_EMAIL}`);
    return;
  }

  const ownerId = ownerData.results[0].id;
  console.log(`  Found owner ID: ${ownerId}`);

  // Step 2: Search for contacts owned by Seth with blank sequence_active.
  // Existing contacts are protected because we already bulk-set them to false.
  // Only brand new contacts from Apollo will have a blank sequence_active.
  const response = await fetch(
    "https://api.hubapi.com/crm/v3/objects/contacts/search",
    {
      method: "POST",
      headers: hubspotHeaders,
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              {
                propertyName: "hubspot_owner_id",
                operator: "EQ",
                value: ownerId,
              },
              {
                propertyName: "sequence_active",
                operator: "NOT_HAS_PROPERTY",
              },
            ],
          },
          {
            filters: [
              {
                propertyName: "hubspot_owner_id",
                operator: "EQ",
                value: ownerId,
              },
              {
                propertyName: "sequence_active",
                operator: "EQ",
                value: "",
              },
            ],
          },
        ],
        properties: ["firstname", "lastname", "email", "company", "sequence_active", "sequence_step"],
        limit: 100,
      }),
    }
  );

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    console.log("  No new contacts to enroll");
    return;
  }

  console.log(`  Found ${data.results.length} contact(s) owned by Seth to enroll`);

  for (const contact of data.results) {
    if (!contact.properties.email) {
      console.log(`  Skipping ${contact.id} — no email address`);
      continue;
    }

    await fetch(
      `https://api.hubapi.com/crm/v3/objects/contacts/${contact.id}`,
      {
        method: "PATCH",
        headers: hubspotHeaders,
        body: JSON.stringify({
          properties: {
            sequence_active: "true",
            sequence_step: "0",
          },
        }),
      }
    );

    console.log(
      `  Enrolled: ${contact.properties.firstname || ""} ${contact.properties.lastname || ""} @ ${contact.properties.company || "unknown"}`
    );
  }
}

// -------------------------------------------------------------------
// STEP 1b: Fetch all currently active prospects from HubSpot
// Custom properties needed on your HubSpot contacts:
//   sequence_active  (single-line text: "true" or "false")
//   sequence_step    (number: 0 through 8)
//   last_email_sent  (date)
//   thread_id        (single-line text: Outlook message ID for threading)
//   thread_subject   (single-line text: subject line of email 1)
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
              {
                propertyName: "sequence_active",
                operator: "EQ",
                value: "true",
              },
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
  if (!data.results) {
    console.log("No prospects found or HubSpot error:", data);
    return [];
  }

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
// STEP 2: Research the prospect's company
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
        messages: [
          {
            role: "user",
            content: `Search for recent news about the company "${contact.company}"
(located in ${contact.city || ""} ${contact.state || ""}, industry: ${contact.industry || "unknown"}).

Find: recent news, expansions, new locations, hiring trends, funding rounds, 
leadership changes, layoffs, or any signs relevant to an HR/benefits conversation.

Return ONLY 2-3 sentences of plain text summarising what you found.
If nothing useful, return exactly: "No notable recent news found."`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!data.content || !Array.isArray(data.content)) {
      return "No notable recent news found.";
    }

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
// STEP 3: Write the email with Claude
// -------------------------------------------------------------------
async function writeEmail(contact, step, companyResearch) {
  const emailDef = SEQUENCE[step];
  console.log(`  ✍️  Writing email ${step + 1}/8 for ${contact.firstName}...`);

  const isReply = step > 0;
  const prompt = `${PHMP_BRIEFING}

---
PROSPECT DETAILS:
- Name: ${contact.firstName} ${contact.lastName}
- Title: ${contact.jobTitle || "unknown"}
- Company: ${contact.company}
- Industry: ${contact.industry || "unknown"}
- Location: ${contact.city || ""} ${contact.state || ""}
- Company size: ${contact.employeeCount ? contact.employeeCount + " employees" : "unknown"}

RECENT COMPANY RESEARCH (use only if genuinely relevant — never force it):
${companyResearch}

---
CONTEXT:
${isReply
  ? `This is email ${step + 1} in an ongoing thread. You have already sent ${step} previous email(s) to this person with no reply. Do NOT re-introduce yourself. Do NOT reference being in a thread explicitly. Just write naturally as though continuing a real conversation by email.`
  : `This is the very first email. Introduce yourself briefly and naturally.`
}

YOUR TASK:
${fillTemplate(emailDef.goal, contact)}

FORMATTING:
- Start with: "Hi ${contact.firstName},"
- Write the entire body as one single paragraph. no line breaks between sentences. no gaps. just one flowing block of text.
- End with exactly this on a new line: Seth Christensen | The PHMP
- No subject line, no bullet points, no bold, no dashes, no hyphens, no symbols
- Under 60 words total in the body. shorter is better.
- Do not capitalize the first word of the body after the greeting
- Loose contractions are good. "thats" "youre" "ill" "dont" are fine.`;

  const response = await claude.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 400,
    messages: [{ role: "user", content: prompt }],
  });

  let body = response.content[0].text;
  body = body.replace(
    "Seth Christensen | The PHMP",
    "Seth Christensen | The PHMP"
  );

  // Clean up any leftover signature placeholders just in case
  body = body.replace("[SIGNATURE]", "Seth Christensen | The PHMP");

  return body;
}

// -------------------------------------------------------------------
// STEP 4: Get Microsoft Outlook token
// -------------------------------------------------------------------
async function testHubSpotConnection() {
  // Simple check that our HubSpot key works before we start sending
  const res = await fetch("https://api.hubapi.com/crm/v3/objects/contacts?limit=1", {
    headers: hubspotHeaders,
  });
  if (!res.ok) {
    throw new Error("HubSpot connection failed: " + res.status);
  }
  return true;
}


// -------------------------------------------------------------------
// STEP 5: Send email via HubSpot (uses your connected Outlook account)
// Email 1 sends fresh. Emails 2-8 reply in the same thread using
// HubSpot's in_reply_to field to keep the conversation threaded.
// -------------------------------------------------------------------
async function sendViaHubSpot(contact, subject, body, inReplyToId) {
  const senderEmail = process.env.SENDER_EMAIL;

  // HubSpot requires sender/recipient info inside hs_email_headers as JSON
  const headers = {
    from: {
      email: senderEmail,
      firstName: process.env.SENDER_NAME || "Seth",
      lastName: "",
    },
    to: [
      {
        email: contact.email,
        firstName: contact.firstName || "",
        lastName: contact.lastName || "",
      },
    ],
    cc: [],
    bcc: [],
  };

  const properties = {
    hs_email_direction: "EMAIL",
    hs_email_subject: subject,
    hs_email_text: body,
    hs_email_status: "SENT",
    hs_timestamp: String(Date.now()),
    hs_email_headers: JSON.stringify(headers),
  };

  if (inReplyToId) {
    properties.hs_email_thread_id = String(inReplyToId);
  }

  const emailPayload = {
    properties,
    associations: [
      {
        to: { id: contact.id },
        types: [
          {
            associationCategory: "HUBSPOT_DEFINED",
            associationTypeId: 198,
          },
        ],
      },
    ],
  };

  const res = await fetch("https://api.hubapi.com/crm/v3/objects/emails", {
    method: "POST",
    headers: hubspotHeaders,
    body: JSON.stringify(emailPayload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`HubSpot send failed: ${JSON.stringify(data)}`);
  }

  console.log(`  📧 Email sent via HubSpot (id: ${data.id})`);
  return data.id;
}

// -------------------------------------------------------------------
// STEP 6: Update HubSpot — new step + thread info + log email
// -------------------------------------------------------------------
async function updateHubSpot(contact, emailBody, subject, newStep, threadId, threadSubject) {
  const now = new Date().toISOString().split("T")[0];
  const isComplete = newStep >= SEQUENCE.length;

  const updates = {
    sequence_step: String(newStep),
    last_email_sent: now,
    sequence_active: isComplete ? "false" : "true",
  };

  // Save thread info on first email so all future emails can reply in thread
  if (newStep === 1 && threadId) {
    updates.thread_id = threadId;
    updates.thread_subject = subject;
  }

  await fetch(
    `https://api.hubapi.com/crm/v3/objects/contacts/${contact.id}`,
    {
      method: "PATCH",
      headers: hubspotHeaders,
      body: JSON.stringify({ properties: updates }),
    }
  );

  // Log the email as an engagement on the contact timeline
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
      associations: [
        {
          to: { id: contact.id },
          types: [
            {
              associationCategory: "HUBSPOT_DEFINED",
              associationTypeId: 198,
            },
          ],
        },
      ],
    }),
  });

  console.log(
    `  ✅ HubSpot updated (step ${newStep}${isComplete ? " — sequence complete" : ""})`
  );
}

// -------------------------------------------------------------------
// MAIN
// -------------------------------------------------------------------
async function main() {
  console.log("\n🚀 PHMP Sales Email Sequencer\n");
  console.log(`📅 ${new Date().toDateString()}\n`);

  // Wait a random amount of time between 0 and 3 hours before doing anything
  // This spreads the start time across the 9am-12pm window so it never
  // kicks off at the exact same moment every day
  // Skip the delay if running manually via workflow_dispatch (useful for testing)
  const isManualRun = process.env.GITHUB_EVENT_NAME === "workflow_dispatch";
  if (!isManualRun) {
    const randomStartDelay = Math.floor(Math.random() * 3 * 60 * 60 * 1000);
    const startMins = Math.round(randomStartDelay / 60000);
    console.log(`⏱  Random start delay: ${Math.floor(startMins/60)}h ${startMins%60}m — emails will begin around ${new Date(Date.now() + randomStartDelay).toLocaleTimeString("en-US", {timeZone: "America/Denver", hour: "2-digit", minute: "2-digit"})} MT\n`);
    await new Promise((r) => setTimeout(r, randomStartDelay));
  } else {
    console.log("Manual run detected — skipping random delay\n");
  }

  try {
    console.log("🔑 Connecting to HubSpot...");
    await testHubSpotConnection();
    console.log("  ✅ Connected\n");

    // Auto-enroll any new contacts synced from Apollo in the last 24hrs
    await enrollNewApolloContacts();
    console.log("");

    const prospects = await getActiveProspects();
    console.log(`  Found ${prospects.length} active prospect(s)\n`);

    if (prospects.length === 0) {
      console.log("No prospects to email. Add contacts in HubSpot with sequence_active = true and sequence_step = 0");
      return;
    }

    let sent = 0;
    let skipped = 0;

    for (const contact of prospects) {
      const step = contact.sequenceStep;

      // Sequence complete
      if (step >= SEQUENCE.length) {
        console.log(`⏭️  ${contact.firstName} ${contact.lastName} — sequence complete`);
        skipped++;
        continue;
      }

      const emailDef = SEQUENCE[step];

      // Not time yet for this step
      if (step > 0) {
        const daysWaited = daysSince(contact.lastEmailSent);
        const daysNeeded = emailDef.day - SEQUENCE[step - 1].day;
        if (daysWaited < daysNeeded) {
          console.log(
            `⏳ ${contact.firstName} ${contact.lastName} — waiting (${daysWaited}/${daysNeeded} days until email ${step + 1})`
          );
          skipped++;
          continue;
        }
      }

      console.log(`\n👤 ${contact.firstName} ${contact.lastName} @ ${contact.company}`);
      console.log(`   Email ${step + 1}/8 (Day ${emailDef.day})`);

      try {
        // Research (only for steps that need it)
        let research = "No research for this step.";
        if (emailDef.research) {
          research = await researchCompany(contact);
        }

        // Write the email
        const body = await writeEmail(contact, step, research);
        const subject = fillTemplate(emailDef.subject, contact);

        if (step === 0) {
          // First email — send fresh, save HubSpot email ID for threading
          const emailId = await sendViaHubSpot(contact, subject, body, null);
          await updateHubSpot(contact, body, subject, step + 1, emailId, subject);
        } else {
          // All follow-ups — reply in the original thread via HubSpot
          const reSubject = contact.threadSubject
            ? `Re: ${contact.threadSubject}`
            : `Re: quick question`;
          await sendViaHubSpot(contact, reSubject, body, contact.threadId);
          await updateHubSpot(contact, body, null, step + 1, null, null);
        }

        sent++;

        // Wait a random amount between 4 and 18 minutes before the next email
        // so each one lands at a different time rather than all at once
        const randomDelay = Math.floor(Math.random() * (18 - 4 + 1) + 4) * 60 * 1000;
        console.log(`  ⏱  Waiting ${Math.round(randomDelay/60000)} min before next email...`);
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
