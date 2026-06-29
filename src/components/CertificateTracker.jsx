import './CertificateTracker.css';
import { CheckIcon } from './Icons';

// Certificate definitions map categories to their member group IDs
const CERTIFICATES = [
  { id: 'clinical', name: 'Clinical Groups', groups: ['healthy-relationships', 'dbt', 'cbisa', 'seeking-safety', 'living-balance', 'relapse-prevention-rashida', 'transitional-skills', 'spiritual-group', 'recovery-relapse', 'wellness-group'] },
  { id: 'mandatory', name: 'Mandatory Program', groups: ['orientation', 'community-meetings', 'big-book', 'step-study'] },
  { id: 'after30', name: 'Extended Program', groups: ['peer-support', 'alumni-group'] },
  { id: 'support', name: 'Support Network', groups: ['aa-na', 'smart-recovery', 'celebrate-recovery'] },
  { id: 'overall', name: 'Full Program Completion', groups: [] },
];

// Shows completion status for each certificate category and overall program completion
export default function CertificateTracker({ groups }) {
  // Determine if a certificate's requirements are met (all groups completed)
  const getCertificateStatus = (cert) => {
    if (cert.id === 'overall') {
      return CERTIFICATES
        .filter(c => c.id !== 'overall')
        .every(c => getCertificateStatus(c).completed);
    }

    const certGroups = groups.filter(g => cert.groups.includes(g.id));
    const allCompleted = certGroups.length > 0 && certGroups.every(g => 
      g.required === 999 || g.completed >= (g.required || 0)
    );
    const completedCount = certGroups.filter(g => 
      g.required === 999 || g.completed >= (g.required || 0)
    ).length;

    return {
      completed: allCompleted,
      total: certGroups.length,
      completedCount,
      groups: certGroups,
    };
  };

  return (
    <div className="certificate-tracker">
      <h2 className="certificate-title">Certificate Tracker</h2>
      <div className="certificates-grid">
        {CERTIFICATES.map(cert => {
          const status = getCertificateStatus(cert);
          return (
            <div 
              key={cert.id} 
              className={`certificate-card ${status.completed ? 'cert-complete' : ''}`}
            >
              <div className="cert-header">
                <span className="cert-name">{cert.name}</span>
                {status.completed && <span className="cert-badge"><CheckIcon /></span>}
              </div>
              {cert.id !== 'overall' && (
                <div className="cert-progress">
                  <div className="cert-progress-bar">
                    <div 
                      className="cert-progress-fill"
                      style={{ width: `${status.total > 0 ? Math.round((status.completedCount / status.total) * 100) : 0}%` }}
                    ></div>
                  </div>
                  <span className="cert-progress-text">
                    {status.completedCount}/{status.total} groups
                  </span>
                </div>
              )}
              {cert.id === 'overall' && (
                <div className="cert-overall-status">
                  {status.completed ? 'All Certificates Earned' : 'Complete All Certificate Requirements'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}