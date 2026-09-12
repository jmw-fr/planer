# PRD - Sports Training Planning Management Software

## 1. General information
- **Product name**: Planer Sport
- **Document version**: 1.0
- **Date**: 2026-04-19
- **Author**: Product Team
- **Status**: Draft validated for MVP scoping

## 2. Context and problem statement
Coaches, clubs and individual athletes often use several disconnected tools (spreadsheets, messaging apps, generic calendars) to organize sessions, track training loads and communicate changes. This causes:
- scheduling errors,
- a lack of visibility for athletes,
- difficulty tracking load and progression,
- administrative time loss for staff.

The product aims to centralize sports planning, execution tracking and operational communication in a single piece of software.

## 3. Product vision
Enable any sports organization to plan, adapt and track training in a simple, reliable and collaborative way, in order to improve consistency, performance and injury prevention.
The product is available on two complementary channels: a mobile application (athletes and coaches on the move) and a web interface (coaches, managers, administration).

## 4. Business objectives
1. Reduce the administrative time spent creating and updating schedules by 40%.
2. Increase the average session attendance rate by 15% within 6 months.
3. Reach a 70% weekly active adoption rate (WAU) among registered users.
4. Provide a monetizable base via club subscriptions and independent coach subscriptions.

## 5. User objectives
1. Build a weekly/monthly schedule in a few minutes.
2. Receive clear notifications when something changes.
3. Easily report completion, perceived load and feelings.
4. Visualize individual and collective progress.
5. Coordinate coaches, athletes and medical staff around a single source of truth.
6. Allow the athlete to follow their session in real time, with the exercises to perform displayed at each step.
7. Allow the coach to plan a full season with different training phases.

## 6. Target personas
### 6.1 Head coach
- Manages several groups and training cycles.
- Need: plan quickly, adjust easily, track adherence and fatigue.

### 6.2 Athlete
- Follows an individual or collective program.
- Need: view their sessions, receive reminders, record feedback.

### 6.3 Club manager / sports manager
- Oversees organization and tracking quality.
- Need: global view of groups, attendance rate, load, incidents.

### 6.4 Physical trainer / medical staff
- Tracks load and fatigue/risk signals.
- Need: access to relevant data, threshold alerts, coordination with the coach.

## 7. Scope
### 7.1 In scope (MVP)
- Account and role management (admin, coach, athlete, staff).
- Dedicated mobile application (iOS/Android) for viewing, notifications and post-session feedback.
- Dedicated web interface for advanced planning, administration and reporting.
- Training season planning with phases (general preparation, specific preparation, competition, transition).
- Creation of training plans (session, microcycle, mesocycle).
- Individual and collective calendar.
- Real-time training follow-up mode on mobile (exercise sequence, duration, rest, progression).
- Creation and management of reusable exercise templates.
- Physiotherapy (physio) sessions for athletes in rehabilitation or prevention.
- Recovery sessions (self-massage, walking, yoga, etc.) for athletes in prevention or post-effort.
- Basic external integrations (Google/Outlook calendar, push notifications).
- Defined technical dependencies (technology stack, architecture).
- Library of predefined exercise templates per sport.
- Attendance/absence tracking and management.
- Change notifications (email/push).
- Post-session input (completed/not completed, RPE, comment).
- Tracking dashboard (weekly load, adherence, consistency).
- Basic exercise library.

### 7.2 Out of scope (MVP)
- AI for automatic generation of personalized plans.
- Advanced video coaching and biomechanical analysis.
- Marketplace for external programs.
- Complex integrated multi-entity billing.

## 8. Key assumptions
- Clubs are willing to migrate from spreadsheets to a dedicated tool.
- Athletes provide at least simple feedback after each session.
- Coaches use the software calendar as their main communication channel.

## 9. Functional requirements
### 9.1 Authentication and accounts
- Secure sign-up and sign-in.
- Password recovery.
- Role and permission management per organization.

### 9.2 Sports organization
- Creation of an organization (club/academy).
- Creation of groups (e.g. U18, Elite, Return-to-play).
- Assignment of athletes and staff members.

### 9.3 Training planning
- Creation of sessions with:
  - date/time,
  - location,
  - objective,
  - content (warm-up, main block, cool-down),
  - duration,
  - target intensity,
  - required equipment.
- Duplication of sessions and reusable templates.
- Recurring scheduling (e.g. every Tuesday at 6pm).
- Drag-and-drop in the calendar (web).

