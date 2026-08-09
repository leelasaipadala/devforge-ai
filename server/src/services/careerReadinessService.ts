export interface IWeightConfig {
  skills: number;     // e.g. 0.25
  resume: number;     // e.g. 0.15
  github: number;     // e.g. 0.15
  projects: number;   // e.g. 0.20
  interview: number;  // e.g. 0.15
  learning: number;   // e.g. 0.10
}

export interface IReadinessBreakdown {
  overallScore: number;
  statusCategory: 'Needs Attention' | 'Developing' | 'Competitive' | 'Job Ready';
  weights: IWeightConfig;
  categories: {
    skillsScore: number;
    resumeScore: number;
    githubScore: number;
    projectsScore: number;
    interviewScore: number;
    learningScore: number;
  };
  recommendations: string[];
  disclaimer: string;
}

export class CareerReadinessService {
  /**
   * Central Configurable Weights Location
   */
  public static WEIGHT_CONFIG: IWeightConfig = {
    skills: 0.25,     // 25%
    resume: 0.15,     // 15%
    github: 0.15,     // 15%
    projects: 0.20,   // 20%
    interview: 0.15,  // 15%
    learning: 0.10,   // 10%
  };

  /**
   * Target role skill benchmarks dictionary
   */
  public static ROLE_BENCHMARKS: Record<string, string[]> = {
    'Frontend Developer': ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'Git', 'REST APIs', 'Testing'],
    'Backend Developer': ['Java', 'Node.js', 'Express', 'Python', 'SQL', 'MongoDB', 'REST APIs', 'Docker', 'Git', 'System Design'],
    'Full Stack Developer': ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'SQL', 'MongoDB', 'Git', 'REST APIs', 'Docker'],
    'AI/ML Engineer': ['Python', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'SQL', 'Git', 'Math/Statistics', 'NLP', 'Computer Vision', 'Docker'],
    'Data Analyst': ['Python', 'SQL', 'Excel', 'Tableau', 'PowerBI', 'Pandas', 'Statistics', 'Data Visualization', 'Git'],
    'Data Scientist': ['Python', 'SQL', 'R', 'Pandas', 'NumPy', 'Scikit-Learn', 'Machine Learning', 'Statistics', 'Data Visualization'],
    'DevOps Engineer': ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Terraform', 'Python', 'Bash', 'Git', 'Networking'],
    'Mobile Developer': ['Swift', 'Kotlin', 'React Native', 'Flutter', 'iOS', 'Android', 'REST APIs', 'Git', 'State Management'],
    'Other': ['Git', 'Data Structures', 'Algorithms', 'SQL', 'Problem Solving', 'System Architecture'],
  };

  /**
   * Calculate overall career readiness score deterministically
   */
  public static calculateReadinessScore(params: {
    targetRole: string;
    skills: { name: string; proficiency: string }[];
    resumeScore?: number;
    githubScore?: number;
    projectCount?: number;
    completedProjects?: number;
    avgInterviewScore?: number;
    weeklyLearningHours?: number;
  }): IReadinessBreakdown {
    const {
      targetRole,
      skills,
      resumeScore = 0,
      githubScore = 0,
      projectCount = 0,
      completedProjects = 0,
      avgInterviewScore = 0,
      weeklyLearningHours = 10,
    } = params;

    // 1. Deterministic Skills Score (25%)
    const requiredSkills = this.ROLE_BENCHMARKS[targetRole] || this.ROLE_BENCHMARKS['Full Stack Developer'];
    const userSkillNames = new Set(skills.map((s) => s.name.toLowerCase()));

    let matchedCount = 0;
    requiredSkills.forEach((reqSkill) => {
      if (userSkillNames.has(reqSkill.toLowerCase())) {
        matchedCount++;
      }
    });

    const skillCoverage = requiredSkills.length > 0 ? (matchedCount / requiredSkills.length) * 100 : 0;
    const proficiencyBonus = skills.reduce((acc, curr) => {
      if (curr.proficiency === 'Expert') return acc + 10;
      if (curr.proficiency === 'Advanced') return acc + 7;
      if (curr.proficiency === 'Intermediate') return acc + 4;
      return acc + 2;
    }, 0);

    const skillsScore = Math.min(100, Math.round(skillCoverage * 0.8 + Math.min(20, proficiencyBonus)));

    // 2. Deterministic Resume Score (15%)
    const effectiveResumeScore = Math.min(100, resumeScore);

    // 3. Deterministic GitHub Score (15%)
    const effectiveGithubScore = Math.min(100, githubScore);

    // 4. Deterministic Projects Score (20%)
    let projectsScore = 0;
    if (completedProjects >= 3) projectsScore = 100;
    else if (completedProjects === 2) projectsScore = 85;
    else if (completedProjects === 1) projectsScore = 65;
    else if (projectCount > 0) projectsScore = 40;
    else projectsScore = 0;

    // 5. Deterministic Interview Score (15%)
    const effectiveInterviewScore = Math.min(100, avgInterviewScore);

    // 6. Deterministic Learning Score (10%)
    const learningScore = Math.min(100, Math.round((weeklyLearningHours / 20) * 100));

    // Weighted Deterministic Overall Calculation
    const overallScore = Math.round(
      skillsScore * this.WEIGHT_CONFIG.skills +
      effectiveResumeScore * this.WEIGHT_CONFIG.resume +
      effectiveGithubScore * this.WEIGHT_CONFIG.github +
      projectsScore * this.WEIGHT_CONFIG.projects +
      effectiveInterviewScore * this.WEIGHT_CONFIG.interview +
      learningScore * this.WEIGHT_CONFIG.learning
    );

    let statusCategory: 'Needs Attention' | 'Developing' | 'Competitive' | 'Job Ready' = 'Needs Attention';
    if (overallScore >= 80) statusCategory = 'Job Ready';
    else if (overallScore >= 65) statusCategory = 'Competitive';
    else if (overallScore >= 45) statusCategory = 'Developing';

    // Tailored Recommendations
    const recommendations: string[] = [];
    if (skillsScore < 60) {
      const missing = requiredSkills.filter((s) => !userSkillNames.has(s.toLowerCase())).slice(0, 3);
      if (missing.length > 0) {
        recommendations.push(`Add core skills for ${targetRole}: ${missing.join(', ')}.`);
      }
    }

    if (effectiveResumeScore < 50) {
      recommendations.push('Upload and analyze your resume to identify missing ATS keywords.');
    }

    if (effectiveGithubScore < 50) {
      recommendations.push('Connect your authorized GitHub account to showcase public repository activity.');
    }

    if (completedProjects < 2) {
      recommendations.push('Complete at least 2 full-stack portfolio projects highlighting target technologies.');
    }

    if (effectiveInterviewScore < 60) {
      recommendations.push('Practice technical interview sessions in DSA and core framework questions.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Maintain learning consistency, update project live URLs, and apply to openings.');
    }

    return {
      overallScore,
      statusCategory,
      weights: this.WEIGHT_CONFIG,
      categories: {
        skillsScore,
        resumeScore: effectiveResumeScore,
        githubScore: effectiveGithubScore,
        projectsScore,
        interviewScore: effectiveInterviewScore,
        learningScore,
      },
      recommendations,
      disclaimer: 'The DevForge Career Readiness Score is calculated deterministically by the backend using configurable weighted category metrics. It is an internal benchmark indicator.',
    };
  }
}
