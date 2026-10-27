/**
 * ASTROWORLD — Hierarchical Career & Education Taxonomy
 *
 * Implements a 4-level taxonomy:
 * Level 1: Broad Sector
 * Level 2: Professional Discipline
 * Level 3: Specialization
 * Level 4: Job Family / Exact Occupational Role
 *
 * Plus Academic Degree mapping and explicit occupational distinction definitions.
 */

export type SectorId =
  | 'healthcare_medicine'
  | 'engineering_technology'
  | 'science_research'
  | 'business_commerce_finance'
  | 'law_governance_public'
  | 'creative_media_design'
  | 'education_academia'
  | 'entrepreneurship_consulting'
  | 'inconclusive_insufficient_evidence';

export interface TaxonomyRole {
  id: string;
  label: string;
  level: 4;
  sectorId: SectorId;
  disciplineId: string;
  specializationId: string;
  description: string;
  academicDegrees: string[];
  planetaryArchetypes: {
    primarySignificators: string[];
    secondarySignificators: string[];
    favorableHousesD1: number[];
    favorableHousesD10: number[];
  };
  distinctionNotes?: string;
}

export interface TaxonomySpecialization {
  id: string;
  label: string;
  level: 3;
  sectorId: SectorId;
  disciplineId: string;
  description: string;
  roles: TaxonomyRole[];
  planetaryArchetypes: {
    primarySignificators: string[];
    secondarySignificators: string[];
  };
}

export interface TaxonomyDiscipline {
  id: string;
  label: string;
  level: 2;
  sectorId: SectorId;
  description: string;
  specializations: TaxonomySpecialization[];
  academicDegrees: string[];
  planetaryArchetypes: {
    primarySignificators: string[];
    favorableHousesD1: number[];
  };
}

export interface TaxonomySector {
  id: SectorId;
  label: string;
  level: 1;
  description: string;
  disciplines: TaxonomyDiscipline[];
}

export interface CompetingDistinction {
  candidateA: string;
  candidateB: string;
  keyDifferentiators: string;
  astrologicalDistinctionRule: string;
  epistemicLimitation: string;
}

// ---------------------------------------------------------------------------
// Canonical Taxonomy Tree
// ---------------------------------------------------------------------------

