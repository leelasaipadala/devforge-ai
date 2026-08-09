# DATABASE.md - Database Schema Reference

DevForge AI uses Mongoose schemas on MongoDB Atlas with automatic fallback memory caching.

## Core Models

1. **`UserProfile`**
   - `clerkId` (String, Indexed, Unique)
   - `email`, `name`, `targetRole`, `careerGoal`, `weeklyLearningHours`, `githubUsername`
   - `readinessScore` (Number)

2. **`Skill`**
   - `userId` (String, Indexed)
   - `name`, `category`, `proficiency`, `learningStatus`, `notes`

3. **`Roadmap`**
   - `userId`, `targetRole`, `title`, `phases` array (items, completion, estimated effort)

4. **`ResumeAnalysis`**
   - `userId`, `fileName`, `atsScore`, `sectionScores`, `foundKeywords`, `missingKeywords`, `suggestions`

5. **`GitHubProfile`**
   - `userId`, `username`, `score`, `publicRepos`, `topLanguages`, `repositories`, `strengths`, `improvements`

6. **`Project`**
   - `userId`, `title`, `description`, `technologies`, `githubUrl`, `liveUrl`, `status`, `difficulty`

7. **`InterviewSession`**
   - `userId`, `category`, `difficulty`, `mode`, `overallScore`, `questions` (userAnswer, feedback, score)

8. **`JobApplication`**
   - `userId`, `company`, `position`, `location`, `status`, `salaryRange`, `interviewDate`

9. **`AIConversation`**
   - `userId`, `title`, `messages` (role, content, timestamp)

10. **`Activity`**
    - `userId`, `type`, `title`, `description`, `metadata`