### 9.4 Season and phase planning
- The coach can create a season with a start date and an end date.
- The coach can define several season phases (e.g. general preparation, specific preparation, competition, transition) with a period, an objective and a target intensity level.
- The coach can associate mesocycles/microcycles with each phase.
- The coach can view the season on a timeline/calendar with color-coded phases.
- The coach can adjust phase dates and propagate the shifts to the associated sessions.

### 9.5 Execution tracking and feedback
- Attendance/absence/lateness tracking.
- Session completion validation by the athlete.
- RPE input (scale 1 to 10) and free-text feelings.
- Simple internal load calculation: load = duration (min) x RPE.

### 9.6 Communication
- Automatic notifications on:
  - new session,
  - modification,
  - cancellation,
  - reminder before a session.
- Comment channel per session.

### 9.7 Reporting and dashboards
- Coach view: adherence, absences, weekly load per athlete.
- Manager view: group activity, participation rate, monthly trends.
- CSV export of key data.

### 9.8 Administration
- Configuration of sports, session types, tags.
- Minimal activity log (who changed what and when).

### 9.9 Exercise templates
- The coach can create an exercise template with the fields: name, category, objective, description, equipment, target duration or reps/sets, rest time, safety instructions.
- The coach can edit, archive and duplicate an exercise template.
- A template can be shared at the group or organization level depending on permissions.
- Templates can be selected when creating a session on the web interface.
- Templates used in a session are displayed in the real-time guided mode on mobile.
- The software supports exercises from various disciplines (strength training, running, swimming, etc.) to enrich sessions for a main sport, with categorization by exercise type and originating sport.

### 9.10 Channels and functional parity
- The software must include a mobile application and a web interface.
- The mobile application primarily targets athlete and field-coach journeys: viewing the schedule, notifications, session validation, RPE/comment input.
- The web interface primarily targets coach/manager/admin journeys: detailed planning, group management, reporting, configuration.
- Data must be synchronized in real time or near real time between mobile and web.
- Access rights and permissions must be consistent across both channels.

### 9.11 Real-time training tracking (mobile)
- The athlete can start a session from the mobile application in guided mode.
- The application displays in real time the current exercise, the target reps/sets or duration, and the rest time.
- The application automatically indicates the next exercise and progress within the session (step x/y).
- The athlete can mark an exercise as completed, pause and resume the session.
- Session adjustments published by the coach are visible in near real time on the active mobile session.

### 9.12 Physiotherapy sessions
- The physiotherapist can create individual or group physio sessions with medical objectives (rehabilitation, prevention, strengthening).
- Physio sessions can include mobility exercises, stretching, proprioception, targeted muscle strengthening.
- The physiotherapist can attach private medical notes to each session (not visible to athletes).
- Athletes can follow a physio session in mobile guided mode similar to training sessions.
- Medical staff can track adherence and post-session feedback for physio sessions via the dashboard.
- Physio sessions are distinguished from training sessions in the calendar (different color/code).

### 9.13 Recovery sessions
- The coach or physical trainer can create individual or collective recovery sessions (self-massage, walking, yoga, passive stretching, etc.).
- Recovery sessions can be scheduled preventively (e.g. post-match) or in response to a detected high load.
- Athletes can follow a recovery session in mobile guided mode with duration reminders and simple instructions.
- Post-recovery feedback can include a feeling of freshness or residual fatigue.
- Recovery sessions are distinguished in the calendar (different color/code) and can be marked as optional.

### 9.14 External integrations
- Two-way synchronization with external calendars (Google Calendar, Outlook) to import/export sessions.
- Push notifications via Azure Notification Hubs for session reminders and modifications.
- CSV/JSON export of key data (schedule, attendance, load) for integration with third-party tools.
- Ability to import data from existing Excel spreadsheets for initial migration.

### 9.15 Technical dependencies and architecture
- Web frontend: Blazor with C# for the coach/manager interface (code sharing with the backend).
- Mobile frontend: Flutter for iOS/Android applications.
- Backend: ASP.Net Core with C# and SQL Server or PostgreSQL database.
- Architecture: RESTful API with JWT authentication, cloud storage (Azure/AWS S3), containerized deployment (Docker).
- Security: TLS 1.3 encryption, GDPR compliance with audit trails.

## 10. Non-functional requirements
### 10.1 Performance
- Weekly calendar load time < 2 seconds for 95% of requests.
- Post-session feedback save < 1 second for 95% of requests.
- Next exercise display in mobile guided mode < 500 ms for 95% of transitions.

