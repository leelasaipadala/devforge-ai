'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Check, ChevronLeft, Search, GraduationCap, Building2, Layers, BookOpen, User } from 'lucide-react';
import { ApiClient } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { AuroraButton } from '@/components/AuroraButton';
import { AuroraBadge } from '@/components/AuroraBadge';
import { AuroraCard } from '@/components/AuroraCard';

const ROLE_CATEGORIES = [
  {
    category: 'Software Development',
    roles: [
      'Frontend Developer',
      'Backend Developer',
      'Full Stack Developer',
      'Software Engineer',
      'Software Developer',
      'Web Developer',
      'Mobile App Developer',
      'Android Developer',
      'iOS Developer',
      'Flutter Developer',
      'React Native Developer',
    ],
  },
  {
    category: 'AI & Data Science',
    roles: [
      'AI Engineer',
      'Machine Learning Engineer',
      'Deep Learning Engineer',
      'Generative AI Engineer',
      'NLP Engineer',
      'Computer Vision Engineer',
      'Data Scientist',
      'Data Analyst',
      'Data Engineer',
      'ML Researcher',
    ],
  },
  {
    category: 'Cloud & Infrastructure',
    roles: [
      'DevOps Engineer',
      'Cloud Engineer',
      'AWS Cloud Engineer',
      'Azure Cloud Engineer',
      'Google Cloud Engineer',
      'Site Reliability Engineer',
      'Platform Engineer',
      'Cloud Architect',
      'Solutions Architect',
    ],
  },
  {
    category: 'Cybersecurity',
    roles: [
      'Cybersecurity Analyst',
      'Security Engineer',
      'Application Security Engineer',
      'Ethical Hacker',
      'SOC Analyst',
      'Penetration Tester',
    ],
  },
  {
    category: 'Specialized Engineering',
    roles: [
      'Blockchain Developer',
      'Web3 Developer',
      'Game Developer',
      'Embedded Systems Engineer',
      'IoT Engineer',
      'QA Engineer',
      'Automation Test Engineer',
      'Software Testing Engineer',
      'Database Administrator',
      'Database Engineer',
      'System Administrator',
    ],
  },
  {
    category: 'Management & Research',
    roles: [
      'Product Engineer',
      'Technical Product Manager',
      'Engineering Manager',
      'Technical Consultant',
      'Research Engineer',
      'Other',
    ],
  },
];

const EXPERIENCE_LEVELS = [
  { label: 'High School / Pre-University', desc: 'Pre-college student interested in computer science and programming.' },
  { label: 'Undergraduate Student', desc: 'Currently pursuing a bachelor’s degree in CS, IT, or engineering.' },
  { label: 'Postgraduate Student', desc: 'Currently pursuing a master’s degree, M.Tech, MCA, or PhD.' },
  { label: 'Recent Graduate', desc: 'Recently completed a degree and preparing for entry-level tech roles.' },
  { label: 'Beginner / Entry Level', desc: 'Starting out in software development with early self-taught projects.' },
  { label: 'Junior Developer', desc: '0–2 years of hands-on professional development experience.' },
  { label: 'Mid-Level Professional', desc: '2–5 years of professional software engineering experience.' },
  { label: 'Senior Professional', desc: '5+ years of professional experience leading tech implementations.' },
  { label: 'Lead / Principal', desc: 'Architect, tech lead, engineering manager, or principal engineer.' },
  { label: 'Career Switcher', desc: 'Transitioning into software engineering from another industry.' },
  { label: 'Other', desc: 'Custom experience background.' },
];

const ALL_LANGUAGES = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C', 'C++', 'C#', 'Go', 'Rust',
  'Kotlin', 'Swift', 'Dart', 'PHP', 'Ruby', 'R', 'Scala', 'SQL', 'MATLAB',
  'Bash', 'PowerShell', 'Solidity', 'Lua', 'Perl',
];

