import type { TestItem } from '../types';
import { pronunciationItems } from './testItems/pronunciation';
import { buildingBlocksItems } from './testItems/building-blocks';
import { identityItems } from './testItems/identity';
import { weatherItems } from './testItems/weather';
import { plansItems } from './testItems/plans';
import { vieFrancaiseItems } from './testItems/vie-francaise';
import { b1OpinionsItems } from './testItems/b1-opinions';
import { b1HypotheticalItems } from './testItems/b1-hypothetical';
import { b1NarrationItems } from './testItems/b1-narration';
import { b1WorkplaceItems } from './testItems/b1-workplace';
import { b1MediaItems } from './testItems/b1-media';
import { b1AbstractItems } from './testItems/b1-abstract';
import { b2SyntaxItems } from './testItems/b2-syntax';
import { b2SubjunctiveItems } from './testItems/b2-subjunctive';
import { b2ArgumentationItems } from './testItems/b2-argumentation';
import { b2RegisterItems } from './testItems/b2-register';
import { b2IdiomaticItems } from './testItems/b2-idiomatic';
import { b2AbstractIssuesItems } from './testItems/b2-abstract-issues';
import { housingItems } from './testItems/housing';
import { hobbiesItems } from './testItems/hobbies';
import { everydayHealthItems } from './testItems/everyday-health';
import { transportItems } from './testItems/transport';
import { b1TravelItems } from './testItems/b1-travel';
import { b1EnvironmentItems } from './testItems/b1-environment';
import { b1TechnologyItems } from './testItems/b1-technology';
import { b2LiteratureArtsItems } from './testItems/b2-literature-arts';
import { b2PoliticsEconomyItems } from './testItems/b2-politics-economy';
import { b2ScienceTechnologyItems } from './testItems/b2-science-technology';
import { b2PhilosophyEthicsItems } from './testItems/b2-philosophy-ethics';
import { b2ProfessionalNuanceItems } from './testItems/b2-professional-nuance';
import { b2CultureSocietyItems } from './testItems/b2-culture-society';

// Hand-authored IRT test bank for the self-adaptive level test.
// 650 items across four difficulty bands (plus 171 derived lesson items in
// testItemBank.ts, for 821 total items in the live test bank):
//   Band 1 (Pre-A1 floor):  60 items  -> pronunciation (30), building-blocks (30)
//   Band 2 (A2 smoothing): 140 items  -> identity, weather, plans, vie-francaise (15 each),
//                                        housing, hobbies, everyday-health, transport (20 each)
//   Band 3 (B1 ceiling):   198 items  -> b1-opinions, b1-hypothetical, b1-narration,
//                                        b1-workplace, b1-media, b1-abstract (23 each),
//                                        b1-travel, b1-environment, b1-technology (20 each)
//   Band 4 (B2 ceiling):   252 items  -> b2-syntax, b2-subjunctive, b2-argumentation,
//                                        b2-register, b2-idiomatic, b2-abstract-issues (22 each),
//                                        b2-literature-arts, b2-politics-economy,
//                                        b2-science-technology, b2-philosophy-ethics,
//                                        b2-professional-nuance, b2-culture-society (20 each)
// a = discrimination (0.7 forgiving / 1.0 default / 1.4 tight),
// b = difficulty on the theta scale.
export const AUTHORED_ITEMS: TestItem[] = [
  ...pronunciationItems,
  ...buildingBlocksItems,
  ...identityItems,
  ...weatherItems,
  ...plansItems,
  ...vieFrancaiseItems,
  ...b1OpinionsItems,
  ...b1HypotheticalItems,
  ...b1NarrationItems,
  ...b1WorkplaceItems,
  ...b1MediaItems,
  ...b1AbstractItems,
  ...b2SyntaxItems,
  ...b2SubjunctiveItems,
  ...b2ArgumentationItems,
  ...b2RegisterItems,
  ...b2IdiomaticItems,
  ...b2AbstractIssuesItems,
  ...housingItems,
  ...hobbiesItems,
  ...everydayHealthItems,
  ...transportItems,
  ...b1TravelItems,
  ...b1EnvironmentItems,
  ...b1TechnologyItems,
  ...b2LiteratureArtsItems,
  ...b2PoliticsEconomyItems,
  ...b2ScienceTechnologyItems,
  ...b2PhilosophyEthicsItems,
  ...b2ProfessionalNuanceItems,
  ...b2CultureSocietyItems,
];