export const CAREER_TAXONOMY: TaxonomySector[] = [
  // 1. Healthcare & Medicine
  {
    id: 'healthcare_medicine',
    label: 'Healthcare & Life Sciences',
    level: 1,
    description: 'Diagnosis, surgical intervention, therapeutics, pharmaceuticals, and biomedical research.',
    disciplines: [
      {
        id: 'medicine_clinical',
        label: 'Clinical Medicine & Surgery',
        level: 2,
        sectorId: 'healthcare_medicine',
        description: 'Direct patient care, medical therapeutics, and invasive surgical intervention.',
        academicDegrees: ['MBBS', 'MD Internal Medicine', 'MS General Surgery', 'DM Cardiology', 'MCh Neurosurgery'],
        planetaryArchetypes: {
          primarySignificators: ['Sun', 'Mars', 'Moon'],
          favorableHousesD1: [1, 6, 8, 10, 12],
        },
        specializations: [
          {
            id: 'surgery_invasive',
            label: 'Surgery & Interventional Medicine',
            level: 3,
            sectorId: 'healthcare_medicine',
            disciplineId: 'medicine_clinical',
            description: 'Invasive mechanical/surgical cutting, trauma treatment, and operative care.',
            planetaryArchetypes: {
              primarySignificators: ['Mars', 'Ketu', 'Sun'],
              secondarySignificators: ['Saturn'],
            },
            roles: [
              {
                id: 'role_general_surgeon',
                label: 'Surgeon / Operative Specialist',
                level: 4,
                sectorId: 'healthcare_medicine',
                disciplineId: 'medicine_clinical',
                specializationId: 'surgery_invasive',
                description: 'Performs invasive operations; requires sharp technical precision (Mars/Ketu) and clinical stamina.',
                academicDegrees: ['MS Surgery', 'MCh', 'FRCS'],
                planetaryArchetypes: {
                  primarySignificators: ['Mars', 'Ketu'],
                  secondarySignificators: ['Sun', 'Saturn'],
                  favorableHousesD1: [6, 8, 10],
                  favorableHousesD10: [1, 6, 10],
                },
                distinctionNotes: 'Mars is the instrument/scalpel; Ketu is precise incision. Differs from general physician by active Mars-Ketu operational signature.',
              },
            ],
          },
          {
            id: 'clinical_physician',
            label: 'Internal Medicine & Physician Practice',
            level: 3,
            sectorId: 'healthcare_medicine',
            disciplineId: 'medicine_clinical',
            description: 'Diagnostic assessment, internal pathology management, and pharmacological treatment without invasive surgery.',
            planetaryArchetypes: {
              primarySignificators: ['Sun', 'Jupiter', 'Moon'],
              secondarySignificators: ['Mercury'],
            },
            roles: [
              {
                id: 'role_clinical_physician',
                label: 'General Physician / Internal Medicine Specialist',
                level: 4,
                sectorId: 'healthcare_medicine',
                disciplineId: 'medicine_clinical',
                specializationId: 'clinical_physician',
                description: 'Diagnoses diseases and prescribes medicinal regimens; Sun represents vitality/healing, Jupiter provides therapeutic wisdom.',
                academicDegrees: ['MBBS', 'MD General Medicine'],
                planetaryArchetypes: {
                  primarySignificators: ['Sun', 'Jupiter'],
                  secondarySignificators: ['Moon', 'Mercury'],
                  favorableHousesD1: [1, 6, 10],
                  favorableHousesD10: [6, 10],
                },
                distinctionNotes: 'Lacks the sharp Mars/Ketu surgical requirement; emphasized by Sun-Jupiter healing and 6th house disease overcoming.',
              },
            ],
          },
        ],
      },
      {
        id: 'pharmacy_biotech',
        label: 'Pharmacy & Biomedical Science',
        level: 2,
        sectorId: 'healthcare_medicine',
        description: 'Drug discovery, chemical pharmacology, toxicology, and lab-based biomedical research.',
        academicDegrees: ['B.Pharm', 'Pharm.D', 'M.Sc Pharmacology', 'Ph.D Biomedical Science'],
        planetaryArchetypes: {
          primarySignificators: ['Moon', 'Venus', 'Rahu', 'Mercury'],
          favorableHousesD1: [5, 6, 8, 12],
        },
        specializations: [
          {
            id: 'pharmaceutical_chemistry',
            label: 'Pharmaceutical Chemistry & Therapeutics',
            level: 3,
            sectorId: 'healthcare_medicine',
            disciplineId: 'pharmacy_biotech',
            description: 'Formulation of medicinal chemistry, drug compounds, and clinical dispensing.',
            planetaryArchetypes: {
              primarySignificators: ['Moon', 'Venus', 'Rahu'],
              secondarySignificators: ['Mercury'],
            },
            roles: [
              {
                id: 'role_pharmacist',
                label: 'Pharmacist / Drug Formulation Chemist',
                level: 4,
                sectorId: 'healthcare_medicine',
                disciplineId: 'pharmacy_biotech',
                specializationId: 'pharmaceutical_chemistry',
                description: 'Compounds medicines, handles biochemical compounds, and manages drug therapies.',
                academicDegrees: ['B.Pharm', 'Pharm.D', 'M.Pharm'],
                planetaryArchetypes: {
                  primarySignificators: ['Moon', 'Venus', 'Rahu'],
                  secondarySignificators: ['Mercury'],
                  favorableHousesD1: [6, 8, 10],
                  favorableHousesD10: [2, 6, 10],
                },
                distinctionNotes: 'Venus governs chemical medicines (Oshadhi/Sanjeevani); Moon governs herbal/liquid elixirs; Rahu governs synthetic chemistry. Differs from medical doctor by lack of direct Sun vital diagnosis.',
              },
              {
                id: 'role_clinical_researcher',
                label: 'Biomedical & Clinical Trial Researcher',
                level: 4,
                sectorId: 'healthcare_medicine',
                disciplineId: 'pharmacy_biotech',
                specializationId: 'pharmaceutical_chemistry',
                description: 'Conducts laboratory studies, clinical trials, and epidemiological analysis.',
                academicDegrees: ['M.Sc Clinical Research', 'Ph.D Pharmacology', 'MD Pharmacology'],
                planetaryArchetypes: {
                  primarySignificators: ['Mercury', 'Rahu', 'Jupiter'],
                  secondarySignificators: ['Mars', 'Saturn'],
                  favorableHousesD1: [5, 8, 9, 12],
                  favorableHousesD10: [8, 9, 10],
                },
                distinctionNotes: 'Strong 8th (deep research) and 5th/9th (higher scientific scholarship) with Mercury-Rahu investigative synthesis.',
              },
            ],
          },
        ],
      },
    ],
  },

  // 2. Engineering & Technology
  {
    id: 'engineering_technology',
    label: 'Engineering & Technology',
    level: 1,
    description: 'Computational systems, software engineering, hardware, telecommunications, civil and mechanical engineering.',
    disciplines: [
      {
        id: 'computer_science_engineering',
        label: 'Computer Science Engineering (CSE)',
        level: 2,
        sectorId: 'engineering_technology',
        description: 'Algorithms, software systems, data architecture, cloud computing, and AI.',
        academicDegrees: ['B.Tech CSE', 'B.E. Computer Engineering', 'M.Tech CSE', 'MS Computer Science'],
        planetaryArchetypes: {
          primarySignificators: ['Mercury', 'Mars', 'Rahu'],
          favorableHousesD1: [3, 5, 10, 11],
        },
        specializations: [
          {
            id: 'software_engineering',
            label: 'Software Engineering & Systems Development',
            level: 3,
            sectorId: 'engineering_technology',
            disciplineId: 'computer_science_engineering',
            description: 'Building application software, backend systems, APIs, and computational infrastructure.',
            planetaryArchetypes: {
              primarySignificators: ['Mercury', 'Mars'],
              secondarySignificators: ['Rahu', 'Saturn'],
            },
            roles: [
              {
                id: 'role_software_engineer',
                label: 'Software Development Engineer (Full Stack / Backend)',
                level: 4,
                sectorId: 'engineering_technology',
                disciplineId: 'computer_science_engineering',
                specializationId: 'software_engineering',
                description: 'Designs and builds deterministic software architectures, logic modules, and web/enterprise platforms.',
                academicDegrees: ['B.Tech CSE', 'BCA/MCA', 'BS Computer Science'],
                planetaryArchetypes: {
                  primarySignificators: ['Mercury', 'Mars'],
                  secondarySignificators: ['Rahu'],
                  favorableHousesD1: [3, 5, 10, 11],
                  favorableHousesD10: [3, 10, 11],
                },
                distinctionNotes: 'Mercury provides discrete logic and coding; Mars provides engineering construction. Differs from Data Scientist by focus on code architecture over empirical statistics.',
              },
              {
                id: 'role_backend_engineer',
                label: 'Backend & Distributed Systems Engineer',
                level: 4,
                sectorId: 'engineering_technology',
                disciplineId: 'computer_science_engineering',
                specializationId: 'software_engineering',
                description: 'Specializes in high-throughput data pipelines, database engines, and microservice infrastructure.',
                academicDegrees: ['B.Tech CSE', 'MS Computer Science'],
                planetaryArchetypes: {
                  primarySignificators: ['Mercury', 'Saturn', 'Mars'],
                  secondarySignificators: ['Rahu'],
                  favorableHousesD1: [3, 6, 10],
                  favorableHousesD10: [6, 10],
                },
                distinctionNotes: 'Saturn adds stability, fault tolerance, and deep infrastructure engineering.',
              },
            ],
          },
          {
            id: 'ai_data_intelligence',
            label: 'Artificial Intelligence, Machine Learning & Data Science',
            level: 3,
            sectorId: 'engineering_technology',
            disciplineId: 'computer_science_engineering',
            description: 'Statistical modeling, deep learning architectures, LLM systems, predictive intelligence, and analytical mining.',
            planetaryArchetypes: {
              primarySignificators: ['Mercury', 'Rahu', 'Jupiter'],
              secondarySignificators: ['Mars', 'Ketu'],
            },
            roles: [
              {
                id: 'role_ai_ml_engineer',
                label: 'AI / Machine Learning Engineer',
                level: 4,
                sectorId: 'engineering_technology',
                disciplineId: 'computer_science_engineering',
                specializationId: 'ai_data_intelligence',
                description: 'Builds, trains, and operationalizes neural networks, LLM agents, and machine learning pipelines.',
                academicDegrees: ['B.Tech AI & Data Science (AI&DS)', 'Diploma in AIML', 'B.Tech CSE (AI/ML)', 'M.Tech AI', 'MS Machine Learning'],
                planetaryArchetypes: {
                  primarySignificators: ['Rahu', 'Mercury', 'Saturn', 'Mars'],
                  secondarySignificators: ['Jupiter', 'Ketu'],
                  favorableHousesD1: [3, 5, 8, 10, 11],
                  favorableHousesD10: [3, 5, 8, 10, 11],
                },
                distinctionNotes: 'Rahu (synthetic intellect, unconventional neural algorithms) conjunct or in mutual aspect with Mercury (discrete logic, code) and Saturn (infrastructure, compute scaling, MLOps). High overlap with general Software Engineer; distinguished by strong 5th/8th research & algorithmic nodes.',
              },
              {
                id: 'role_data_scientist',
                label: 'Data Scientist / AI & Data Intelligence Specialist',
                level: 4,
                sectorId: 'engineering_technology',
                disciplineId: 'computer_science_engineering',
                specializationId: 'ai_data_intelligence',
                description: 'Extracts empirical insights, designs predictive models, trains deep learning architectures, and conducts statistical research.',
                academicDegrees: ['B.Tech AI & Data Science (AI&DS)', 'Diploma in AIML', 'BS Data Science', 'M.Sc Statistics', 'M.Tech CSE'],
                planetaryArchetypes: {
                  primarySignificators: ['Mercury', 'Jupiter', 'Rahu', 'Saturn'],
                  secondarySignificators: ['Moon', 'Ketu'],
                  favorableHousesD1: [2, 3, 5, 9, 10, 11],
                  favorableHousesD10: [2, 5, 9, 10, 11],
                },
                distinctionNotes: 'Jupiter adds higher statistical theorem and loss function optimization; Mercury computes; Rahu uncovers hidden patterns in massive data; Saturn scales pipelines in production.',
              },
              {
                id: 'role_data_analyst',
                label: 'Data Analyst / Business Intelligence Specialist',
                level: 4,
                sectorId: 'engineering_technology',
                disciplineId: 'computer_science_engineering',
                specializationId: 'ai_data_intelligence',
                description: 'Analyzes structured commercial data, produces dashboards, and extracts operational metrics.',
                academicDegrees: ['B.Sc Statistics', 'B.Com / BBA Analytics', 'B.Tech IT'],
                planetaryArchetypes: {
                  primarySignificators: ['Mercury', 'Moon'],
                  secondarySignificators: ['Jupiter'],
                  favorableHousesD1: [2, 3, 10, 11],
                  favorableHousesD10: [2, 10, 11],
                },
                distinctionNotes: 'Lacks the heavy Mars-Rahu engineering and deep neural-net training requirements; emphasizes 2nd/11th house commercial reporting and Mercury visualization.',
              },
            ],
          },
          {
            id: 'cloud_cybersecurity',
            label: 'Cloud Infrastructure & Cybersecurity',
            level: 3,
            sectorId: 'engineering_technology',
            disciplineId: 'computer_science_engineering',
            description: 'Defensive information security, threat hunting, encryption, and planetary-scale cloud networks.',
            planetaryArchetypes: {
              primarySignificators: ['Rahu', 'Mars', 'Saturn', 'Ketu'],
              secondarySignificators: ['Mercury'],
            },
            roles: [
              {
                id: 'role_cybersecurity_engineer',
                label: 'Cybersecurity Analyst / Information Security Architect',
                level: 4,
                sectorId: 'engineering_technology',
                disciplineId: 'computer_science_engineering',
                specializationId: 'cloud_cybersecurity',
                description: 'Guards against cyber warfare, penetration, and espionage; audits encryption and vulnerability.',
                academicDegrees: ['B.Tech Cyber Security', 'MS Information Security', 'CEH/CISSP'],
                planetaryArchetypes: {
                  primarySignificators: ['Mars', 'Rahu', 'Ketu'],
                  secondarySignificators: ['Saturn', 'Mercury'],
                  favorableHousesD1: [6, 8, 10, 12],
                  favorableHousesD10: [6, 8, 10],
                },
                distinctionNotes: 'Mars is the defensive warrior; Ketu is cryptography/covert secrets; Rahu is cyber threats and espionage. Strong 6th (enemies/attacks) and 8th (vulnerabilities).',
              },
              {
                id: 'role_cloud_systems_engineer',
                label: 'Cloud Engineer / Site Reliability Engineer (SRE)',
                level: 4,
                sectorId: 'engineering_technology',
                disciplineId: 'computer_science_engineering',
                specializationId: 'cloud_cybersecurity',
                description: 'Architects fault-tolerant server infrastructure, Kubernetes clusters, and multi-region deployments.',
                academicDegrees: ['B.Tech CSE/IT', 'AWS/GCP Certified Architect'],
                planetaryArchetypes: {
                  primarySignificators: ['Saturn', 'Rahu', 'Mercury'],
                  secondarySignificators: ['Mars'],
                  favorableHousesD1: [3, 6, 10, 11],
                  favorableHousesD10: [10, 11],
                },
                distinctionNotes: 'Saturn represents sustained structural uptime; Rahu represents vast distributed networks beyond physical boundaries.',
              },
            ],
          },
        ],
      },
      {
        id: 'electronics_communication_engineering',
        label: 'Electronics & Communication Engineering (ECE)',
        level: 2,
        sectorId: 'engineering_technology',
        description: 'Semiconductor design, VLSI, microprocessors, telecommunications, RF signals, and embedded robotics.',
        academicDegrees: ['B.Tech ECE', 'B.E. Electronics', 'M.Tech VLSI Design', 'MS Microelectronics'],
        planetaryArchetypes: {
          primarySignificators: ['Mars', 'Mercury', 'Sun', 'Rahu'],
          favorableHousesD1: [3, 5, 10],
        },
        specializations: [
          {
            id: 'vlSI_embedded_systems',
            label: 'VLSI, Semiconductors & Embedded Systems',
            level: 3,
            sectorId: 'engineering_technology',
            disciplineId: 'electronics_communication_engineering',
            description: 'Microchip architecture, silicon physical design, FPGA, and hardware-level firmware.',
            planetaryArchetypes: {
              primarySignificators: ['Mars', 'Sun', 'Mercury', 'Ketu'],
              secondarySignificators: ['Saturn'],
            },
            roles: [
              {
                id: 'role_embedded_systems_engineer',
                label: 'Embedded Systems & VLSI Engineer',
                level: 4,
                sectorId: 'engineering_technology',
                disciplineId: 'electronics_communication_engineering',
                specializationId: 'vlSI_embedded_systems',
                description: 'Bridges hardware silicon and microcode; microchip timing, circuit design, and sensors.',
                academicDegrees: ['B.Tech ECE', 'M.Tech VLSI Design'],
                planetaryArchetypes: {
                  primarySignificators: ['Mars', 'Sun', 'Mercury'],
                  secondarySignificators: ['Ketu'],
                  favorableHousesD1: [3, 5, 10],
                  favorableHousesD10: [3, 10],
                },
                distinctionNotes: 'Sun governs electrical current/prana; Mars governs physical circuits; Mercury governs microcode logic; Ketu micro-miniaturization. Differs from pure CSE by physical electrical/semiconductor emphasis.',
              },
            ],
          },
          {
            id: 'telecommunications_rf',
            label: 'Telecommunications & RF Engineering',
            level: 3,
            sectorId: 'engineering_technology',
            disciplineId: 'electronics_communication_engineering',
            description: '5G networks, wireless propagation, satellite links, and radar systems.',
            planetaryArchetypes: {
              primarySignificators: ['Mercury', 'Rahu', 'Mars'],
              secondarySignificators: ['Moon'],
            },
            roles: [
              {
                id: 'role_telecom_engineer',
                label: 'Telecommunications Network Engineer',
                level: 4,
                sectorId: 'engineering_technology',
                disciplineId: 'electronics_communication_engineering',
                specializationId: 'telecommunications_rf',
                description: 'Designs wireless frequencies, optical fiber rings, and telecommunication switches.',
                academicDegrees: ['B.Tech ECE / Telecommunications', 'M.Tech Telecommunications'],
                planetaryArchetypes: {
                  primarySignificators: ['Mercury', 'Rahu'],
                  secondarySignificators: ['Mars'],
                  favorableHousesD1: [3, 9, 10],
                  favorableHousesD10: [3, 10],
                },
                distinctionNotes: '3rd house governs communication equipment and wave transmissions; Rahu represents airborne invisible radiation/frequencies.',
              },
            ],
          },
        ],
      },
      {
        id: 'mechanical_civil_engineering',
        label: 'Mechanical, Aerospace & Civil Engineering',
        level: 2,
        sectorId: 'engineering_technology',
        description: 'Physical machines, thermodynamics, manufacturing, structural edifices, bridges, and materials.',
        academicDegrees: ['B.Tech Mechanical', 'B.Tech Civil', 'M.Tech Structural Engineering', 'B.Tech Aerospace'],
        planetaryArchetypes: {
          primarySignificators: ['Mars', 'Saturn'],
          favorableHousesD1: [3, 4, 10],
        },
        specializations: [
          {
            id: 'mechanical_automotive',
            label: 'Mechanical & Automotive Systems',
            level: 3,
            sectorId: 'engineering_technology',
            disciplineId: 'mechanical_civil_engineering',
            description: 'Engines, kinetic mechanisms, robotics, automotive dynamics, and manufacturing metallurgy.',
            planetaryArchetypes: {
              primarySignificators: ['Mars', 'Saturn'],
              secondarySignificators: ['Venus'],
            },
            roles: [
              {
                id: 'role_mechanical_engineer',
                label: 'Mechanical Design / Robotics Engineer',
                level: 4,
                sectorId: 'engineering_technology',
                disciplineId: 'mechanical_civil_engineering',
                specializationId: 'mechanical_automotive',
                description: 'Designs mechanical apparatus, thermal equipment, and dynamic heavy machinery.',
                academicDegrees: ['B.Tech Mechanical Engineering', 'MS Robotics'],
                planetaryArchetypes: {
                  primarySignificators: ['Mars', 'Saturn'],
                  secondarySignificators: ['Sun'],
                  favorableHousesD1: [3, 10],
                  favorableHousesD10: [10],
                },
                distinctionNotes: 'Mars is combustion/force; Saturn is heavy metals, steel, and mechanical endurance. Differs from Civil Engineering by kinetic motion and machine fabrication.',
              },
            ],
          },
          {
            id: 'civil_structural',
            label: 'Civil Infrastructure & Structural Engineering',
            level: 3,
            sectorId: 'engineering_technology',
            disciplineId: 'mechanical_civil_engineering',
            description: 'Bridges, concrete dams, real estate foundations, transport infrastructure, and geotechnics.',
            planetaryArchetypes: {
              primarySignificators: ['Saturn', 'Mars'],
              secondarySignificators: ['Venus', 'Moon'],
            },
            roles: [
              {
                id: 'role_civil_engineer',
                label: 'Civil & Structural Engineer',
                level: 4,
                sectorId: 'engineering_technology',
                disciplineId: 'mechanical_civil_engineering',
                specializationId: 'civil_structural',
                description: 'Constructs permanent buildings, transport systems, and civil earthworks.',
                academicDegrees: ['B.Tech Civil Engineering', 'M.Tech Structural Engineering'],
                planetaryArchetypes: {
                  primarySignificators: ['Saturn', 'Mars'],
                  secondarySignificators: ['Venus'],
                  favorableHousesD1: [4, 10],
                  favorableHousesD10: [4, 10],
                },
                distinctionNotes: '4th house rules landed property, architecture, and immovable structures (Bhumi/Vastu); Saturn is concrete, soil, foundation; Mars is construction execution.',
              },
            ],
          },
        ],
      },
    ],
  },

  // 3. Business, Finance & Law
  {
    id: 'business_commerce_finance',
    label: 'Business, Finance & Commerce',
    level: 1,
    description: 'Corporate management, investment banking, accounting, market trade, and entrepreneurship.',
    disciplines: [
      {
        id: 'finance_accounting',
        label: 'Banking, Investment & Accounting',
        level: 2,
        sectorId: 'business_commerce_finance',
        description: 'Capital asset management, chartered accountancy, corporate finance, and equity analysis.',
        academicDegrees: ['B.Com', 'CA', 'CFA', 'MBA Finance', 'M.Sc Financial Engineering'],
        planetaryArchetypes: {
          primarySignificators: ['Mercury', 'Jupiter', 'Venus'],
          favorableHousesD1: [2, 5, 9, 11],
        },
        specializations: [
          {
            id: 'investment_quantitative_finance',
            label: 'Investment Banking & Quantitative Analysis',
            level: 3,
            sectorId: 'business_commerce_finance',
            disciplineId: 'finance_accounting',
            description: 'Capital deployment, portfolio structuring, and quantitative algorithmic financial models.',
            planetaryArchetypes: {
              primarySignificators: ['Mercury', 'Jupiter', 'Rahu'],
              secondarySignificators: ['Sun'],
            },
            roles: [
              {
                id: 'role_investment_banker',
                label: 'Investment Banker / Financial Quant Analyst',
                level: 4,
                sectorId: 'business_commerce_finance',
                disciplineId: 'finance_accounting',
                specializationId: 'investment_quantitative_finance',
                description: 'Manages corporate acquisitions, capital growth, and high-yield financial instruments.',
                academicDegrees: ['MBA Finance', 'CFA', 'MS Finance'],
                planetaryArchetypes: {
                  primarySignificators: ['Mercury', 'Jupiter'],
                  secondarySignificators: ['Rahu', 'Sun'],
                  favorableHousesD1: [2, 5, 9, 11],
                  favorableHousesD10: [2, 10, 11],
                },
                distinctionNotes: 'Strong Dhana yogas (1-2-5-9-11 houses) with Mercury accounting and Jupiter wealth expansion.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'law_governance_public',
    label: 'Law, Governance & Public Administration',
    level: 1,
    description: 'Judiciary, corporate jurisprudence, civil service, diplomacy, and administrative leadership.',
    disciplines: [
      {
        id: 'legal_jurisprudence',
        label: 'Law & Jurisprudence',
        level: 2,
        sectorId: 'law_governance_public',
        description: 'Litigation, constitutional law, corporate contracts, and judicial arbitration.',
        academicDegrees: ['BA LLB', 'LLB', 'LLM', 'Juris Doctor'],
        planetaryArchetypes: {
          primarySignificators: ['Jupiter', 'Saturn', 'Mars'],
          favorableHousesD1: [6, 9, 10],
        },
        specializations: [
          {
            id: 'corporate_litigation',
            label: 'Corporate Law & Litigation',
            level: 3,
            sectorId: 'law_governance_public',
            disciplineId: 'legal_jurisprudence',
            description: 'Court advocacy, contract negotiation, dispute settlement, and statutory compliance.',
            planetaryArchetypes: {
              primarySignificators: ['Jupiter', 'Saturn', 'Mercury'],
              secondarySignificators: ['Mars'],
            },
            roles: [
              {
                id: 'role_corporate_lawyer',
                label: 'Advocate / Corporate Legal Counsel',
                level: 4,
                sectorId: 'law_governance_public',
                disciplineId: 'legal_jurisprudence',
                specializationId: 'corporate_litigation',
                description: 'Represents corporations or individuals in legal disputes; drafts statutory covenants.',
                academicDegrees: ['LLB', 'LLM'],
                planetaryArchetypes: {
                  primarySignificators: ['Jupiter', 'Saturn'],
                  secondarySignificators: ['Mars', 'Mercury'],
                  favorableHousesD1: [6, 9, 10],
                  favorableHousesD10: [6, 9, 10],
                },
                distinctionNotes: 'Jupiter represents Dharma/justice; Saturn represents law, courts, and civil codes; 6th house is dispute/litigation; 9th is constitutional jurisprudence.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'science_research',
    label: 'Pure Science & Academia',
    level: 1,
    description: 'Fundamental theoretical physics, pure mathematics, academic teaching, and university research.',
    disciplines: [
      {
        id: 'academic_research_teaching',
        label: 'Pure Science & University Academia',
        level: 2,
        sectorId: 'science_research',
        description: 'Higher scholarship, university professorship, theoretical discovery, and doctoral mentoring.',
        academicDegrees: ['B.Sc', 'M.Sc', 'Ph.D', 'Post-Doctoral Fellowship'],
        planetaryArchetypes: {
          primarySignificators: ['Jupiter', 'Mercury', 'Ketu'],
          favorableHousesD1: [5, 9, 10],
        },
        specializations: [
          {
            id: 'scientific_research',
            label: 'Theoretical & Experimental Research',
            level: 3,
            sectorId: 'science_research',
            disciplineId: 'academic_research_teaching',
            description: 'Independent investigation into natural laws, mathematics, or physics.',
            planetaryArchetypes: {
              primarySignificators: ['Jupiter', 'Ketu', 'Mercury'],
              secondarySignificators: ['Sun'],
            },
            roles: [
              {
                id: 'role_research_scientist',
                label: 'Research Scientist / University Professor',
                level: 4,
                sectorId: 'science_research',
                disciplineId: 'academic_research_teaching',
                specializationId: 'scientific_research',
                description: 'Advances scientific knowledge through publication, grant research, and graduate student mentorship.',
                academicDegrees: ['Ph.D', 'D.Sc'],
                planetaryArchetypes: {
                  primarySignificators: ['Jupiter', 'Ketu', 'Mercury'],
                  secondarySignificators: ['Sun'],
                  favorableHousesD1: [5, 9, 10],
                  favorableHousesD10: [5, 9, 10],
                },
                distinctionNotes: 'Dominant 9th house (higher knowledge/gurukula) and Jupiter-Ketu (subtle spiritual/theoretical intuition) over commercial 11th house gains.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'creative_media_design',
    label: 'Creative Industries, Design & Media',
    level: 1,
    description: 'Architecture, digital arts, media communication, creative writing, cinema, and aesthetic industries.',
    disciplines: [
      {
        id: 'design_architecture',
        label: 'Design & Architecture',
        level: 2,
        sectorId: 'creative_media_design',
        description: 'Spatial aesthetics, industrial design, visual arts, and structural architecture.',
        academicDegrees: ['B.Arch', 'B.Des', 'M.Des'],
        planetaryArchetypes: {
          primarySignificators: ['Venus', 'Mercury', 'Mars'],
          favorableHousesD1: [3, 4, 10],
        },
        specializations: [
          {
            id: 'digital_product_design',
            label: 'Digital Product & Spatial Design',
            level: 3,
            sectorId: 'creative_media_design',
            disciplineId: 'design_architecture',
            description: 'UI/UX design, virtual spatial environments, and aesthetic media.',
            planetaryArchetypes: {
              primarySignificators: ['Venus', 'Mercury', 'Rahu'],
              secondarySignificators: ['Moon'],
            },
            roles: [
              {
                id: 'role_digital_designer',
                label: 'Product / UI-UX Designer',
                level: 4,
                sectorId: 'creative_media_design',
                disciplineId: 'design_architecture',
                specializationId: 'digital_product_design',
                description: 'Crafts interactive digital interfaces, aesthetic user journeys, and media design systems.',
                academicDegrees: ['B.Des', 'M.Des Interactive Media'],
                planetaryArchetypes: {
                  primarySignificators: ['Venus', 'Mercury'],
                  secondarySignificators: ['Rahu'],
                  favorableHousesD1: [3, 5, 10],
                  favorableHousesD10: [3, 10],
                },
                distinctionNotes: 'Venus is aesthetics/form; Mercury is usability/syntax; Rahu is modern digital screens.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'education_academia',
    label: 'Education, Pedagogy & Institutional Governance',
    level: 1,
    description: 'Primary/secondary pedagogy, educational leadership, institutional counseling, and curriculum architecture.',
    disciplines: [
      {
        id: 'pedagogy_institutional_education',
        label: 'Pedagogy & Educational Administration',
        level: 2,
        sectorId: 'education_academia',
        description: 'Teaching methodology, educational institutional leadership, and student guidance.',
        academicDegrees: ['B.Ed', 'M.Ed', 'MA Education'],
        planetaryArchetypes: {
          primarySignificators: ['Jupiter', 'Mercury', 'Moon'],
          favorableHousesD1: [4, 5, 9, 10],
        },
        specializations: [
          {
            id: 'educational_leadership',
            label: 'Educational Leadership & School Governance',
            level: 3,
            sectorId: 'education_academia',
            disciplineId: 'pedagogy_institutional_education',
            description: 'Dean, academic director, educational administration, and counseling.',
            planetaryArchetypes: {
              primarySignificators: ['Jupiter', 'Sun', 'Mercury'],
              secondarySignificators: ['Moon'],
            },
            roles: [
              {
                id: 'role_educational_director',
                label: 'Academic Director / Master Educator',
                level: 4,
                sectorId: 'education_academia',
                disciplineId: 'pedagogy_institutional_education',
                specializationId: 'educational_leadership',
                description: 'Leads educational institutions, mentors faculties, and oversees pedagogy.',
                academicDegrees: ['M.Ed', 'Ph.D Education'],
                planetaryArchetypes: {
                  primarySignificators: ['Jupiter', 'Sun'],
                  secondarySignificators: ['Mercury'],
                  favorableHousesD1: [4, 5, 9, 10],
                  favorableHousesD10: [9, 10],
                },
                distinctionNotes: 'Jupiter is the Guru/teacher; Sun is institutional authority; 4th house is formal schooling.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'entrepreneurship_consulting',
    label: 'Entrepreneurship & Strategic Consultancy',
    level: 1,
    description: 'Founding commercial ventures, independent business leadership, strategic advisory, and equity enterprise.',
    disciplines: [
      {
        id: 'venture_consulting',
        label: 'Venture Leadership & Strategic Advisory',
        level: 2,
        sectorId: 'entrepreneurship_consulting',
        description: 'Autonomous enterprise creation, market disruption, strategy consulting, and management consulting.',
        academicDegrees: ['MBA Entrepreneurship', 'BBA', 'Executive MS'],
        planetaryArchetypes: {
          primarySignificators: ['Sun', 'Mars', 'Mercury', 'Rahu'],
          favorableHousesD1: [3, 7, 10, 11],
        },
        specializations: [
          {
            id: 'startup_founding',
            label: 'Startup Founding & Commercial Enterprise',
            level: 3,
            sectorId: 'entrepreneurship_consulting',
            disciplineId: 'venture_consulting',
            description: 'Independent entrepreneurship, risk taking, and business scaling.',
            planetaryArchetypes: {
              primarySignificators: ['Sun', 'Mars', 'Mercury'],
              secondarySignificators: ['Rahu'],
            },
            roles: [
              {
                id: 'role_entrepreneur_founder',
                label: 'Startup Founder / Managing Director',
                level: 4,
                sectorId: 'entrepreneurship_consulting',
                disciplineId: 'venture_consulting',
                specializationId: 'startup_founding',
                description: 'Builds and leads independent commercial enterprises; drives strategic innovation and market risk.',
                academicDegrees: ['MBA', 'B.Tech + Founder Experience'],
                planetaryArchetypes: {
                  primarySignificators: ['Sun', 'Mars', 'Mercury'],
                  secondarySignificators: ['Rahu'],
                  favorableHousesD1: [3, 7, 10, 11],
                  favorableHousesD10: [1, 3, 10, 11],
                },
                distinctionNotes: '3rd house rules courage and self-enterprise (Parakrama); 7th rules independent business; 10th rules executive status; 11th rules profits and valuation.',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'inconclusive_insufficient_evidence',
    label: 'Inconclusive / Overlapping Indications',
    level: 1,
    description: 'When astrological factors support multiple professional domains or lack definitive divisional chart divergence.',
    disciplines: [],
  },
];

// ---------------------------------------------------------------------------
// Standard Competing Candidate Distinction Matrix
// ---------------------------------------------------------------------------

export const COMPETING_OCCUPATIONAL_DISTINCTIONS: CompetingDistinction[] = [
  {
    candidateA: 'Doctor (Physician)',
    candidateB: 'Pharmacist',
    keyDifferentiators: 'Vital diagnosis & healing vs chemical compounding and drug formulation.',
    astrologicalDistinctionRule: 'Doctor requires strong Sun/Moon in 6th/10th or 1st house (vitality and disease overcoming); Pharmacist emphasizes Venus (medicinal flora/chemistry) and Rahu/Moon (compounds, solutions, synthetic chemistry) in 6th/8th.',
    epistemicLimitation: 'Both share 6th house healthcare theme. Natal charts with both Sun and Venus-Rahu active in health houses frequently support both clinical therapeutics and pharmacology.',
  },
  {
    candidateA: 'Surgeon',
    candidateB: 'Clinical Physician',
    keyDifferentiators: 'Invasive mechanical incision & blood/trauma management vs systemic pharmaceutical diagnosis.',
    astrologicalDistinctionRule: 'Surgeon strictly requires Mars and Ketu (sharp surgical instruments, incision) aspecting or placed in 6th/8th/10th or D10 Lagna; Clinical Physician relies primarily on Sun (healing life-force) and Jupiter (therapeutic judgment) without prominent surgical Mars-Ketu intervention.',
    epistemicLimitation: 'Modern surgeons also prescribe internal medicine; astrological factors evaluate surgical appetite but cannot guarantee hospital credentialing.',
  },
  {
    candidateA: 'Computer Science Engineering (CSE)',
    candidateB: 'Electronics & Communication Engineering (ECE)',
    keyDifferentiators: 'Abstract software algorithms, logic, and data architecture vs physical semiconductors, circuits, and RF waves.',
    astrologicalDistinctionRule: 'CSE is dominated by Mercury (discrete logic/coding) combined with Mars (engineering) and Rahu (virtual systems); ECE requires Mars (circuits) combined with Sun (electric current) and Ketu/Mercury (micro-electronics, VLSI) or 3rd house (telecom/signals).',
    epistemicLimitation: 'Significant modern overlap exists: embedded systems and VLSI engineers write C/C++ microcode; Jyotish indicators indicate a spectrum between pure abstraction (Mercury) and physical silicon (Sun-Mars).',
  },
  {
    candidateA: 'Software Engineer',
    candidateB: 'Data Scientist',
    keyDifferentiators: 'Application architecture, code production, and API infrastructure vs statistical modeling, predictive algorithms, and empirical experiments.',
    astrologicalDistinctionRule: 'Software Engineer emphasizes Mercury-Mars (functional logic and code construction in 3rd/5th/10th houses); Data Scientist emphasizes Mercury-Jupiter-Rahu (quantitative statistics, empirical research, and pattern extraction in 5th/8th/9th houses).',
    epistemicLimitation: 'Software Engineering and Data Science share 80%+ of the same modern planetary signatures (Mercury-Rahu-Mars). Astrological interpretation must NOT claim absolute demarcation between these two closely related roles.',
  },
  {
    candidateA: 'Data Analyst',
    candidateB: 'Data Scientist',
    keyDifferentiators: 'Business dashboarding, structured SQL querying, and reporting vs advanced predictive modeling, machine learning, and statistical mathematics.',
    astrologicalDistinctionRule: 'Data Analyst emphasizes 2nd/11th house commercial metrics with Mercury-Moon visualization; Data Scientist requires deeper 5th/8th/9th research houses with Jupiter statistical theory and Rahu complex algorithmic modeling.',
    epistemicLimitation: 'In industry, the job title "Data Analyst" is frequently used for junior data science work; astrology indicates intellectual depth and mathematical orientation rather than corporate HR job grades.',
  },
  {
    candidateA: 'Machine Learning / AI Engineer',
    candidateB: 'Software Engineer (General)',
    keyDifferentiators: 'Neural network training, probabilistic modeling, and synthetic intelligence vs deterministic software development.',
    astrologicalDistinctionRule: 'AI/ML Engineer requires prominent Rahu (synthetic mind, unconventional machines) closely coupled with Mercury (logic) in D10/D24 5th/8th/10th houses; General Software Engineer relies on classical Mercury-Mars mechanical logic without dominant Rahu experimental synthesis.',
    epistemicLimitation: 'Rahu-Mercury represents modern computational intelligence; exact boundary between AI engineering and modern backend engineering is fluid.',
  },
  {
    candidateA: 'Civil Engineer',
    candidateB: 'Mechanical Engineer',
    keyDifferentiators: 'Static immovable structures, land development, and buildings vs dynamic kinetic machines, automotive engines, and robotics.',
    astrologicalDistinctionRule: 'Civil Engineer activates 4th house (land/structures/Bhumi) with Saturn (concrete/soil) and Mars; Mechanical Engineer activates 3rd/10th houses with Mars (kinetic force/combustion) and Saturn (metals/machinery) without mandatory 4th house land predominance.',
    epistemicLimitation: 'Both are Mars-Saturn engineering disciplines; differentiation relies on the 4th house (civil architecture) vs 3rd/10th (kinetic machinery).',
  },
  {
    candidateA: 'Employment (Salaried Service)',
    candidateB: 'Entrepreneurship / Consultancy',
    keyDifferentiators: 'Organizational hierarchy and fixed remuneration vs autonomous commercial risk and equity enterprise.',
    astrologicalDistinctionRule: 'Employment is governed by the 6th house (service, subordinate work, steady salary) and Saturn; Entrepreneurship is governed by the 3rd house (self-enterprise, courage), 7th house (independent commerce/public trade), and strong 10th/11th houses with Sun/Mars leadership.',
    epistemicLimitation: 'Natives often transition from salaried employment to consultancy during favorable dasha periods; the chart shows organizational orientation, not a permanent lifetime lock.',
  },
];

// ---------------------------------------------------------------------------
// Lookup Utilities
// ---------------------------------------------------------------------------

export function findTaxonomyRole(roleId: string): TaxonomyRole | undefined {
  for (const sector of CAREER_TAXONOMY) {
    for (const discipline of sector.disciplines) {
      for (const spec of discipline.specializations) {
        const found = spec.roles.find((r) => r.id === roleId);
        if (found) return found;
      }
    }
  }
  return undefined;
}

export function findTaxonomySpecialization(specId: string): TaxonomySpecialization | undefined {
  for (const sector of CAREER_TAXONOMY) {
    for (const discipline of sector.disciplines) {
      const found = discipline.specializations.find((s) => s.id === specId);
      if (found) return found;
    }
  }
  return undefined;
}

export function findTaxonomyDiscipline(disciplineId: string): TaxonomyDiscipline | undefined {
  for (const sector of CAREER_TAXONOMY) {
    const found = sector.disciplines.find((d) => d.id === disciplineId);
    if (found) return found;
  }
  return undefined;
}

export function findTaxonomySector(sectorId: SectorId): TaxonomySector | undefined {
  return CAREER_TAXONOMY.find((s) => s.id === sectorId);
}

export function searchTaxonomyByKeywords(query: string): TaxonomyRole[] {
  const q = query.toLowerCase();
  const matches: TaxonomyRole[] = [];

  for (const sector of CAREER_TAXONOMY) {
    for (const discipline of sector.disciplines) {
      for (const spec of discipline.specializations) {
        for (const role of spec.roles) {
          if (
            role.label.toLowerCase().includes(q) ||
            role.description.toLowerCase().includes(q) ||
            role.academicDegrees.some((deg) => deg.toLowerCase().includes(q)) ||
            (role.distinctionNotes && role.distinctionNotes.toLowerCase().includes(q))
          ) {
            matches.push(role);
          }
        }
      }
    }
  }
  return matches;
}
