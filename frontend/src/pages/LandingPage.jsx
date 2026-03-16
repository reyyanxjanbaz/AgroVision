import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Bot,
  CloudSun,
  Database,
  Globe2,
  Leaf,
  LineChart,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users
} from 'lucide-react';

const capabilityCards = [
  {
    icon: LineChart,
    title: 'Live Price Intelligence',
    description: 'Track crop prices with historical trends, forecast signals, and regional movement analysis in one interface.'
  },
  {
    icon: CloudSun,
    title: 'Weather-Aware Insights',
    description: 'Understand how real-world weather volatility influences crop risk, yield potential, and pricing dynamics.'
  },
  {
    icon: Bot,
    title: 'Embedded Agro AI Assistant',
    description: 'Get role-specific guidance for farmers, merchants, and customers using contextual conversational intelligence.'
  },
  {
    icon: Users,
    title: 'Role-Based Experience',
    description: 'A single platform tailored for each stakeholder, with context-aware analytics and actionable workflows.'
  },
  {
    icon: Database,
    title: 'Data-Driven Decision Layer',
    description: 'From factors and forecasts to historical price curves, every module is grounded in measurable data signals.'
  },
  {
    icon: Globe2,
    title: 'Multi-Language Accessibility',
    description: 'Localized interface support helps improve inclusivity and trust across diverse user segments.'
  }
];

const platformHighlights = [
  { label: 'Stakeholder Modes', value: '3', icon: Users },
  { label: 'Core Data Streams', value: '6+', icon: TrendingUp },
  { label: 'AI-Enhanced Modules', value: '4', icon: Sparkles },
  { label: 'Reliability Focus', value: 'High', icon: ShieldCheck }
];

const LandingPage = ({ onEnterApp }) => {
  return (
    <div className="relative min-h-screen overflow-hidden text-text-primary dark:text-white">
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-background via-white to-surface dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" />
      <div className="absolute -top-32 -right-16 -z-10 h-[420px] w-[420px] rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-28 -left-10 -z-10 h-[380px] w-[380px] rounded-full bg-secondary/20 blur-3xl" />

      <main className="container mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel relative overflow-hidden rounded-[2rem] border border-white/30 p-8 md:p-12"
        >
          <div className="absolute -top-20 right-0 h-52 w-52 rounded-full bg-primary/20 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-[11px] font-mono uppercase tracking-widest text-primary">
                <Leaf size={14} />
                Intelligent Agricultural Market Platform
              </div>

              <h1 className="font-display text-4xl font-bold leading-tight md:text-6xl">
                AgroVision unifies market data, weather intelligence, and AI guidance into one operational command layer.
              </h1>

              <p className="max-w-2xl text-base leading-relaxed text-text-secondary dark:text-gray-300 md:text-lg">
                Built for real-world agricultural decisions, AgroVision helps users monitor volatility,
                understand causal market drivers, and act with confidence through a modern, role-aware interface.
              </p>
            </div>

            <div className="w-full max-w-sm rounded-2xl border border-gray-200/70 bg-white/75 p-5 shadow-soft backdrop-blur-lg dark:border-gray-700 dark:bg-gray-900/70">
              <p className="text-xs font-mono uppercase tracking-widest text-text-secondary dark:text-gray-400">
                Platform Positioning
              </p>
              <div className="mt-3 flex items-center gap-3">
                <BarChart3 className="text-primary" size={24} />
                <p className="text-sm leading-relaxed text-text-secondary dark:text-gray-300">
                  A practical fusion of analytics, prediction, and conversational assistance for smarter agro-economics.
                </p>
              </div>

              <Link
                to="/dashboard"
                onClick={onEnterApp}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-white shadow-lg shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow-green"
              >
                Open Existing Project
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4"
        >
          {platformHighlights.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-2xl border border-gray-200/70 bg-white/80 p-4 shadow-sm backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/70">
                <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
                  <Icon size={16} />
                </div>
                <p className="font-mono text-2xl font-bold tracking-tight text-text-primary dark:text-white">{item.value}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-text-secondary dark:text-gray-400">{item.label}</p>
              </div>
            );
          })}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10"
        >
          <div className="mb-4 flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-text-secondary dark:text-gray-400">
            <Sparkles size={16} className="text-primary" />
            Core Capabilities
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {capabilityCards.map((card) => {
              const Icon = card.icon;
              return (
                <article
                  key={card.title}
                  className="group rounded-2xl border border-gray-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lift dark:border-gray-700 dark:bg-gray-900/70"
                >
                  <div className="mb-4 inline-flex rounded-xl border border-primary/20 bg-primary/10 p-2.5 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Icon size={18} />
                  </div>
                  <h2 className="font-display text-xl font-semibold tracking-tight text-text-primary dark:text-white">{card.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary dark:text-gray-300">{card.description}</p>
                </article>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 rounded-3xl border border-gray-200/70 bg-white/85 p-7 shadow-sm backdrop-blur-md dark:border-gray-700 dark:bg-gray-900/70"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-text-secondary dark:text-gray-400">Project Intent</p>
              <h3 className="mt-2 font-display text-2xl font-bold text-text-primary dark:text-white md:text-3xl">
                Empower better decisions across the agricultural value chain.
              </h3>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-secondary dark:text-gray-300">
                AgroVision is designed to reduce decision latency and increase clarity through explainable insights,
                operational visibility, and real-time context on market behavior.
              </p>
            </div>

            <Link
              to="/dashboard"
              onClick={onEnterApp}
              className="inline-flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 px-6 py-3 font-semibold text-primary transition-all hover:border-primary hover:bg-primary hover:text-white"
            >
              Enter Platform
              <ArrowRight size={18} />
            </Link>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default LandingPage;