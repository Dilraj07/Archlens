import { ArchGraphSchema, GuidedMissionSchema, IncidentScenarioSchema } from './schemas';
import tatkalJson from './blueprints/tatkal.json';
import cricketJson from './blueprints/cricket.json';
import simpleAppJson from './blueprints/simple-app.json';
import scaledAppJson from './blueprints/scaled-app.json';
import amazonJson from './blueprints/amazon.json';
import netflixJson from './blueprints/netflix.json';
import g1Json from './missions/g1-tatkal-10am.json';
import g2Json from './missions/g2-cricket-no-cdn.json';
import g3Json from './missions/g3-slow-analytics.json';
import i1Json from './incidents/i1-tatkal-down.json';
import { z } from 'zod';

export type Blueprint = z.infer<typeof ArchGraphSchema>;
export type Mission = z.infer<typeof GuidedMissionSchema>;
export type Incident = z.infer<typeof IncidentScenarioSchema>;

export const BLUEPRINTS: Record<string, Blueprint> = {
  'simple-app': ArchGraphSchema.parse(simpleAppJson),
  'scaled-app': ArchGraphSchema.parse(scaledAppJson),
  amazon: ArchGraphSchema.parse(amazonJson),
  tatkal: ArchGraphSchema.parse(tatkalJson),
  netflix: ArchGraphSchema.parse(netflixJson),
  cricket: ArchGraphSchema.parse(cricketJson),
};

export const MISSIONS: Record<string, Mission> = {
  'g1-tatkal-10am': GuidedMissionSchema.parse(g1Json),
  'g2-cricket-no-cdn': GuidedMissionSchema.parse(g2Json),
  'g3-slow-analytics': GuidedMissionSchema.parse(g3Json),
};

export const INCIDENTS: Record<string, Incident> = {
  'i1-tatkal-down': IncidentScenarioSchema.parse(i1Json),
};

export function getBlueprint(id: string): Blueprint | undefined {
  return BLUEPRINTS[id];
}

export function getMission(id: string): Mission | undefined {
  return MISSIONS[id];
}

export function getIncident(id: string): Incident | undefined {
  return INCIDENTS[id];
}
