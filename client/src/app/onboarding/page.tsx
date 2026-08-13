'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Check, ChevronLeft, Search, GraduationCap, Building2, Layers, BookOpen, User } from 'lucide-react';
import { ApiClient } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

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

  // Form State
  const [name, setName] = useState('DevForge Developer');
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

  const { refreshProfile } = useAuth();

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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-4 sm:p-6 lg:p-12 transition-colors duration-200">
      {/* Header */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5 fill-white" />
          </div>
          <div>
            <span className="font-bold text-base text-white block">DevForge AI</span>
            <span className="text-[10px] text-zinc-500 font-medium">Developer Career Setup</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
          <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Step {step} of 4
          </span>
        </div>
      </div>

      {/* Main Form Body */}
      <div className="max-w-3xl mx-auto w-full my-6">
        {/* STEP 1: Target Role & Experience Level */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1.5">Target Software Role & Experience</h1>
              <p className="text-xs text-zinc-400">DevForge AI benchmarks your skill matrix against your chosen career role.</p>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Your Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Target Role Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-zinc-300">Target Software Role</label>
                <div className="relative w-48 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search roles..."
                    value={roleSearch}
                    onChange={(e) => setRoleSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {filteredRoleCategories.map((cat) => (
                  <div key={cat.category} className="space-y-2">
                    <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">{cat.category}</div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {cat.roles.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setTargetRole(r)}
                          className={`p-2.5 rounded-xl text-xs font-medium text-left border transition-colors duration-150 ${
                            targetRole === r
                              ? 'bg-blue-600/20 text-blue-400 border-blue-500 font-semibold shadow-md shadow-blue-600/10'
                              : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience Level Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-zinc-300">Experience Level</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                {EXPERIENCE_LEVELS.map((exp) => (
                  <button
                    key={exp.label}
                    type="button"
                    onClick={() => setExperienceLevel(exp.label)}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      experienceLevel === exp.label
                        ? 'bg-purple-600/20 text-purple-300 border-purple-500 font-semibold shadow-md'
                        : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white mb-0.5">{exp.label}</div>
                    <div className="text-[11px] text-zinc-400 leading-tight">{exp.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Education Section */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1.5">Education Information</h1>
              <p className="text-xs text-zinc-400">Provide your academic background so DevForge can contextualize resume scores.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Education Level</label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none"
                >
                  {['High School', 'Diploma', 'Undergraduate', 'Postgraduate', 'Master’s', 'M.Tech', 'MBA', 'PhD', 'Other'].map((lvl) => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Degree / Program</label>
                <select
                  value={degreeProgram}
                  onChange={(e) => setDegreeProgram(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none"
                >
                  {['B.Tech', 'B.E.', 'B.Sc', 'BCA', 'MCA', 'M.Tech', 'M.Sc', 'MBA', 'Other'].map((deg) => (
                    <option key={deg} value={deg}>{deg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Specialization / Major</label>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none"
                >
                  {['Computer Science', 'Information Technology', 'Artificial Intelligence', 'Data Science', 'Electronics', 'Electrical', 'Mechanical', 'Other'].map((sp) => (
                    <option key={sp} value={sp}>{sp}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">College / University Name</label>
                <input
                  type="text"
                  placeholder="e.g. Stanford University / IIT Delhi"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Current Education Status</label>
                <select
                  value={educationStatus}
                  onChange={(e) => setEducationStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none"
                >
                  <option value="Currently Studying">Currently Studying</option>
                  <option value="Graduated">Graduated</option>
                  <option value="Expected to Graduate">Expected to Graduate</option>
                </select>
              </div>

              {educationStatus === 'Currently Studying' ? (
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Current Year</label>
                  <select
                    value={currentYear}
                    onChange={(e) => setCurrentYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none"
                  >
                    {['1st Year', '2nd Year', '3rd Year', '4th Year', 'Final Year'].map((yr) => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Graduation Year</label>
                  <input
                    type="number"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none"
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* STEP 3: Languages & Technologies */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1.5">Programming Languages & Technologies</h1>
              <p className="text-xs text-zinc-400">Select what you know. DevForge uses this to highlight your skill coverage vs gaps.</p>
            </div>

            {/* Programming Languages */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-zinc-300">Programming Languages</label>
                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2" />
                  <input
                    type="text"
                    placeholder="Search language..."
                    value={langSearch}
                    onChange={(e) => setLangSearch(e.target.value)}
                    className="w-full pl-8 pr-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {ALL_LANGUAGES.filter((l) => l.toLowerCase().includes(langSearch.toLowerCase())).map((lang) => {
                  const active = selectedLanguages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        active
                          ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {active ? '✓ ' : ''}{lang}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Frameworks & Tech */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-zinc-300">Technologies & Frameworks</label>
                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2" />
                  <input
                    type="text"
                    placeholder="Search tech..."
                    value={techSearch}
                    onChange={(e) => setTechSearch(e.target.value)}
                    className="w-full pl-8 pr-2 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {TECH_CATEGORIES.map((cat) => {
                  const filtered = cat.items.filter((item) => item.toLowerCase().includes(techSearch.toLowerCase()));
                  if (filtered.length === 0) return null;
                  return (
                    <div key={cat.name} className="space-y-1.5">
                      <div className="text-[11px] font-bold text-zinc-500">{cat.name}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {filtered.map((item) => {
                          const active = selectedTech.includes(item);
                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => toggleTech(item)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                                active
                                  ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
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
            </div>
          </motion.div>
        )}

        {/* STEP 4: Career Goals & Target Companies */}
        {step === 4 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1.5">Career Goals & Target Companies</h1>
              <p className="text-xs text-zinc-400">Specify target companies to tailor interview questions and roadmap focus.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Primary Career Goal</label>
              <textarea
                rows={2}
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none"
                placeholder="e.g. Land a Backend Developer position in 3 months"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Weekly Commitment (Hours)</label>
                <input
                  type="number"
                  min={1}
                  max={80}
                  value={weeklyLearningHours}
                  onChange={(e) => setWeeklyLearningHours(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">GitHub Username (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. octocat"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none"
                />
              </div>
            </div>

            {/* Target Companies Suggestions */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-zinc-300">Target Companies</label>

              {/* Selected Chips */}
              <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-zinc-900 border border-zinc-800 min-h-[44px]">
                {targetCompanies.map((c) => (
                  <span key={c} className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-300 text-xs border border-blue-500/30 flex items-center gap-1.5">
                    <span>{c}</span>
                    <button type="button" onClick={() => removeCompany(c)} className="hover:text-white font-bold">×</button>
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
                  className="flex-1 bg-transparent text-xs text-zinc-100 focus:outline-none min-w-[150px]"
                />
              </div>

              {/* Company Categories Suggestion Panel */}
              <div className="space-y-3 pt-2">
                <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Popular Technology Companies</div>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {COMPANY_CATEGORIES.map((cat) => (
                    <div key={cat.category} className="space-y-1">
                      <div className="text-[10px] text-zinc-400 font-semibold">{cat.category}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.companies.map((comp) => {
                          const isSelected = targetCompanies.includes(comp);
                          return (
                            <button
                              key={comp}
                              type="button"
                              onClick={() => (isSelected ? removeCompany(comp) : addCompany(comp))}
                              className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-500 font-semibold'
                                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
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
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="max-w-3xl mx-auto w-full flex items-center justify-between pt-4 border-t border-zinc-800/80">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 flex items-center gap-2 border border-zinc-800"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        ) : <div />}

        {step < 4 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 flex items-center gap-2"
          >
            <span>Next Step</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-sm font-bold text-white shadow-xl shadow-blue-600/25 flex items-center gap-2 transition-all"
          >
            {loading ? 'Configuring DevForge Command Center...' : 'Complete Setup & Open Command Center'}
            <Sparkles className="w-4 h-4 fill-white" />
          </button>
        )}
      </div>
    </div>
  );
}
