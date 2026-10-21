'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import PageWrapper from '@/components/PageWrapper';
import SectionHeader from '@/components/SectionHeader';
import CircuitBackground from '@/components/CircuitBackground';

interface Course {
  code: string;
  name: string;
  semesters: string;
  level: 'undergraduate' | 'graduate';
}

const uciCourses: Course[] = [
  { code: 'EECS 70A', name: 'Network Analysis', semesters: 'Spring 2020\u20132025', level: 'undergraduate' },
  { code: 'EECS 270A', name: 'Advanced Analog Circuits', semesters: 'Fall 2020\u20132025', level: 'graduate' },
  { code: 'EECS 270AP', name: 'Advanced Analog Circuits M.Eng', semesters: 'Fall 2020', level: 'graduate' },
  { code: 'EECS 270E', name: 'mm-Wave and THz Circuits', semesters: 'Winter 2020\u20132025', level: 'graduate' },
  { code: 'EECS 298', name: 'mm-Wave and THz Circuits Special Topics', semesters: 'Fall 2019', level: 'graduate' },
];

const cornellCourses: Course[] = [
  { code: 'ECE 5790', name: 'Advanced High-Speed and RF ICs', semesters: 'Spring 2014', level: 'graduate' },
];

/** A course list as rows of one panel: code, title, level, terms. */
function CourseList({ courses }: { courses: Course[] }) {
  return (
    <motion.ul
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5 }}
      className="glass-ios rounded-2xl divide-y divide-panel-line"
    >
      {courses.map((course) => (
        <li
          key={course.code}
          className="grid grid-cols-[6.5rem_1fr] gap-x-4 gap-y-1 px-5 py-4 sm:grid-cols-[7rem_1fr_8rem_11rem] sm:items-baseline sm:px-6"
        >
          <span className="font-semibold tabular-nums text-eng-blue">{course.code}</span>
          <span className="font-medium text-gray-800">{course.name}</span>
          <span className="col-start-2 text-sm text-gray-500 sm:col-start-auto">
            {course.level === 'graduate' ? 'Graduate' : 'Undergraduate'}
          </span>
          <span className="col-start-2 text-sm tabular-nums text-gray-500 sm:col-start-auto">{course.semesters}</span>
        </li>
      ))}
    </motion.ul>
  );
}

function Institution({ logo, logoAlt, name, role }: { logo: string; logoAlt: string; name: string; role: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Image src={logo} alt={logoAlt} width={48} height={48} className="w-12 h-12 rounded-xl object-contain" />
      <div>
        <h2 className="text-2xl font-bold text-eng-blue">{name}</h2>
        <p className="text-gray-500">{role}</p>
      </div>
    </div>
  );
}

export default function TeachingPage() {
  return (
    <PageWrapper>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-eng-blue via-navy to-uci-blue-dark text-white py-20 overflow-hidden">
        <CircuitBackground density={25} variant="ic-layout" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <SectionHeader
            as="h1"
            title="Teaching"
            subtitle="Courses taught at UC Irvine and Cornell University"
            centered
            light
          />
        </div>
      </section>

      <section className="py-16 bg-slate-warm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-14">
          <div>
            <Institution
              logo="/images/teaching/uci-logo.png"
              logoAlt="UC Irvine logo"
              name="University of California, Irvine"
              role="Associate Professor, EECS Department"
            />
            <CourseList courses={uciCourses} />
          </div>
          <div>
            <Institution
              logo="/images/teaching/cornell-logo.png"
              logoAlt="Cornell University logo"
              name="Cornell University"
              role="Instructor, ECE Department"
            />
            <CourseList courses={cornellCourses} />
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
