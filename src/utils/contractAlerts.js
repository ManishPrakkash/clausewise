/**
 * Contract Alerts Generator
 * Generates random alerts for contract analysis
 */

const alertTemplates = {
  payment: [
    'Payment schedule is missing.',
    'Late payment penalties are not defined.',
    'Payment method is not specified.',
    'Currency is not clearly stated.',
    'Payment terms are ambiguous.',
    'No grace period for payments.',
    'Payment due dates are unclear.',
    'No late fee structure defined.'
  ],
  
  duration: [
    'End date is not clearly defined.',
    'Contract start date is missing.',
    'Renewal terms are not specified.',
    'Termination notice period is unclear.',
    'No automatic renewal clause.',
    'Contract duration is ambiguous.',
    'No extension terms defined.',
    'Expiration conditions are missing.'
  ],
  
  confidentiality: [
    'Confidentiality clause is missing.',
    'Non-disclosure terms are not defined.',
    'Data protection measures are unclear.',
    'Confidentiality duration is not specified.',
    'No breach consequences defined.',
    'Information handling is ambiguous.',
    'Privacy terms are missing.',
    'Confidentiality scope is unclear.'
  ],
  
  termination: [
    'Termination conditions are ambiguous.',
    'No termination notice period.',
    'Breach consequences are not defined.',
    'Force majeure clause is missing.',
    'Termination fees are not specified.',
    'No exit procedures defined.',
    'Termination grounds are unclear.',
    'Post-termination obligations missing.'
  ],
  
  dispute: [
    'Arbitration process is not defined.',
    'Dispute resolution method is unclear.',
    'No governing law specified.',
    'Jurisdiction is not defined.',
    'Mediation process is missing.',
    'Appeal procedures are unclear.',
    'No expert determination clause.',
    'Dispute timeline is not specified.'
  ],
  
  liability: [
    'Liability limits are not defined.',
    'Indemnification clause is missing.',
    'No insurance requirements.',
    'Liability exclusions are unclear.',
    'No consequential damages clause.',
    'Liability cap is not specified.',
    'No force majeure protection.',
    'Liability scope is ambiguous.'
  ],
  
  intellectual: [
    'IP ownership is not clearly defined.',
    'No licensing terms specified.',
    'IP infringement protection missing.',
    'No IP assignment clause.',
    'IP usage rights are unclear.',
    'No IP confidentiality terms.',
    'IP termination rights missing.',
    'IP dispute resolution unclear.'
  ],
  
  compliance: [
    'Regulatory compliance is not addressed.',
    'No audit rights specified.',
    'Compliance reporting missing.',
    'No regulatory change clause.',
    'Compliance costs not defined.',
    'No compliance monitoring.',
    'Regulatory updates not addressed.',
    'Compliance penalties unclear.'
  ]
};

const contractTypes = {
  'land ownership contract': ['payment', 'duration', 'confidentiality', 'termination', 'dispute', 'liability'],
  'patta': ['duration', 'termination', 'dispute', 'liability', 'compliance'],
  'chitta': ['duration', 'termination', 'dispute', 'liability', 'compliance'],
  'title deed': ['duration', 'termination', 'dispute', 'liability', 'compliance'],
  'a-register': ['duration', 'termination', 'dispute', 'liability', 'compliance'],
  'fmb': ['duration', 'termination', 'dispute', 'liability', 'compliance'],
  'default': ['payment', 'duration', 'confidentiality', 'termination', 'dispute', 'liability']
};

/**
 * Generate random alerts for a contract
 */
export const generateRandomAlerts = (contractType = 'default', alertCount = 3) => {
  const availableCategories = contractTypes[contractType.toLowerCase()] || contractTypes.default;
  const selectedCategories = shuffleArray(availableCategories).slice(0, Math.min(alertCount, availableCategories.length));
  
  const alerts = [];
  
  selectedCategories.forEach(category => {
    const categoryAlerts = alertTemplates[category];
    const randomAlert = categoryAlerts[Math.floor(Math.random() * categoryAlerts.length)];
    
    alerts.push({
      category,
      message: randomAlert,
      level: Math.random() > 0.7 ? 'critical' : 'warning'
    });
  });
  
  return alerts;
};

/**
 * Generate detailed sections with random alerts
 */
export const generateDetailedSections = (contractType = 'default') => {
  const sections = [
    {
      title: 'Payment Terms',
      content: 'The payment terms specify the amount and schedule of payments for the contract.',
      alerts: []
    },
    {
      title: 'Contract Duration',
      content: 'The contract duration specifies the start and end dates of the agreement.',
      alerts: []
    },
    {
      title: 'Confidentiality Clause',
      content: 'The confidentiality clause outlines the handling of sensitive information.',
      alerts: []
    },
    {
      title: 'Termination Clause',
      content: 'The termination clause specifies conditions for ending the contract.',
      alerts: []
    },
    {
      title: 'Dispute Resolution',
      content: 'The dispute resolution clause specifies how disputes will be handled.',
      alerts: []
    },
    {
      title: 'Liability & Indemnification',
      content: 'The liability clause defines the extent of responsibility and protection.',
      alerts: []
    },
    {
      title: 'Intellectual Property',
      content: 'The IP clause addresses ownership and usage rights of intellectual property.',
      alerts: []
    },
    {
      title: 'Compliance & Regulations',
      content: 'The compliance clause ensures adherence to relevant laws and regulations.',
      alerts: []
    }
  ];
  
  // Add random alerts to sections
  sections.forEach(section => {
    const category = section.title.toLowerCase().replace(/\s+/g, '').replace(/&/g, '');
    if (alertTemplates[category]) {
      const randomAlerts = generateRandomAlerts(contractType, Math.floor(Math.random() * 3) + 1);
      section.alerts = randomAlerts.filter(alert => alert.category === category);
    }
  });
  
  return sections;
};

/**
 * Shuffle array elements
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get alert summary for display
 */
export const getAlertSummary = (sections) => {
  const allAlerts = sections.flatMap(section => 
    section.alerts.map(alert => ({
      section: section.title,
      message: alert.message,
      level: alert.level
    }))
  );
  
  return {
    totalAlerts: allAlerts.length,
    criticalAlerts: allAlerts.filter(alert => alert.level === 'critical').length,
    warningAlerts: allAlerts.filter(alert => alert.level === 'warning').length,
    alerts: allAlerts
  };
};