const TECH_CATEGORIES = [
  {
    name: 'Frontend Frameworks & UI',
    items: ['React', 'Next.js', 'Vue', 'Nuxt', 'Angular', 'Svelte', 'SvelteKit', 'HTML', 'CSS', 'Tailwind CSS', 'Bootstrap'],
  },
  {
    name: 'Backend Frameworks',
    items: ['Node.js', 'Express.js', 'NestJS', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'ASP.NET', 'Laravel'],
  },
  {
    name: 'Databases & Storage',
    items: ['MongoDB', 'PostgreSQL', 'MySQL', 'SQLite', 'Redis', 'Firebase', 'Supabase', 'Oracle'],
  },
  {
    name: 'Cloud & Infrastructure',
    items: ['AWS', 'Microsoft Azure', 'Google Cloud', 'Vercel', 'Netlify', 'Cloudflare'],
  },
  {
    name: 'DevOps & Containers',
    items: ['Docker', 'Kubernetes', 'GitHub Actions', 'Jenkins', 'Terraform', 'Ansible', 'Nginx'],
  },
  {
    name: 'AI / ML & Data Science',
    items: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'Hugging Face', 'LangChain', 'OpenAI APIs', 'Google Gemini', 'Vector Databases'],
  },
  {
    name: 'Developer Tools & Workflow',
    items: ['Git', 'GitHub', 'GitLab', 'Postman', 'Figma', 'Jira', 'Notion'],
  },
  {
    name: 'Testing & QA',
    items: ['Jest', 'Vitest', 'Cypress', 'Playwright', 'Selenium'],
  },
];

