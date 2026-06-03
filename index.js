// ============================================================
// AI SALES EMAIL SEQUENCER — THE PHMP
// 8-touch sequence | Microsoft Graph sending | HubSpot logging
// Auto-enrolls new contacts owned by Seth from Apollo
// Runs automatically every morning via GitHub Actions
// ============================================================

const Anthropic = require("@anthropic-ai/sdk");

// -------------------------------------------------------------------
// PHMP PRODUCT BRIEFING
// -------------------------------------------------------------------
const PHMP_BRIEFING = `
You are a sales rep setting intro meetings for The PHMP (Proactive Health Management Plan).

WHAT THE PHMP IS:
The PHMP is a supplemental employee health benefits plan that layers on top of a company's 
existing major medical plan. It combines fully-insured indemnity benefits, preventive care 
services, and patented chronic disease management at little to no net cost to the employer.

THE CORE PAIN YOU ARE SOLVING FOR EMPLOYERS:
- Health insurance premiums have risen 71% since 2010
- Average family deductibles are up 123%
- 40% of employees delay or skip needed care because of cost
- The chronically ill are a minority but drive the MAJORITY of claims
- Employers feel trapped raising deductibles or absorbing costs every year
- Productivity and absenteeism suffer when employees cannot afford to get healthy

HOW THE PHMP WORKS (EMPLOYER SIDE):
- No net cost to the employer largely pays for itself through FICA/payroll tax savings
- Employers save $330 to $450 per enrolled employee per year in payroll tax reduction alone
- Proven 11 to 17% reduction in overall medical spending confirmed across 5 independent studies 2006 to 2021
- Combined ROI of over $681 per employee per year
- Enhances the benefit package to attract and retain talent
- Reduces absenteeism and improves productivity
- No disruption layers onto whatever plan they already have

HOW THE PHMP WORKS (EMPLOYEE SIDE):
- 95% of employees see an increase in spendable take-home income just for participating
- $625/month indemnity payment for completing simple healthy activities
- $7,500/year potential in wellness incentives
- 24/7 family telemedicine at $0 co-pay
- Family behavioral health at $0 co-pay
- Personalized health coaching and dietary counseling
- Biometric and DNA screenings
- Disease management for 27 chronic conditions with a personal Nurse Navigator
- Hospital confinement indemnity benefit
- Prescription savings tool up to 80% savings

KEY PROOF POINTS:
- 7 US patents this is not a generic wellness program
- Backed by the American Health Data Institute with data from 1.5M+ lives across 48 states
- Fully insured by an A+ rated insurance carrier
- 98% of clients see their cost trend line fall below the national average
- Confirmed ROI across RAND Corporation and AHDI studies

WHO YOU ARE TARGETING:
HR Directors, CFOs, CEOs, Benefits Managers, and Business Owners at companies with 
50+ employees who are frustrated by rising healthcare costs.

YOUR GOAL:
Get a 20 minute intro call. Not a sale. Be curious not pushy.
Focus on their pain not our features.

TONE AND STYLE RULES:
Write like a real person typing fast between meetings not like a marketer.
Keep every email under 60 words in the body. Under 40 is even better for follow ups.
Write the entire body as one flowing paragraph with no line breaks between thoughts.
No bullet points, no bold, no dashes, no hyphens, no colons used for effect, no em dashes.
No symbols of any kind that make it look formatted or AI written.
Do not capitalize the first word after the greeting. Sentences can start lowercase.
Use loose contractions like "thats" "youre" "ill" "dont" "ive" "havent".
Never use words like "synergy", "game changer", "revolutionary", "best in class", "solution", "leverage", "streamline".
Never use phrases like "I hope this finds you well" or "I wanted to reach out" or "please do not hesitate".
The sign off is always exactly: Seth Christensen | The PHMP
Do NOT mention KBA by name.
`;

