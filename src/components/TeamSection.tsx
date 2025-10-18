// src/components/TeamSection.tsx
import React from 'react'

type CardProps = {
  name: string
  role: string
  blurb: string
  linkedin: string
  initials: string
}

function FounderCard({ name, role, blurb, linkedin, initials }: CardProps) {
  return (
    <div className="founder-card">
      <div className="founder-card-head">
        <div className="founder-avatar">{initials}</div>
        <div className="founder-id">
          <div className="founder-name">{name}</div>
          <div className="founder-role">{role}</div>
        </div>
      </div>

      <p className="founder-blurb">{blurb}</p>

      <div className="founder-actions">
        <a className="btn btn-secondary" href={linkedin} target="_blank" rel="noreferrer">
          View LinkedIn
        </a>
      </div>
    </div>
  )
}

export default function TeamSection() {
  return (
    <section className="team-section">
      <h2 className="team-title">Team</h2>
      <p className="team-sub">We’re builders with deep ML + product experience.</p>

      <div className="team-grid">
        <FounderCard
          name="Jaskaran Walia"
          role="Co-founder"
          initials="JW"
          linkedin="https://www.linkedin.com/in/jaskaranwalia/"
          blurb={`I’m a 2x founder (previously raised $600k) • CMU grad student (AI); Ex — Microsoft, MIT.`}
        />

        <FounderCard
          name="Shreenabh"
          role="Co-founder"
          initials="S"
          linkedin="https://www.linkedin.com/in/shreenabh/"
          blurb={`Co-founder & ML engineer. Built agentic data-mining workflows and scalable APIs for supply-chain intelligence. Focus on retrieval, reasoning and product velocity.`}
        />
      </div>

      <div className="team-contact">
        <a
        className="btn"
        href="mailto:karanwalia2k3@gmail.com?subject=PIE%20AI%20%E2%80%94%20Investor%20Intro&body=Hi%20PIE%20AI%20team%2C%0A%0AI'm%20interested%20in%20learning%20more%20about%20your%20supply-chain%20intelligence%20platform.%0A%0A"
        >
        Contact Team
        </a>

      </div>
    </section>
  )
}