### 10.2 Security and compliance
- TLS encryption in transit.
- Strong password hashing.
- Strict role-based access control.
- GDPR compliance: consent, right of access, right to erasure, data minimization.

### 10.3 Availability
- MVP target SLA: 99.5% monthly.
- Daily backups and tested restoration.

### 10.4 Scalability
- Support for 100 organizations, 50,000 athletes in the database, without major degradation.

### 10.5 Accessibility and UX
- Responsive interface for mobile and desktop.
- Main journey achievable in fewer than 3 actions to view the next session.
- Compliance with accessibility best practices (contrast, keyboard navigation, labels).

## 11. Key user journeys
### 11.1 Coach creates a microcycle
1. Selects their group.
2. Defines the target season phase and its objectives.
3. Adds 4 sessions for the week via a template.
4. Adjusts the objectives and target intensity.
5. Publishes the schedule and notifies the group.

### 11.2 Athlete views and validates
1. Opens the application.
2. Views their next session.
3. Starts the real-time guided mode and follows the proposed exercises and rest times.
4. Validates each step of the session until completion.
5. Enters RPE and a comment at the end of the session.

### 11.3 Manager tracks activity
1. Opens the global dashboard.
2. Compares attendance rates by group.
3. Exports monthly data for internal reporting.

### 11.4 Physiotherapist manages a rehabilitation session
1. Selects the athlete in rehabilitation.
2. Creates a physio session with targeted exercises (stretching, strengthening).
3. Adds private medical notes.
4. Publishes the session and tracks adherence via the dashboard.

### 11.5 Coach schedules a recovery session
1. Identifies a recovery need (post-match or detected high load).
2. Creates a collective recovery session (walking, self-massage, yoga).
3. Marks the session as optional.
4. Publishes it and tracks voluntary adherence via the dashboard.

## 12. KPIs and success metrics
- Average attendance rate per group.
- Rate of sessions with complete feedback.
- WAU/MAU by user role.
- Average time to publish a weekly schedule.
- Average number of schedule modifications per week.
- Coach NPS and athlete NPS.

## 13. Prioritization (MoSCoW)
### Must have
- Roles and permissions
- Session calendar
- Season planning with phases
- Creation and reuse of exercise templates
- Change notifications
- Attendance + RPE feedback
- Basic adherence/load dashboard

### Should have
- Advanced templates by sport
- Enriched CSV export
- Fatigue alerts based on RPE threshold
- Basic physiotherapy sessions
- Collective recovery sessions

### Could have
- Wearable integration (Garmin, Polar)
- Automatic deload suggestions

### Won't have (MVP)
- Fully generative AI plans
- Automated video analysis

## 14. Constraints and dependencies
- Availability of a notification sending service (email/push).
- Definition of a common exercise reference library per sport.
- Legal GDPR validation and data retention policy.
- Staff capacity to support the change in usage.

## 15. Risks and mitigations
1. **Low athlete adoption**
   - Mitigation: ultra-simple mobile UX, automated reminders, guided onboarding.
2. **Input overload for coaches**
   - Mitigation: templates, duplication, initial CSV import.
3. **Heterogeneous data quality**
   - Mitigation: standardized fields + minimal validations.
4. **Sensitivity of health data**
   - Mitigation: strict access control, traceability, data minimization.

## 16. Release plan
### Phase 0 - Scoping (2 to 3 weeks)
- Business workshops, MVP scope validation, main mockups.

### Phase 1 - MVP (8 to 12 weeks)
- Auth, roles, calendar, notifications, attendance, feedback, basic dashboard.

### Phase 2 - Stabilization (3 to 4 weeks)
- Fixes, performance optimization, KPI instrumentation.

### Phase 3 - Evolution (post-MVP)
- External integrations, advanced alerts, enhanced analytics.

## 23. Batch 2 - Post-MVP evolution
### 23.1 Detailed success metrics
- Define target thresholds for each KPI (e.g. attendance rate >85%, NPS >7/10).
- Add technical metrics (response time, error rate, user retention).
- Competitive benchmarks and detailed user satisfaction analysis.

### 23.2 Extended risk analysis and mitigation
- Technical risks (scalability, medical data security).
- Business risks (club adoption, competition).
- Business continuity plan (backup, disaster recovery).