const COMPANY_CATEGORIES = [
  {
    category: 'FAANG & Big Tech',
    companies: ['Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Netflix'],
  },
  {
    category: 'AI Pioneers',
    companies: ['NVIDIA', 'OpenAI', 'Anthropic'],
  },
  {
    category: 'Cloud & Dev Tools',
    companies: ['Vercel', 'Cloudflare', 'GitHub', 'GitLab', 'Figma', 'Notion', 'Linear', 'Datadog', 'Stripe', 'Shopify'],
  },
  {
    category: 'Global Product Tech',
    companies: ['Salesforce', 'Oracle', 'IBM', 'Intel', 'AMD', 'Cisco', 'Uber', 'Airbnb', 'Spotify', 'Atlassian'],
  },
  {
    category: 'Tech Services & Consulting',
    companies: ['Deloitte', 'Accenture', 'TCS', 'Infosys', 'Wipro', 'Cognizant', 'Capgemini'],
  },
  {
    category: 'Indian Tech & High-Growth SaaS',
    companies: ['Zoho', 'Freshworks', 'Razorpay', 'PhonePe', 'Swiggy', 'Zomato'],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const { refreshProfile, user } = useAuth();
  
  // Form State
  const [name, setName] = useState(user?.name || 'DevForge Developer');
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [roleSearch, setRoleSearch] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Undergraduate Student');

  // Education state
  const [educationLevel, setEducationLevel] = useState('Undergraduate');
  const [degreeProgram, setDegreeProgram] = useState('B.Tech');
  const [specialization, setSpecialization] = useState('Computer Science');
  const [institution, setInstitution] = useState('');
  const [graduationYear, setGraduationYear] = useState('2026');
  const [educationStatus, setEducationStatus] = useState('Currently Studying');
  const [currentYear, setCurrentYear] = useState('3rd Year');

  // Languages & Tech
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['JavaScript', 'TypeScript', 'Python']);
  const [langSearch, setLangSearch] = useState('');
  const [selectedTech, setSelectedTech] = useState<string[]>(['React', 'Node.js', 'Express', 'MongoDB', 'Git']);
  const [techSearch, setTechSearch] = useState('');

  // Career Goals & Target Companies
  const [careerGoal, setCareerGoal] = useState('Land a High-Impact Software Engineering Position');
  const [weeklyLearningHours, setWeeklyLearningHours] = useState(15);
  const [githubUsername, setGithubUsername] = useState('');
  const [targetCompanies, setTargetCompanies] = useState<string[]>(['Google', 'Linear', 'Vercel', 'Stripe']);
  const [companyInput, setCompanyInput] = useState('');

  // Memoized search filtering for instant response without typing lag
  const filteredRoleCategories = useMemo(() => {
    if (!roleSearch.trim()) return ROLE_CATEGORIES;
    const query = roleSearch.toLowerCase();
    return ROLE_CATEGORIES.map((cat) => ({
      ...cat,
      roles: cat.roles.filter((r) => r.toLowerCase().includes(query)),
    })).filter((cat) => cat.roles.length > 0);
  }, [roleSearch]);

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const toggleTech = (t: string) => {
    setSelectedTech((prev) =>
      prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]
    );
  };

  const addCompany = (company: string) => {
    const clean = company.trim();
    if (clean && !targetCompanies.includes(clean)) {
      setTargetCompanies([...targetCompanies, clean]);
    }
  };

  const removeCompany = (company: string) => {
    setTargetCompanies(targetCompanies.filter((c) => c !== company));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        name,
        targetRole,
        experienceLevel,
        education: {
          educationLevel,
          degreeProgram,
          specialization,
          institution,
          graduationYear,
          educationStatus,
          currentYear,
        },
        programmingLanguages: selectedLanguages,
        technologies: selectedTech,
        careerGoal,
        weeklyLearningHours,
        githubUsername,
        targetCompanies,
      };

      await ApiClient.post('/profile/onboarding', payload);
      await refreshProfile();
      router.push('/dashboard');
    } catch (err) {
      console.error('Onboarding submission error:', err);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const baseInputClass = "w-full px-4 py-3 rounded-xl bg-card border border-border text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-4 sm:p-6 lg:p-12 transition-colors duration-200 selection:bg-primary/20 selection:text-primary">
      {/* Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-bold text-primary-foreground shadow-lg shadow-primary/20">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-foreground block tracking-tight">DevForge Studio</span>
            <span className="text-xs text-muted-foreground font-semibold tracking-wide uppercase">Developer Setup</span>
          </div>
        </div>
        <AuroraBadge variant="primary" className="font-semibold shadow-sm shadow-primary/10">
          Step {step} of 4
        </AuroraBadge>
      </div>

      {/* Main Form Body */}
      <div className="max-w-3xl mx-auto w-full my-10">
        {/* STEP 1: Target Role & Experience Level */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="text-center sm:text-left mb-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3 tracking-tight">Target Software Role & Experience</h1>
              <p className="text-sm text-muted-foreground font-medium">DevForge AI dynamically benchmarks your skill matrix against your chosen career path.</p>
            </div>

            {/* Name Input */}
            <AuroraCard padded className="space-y-2 border-border/50 shadow-sm">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">Your Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={baseInputClass}
                placeholder="e.g. Alex Developer"
              />
            </AuroraCard>

            {/* Target Role Selector */}
            <AuroraCard padded className="space-y-4 border-border/50 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">Target Software Role</label>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search roles..."
                    value={roleSearch}
                    onChange={(e) => setRoleSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>

              <div className="space-y-5 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {filteredRoleCategories.map((cat) => (
                  <div key={cat.category} className="space-y-2.5">
                    <div className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">{cat.category}</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {cat.roles.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setTargetRole(r)}
                          className={`px-3 py-2.5 rounded-xl text-[13px] font-semibold text-left border transition-all duration-200 ${
                            targetRole === r
                              ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-[1.02]'
                              : 'bg-background text-foreground border-border hover:border-primary/50 hover:bg-card'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </AuroraCard>

            {/* Experience Level Selector */}
            <AuroraCard padded className="space-y-4 border-border/50 shadow-sm">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">Experience Level</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                {EXPERIENCE_LEVELS.map((exp) => (
                  <button
                    key={exp.label}
                    type="button"
                    onClick={() => setExperienceLevel(exp.label)}
                    className={`p-4 rounded-2xl text-left border transition-all duration-200 ${
                      experienceLevel === exp.label
                        ? 'bg-ai/10 text-ai-foreground border-ai shadow-md shadow-ai/10 scale-[1.01]'
                        : 'bg-background text-foreground border-border hover:border-ai/50 hover:bg-card'
                    }`}
                  >
                    <div className={`text-sm font-bold mb-1 ${experienceLevel === exp.label ? 'text-ai' : 'text-foreground'}`}>{exp.label}</div>
                    <div className="text-xs font-medium text-muted-foreground leading-relaxed">{exp.desc}</div>
                  </button>
                ))}
              </div>
            </AuroraCard>
          </motion.div>
        )}

        {/* STEP 2: Education Section */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="text-center sm:text-left mb-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3 tracking-tight">Academic Background</h1>
              <p className="text-sm text-muted-foreground font-medium">Provide your education history so DevForge can correctly contextualize your resume scores.</p>
            </div>

            <AuroraCard padded className="border-border/50 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">Education Level</label>
                  <select
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    className={baseInputClass}
                  >
                    {['High School', 'Diploma', 'Undergraduate', 'Postgraduate', 'Master’s', 'M.Tech', 'MBA', 'PhD', 'Other'].map((lvl) => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">Degree / Program</label>
                  <select
                    value={degreeProgram}
                    onChange={(e) => setDegreeProgram(e.target.value)}
                    className={baseInputClass}
                  >
                    {['B.Tech', 'B.E.', 'B.Sc', 'BCA', 'MCA', 'M.Tech', 'M.Sc', 'MBA', 'Other'].map((deg) => (
                      <option key={deg} value={deg}>{deg}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">Specialization / Major</label>
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className={baseInputClass}
                  >
                    {['Computer Science', 'Information Technology', 'Artificial Intelligence', 'Data Science', 'Electronics', 'Electrical', 'Mechanical', 'Other'].map((sp) => (
                      <option key={sp} value={sp}>{sp}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">Institution Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Stanford University"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className={baseInputClass}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">Current Status</label>
                  <select
                    value={educationStatus}
                    onChange={(e) => setEducationStatus(e.target.value)}
                    className={baseInputClass}
                  >
                    <option value="Currently Studying">Currently Studying</option>
                    <option value="Graduated">Graduated</option>
                    <option value="Expected to Graduate">Expected to Graduate</option>
                  </select>
                </div>

                {educationStatus === 'Currently Studying' ? (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">Current Year</label>
                    <select
                      value={currentYear}
                      onChange={(e) => setCurrentYear(e.target.value)}
                      className={baseInputClass}
                    >
                      {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Final Year'].map((yr) => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">Graduation Year</label>
                    <input
                      type="number"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      className={baseInputClass}
                    />
                  </div>
                )}
              </div>
            </AuroraCard>
          </motion.div>
        )}

        {/* STEP 3: Languages & Technologies */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="text-center sm:text-left mb-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3 tracking-tight">Languages & Frameworks</h1>
              <p className="text-sm text-muted-foreground font-medium">Select your tech stack. We'll use this to highlight your coverage vs industry requirements.</p>
            </div>

            {/* Programming Languages */}
            <AuroraCard padded className="space-y-4 border-border/50 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">Programming Languages</label>
                <div className="relative w-full sm:w-56">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search language..."
                    value={langSearch}
                    onChange={(e) => setLangSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                {ALL_LANGUAGES.filter((l) => l.toLowerCase().includes(langSearch.toLowerCase())).map((lang) => {
                  const active = selectedLanguages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                        active
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20 scale-[1.02]'
                          : 'bg-background text-foreground border-border hover:border-primary/50 hover:bg-card'
                      }`}
                    >
                      {active ? '✓ ' : ''}{lang}
                    </button>
                  );
                })}
              </div>
            </AuroraCard>

            {/* Frameworks & Tech */}
            <AuroraCard padded className="space-y-4 border-border/50 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">Core Technologies</label>
                <div className="relative w-full sm:w-56">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search tech..."
                    value={techSearch}
                    onChange={(e) => setTechSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>

              <div className="space-y-5 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {TECH_CATEGORIES.map((cat) => {
                  const filtered = cat.items.filter((item) => item.toLowerCase().includes(techSearch.toLowerCase()));
                  if (filtered.length === 0) return null;
                  return (
                    <div key={cat.name} className="space-y-2">
                      <div className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">{cat.name}</div>
                      <div className="flex flex-wrap gap-2">
                        {filtered.map((item) => {
                          const active = selectedTech.includes(item);
                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => toggleTech(item)}
                              className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold border transition-all duration-200 ${
                                active
                                  ? 'bg-secondary-accent text-white border-secondary-accent shadow-sm shadow-secondary-accent/20 scale-[1.02]'
                                  : 'bg-background text-foreground border-border hover:border-secondary-accent/50 hover:bg-card'
                              }`}
                            >
                              {active ? '✓ ' : ''}{item}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </AuroraCard>
          </motion.div>
        )}

        {/* STEP 4: Career Goals & Target Companies */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="text-center sm:text-left mb-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3 tracking-tight">Career Goals & Targets</h1>
              <p className="text-sm text-muted-foreground font-medium">Specify target companies to tailor interview questions and roadmap generation.</p>
            </div>

            <AuroraCard padded className="space-y-4 border-border/50 shadow-sm">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">Primary Career Goal</label>
                <textarea
                  rows={2}
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  className={baseInputClass}
                  placeholder="e.g. Land a Backend Developer position in 3 months"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">Weekly Commitment (Hours)</label>
                  <input
                    type="number"
                    min={1}
                    max={80}
                    value={weeklyLearningHours}
                    onChange={(e) => setWeeklyLearningHours(Number(e.target.value))}
                    className={baseInputClass}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">GitHub Username (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. octocat"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    className={baseInputClass}
                  />
                </div>
              </div>
            </AuroraCard>

            {/* Target Companies Suggestions */}
            <AuroraCard padded className="space-y-4 border-border/50 shadow-sm">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest">Target Companies</label>

              {/* Selected Chips */}
              <div className="flex flex-wrap gap-2 p-3.5 rounded-xl bg-card border border-border min-h-[52px] focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                {targetCompanies.map((c) => (
                  <span key={c} className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-sm font-semibold border border-primary/20 flex items-center gap-1.5">
                    <span>{c}</span>
                    <button type="button" onClick={() => removeCompany(c)} className="hover:text-primary-foreground hover:bg-primary rounded-full w-4 h-4 flex items-center justify-center transition-colors">×</button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="Add company name & press Enter..."
                  value={companyInput}
                  onChange={(e) => setCompanyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCompany(companyInput);
                      setCompanyInput('');
                    }
                  }}
                  className="flex-1 bg-transparent text-sm text-foreground focus:outline-none min-w-[200px] placeholder:text-muted-foreground/60"
                />
              </div>

              {/* Company Categories Suggestion Panel */}
              <div className="space-y-3 pt-4 border-t border-border/50 mt-4">
                <div className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Popular Technology Companies</div>
                <div className="space-y-4 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                  {COMPANY_CATEGORIES.map((cat) => (
                    <div key={cat.category} className="space-y-2">
                      <div className="text-[11px] text-muted-foreground font-bold">{cat.category}</div>
                      <div className="flex flex-wrap gap-2">
                        {cat.companies.map((comp) => {
                          const isSelected = targetCompanies.includes(comp);
                          return (
                            <button
                              key={comp}
                              type="button"
                              onClick={() => (isSelected ? removeCompany(comp) : addCompany(comp))}
                              className={`px-3 py-1.5 rounded-lg text-[13px] border transition-all duration-200 ${
                                isSelected
                                  ? 'bg-primary text-primary-foreground border-primary font-semibold shadow-sm'
                                  : 'bg-background text-foreground font-medium border-border hover:border-primary/50 hover:bg-card'
                              }`}
                            >
                              {isSelected ? '✓ ' : '+ '}{comp}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AuroraCard>
          </motion.div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pt-6 border-t border-border/50">
        {step > 1 ? (
          <AuroraButton
            variant="outline"
            onClick={() => setStep(step - 1)}
            className="px-6 rounded-xl text-sm font-bold shadow-sm"
          >
            <span className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" />
              Back
            </span>
          </AuroraButton>
        ) : <div />}

        {step < 4 ? (
          <AuroraButton
            variant="primary"
            onClick={() => setStep(step + 1)}
            className="px-8 rounded-xl text-sm font-bold shadow-lg shadow-primary/20"
          >
            <span className="flex items-center gap-2">
              Next Step
              <ArrowRight className="w-4 h-4" />
            </span>
          </AuroraButton>
        ) : (
          <AuroraButton
            variant="primary"
            disabled={loading}
            onClick={handleSubmit}
            className="px-8 py-3.5 rounded-xl text-sm font-bold shadow-xl shadow-primary/25 hover:scale-105 transition-transform"
          >
            <span className="flex items-center gap-2">
              {loading ? 'Configuring Studio...' : 'Enter Command Center'}
              <Sparkles className="w-4 h-4 fill-current" />
            </span>
          </AuroraButton>
        )}
      </div>
    </div>
  );
}
