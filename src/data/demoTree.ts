// src/data/demoTree.ts
export type DemoNode = { name: string; children?: DemoNode[] };

export const makeDemoTree = (company: string): DemoNode => ({
  name: company || 'PIE.ai',
  children: [
    {
      name: 'Supply Chain',
      children: [
        { name: 'Risk Scoring' },
        { name: 'Procurement' },
        { name: 'Fulfillment' },
      ],
    },
    { name: 'Business Records' },
    { name: 'Forums / Blogs' },
  ],
});

// Labels used in the “video-like research” overlay
export const researchItems: string[] = [
  'Supply Chain → Risk Scoring',
  'Supply Chain → Procurement',
  'Supply Chain → Fulfillment',
  'Business Records',
  'Forums / Blogs',
];

// The pipeline page check-list
export const pipelineSteps: string[] = [
  "Gather individual founder details",
  "Gather company's public details",
  "Scrape records & online activity",
  "Trace buyers/sellers & deals",
  "Detect red flags (cases/reports/reviews)",
  "Generate score & report",
];