### 23.3 Test and validation scenarios
- Pilot user tests with partner clubs.
- Quality criteria (WCAG accessibility, mobile performance).
- Regulatory compliance validation (GDPR, health data).

### 23.4 Estimated budget and resources
- Development cost estimate for MVP and Batch 2.
- Required team (developers, designers, PM).
- Recruitment and training plan.

### 23.5 Maintenance and evolution
- User support plan (hotline, FAQ, tutorials).
- Batch 2 roadmap (priority features: AI, wearables, analytics).
- Detailed monetization strategy (subscriptions, premium features).

## 17. MVP acceptance criteria
1. A coach can create and publish a complete weekly schedule for a group.
2. An athlete can view their sessions and submit post-session feedback in under 60 seconds.
3. Any session modification sends a notification to the relevant members.
4. A manager can view a monthly attendance and load report.
5. User data complies with the defined GDPR requirements.
6. Critical MVP journeys are available on both the mobile application and the web interface according to their defined usages.
7. An athlete can follow a session in real time on mobile with a dynamic display of the current exercise and the next one.
8. A coach can plan a complete season with at least 3 phases and associate training cycles with each phase.
9. A physiotherapist can create and assign individual physio sessions with adherence tracking.
10. A coach can schedule collective recovery sessions with optional adherence tracking.

## 18. Open questions
- Should nutrition/sleep objectives be included in the MVP or a later phase?
- What level of customization per sports discipline is required at launch?
- Which notification channel is the priority per segment (email, push, SMS)?

## 19. Appendices (optional)
- Glossary: microcycle, mesocycle, RPE, internal load.
- Screen mockups (to be added).
- Initial data schema (to be added).

## 22. Examples of predefined exercise templates
### Football - General strength training session
- Squats: 4 sets x 10 reps
- Forward lunges: 3 sets x 12 reps/leg
- Push-ups: 3 sets x 15 reps
- Pull-ups (assisted): 3 sets x 8 reps
- Core bracing: 3 sets x 30 seconds

### Basketball - Coordination and agility session
- Vertical jumps: 4 sets x 8 reps
- Technical dribbling: 3 sets x 2 minutes
- Shooting drills: 3 sets x 20 shots
- Single-leg balance: 3 sets x 30 seconds/leg
- Dynamic yoga: 3 sets x 5 minutes

### Swimming - Endurance session
- Continuous freestyle: 10 x 100m with 20s rest
- Technical breaststroke: 8 x 50m with 30s rest
- Backstroke: 6 x 75m with 45s rest
- Swimming with fins: 4 x 200m with 1min rest

### Recovery - Post-match session
- Active walking: 20 minutes at a moderate pace
- Thigh self-massage: 5 minutes per leg
- Passive stretching: 10 minutes (quadriceps, hamstrings, adductors)
- Deep breathing: 5 minutes of meditation

### Physiotherapy - Knee strengthening
- Isometric squats: 3 sets x 20 seconds
- Straight leg raises: 3 sets x 15 reps
- Seated leg curls: 3 sets x 12 reps
- Single-leg proprioception: 3 sets x 30 seconds
- Joint mobility: 5 minutes of gentle rotations

## 20. Indicative list of supported sports and exercises
### Main target sports (examples)
- Football
- Basketball
- Rugby
- Handball
- Volleyball
- Tennis
- Swimming
- Athletics
- Cycling
- Orienteering
- Martial arts (judo, karate, etc.)
- Gymnastics
- Dance

### Cross-disciplinary exercises (strength training, running, swimming, etc.)
- **Strength training**: squats, lunges, push-ups, pull-ups, bench press, deadlift, etc.
- **Running**: interval training, endurance, fartlek, sprint, Nordic walking, etc.
- **Swimming**: freestyle, breaststroke, backstroke, swimming with fins, etc.
- **Mobility/Physical preparation**: yoga, pilates, dynamic stretching, core bracing, etc.
- **Coordination**: proprioception exercises, jumps, balance, etc.
- **Conditioning**: circuit training, HIIT, tabata, etc.
- **Physiotherapy**: therapeutic stretching, targeted muscle strengthening, joint mobility, medical proprioception, etc.
- **Recovery**: self-massage, active walking, restorative yoga, passive stretching, breathing, etc.

### Concrete examples of multi-sport exercises in a session
- **Football session with strength training**: running warm-up + squats + technical dribbling + bench press + small-sided game.
- **Basketball session with swimming**: swimming warm-up + push-ups + shooting drills + core bracing + endurance swimming.
- **Rugby session with running**: interval training + tackling technique + squats + fartlek + stretching.

