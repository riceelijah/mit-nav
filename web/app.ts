import { createApp, ref, computed, watch, onMounted } from "vue/dist/vue.esm-bundler.js";
import { createHttpClient } from "@mit-sdg/sync-engine-http/client";
import type { CampusWireHttp } from "../generated/wire.ts";

const client = createHttpClient<CampusWireHttp>({ baseUrl: "/api" });

function remembered(key: string) {
  try { return localStorage.getItem(key) ?? ""; } catch { return ""; }
}
function remember(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* storage is optional */ }
}

type Place = { place: string; name: string; kind: string; floor: number };
const floorLabel = (floor: number) => (floor === 0 ? "Basement" : `Floor ${floor}`);

/** The place with exactly this name, found through search (the browser never holds the whole map). */
async function placeNamed(name: string): Promise<Place | null> {
  const result = await client.map.search({ text: name });
  return "error" in result ? null : (result.places.places.find((p: Place) => p.name === name) ?? null);
}

const app = createApp({
  template: `
  <main>
    <h1>MIT Navigator</h1>
    <p class="sub">Step-by-step directions across MIT, from building to building and floor to floor. If a passage is out of service, flag it and everyone's directions will avoid it.</p>

    <section>
      <div class="row">
        <place-picker label="From" v-model="from" />
        <place-picker label="To" v-model="to" />
        <label>Time of day
          <input type="time" v-model="time" />
        </label>
        <label class="check"><input type="checkbox" v-model="accessibleOnly" /> Step-free route only</label>
      </div>
      <p v-if="from && to && from.place === to.place" class="msg">You are already there.</p>
      <p v-else-if="searched && steps.length === 0" class="msg bad">
        No route found{{ accessibleOnly ? ' that avoids stairs, blocked passages and anything closed at this time. Try turning off step-free or changing the time.' : ' that avoids blocked or closed passages at this time.' }}
      </p>
      <ol v-if="steps.length" class="steps">
        <li v-for="s in steps" :key="s.step">
          {{ s.instruction }} <span class="floor">(arrive: {{ s.placeName }}, floor {{ s.floor }})</span>
          <button class="flag danger" @click="flagging = flagging === s.link ? '' : s.link; reason = ''">Flag blocked</button>
          <div v-if="flagging === s.link" class="inline">
            <input type="text" v-model="reason" placeholder="What is wrong? (e.g. elevator out of service)" />
            <button class="primary" @click="block(s.link)">Report</button>
          </div>
        </li>
      </ol>
      <p v-if="message" :class="['msg', messageKind]">{{ message }}</p>
    </section>

    <section>
      <label>Your name (attached to reports)
        <input type="text" v-model="reporter" placeholder="Your name" @change="remember('reporter', reporter)" />
      </label>
    </section>

    <h2>Open problem reports</h2>
    <section>
      <p v-if="!reports.length" class="sub">Nothing is reported as blocked.</p>
      <ul class="plain">
        <li v-for="r in reports" :key="r.report">
          <span><strong>{{ r.sourceName }} to {{ r.destinationName }}</strong>: {{ r.forward }}<br /><span class="floor">{{ r.reporter }}: {{ r.reason }}</span></span>
          <button @click="unblock(r.link)">Mark as clear</button>
        </li>
      </ul>
    </section>
  </main>`,
  setup() {
    const reports = ref<any[]>([]);
    const steps = ref<any[]>([]);
    const from = ref<Place | null>(null);
    const to = ref<Place | null>(null);
    const accessibleOnly = ref(false);
    const now = new Date();
    const time = ref(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
    const hour = computed(() => {
      const [h, m] = time.value.split(":").map(Number);
      return (h || 0) + (m || 0) / 60;
    });
    const searched = ref(false);
    const flagging = ref("");
    const reason = ref("");
    const reporter = ref(remembered("reporter"));
    const message = ref("");
    const messageKind = ref("ok");
    const say = (text: string, kind = "ok") => { message.value = text; messageKind.value = kind; };

    async function load() {
      const result = await client.map.overview({});
      if ("error" in result) return say(`Could not load the reports: ${result.error}`, "bad");
      reports.value = result.problems.reports;
    }

    let latestRoute = 0;
    async function findRoute() {
      const asked = ++latestRoute;
      if (!from.value || !to.value || from.value.place === to.value.place) { steps.value = []; searched.value = false; return; }
      const result = await client.route.find({ source: from.value.place, destination: to.value.place, accessibleOnly: accessibleOnly.value, hour: hour.value });
      if (asked !== latestRoute) return; // an answer to an older choice of places
      if ("error" in result) return say(`Could not find a route: ${result.error}`, "bad");
      steps.value = result.route.steps;
      searched.value = true;
    }

    async function block(link: string) {
      if (!reporter.value.trim() || !reason.value.trim()) return say("Please enter your name and what is wrong.", "bad");
      const result = await client.problems.block({ link, reporter: reporter.value.trim(), reason: reason.value.trim() });
      if ("error" in result) return say(result.error === "CONFLICT" ? "Someone has already flagged that passage." : `Could not report: ${result.error}`, "bad");
      flagging.value = ""; reason.value = "";
      say("Reported. Directions now avoid that passage.");
      await load(); await findRoute();
    }

    async function unblock(link: string) {
      const result = await client.problems.unblock({ link });
      if ("error" in result) return say(`Could not clear it: ${result.error}`, "bad");
      say("Marked as clear.");
      await load(); await findRoute();
    }

    watch([from, to, accessibleOnly, time], () => { message.value = ""; findRoute(); });
    onMounted(async () => {
      const [start, end] = await Promise.all([placeNamed("Main Lobby Entrance"), placeNamed("32-123 Lecture Hall"), load()]);
      from.value ??= start;
      to.value ??= end;
    });

    return { reports, steps, from, to, accessibleOnly, time, searched, flagging, reason, reporter, message, messageKind, block, unblock, remember };
  },
});

// A text box that asks the server for matching places as you type (buildings first).
app.component("PlacePicker", {
  props: { modelValue: { type: Object, default: null }, label: String },
  emits: ["update:modelValue"],
  template: `
    <label class="combo">{{ label }}
      <input type="text" :value="text" placeholder="Building or room, e.g. 32-123" autocomplete="off"
        @focus="onFocus" @input="onInput" @blur="close" @keydown.esc="close" @keydown.enter.prevent="pickFirst" />
      <ul v-if="open" class="options">
        <li v-for="p in pinned" :key="p.place" :class="{ chosen: p.place === modelValue?.place }" @mousedown.prevent="choose(p)">
          <span class="name">{{ p.name }}</span> <span class="floor">{{ floorLabel(p.floor) }}</span>
        </li>
        <li v-if="pinned.length && others.length" class="divider" role="separator"></li>
        <li v-for="p in others" :key="p.place" :class="{ chosen: p.place === modelValue?.place }" @mousedown.prevent="choose(p)">
          <span class="name">{{ p.name }}</span> <span class="floor">{{ floorLabel(p.floor) }}</span>
        </li>
        <li v-if="!results.length" class="none">No matching places</li>
        <li v-else-if="results.length >= 40" class="none">Showing the first 40. Type more to narrow the list.</li>
      </ul>
    </label>`,
  setup(props: any, { emit }: any) {
    const text = ref("");
    const open = ref(false);
    const results = ref<Place[]>([]);
    // Entrances (buildings and the Simmons lobby) come first from the server, set apart by a divider.
    const pinned = computed(() => results.value.filter((p) => p.kind === "ENTRANCE"));
    const others = computed(() => results.value.filter((p) => p.kind !== "ENTRANCE"));
    watch(() => props.modelValue, (p) => { text.value = p?.name ?? text.value; }, { immediate: true });

    let latest = 0;
    async function search(q: string) {
      const asked = ++latest;
      const result = await client.map.search({ text: q });
      // A slow answer to an older keystroke must not replace a newer one.
      if (asked === latest && !("error" in result)) results.value = result.places.places;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onFocus = (event: Event) => { open.value = true; (event.target as HTMLInputElement).select(); search(""); };
    const onInput = (event: Event) => {
      text.value = (event.target as HTMLInputElement).value;
      open.value = true;
      clearTimeout(timer);
      timer = setTimeout(() => search(text.value), 120);
    };
    const choose = (p: Place) => { emit("update:modelValue", p); text.value = p.name; open.value = false; };
    const pickFirst = () => { const first = pinned.value[0] ?? others.value[0]; if (first) choose(first); };
    const close = () => { open.value = false; text.value = props.modelValue?.name ?? ""; };
    return { text, open, results, pinned, others, floorLabel, onFocus, onInput, choose, pickFirst, close };
  },
});

app.mount("#app");
