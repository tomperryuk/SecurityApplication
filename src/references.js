import {sources} from './data.js';
import {foundationSources, quickStarts} from './blueprintData.js';
import {sdlcSources} from './sdlcData.js';
import {metricSources} from './metricsData.js';

export const referenceGroups = ['Detection & response', 'Foundations', 'Data & recovery', 'Agents & delivery', 'Measurement & outcomes'];

const groupByTitle = {
  'GuardDuty event delivery': 'Detection & response', 'Security Hub automation': 'Detection & response', 'Temporary credential containment': 'Detection & response',
  'GuardDuty coverage': 'Detection & response', 'AWS incident response': 'Detection & response', 'Step Functions approval pattern': 'Detection & response',
  'AWS security reference architecture': 'Foundations', 'Dedicated security accounts': 'Foundations', 'Phased security foundations': 'Foundations',
  'Control Tower quick start': 'Foundations', 'GitHub OIDC with AWS': 'Foundations',
  'Security Lake source and subscriber concepts': 'Data & recovery', 'Security Lake third-party integrations': 'Data & recovery',
  'AWS Backup restore testing': 'Data & recovery', 'Logically air-gapped vaults': 'Data & recovery',
  'Agent security on AWS': 'Agents & delivery'
};
const foundationNotes = {
  'AWS security reference architecture': 'The multi-account pattern behind the Account foundations design.',
  'Dedicated security accounts': 'Why management, security tooling and log archive live in separate accounts.',
  'Phased security foundations': 'A staged order for building security capabilities.',
  'Control Tower quick start': 'Setting up a governed landing zone and enrolling accounts.',
  'Security Lake source and subscriber concepts': 'How sources, subscribers and normalised data fit together.',
  'Security Lake third-party integrations': 'Connecting external analytics and SIEM tools to the lake.',
  'Step Functions approval pattern': 'A human-approval step inside an automated response workflow.',
  'GitHub OIDC with AWS': 'Short-lived pipeline roles instead of stored deployment keys.',
  'AWS Backup restore testing': 'Scheduled restore tests that prove recovery, not just backup jobs.',
  'Logically air-gapped vaults': 'Isolated recovery copies that survive a compromised account.',
  'Agent security on AWS': 'Prescriptive guidance on identity, tools and guardrails for agents.'
};

export function references() {
  const usedBy = index => quickStarts.filter(q => q.sourceIds.includes(index)).map(q => q.id);
  const list = [
    ...sources.map(([title, url, note]) => ({title, url, note, group: groupByTitle[title], usedBy: []})),
    ...foundationSources.map(([title, url], i) => ({title, url, note: foundationNotes[title], group: groupByTitle[title], usedBy: usedBy(i)})),
    ...metricSources.map(([title, url, note]) => ({title, url, note, group: 'Measurement & outcomes', usedBy: []})),
    ...sdlcSources.map(([title, url, note]) => ({title, url, note, group: 'Agents & delivery', usedBy: []}))
  ];
  return list.sort((a, b) => referenceGroups.indexOf(a.group) - referenceGroups.indexOf(b.group));
}