This list is extensible via admin configuration and can be enriched by users (custom templates).

## 20. Mini user story map - Real-time guided mode (mobile)
### Activity 1 - Prepare the session
- As an athlete, I want to see today's session so I can check its content before starting it.
- As an athlete, I want to download the session to my mobile to limit the impact of an unstable connection.

### Activity 2 - Start the guided mode
- As an athlete, I want to start the session in 1 action so I can begin quickly.
- As an athlete, I want to see the overall session objective (total duration, number of exercises) at start-up.

### Activity 3 - Perform each exercise
- As an athlete, I want to see the current exercise with instructions (sets/reps or duration) so I can perform it correctly.
- As an athlete, I want to see a timer and rest times so I can follow the expected pace.
- As an athlete, I want to mark the exercise as completed so I can move to the next step.

### Activity 4 - Manage the pace during the session
- As an athlete, I want to pause and resume the session so I can adapt to my actual context.
- As an athlete, I want to go back to the previous exercise in case of a validation mistake.

### Activity 5 - Adapt to coach changes
- As an athlete, I want to receive session changes published by the coach in near real time.
- As an athlete, I want to be clearly informed when an exercise is replaced or adjusted.

### Activity 6 - Close out and submit feedback
- As an athlete, I want to finish the session and see a summary (duration, completed exercises, deviations).
- As an athlete, I want to enter my RPE and a comment so I can share my feelings with the coach.

### Recommended MVP slice
- View today's session.
- Start the session in guided mode.
- Display current + next exercise, timer and rest.
- Validate a step, pause/resume.
- Close out the session with RPE/comment.

### Recommended post-MVP slice
- Full offline mode with smart resynchronization.
- Automatic pace adaptation based on live progression.
- Audio guidance and real-time wearable integration.

## 21. Concrete example - Typical season (10 months)
### Calendar assumption
- Season start: September
- Season end: June
- Context: team sport with 1 official match per week during the competitive period

### Phase 1 - General preparation (weeks 1 to 8)
- Main objective: build the physical base (endurance, general strength, mobility).
- Training volume: high.
- Average intensity: moderate.
- Indicative breakdown: 60% general physical, 25% technical, 15% tactical.
- Phase KPI: attendance, load tolerance, progression on basic physical tests.

### Phase 2 - Specific preparation (weeks 9 to 14)
- Main objective: transfer the gains toward the discipline's specific requirements.
- Training volume: medium to high.
- Average intensity: moderate to high.
- Indicative breakdown: 35% specific physical, 35% technical, 30% tactical.
- Phase KPI: quality of game scenario execution, RPE control, reduced gaps between positions.

### Phase 3 - Competition 1 (weeks 15 to 26)
- Main objective: maximize match performance and maintain freshness.
- Training volume: medium.
- Average intensity: high on targeted sessions, lighter the day before a match.
- Indicative breakdown: 20% maintenance physical, 35% technical, 45% tactical.
- Phase KPI: athlete availability, match performance, load maintained without overreaching.

### Phase 4 - Intermediate transition (weeks 27 to 29)
- Main objective: active recovery and injury prevention.
- Training volume: low.
- Average intensity: low to moderate.
- Indicative breakdown: 50% recovery/mobility, 30% light technical, 20% playful activities.
- Phase KPI: reduced perceived fatigue, motivation returning, absence of overuse injuries.

### Phase 5 - Competition 2 (weeks 30 to 40)
- Main objective: peak performance at the end of the season.
- Training volume: medium.
- Average intensity: high with planned deload microcycles.
- Indicative breakdown: 20% maintenance physical, 30% technical, 50% tactical.
- Phase KPI: sporting form, consistency of results, adherence to the deload plan.

### Example of associated planning rules
- Rule 1: every phase must contain at least 1 mesocycle and 2 microcycles.
- Rule 2: during the competition phase, automatically block a post-match recovery day.
- Rule 3: trigger an alert if weekly load increases by more than 20% over 2 consecutive weeks.
- Rule 4: enforce a lighter week every 4 to 6 weeks depending on the group's level.

### Expected product value
- Give the coach both a macro (season) and micro (session) view in a single tool.
- Align sports and medical staff around an explicit periodization.
- Facilitate load trade-offs thanks to readable, measurable phases.