// -------------------------------------------------------------------
// 8-STEP SEQUENCE
// -------------------------------------------------------------------
const SEQUENCE = [
  {
    day: 0,
    subject: "quick question",
    research: true,
    goal: `Email 1 — THE HOOK. Open with one genuine specific observation about their company from the research below. If nothing useful reference a challenge common in their industry. Connect it to a soft question about their employee benefits or healthcare costs. End with a gentle ask for a 20 minute call. Do NOT name the PHMP yet.`
  },
  {
    day: 3,
    subject: null,
    research: false,
    goal: `Email 2 — THE COST ANGLE. Different approach from email 1. Lead with a striking stat about rising healthcare costs. Premiums up 71% since 2010, deductibles up 123%, or 40% of employees skipping care. Mention you have helped similar companies improve benefits without net cost to the employer. One question at the end.`
  },
  {
    day: 7,
    subject: null,
    research: false,
    goal: `Email 3 — THE EMPLOYEE ANGLE. Flip to the employee side. 40% of employees delay care, 6 in 10 cannot cover a $500 medical bill. Then pivot: there is a way to put real money back in employees pockets. 95% of participants see take home pay go up just for doing basic health stuff. One question.`
  },
  {
    day: 14,
    subject: null,
    research: true,
    goal: `Email 4 — THE PROOF. Drop the hard numbers. 11 to 17% reduction in medical spending confirmed across 5 independent studies. 98% of companies see their cost trend fall below the national average in year one. Seven patents. A+ rated carrier. Frame it as thought this might be worth sharing. Soft ask for a call.`
  },
  {
    day: 21,
    subject: null,
    research: false,
    goal: `Email 5 — PATTERN INTERRUPT. Two to three sentences maximum after four longer emails. Something like: still worth 20 minutes? I can show you exactly how this would work at a company your size no pitch deck just numbers. That is it nothing else.`
  },
  {
    day: 25,
    subject: null,
    research: false,
    goal: `Email 6 — THE REFERRAL ASK. Stop asking for the meeting. Ask for the right person instead. If benefits decisions do not sit with them who should you be talking to. CFO HR director benefits manager. Frame it as you do not want to keep interrupting their day if there is a better person to speak with.`
  },
  {
    day: 30,
    subject: null,
    research: false,
    goal: `Email 7 — THE BREAKUP. Most important email in the sequence. Genuine and slightly self aware. Something like: ive reached out a few times and havent heard back which is completely fine. should i stop reaching out? just want to make sure im not being annoying if the timings just off. That is essentially it. No features no recap no apology. Keep it honest and brief.`
  },
  {
    day: 35,
    subject: null,
    research: false,
    goal: `Email 8 — THE WARM CLOSE. Final email warm no pressure. Let them know you wont keep reaching out. Whenever the benefits conversation comes up you would love to be a resource even just a sounding board no agenda. Leave the door genuinely open. Good last impression.`
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
// STEP 1: Auto-enroll new contacts owned by Seth with blank sequence
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
          content: `Search for recent news about the company "${contact.company}" located in ${contact.city || ""} ${contact.state || ""} industry ${contact.industry || "unknown"}. Find recent news expansions hiring funding leadership changes or anything relevant to an HR or benefits conversation. Return ONLY 2 to 3 sentences of plain text. If nothing useful return exactly: No notable recent news found.`,
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
- End with exactly this on a new line: Seth Christensen | The PHMP
- No subject line, no bullet points, no bold, no dashes, no hyphens, no symbols
- Under 60 words in the body
- Do not capitalize the first word of the body after the greeting
- Loose contractions are good: "thats" "youre" "ill" "dont"`;

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
// STEP 6a: Send Email 1 — fresh thread, capture Message-ID
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

  // Wait then fetch the Message-ID for threading
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
    // Fallback: send with Re: subject
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
// STEP 7: Update HubSpot — step + thread info + log email
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

  // Log email in HubSpot timeline
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
    const token = await getOutlookToken();
    console.log("  ✅ Connected\n");

    // Auto-enroll new contacts owned by Seth
    await enrollNewApolloContacts();
    console.log("");

    // Small pause so HubSpot indexes newly enrolled contacts
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

        if (step === 0) {
          const threadId = await sendFirstEmail(token, contact, subject, body);
          await updateHubSpot(contact, body, subject, step + 1, threadId, subject);
        } else {
          const threadSubject = contact.threadSubject || `quick question`;
          await sendReplyEmail(token, contact, body, contact.threadId, threadSubject);
          await updateHubSpot(contact, body, null, step + 1, null, null);
        }

        sent++;

        const randomDelay = Math.floor(Math.random() * (18 - 4 + 1) + 4) * 60 * 1000;
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
