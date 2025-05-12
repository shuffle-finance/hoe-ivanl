# Order of action

## 1. Fix Vulnerability
This can be a reputational and existential problem for the entire company.

I would fix the vulnerability first and consider it a P1. We may drop all
other feature development and focus up to the entire dev team on this and
likely get the time required down by 50%. The steps I would take would be
to treat this like a production incident
- Triage and reproduction of issue
- Look for root cause
- Look for mitigations
- Apply perm fixes (in prioritised order)

## 2. Find Cost Savings
Doubling of costs without equivalent increase of usage or revenue is a
big concern as it reduces the runway dramatically.

Here are some areas I would look at in order of ease + possible impact
- Office hours only dev and test envs and schedule auto shutdown hours
- Adding indexes, compound ones, secondaries, etc
- Limiting queries to 1 (if known)
- Individual query tuning for high volume used queries (if APM available)
- Committing to reserved instances for databases
- Pagination
- Adding (cheaper) caches instead of querying
- Consider arbitrage or spot instances for non prod

I would agree with the CFO on a stopping point because optimization is
an open ended task.

## 3. Developer Productivity
Test coverage limits should not be easily relaxed despite the delay.

Similar to the security issue, I would triage, look for RC and then for
mitigations. Perhaps build steps need to be split up?

## 4. Junior Developer Mentoring
While we focus on the vulnerability, I will assign basic tasks from
1 and 2 to the Junior. E.g. looking for simple SQL queries to optimise,
or identifying unused resources (but not taking final action until 
approved by me or another dev)

I will also ask the junior developer to make much smaller changes in
their PRs. A practice that everyone should do anyway. I will monitor
over a couple of sprints before taking more drastic action. 

## Won't Do Onboarding Portal
I would defer the building of a portal. We have only one city so far 
and we should know more about the different processes for more cities
before  building something. Furthermore, onboarding is not a new
thing and has been done by Ops before. Processes can be improved much
faster than coding a new system from scratch. I don't believe we have
a design or UX of it yet.

My recommendation is to suggest some Ops automation tools, e.g. Zapier
Typeform, or event CRM tools would have features that can be used by
Ops for Ops.

Introducing a new system now will generate more distractions and bugs

## Open Questions
- Was there a roadmap that we could have known when Liverpool was being
launched?
- Cost monitoring should be part of Eng ownership, with automated alarms
and reviewed regularly before it got to 2 x