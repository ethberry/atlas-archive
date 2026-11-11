import data from "@/lib/archive/statistics.json";
import { pageTopic, type Topic } from "@/lib/archive/statistics";

// The pages of the Quests section, in order. `pages` in crimson-orb writes them
// into statistics.json beside the guides and lists them under `quests`, off the
// guides menu and their trail, so a quest is read and drawn as a guide is.
export const QUESTS: Topic[] = data.quests.map(pageTopic);

export function questOf(slug: string) {
  return QUESTS.find((quest) => quest.slug === slug);
}
